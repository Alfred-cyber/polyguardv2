"""
PolyGuard v2 — FastAPI Backend
Full timing-aware polypharmacy risk assessment.
Author: Alfred Bartholomew Sunday
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import numpy as np
import joblib
import json
import os
import logging

from knowledge_base import (
    ACB_SCORES, SEDATION_SCORES, ALL_CNS_DRUGS, HIGH_RISK_COMBOS,
    DRUG_ATC_CLASS, CLASS_INDICATIONS, NARROW_TI_DRUGS, MEAL_RULES,
)
from timing_engine import (
    analyse_windows, check_timing_violations, check_interactions,
    check_therapeutic_duplication, compute_24hr_curve, compute_nighttime_risk,
    normalise,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PolyGuard API v2",
    description="Timing-Aware Explainable AI for Polypharmacy Risk Detection",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model Loading ─────────────────────────────────────────────────────────────

MODEL_PATH    = os.getenv("MODEL_PATH",    "polyguard_model.pkl")
model = None

def load_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            logger.info(f" Model loaded")
    except Exception as e:
        logger.warning(f"Model not loaded: {e} — using rule-based fallback")

load_model()

# ─── Request Models ────────────────────────────────────────────────────────────

class MealTimes(BaseModel):
    breakfast: Optional[str] = None   # "07:30"
    lunch:     Optional[str] = None   # "12:30"
    dinner:    Optional[str] = None   # "18:30"

class Medication(BaseModel):
    drug_name:     str
    dose:          Optional[str] = None      # "500mg"
    dose_unit:     Optional[str] = None      # "mg"
    indication:    Optional[str] = None      # "Type 2 Diabetes"
    frequency:     Optional[str] = None      # "twice daily"
    times:         list[str] = []            # ["08:00", "20:00"]
    food_relation: Optional[str] = None      # "with" | "before" | "after" | "any"
    route:         Optional[str] = "oral"

    @field_validator("drug_name")
    @classmethod
    def clean_name(cls, v):
        return v.strip()

    @field_validator("times")
    @classmethod
    def validate_times(cls, v):
        cleaned = []
        for t in v:
            t = t.strip()
            if ":" in t:
                parts = t.split(":")
                if len(parts) == 2:
                    h, m = parts
                    if 0 <= int(h) <= 23 and 0 <= int(m) <= 59:
                        cleaned.append(f"{int(h):02d}:{int(m):02d}")
        return cleaned

class PatientProfile(BaseModel):
    age:    float = Field(..., ge=18, le=110)
    sex:    str
    weight: float = Field(..., ge=20, le=300)
    renal_impairment:  Optional[str] = "none"   # none|mild|moderate|severe
    hepatic_impairment: Optional[str] = "none"  # none|mild|severe

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v):
        if v.lower() not in ("male", "female"):
            raise ValueError("sex must be male or female")
        return v.lower()

class QuickAssessRequest(BaseModel):
    """Mode 1 — drugs only, no timing."""
    age:    float = Field(..., ge=18, le=110)
    sex:    str
    weight: float = Field(..., ge=20, le=300)
    drugs:  list[str] = Field(..., min_length=1)

class FullAssessRequest(BaseModel):
    """Mode 2 — complete timing-aware assessment."""
    patient:     PatientProfile
    meals:       MealTimes
    medications: list[Medication] = Field(..., min_length=1)

# ─── Feature Engineering ───────────────────────────────────────────────────────

def engineer_features(meds: list[Medication | str], age: float, sex: str, weight: float) -> dict:
    """Compute ML feature vector from medication list."""
    names = []
    for m in meds:
        n = normalise(m.drug_name if hasattr(m, "drug_name") else m)
        names.append(n)

    name_set = set(names)
    acb_scores_list = [ACB_SCORES.get(n, 0) for n in names]
    acb_total = sum(acb_scores_list)
    acb_max   = max(acb_scores_list) if acb_scores_list else 0
    acb_count = sum(1 for s in acb_scores_list if s > 0)
    num_drugs = len(names)
    poly_flag = 1 if num_drugs >= 5 else 0
    cns_count = sum(1 for n in names if n in ALL_CNS_DRUGS)
    age_risk  = 1 if age >= 65 else 0
    sex_enc   = 1 if sex.lower() == "female" else 0

    combo_flag = 0
    for combo in HIGH_RISK_COMBOS:
        if combo.issubset(name_set):
            combo_flag = 1
            break
    if "warfarin" in name_set and name_set & {"aspirin","ibuprofen","naproxen"}:
        combo_flag = 1
    opioids = {"morphine","oxycodone","hydrocodone","fentanyl","codeine","tramadol"}
    benzos  = {"diazepam","lorazepam","alprazolam","clonazepam","zopiclone","zolpidem"}
    if name_set & opioids and name_set & benzos:
        combo_flag = 1

    return {
        "age":               age,
        "sex_encoded":       sex_enc,
        "weight_kg":         weight,
        "num_drugs":         num_drugs,
        "acb_total":         acb_total,
        "acb_max":           acb_max,
        "acb_drug_count":    acb_count,
        "polypharmacy_flag": poly_flag,
        "high_risk_combo":   combo_flag,
        "cns_drug_count":    cns_count,
        "age_risk":          age_risk,
    }

FEATURE_ORDER = [
    "age","sex_encoded","weight_kg","num_drugs",
    "acb_total","acb_max","acb_drug_count",
    "polypharmacy_flag","high_risk_combo","cns_drug_count","age_risk",
]

def predict_risk(features: dict) -> float:
    if model:
        vec = np.array([[features[f] for f in FEATURE_ORDER]])
        return float(model.predict_proba(vec)[0][1])
    # Rule-based fallback
    score = 0.0
    if features["acb_total"] >= 3:        score += 0.20
    if features["acb_max"] == 3:          score += 0.10
    if features["polypharmacy_flag"]:     score += 0.15
    if features["high_risk_combo"]:       score += 0.25
    if features["cns_drug_count"] >= 2:   score += 0.10
    if features["age_risk"]:              score += 0.08
    if features["num_drugs"] >= 8:        score += 0.10
    return min(score, 0.99)

def risk_level(prob: float) -> tuple[str, str]:
    if prob >= 0.70: return "HIGH",     "#ef4444"
    if prob >= 0.40: return "MODERATE", "#f59e0b"
    return "LOW", "#10b981"

def build_factors(features: dict, interactions: list, timing_violations: list,
                  therapeutic_dups: list, nighttime: dict) -> list[dict]:
    """Build plain-English risk factors list."""
    factors = []

    for itx in interactions:
        if itx["severity"] == "contraindicated":
            factors.append({
                "icon": "", "severity": "contraindicated",
                "title": f"Contraindicated Combination: {itx['drug_a'].title()} + {itx['drug_b'].title()}",
                "detail": itx["mechanism"] + " — " + itx["recommendation"],
                "timing_note": itx.get("timing_note", ""),
                "shap": 0.4,
            })
        elif itx["severity"] == "major":
            factors.append({
                "icon": "", "severity": "critical",
                "title": f"Major Interaction: {itx['drug_a'].title()} + {itx['drug_b'].title()}",
                "detail": itx["mechanism"],
                "timing_note": itx.get("timing_note", ""),
                "recommendation": itx["recommendation"],
                "shap": 0.3,
            })

    if features["high_risk_combo"]:
        factors.append({
            "icon": "", "severity": "high",
            "title": "High-Risk Drug Combination Detected",
            "detail": "One or more known dangerous drug pairings identified in your medication list.",
            "shap": 0.25,
        })

    if features["acb_total"] >= 3:
        factors.append({
            "icon": "", "severity": "high",
            "title": f"High Anticholinergic Burden (ACB = {features['acb_total']})",
            "detail": f"Your total anticholinergic score is {features['acb_total']}. Scores of 3+ are linked to cognitive decline, confusion, falls, and urinary problems.",
            "shap": 0.22,
        })

    if nighttime["fall_risk"] == "HIGH":
        factors.append({
            "icon": "", "severity": "high",
            "title": f"High Night-Time Fall Risk (Sedation Score: {nighttime['night_sedation_score']})",
            "detail": f"You have {nighttime['drug_count']} sedating medications scheduled at night. This significantly increases risk of falls when getting up during the night.",
            "shap": 0.18,
        })

    for v in timing_violations[:3]:
        factors.append({
            "icon": "", "severity": v["severity"],
            "title": v["type"].replace("_", " ").title(),
            "detail": v["detail"],
            "suggestion": v.get("suggestion", ""),
            "shap": 0.12,
        })

    for dup in therapeutic_dups:
        factors.append({
            "icon": "", "severity": "moderate",
            "title": f"Therapeutic Duplication: {dup['drug_class']} class",
            "detail": dup["detail"],
            "recommendation": dup["recommendation"],
            "shap": 0.10,
        })

    if features["polypharmacy_flag"]:
        factors.append({
            "icon": "", "severity": "moderate",
            "title": f"Polypharmacy Confirmed ({int(features['num_drugs'])} medications)",
            "detail": "Taking 5 or more medications increases the risk of adverse interactions and side effects.",
            "shap": 0.12,
        })

    if features["cns_drug_count"] >= 2:
        factors.append({
            "icon": "", "severity": "moderate",
            "title": f"Multiple CNS Medications ({int(features['cns_drug_count'])} drugs)",
            "detail": "Multiple central nervous system medications increase risk of sedation, falls, and cognitive impairment.",
            "shap": 0.10,
        })

    if not factors:
        factors.append({
            "icon": "", "severity": "none",
            "title": "No Major Risk Factors Detected",
            "detail": "Based on the medications provided, no significant polypharmacy risk indicators were found. Continue following your prescribed schedule.",
            "shap": 0,
        })

    factors.sort(key=lambda x: abs(x["shap"]), reverse=True)
    return factors[:8]

def build_recommendations(interactions, timing_violations, therapeutic_dups, features) -> list[dict]:
    recs = []
    priority = 1

    for itx in interactions:
        if itx["severity"] in ("contraindicated", "major"):
            recs.append({
                "priority": priority,
                "type": "interaction",
                "urgency": "urgent",
                "action": f"Discuss {itx['drug_a'].title()} + {itx['drug_b'].title()} combination with your doctor",
                "reason": itx["recommendation"],
            })
            priority += 1

    for v in timing_violations:
        if v["severity"] in ("critical", "high"):
            recs.append({
                "priority": priority,
                "type": "timing",
                "urgency": "soon",
                "action": v.get("suggestion", v["detail"]),
                "reason": v["detail"],
            })
            priority += 1

    for dup in therapeutic_dups:
        recs.append({
            "priority": priority,
            "type": "duplication",
            "urgency": "review",
            "action": dup["recommendation"],
            "reason": dup["detail"],
        })
        priority += 1

    if features["acb_total"] >= 3:
        recs.append({
            "priority": priority,
            "type": "deprescribing",
            "urgency": "review",
            "action": "Ask your pharmacist or GP to review your anticholinergic medications",
            "reason": f"Your cumulative anticholinergic burden score is {features['acb_total']}. Some of these medications may be reduceable or substitutable.",
        })
        priority += 1

    recs.append({
        "priority": priority,
        "type": "general",
        "urgency": "routine",
        "action": "Bring this report to your next GP or pharmacist appointment",
        "reason": "A medicines review can identify opportunities to simplify your regimen and reduce risk.",
    })

    return recs

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "PolyGuard API v2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "version": "2.0.0"}

@app.get("/drugs/search")
def search_drugs(q: str = ""):
    all_drugs = sorted(set(list(ACB_SCORES.keys()) + ALL_CNS_DRUGS + list(MEAL_RULES.keys())))
    if not q:
        return {"matches": all_drugs[:50]}
    q_lower = q.lower().strip()
    matches = [d for d in all_drugs if q_lower in d][:20]
    return {"matches": matches}

@app.get("/drugs/info/{drug_name}")
def get_drug_info(drug_name: str):
    name = normalise(drug_name)
    return {
        "drug":           drug_name,
        "acb_score":      ACB_SCORES.get(name, 0),
        "sedation_score": SEDATION_SCORES.get(name, 0),
        "atc_class":      DRUG_ATC_CLASS.get(name, "Unknown"),
        "meal_rule":      MEAL_RULES.get(name),
        "narrow_ti":      name in NARROW_TI_DRUGS,
        "cns_drug":       name in ALL_CNS_DRUGS,
    }

@app.get("/drugs/timing-rules/{drug_name}")
def get_timing_rules(drug_name: str):
    name = normalise(drug_name)
    meal_rule = MEAL_RULES.get(name)
    nti = NARROW_TI_DRUGS.get(name)
    sep_rules = [r for r in SEPARATION_RULES if drug_matches(name, r["trigger"])]
    return {
        "drug":             drug_name,
        "meal_rule":        meal_rule,
        "narrow_ti":        nti,
        "separation_rules": sep_rules,
        "acb_score":        ACB_SCORES.get(name, 0),
        "sedation_score":   SEDATION_SCORES.get(name, 0),
    }

@app.post("/assess/quick")
def assess_quick(request: QuickAssessRequest):
    """Basic assessment — drugs only, no timing."""
    try:
        meds_as_obj = [type("M", (), {"drug_name": d})() for d in request.drugs]
        features = engineer_features(meds_as_obj, request.age, request.sex, request.weight)
        prob = predict_risk(features)
        level, colour = risk_level(prob)
        interactions = check_interactions([
            {"drug_name": d, "times": [], "dose": "", "indication": ""} for d in request.drugs
        ])
        factors = build_factors(features, interactions, [], [], {
            "drug_count": 0, "night_sedation_score": 0, "fall_risk": "LOW"
        })
        return {
            "mode":             "quick",
            "risk_level":       level,
            "risk_colour":      colour,
            "risk_probability": round(prob, 4),
            "risk_percent":     round(prob * 100, 1),
            "features":         features,
            "factors":          factors,
            "interactions":     interactions,
            "disclaimer":       "This is a basic assessment without timing information. Run a Full Assessment for complete analysis.",
        }
    except Exception as e:
        logger.error(f"Quick assess error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assess/full")
def assess_full(request: FullAssessRequest):
    """Complete timing-aware assessment."""
    try:
        p    = request.patient
        meds = request.medications
        meals_dict = {
            "breakfast": request.meals.breakfast,
            "lunch":     request.meals.lunch,
            "dinner":    request.meals.dinner,
        }
        meds_dicts = [m.model_dump() for m in meds]

        features     = engineer_features(meds, p.age, p.sex, p.weight)
        prob         = predict_risk(features)
        level, colour = risk_level(prob)

        # Timing analyses
        windows        = analyse_windows(meds_dicts)
        interactions   = check_interactions(meds_dicts)
        timing_violations = check_timing_violations(meds_dicts, meals_dict)
        therapeutic_dups  = check_therapeutic_duplication(meds_dicts)
        curve          = compute_24hr_curve(meds_dicts)
        nighttime      = compute_nighttime_risk(meds_dicts)

        # Narrow TI drugs in regimen
        nti_drugs = [
            {"drug": m.drug_name, "info": NARROW_TI_DRUGS[normalise(m.drug_name)]}
            for m in meds if normalise(m.drug_name) in NARROW_TI_DRUGS
        ]

        # Boost risk score if serious timing issues found
        critical_timing = any(v["severity"] in ("critical","high") for v in timing_violations)
        critical_interactions = any(i["severity"] in ("contraindicated","major") for i in interactions)
        if critical_timing or critical_interactions:
            prob = min(prob + 0.15, 0.99)
            level, colour = risk_level(prob)

        factors         = build_factors(features, interactions, timing_violations, therapeutic_dups, nighttime)
        recommendations = build_recommendations(interactions, timing_violations, therapeutic_dups, features)

        return {
            "mode":              "full",
            "risk_level":        level,
            "risk_colour":       colour,
            "risk_probability":  round(prob, 4),
            "risk_percent":      round(prob * 100, 1),
            "features":          features,
            "factors":           factors,
            "interactions":      interactions,
            "timing_violations": timing_violations,
            "therapeutic_duplications": therapeutic_dups,
            "window_analysis":   windows,
            "daily_burden_curve": curve,
            "nighttime_risk":    nighttime,
            "narrow_ti_drugs":   nti_drugs,
            "recommendations":   recommendations,
            "disclaimer":        "This assessment is for informational and research purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before changing your medications.",
        }
    except Exception as e:
        logger.error(f"Full assess error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
