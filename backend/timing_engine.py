"""
PolyGuard v2 — Timing Analysis Engine
Handles all time-aware pharmacological risk detection.
"""

from datetime import datetime, timedelta
from typing import Optional
from knowledge_base import (
    MEAL_RULES, SEPARATION_RULES, DRUG_INTERACTIONS,
    SEDATION_SCORES, ACB_SCORES, TIME_WINDOWS,
    HIGH_RISK_COMBOS, NARROW_TI_DRUGS, DRUG_ATC_CLASS,
    CLASS_INDICATIONS, ALL_CNS_DRUGS
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def parse_time(t: str) -> Optional[datetime]:
    """Parse 'HH:MM' string into datetime (today as base date)."""
    try:
        h, m = map(int, t.strip().split(":"))
        return datetime.now().replace(hour=h, minute=m, second=0, microsecond=0)
    except Exception:
        return None


def gap_minutes(t1: str, t2: str) -> int:
    """Absolute gap in minutes between two HH:MM times (circular, 24hr)."""
    a = parse_time(t1)
    b = parse_time(t2)
    if not a or not b:
        return 999
    diff = abs((a - b).total_seconds()) / 60
    return int(min(diff, 1440 - diff))  # Take shortest path around clock


def get_window(time_str: str) -> str:
    """Return the named time window for a given HH:MM."""
    t = parse_time(time_str)
    if not t:
        return "Unknown"
    hour = t.hour
    for w in TIME_WINDOWS:
        if w["start"] <= hour < w["end"]:
            return w["name"]
    return "Bedtime"


def normalise(name: str) -> str:
    return name.lower().strip()


def drug_matches(drug: str, pattern_list: list[str]) -> bool:
    """Check if drug matches any pattern in list (* = wildcard)."""
    d = normalise(drug)
    for pattern in pattern_list:
        p = normalise(pattern)
        if p == "*":
            return True
        if p in d or d in p or d == p:
            return True
    return False


def nearest_meal(time_str: str, meals: dict) -> tuple[str, int]:
    """Return (meal_name, gap_minutes) for the nearest meal to a given time."""
    best_name = "None"
    best_gap = 9999
    for meal_name, meal_time in meals.items():
        if not meal_time:
            continue
        gap = gap_minutes(time_str, meal_time)
        if gap < best_gap:
            best_gap = gap
            best_name = meal_name
    return best_name, best_gap


def get_meal_relation(drug_time: str, meal_time: str) -> str:
    """Determine if drug is taken before/with/after a meal."""
    if not meal_time:
        return "unknown"
    d = parse_time(drug_time)
    m = parse_time(meal_time)
    if not d or not m:
        return "unknown"
    diff = (d - m).total_seconds() / 60
    if -15 <= diff <= 30:
        return "with"
    elif diff < -15:
        return "before"
    else:
        return "after"


# ─── Per-Window Analysis ──────────────────────────────────────────────────────

def analyse_windows(medications: list[dict]) -> list[dict]:
    """Group medications by time window and compute per-window risk scores."""
    windows: dict[str, dict] = {}

    for med in medications:
        for t in med.get("times", []):
            win = get_window(t)
            if win not in windows:
                windows[win] = {
                    "window": win,
                    "time_range": next(
                        (w["label"] for w in TIME_WINDOWS if w["name"] == win),
                        win
                    ),
                    "drugs": [],
                    "acb_score": 0,
                    "sedation_score": 0,
                    "drug_count": 0,
                    "flags": [],
                }
            name = normalise(med["drug_name"])
            windows[win]["drugs"].append({
                "name": med["drug_name"],
                "time": t,
                "dose": med.get("dose", ""),
                "indication": med.get("indication", ""),
            })
            windows[win]["acb_score"] += ACB_SCORES.get(name, 0)
            windows[win]["sedation_score"] += SEDATION_SCORES.get(name, 0)
            windows[win]["drug_count"] += 1

    # Score each window
    result = []
    for win_name, w in windows.items():
        score = 0
        if w["acb_score"] >= 3:
            score += 2
            w["flags"].append({
                "type": "HIGH_ACB_WINDOW",
                "severity": "high",
                "detail": f"Anticholinergic burden of {w['acb_score']} in this window. High risk of confusion, dry mouth, urinary retention."
            })
        if w["sedation_score"] >= 4:
            score += 3
            w["flags"].append({
                "type": "HIGH_SEDATION_CLUSTER",
                "severity": "critical" if win_name == "Bedtime" else "high",
                "detail": f"Sedation score of {w['sedation_score']} — multiple sedating drugs taken together. {'Significantly elevated fall and respiratory depression risk at night.' if win_name in ('Bedtime', 'Night') else 'Risk of daytime sedation and impaired function.'}"
            })
        elif w["sedation_score"] >= 2 and win_name in ("Bedtime", "Night"):
            score += 1
            w["flags"].append({
                "type": "NIGHT_SEDATION_MODERATE",
                "severity": "moderate",
                "detail": f"Moderate sedation load at bedtime (score {w['sedation_score']}). Monitor for falls when getting up at night."
            })
        if w["drug_count"] >= 4:
            score += 1
            w["flags"].append({
                "type": "DOSE_CLUSTER",
                "severity": "moderate",
                "detail": f"{w['drug_count']} medications taken in this window. Consider whether all are necessary at the same time — large clusters increase swallowing burden and adherence risk."
            })
        w["risk_score"] = score
        w["risk_level"] = "CRITICAL" if score >= 5 else "HIGH" if score >= 3 else "MODERATE" if score >= 1 else "LOW"
        result.append(w)

    return sorted(result, key=lambda x: x["risk_score"], reverse=True)


# ─── Timing Violations ────────────────────────────────────────────────────────

def check_timing_violations(medications: list[dict], meals: dict) -> list[dict]:
    """Check all timing-based violations: meal alignment, separation rules, narrow TI."""
    violations = []

    for med in medications:
        name = normalise(med["drug_name"])
        times = med.get("times", [])
        if not times:
            continue

        for t in times:
            # ── Meal alignment check ──────────────────────────────────────────
            rule = MEAL_RULES.get(name)
            if rule:
                meal_name, gap = nearest_meal(t, meals)
                actual_relation = get_meal_relation(t, meals.get(meal_name))
                required_relation = rule.get("relation", "any")
                optimal_time = rule.get("optimal_time")
                strict = rule.get("strict", False)

                if required_relation != "any":
                    if actual_relation != required_relation:
                        violations.append({
                            "drug": med["drug_name"],
                            "time": t,
                            "type": "MEAL_TIMING_MISMATCH",
                            "severity": "high" if strict else "moderate",
                            "detail": (
                                f"{med['drug_name']} should be taken {required_relation} food, "
                                f"but it is currently scheduled {actual_relation} {meal_name} "
                                f"({gap} minutes gap). {rule['reason']}"
                            ),
                            "suggestion": f"Reschedule {med['drug_name']} to be taken {required_relation} {meal_name}.",
                        })
                    elif rule.get("upright"):
                        violations.append({
                            "drug": med["drug_name"],
                            "time": t,
                            "type": "POSTURE_REMINDER",
                            "severity": "moderate",
                            "detail": f"{med['drug_name']} requires you to remain upright (sitting or standing) for at least 30 minutes after taking it. Do not go back to bed.",
                            "suggestion": "Schedule this dose at least 30 minutes before any lying down period.",
                        })

                if optimal_time and t:
                    hour = parse_time(t)
                    if hour and not (18 <= hour.hour <= 23):
                        violations.append({
                            "drug": med["drug_name"],
                            "time": t,
                            "type": "SUBOPTIMAL_TIMING",
                            "severity": "low",
                            "detail": f"{med['drug_name']} is most effective when taken in the {optimal_time}. {rule['reason']}",
                            "suggestion": f"Consider moving {med['drug_name']} to the {optimal_time}.",
                        })

            # ── Narrow therapeutic index ──────────────────────────────────────
            nti = NARROW_TI_DRUGS.get(name)
            if nti and nti.get("interval_critical") and len(times) >= 2:
                for i in range(len(times)):
                    for j in range(i + 1, len(times)):
                        gap = gap_minutes(times[i], times[j])
                        expected = 1440 // len(times)
                        if abs(gap - expected) > 60:
                            violations.append({
                                "drug": med["drug_name"],
                                "time": f"{times[i]} / {times[j]}",
                                "type": "NARROW_TI_INTERVAL_WARNING",
                                "severity": "high",
                                "detail": (
                                    f"{med['drug_name']} is a narrow therapeutic index drug requiring precise dosing intervals. "
                                    f"The gap between {times[i]} and {times[j]} is {gap} minutes "
                                    f"(expected ~{expected} minutes). {nti['note']}"
                                ),
                                "suggestion": f"Space {med['drug_name']} doses as evenly as possible across 24 hours.",
                            })

    # ── Separation rules between different drugs ──────────────────────────────
    for i, med_a in enumerate(medications):
        for med_b in medications[i + 1:]:
            name_a = normalise(med_a["drug_name"])
            name_b = normalise(med_b["drug_name"])
            for rule in SEPARATION_RULES:
                a_matches = drug_matches(name_a, rule["trigger"]) and drug_matches(name_b, rule.get("avoid_with", []))
                b_matches = drug_matches(name_b, rule["trigger"]) and drug_matches(name_a, rule.get("avoid_with", []))
                if a_matches or b_matches:
                    trigger_med = med_a if a_matches else med_b
                    other_med = med_b if a_matches else med_a
                    for t_a in trigger_med.get("times", []):
                        for t_b in other_med.get("times", []):
                            gap = gap_minutes(t_a, t_b)
                            req = rule["min_gap_mins"]
                            if req > 0 and gap < req:
                                violations.append({
                                    "drug": f"{trigger_med['drug_name']} / {other_med['drug_name']}",
                                    "time": f"{t_a} / {t_b}",
                                    "type": "SEPARATION_RULE_BREACH",
                                    "severity": "high",
                                    "detail": (
                                        f"{trigger_med['drug_name']} and {other_med['drug_name']} "
                                        f"are only {gap} minutes apart but require at least {req} minutes separation. "
                                        f"{rule['reason']}"
                                    ),
                                    "suggestion": f"Separate {trigger_med['drug_name']} and {other_med['drug_name']} by at least {req} minutes.",
                                })
    return violations


# ─── Interaction Detection with Timing ───────────────────────────────────────

def check_interactions(medications: list[dict]) -> list[dict]:
    """Detect drug-drug interactions with timing proximity context."""
    flags = []
    names = [normalise(m["drug_name"]) for m in medications]
    name_to_med = {normalise(m["drug_name"]): m for m in medications}

    for interaction in DRUG_INTERACTIONS:
        matched_a = []
        matched_b = []
        for drug_pattern in interaction["drugs"]:
            for name in names:
                if drug_matches(name, [drug_pattern]):
                    matched_a.append(name)
        for drug_pattern in interaction["interacts_with"]:
            for name in names:
                if drug_matches(name, [drug_pattern]) and name not in matched_a:
                    matched_b.append(name)

        for a in matched_a:
            for b in matched_b:
                if a == b:
                    continue
                med_a = name_to_med.get(a)
                med_b = name_to_med.get(b)
                times_a = med_a.get("times", []) if med_a else []
                times_b = med_b.get("times", []) if med_b else []

                # Find closest scheduled administration
                min_gap = 9999
                closest_pair = (None, None)
                for ta in times_a:
                    for tb in times_b:
                        g = gap_minutes(ta, tb)
                        if g < min_gap:
                            min_gap = g
                            closest_pair = (ta, tb)

                timing_note = ""
                timing_mitigates = interaction.get("timing_mitigates", False)
                min_safe = interaction.get("min_safe_gap_mins", 0)

                if closest_pair[0] and closest_pair[1]:
                    if timing_mitigates and min_gap >= min_safe:
                        timing_note = f"✅ Current gap ({min_gap} min) meets the recommended minimum separation of {min_safe} min. Maintain this schedule."
                    elif timing_mitigates and min_gap < min_safe:
                        timing_note = f"⚠️ Current gap ({min_gap} min) is less than the recommended {min_safe} min. Increase separation."
                    elif not timing_mitigates:
                        timing_note = f"⚠️ These drugs are scheduled {min_gap} min apart. Timing does NOT reduce this interaction risk."
                    else:
                        timing_note = f"Closest doses are {min_gap} min apart."

                flags.append({
                    "drug_a": a,
                    "drug_b": b,
                    "severity": interaction["severity"],
                    "mechanism": interaction["mechanism"],
                    "timing_proximity_mins": min_gap if min_gap < 9999 else None,
                    "timing_mitigates": timing_mitigates,
                    "timing_note": timing_note,
                    "recommendation": interaction["recommendation"],
                })

    return flags


# ─── Therapeutic Duplication ─────────────────────────────────────────────────

def check_therapeutic_duplication(medications: list[dict]) -> list[dict]:
    """Detect drugs from the same class treating the same indication."""
    duplications = []
    class_groups: dict[str, list] = {}

    for med in medications:
        name = normalise(med["drug_name"])
        atc = DRUG_ATC_CLASS.get(name)
        if atc:
            if atc not in class_groups:
                class_groups[atc] = []
            class_groups[atc].append({
                "name": med["drug_name"],
                "indication": med.get("indication", ""),
                "class": atc,
            })

    for atc_class, drugs in class_groups.items():
        if len(drugs) >= 2:
            indications = CLASS_INDICATIONS.get(atc_class, [])
            duplications.append({
                "drug_class": atc_class,
                "drugs": [d["name"] for d in drugs],
                "indications": indications,
                "detail": (
                    f"{' and '.join(d['name'] for d in drugs)} are both in the "
                    f"{atc_class} drug class. Having two drugs from the same class is usually "
                    f"not recommended unless specifically intended."
                ),
                "recommendation": f"Review with your prescriber whether both {' and '.join(d['name'] for d in drugs)} are necessary.",
            })

    return duplications


# ─── 24-Hour Burden Curve ─────────────────────────────────────────────────────

def compute_24hr_curve(medications: list[dict]) -> list[dict]:
    """Compute hour-by-hour ACB and sedation burden across the day."""
    curve = [{"hour": h, "acb_load": 0, "sedation_load": 0, "drug_count": 0} for h in range(24)]
    absorption_window_hrs = 2  # approx 2-hour absorption + distribution window

    for med in medications:
        name = normalise(med["drug_name"])
        acb = ACB_SCORES.get(name, 0)
        sed = SEDATION_SCORES.get(name, 0)
        for t in med.get("times", []):
            dt = parse_time(t)
            if not dt:
                continue
            start_hour = dt.hour
            for offset in range(absorption_window_hrs + 1):
                h = (start_hour + offset) % 24
                curve[h]["acb_load"] += acb
                curve[h]["sedation_load"] += sed
                curve[h]["drug_count"] += 1 if offset == 0 else 0

    return curve


# ─── Night-Time Risk ─────────────────────────────────────────────────────────

def compute_nighttime_risk(medications: list[dict]) -> dict:
    """Compute dedicated night-time (21:00-06:00) risk assessment."""
    night_drugs = []
    night_acb = 0
    night_sed = 0

    for med in medications:
        name = normalise(med["drug_name"])
        for t in med.get("times", []):
            dt = parse_time(t)
            if not dt:
                continue
            h = dt.hour
            if h >= 21 or h < 6:
                acb = ACB_SCORES.get(name, 0)
                sed = SEDATION_SCORES.get(name, 0)
                night_drugs.append({
                    "name": med["drug_name"],
                    "time": t,
                    "acb": acb,
                    "sedation": sed,
                    "is_narrow_ti": name in NARROW_TI_DRUGS,
                })
                night_acb += acb
                night_sed += sed

    fall_risk = (
        "HIGH" if night_sed >= 4 else
        "MODERATE" if night_sed >= 2 else
        "LOW"
    )
    respiratory_risk = (
        "HIGH" if any(
            drug_matches(normalise(d["name"]), ["opioid", "morphine", "oxycodone", "codeine", "tramadol", "fentanyl"]) and
            drug_matches(normalise(d["name"]), ["benzodiazepine", "diazepam", "lorazepam", "zopiclone", "zolpidem"])
            for d in night_drugs
        ) else
        "MODERATE" if night_sed >= 3 else
        "LOW"
    )

    return {
        "night_drugs": night_drugs,
        "night_acb_score": night_acb,
        "night_sedation_score": night_sed,
        "fall_risk": fall_risk,
        "respiratory_risk": respiratory_risk,
        "drug_count": len(night_drugs),
    }
