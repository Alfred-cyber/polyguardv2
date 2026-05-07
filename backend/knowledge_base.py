"""
PolyGuard v2 — Pharmacological Knowledge Base
All drug rules, scores, and interaction data encoded here.
"""

# ─── ACB Scale (Bishara et al., 2017) ─────────────────────────────────────────
ACB_SCORES: dict[str, int] = {
    # Score 3 — Definite anticholinergic
    "amitriptyline": 3, "amoxapine": 3, "atropine": 3, "benztropine": 3,
    "brompheniramine": 3, "carbinoxamine": 3, "chlorpheniramine": 3,
    "chlorpromazine": 3, "clomipramine": 3, "clozapine": 3,
    "cyclobenzaprine": 3, "cyproheptadine": 3, "desipramine": 3,
    "dicyclomine": 3, "dimenhydrinate": 3, "diphenhydramine": 3,
    "doxepin": 3, "doxylamine": 3, "flavoxate": 3, "hydroxyzine": 3,
    "hyoscyamine": 3, "imipramine": 3, "meclizine": 3, "nortriptyline": 3,
    "olanzapine": 3, "orphenadrine": 3, "oxybutynin": 3, "paroxetine": 3,
    "perphenazine": 3, "promethazine": 3, "propantheline": 3,
    "scopolamine": 3, "thioridazine": 3, "tolterodine": 3,
    "trifluoperazine": 3, "trimipramine": 3, "trospium": 3,
    # Score 2
    "amantadine": 2, "belladonna": 2, "carbamazepine": 2, "loxapine": 2,
    "meperidine": 2, "molindone": 2, "oxcarbazepine": 2, "pimozide": 2,
    "quetiapine": 2, "risperidone": 2, "tizanidine": 2,
    # Score 1
    "bupropion": 1, "captopril": 1, "codeine": 1, "colchicine": 1,
    "diazepam": 1, "digoxin": 1, "furosemide": 1, "haloperidol": 1,
    "hydralazine": 1, "isosorbide": 1, "metoprolol": 1, "morphine": 1,
    "nifedipine": 1, "prednisolone": 1, "prednisone": 1,
    "ranitidine": 1, "theophylline": 1, "tramadol": 1,
    "triamterene": 1, "warfarin": 1,
}

# ─── Sedation Scores (0-3) ────────────────────────────────────────────────────
SEDATION_SCORES: dict[str, int] = {
    # Score 3 — Strongly sedating
    "amitriptyline": 3, "chlorpromazine": 3, "clozapine": 3,
    "doxepin": 3, "fluphenazine": 3, "lorazepam": 3,
    "nitrazepam": 3, "temazepam": 3, "triazolam": 3,
    "zopiclone": 3, "zolpidem": 3, "diazepam": 3,
    "phenobarbitone": 3, "promethazine": 3, "thioridazine": 3,
    # Score 2 — Moderately sedating
    "alprazolam": 2, "clonazepam": 2, "codeine": 2,
    "gabapentin": 2, "hydroxyzine": 2, "mirtazapine": 2,
    "morphine": 2, "oxazepam": 2, "oxycodone": 2,
    "pregabalin": 2, "quetiapine": 2, "tramadol": 2,
    "trazodone": 2, "valproate": 2,
    # Score 1 — Mildly sedating
    "atenolol": 1, "carbamazepine": 1, "cetirizine": 1,
    "chlorpheniramine": 1, "citalopram": 1, "duloxetine": 1,
    "fluoxetine": 1, "haloperidol": 1, "lamotrigine": 1,
    "metoprolol": 1, "nortriptyline": 1, "paroxetine": 1,
    "sertraline": 1, "venlafaxine": 1,
}

# ─── CNS Drug Categories ──────────────────────────────────────────────────────
CNS_DRUGS: dict[str, list[str]] = {
    "antidepressants": [
        "amitriptyline", "citalopram", "clomipramine", "desipramine",
        "doxepin", "duloxetine", "escitalopram", "fluoxetine", "fluvoxamine",
        "imipramine", "mirtazapine", "nortriptyline", "paroxetine",
        "sertraline", "trazodone", "venlafaxine", "bupropion",
    ],
    "antipsychotics": [
        "aripiprazole", "amisulpride", "chlorpromazine", "clozapine",
        "fluphenazine", "haloperidol", "lurasidone", "olanzapine",
        "paliperidone", "quetiapine", "risperidone", "thioridazine",
        "trifluoperazine", "ziprasidone",
    ],
    "benzodiazepines": [
        "alprazolam", "chlordiazepoxide", "clonazepam", "diazepam",
        "flurazepam", "lorazepam", "midazolam", "nitrazepam",
        "oxazepam", "temazepam", "triazolam",
    ],
    "opioids": [
        "buprenorphine", "codeine", "fentanyl", "hydrocodone",
        "hydromorphone", "meperidine", "methadone", "morphine",
        "oxycodone", "tapentadol", "tramadol",
    ],
    "anticonvulsants": [
        "carbamazepine", "clonazepam", "gabapentin", "lamotrigine",
        "levetiracetam", "oxcarbazepine", "phenobarbitone", "phenytoin",
        "pregabalin", "topiramate", "valproate", "valproic acid",
    ],
    "z_drugs": [
        "zaleplon", "zolpidem", "zopiclone",
    ],
}

ALL_CNS_DRUGS = [d for cat in CNS_DRUGS.values() for d in cat]

# ─── Meal Timing Rules ────────────────────────────────────────────────────────
# relation: "before" | "with" | "after" | "any"
# gap_mins: required gap before meal (for "before") or after meal (for "after")
MEAL_RULES: dict[str, dict] = {
    # Must take BEFORE food
    "levothyroxine":     {"relation": "before", "gap_mins": 30,  "strict": True,  "reason": "Food, calcium, and iron significantly reduce absorption by up to 40%."},
    "thyroxine":         {"relation": "before", "gap_mins": 30,  "strict": True,  "reason": "Same active ingredient as levothyroxine — must be taken on empty stomach."},
    "alendronic acid":   {"relation": "before", "gap_mins": 30,  "strict": True,  "reason": "Must be taken 30 minutes before first food/drink of the day. Patient must remain upright.", "upright": True},
    "risedronate":       {"relation": "before", "gap_mins": 30,  "strict": True,  "reason": "Take 30 minutes before food. Remain upright for at least 30 minutes.", "upright": True},
    "iron":              {"relation": "before", "gap_mins": 0,   "strict": False, "reason": "Best absorbed on an empty stomach. If causing GI upset, can take with food — but absorption reduced by ~50%."},
    "ferrous sulphate":  {"relation": "before", "gap_mins": 0,   "strict": False, "reason": "Take on an empty stomach if tolerated. Avoid tea, coffee, dairy within 2 hours."},
    "ferrous fumarate":  {"relation": "before", "gap_mins": 0,   "strict": False, "reason": "Take on an empty stomach if tolerated."},
    "captopril":         {"relation": "before", "gap_mins": 60,  "strict": False, "reason": "Food reduces absorption by 30-40%. Take 1 hour before meals."},
    "penicillamine":     {"relation": "before", "gap_mins": 60,  "strict": True,  "reason": "Food significantly reduces absorption."},
    # Must take WITH food
    "metformin":         {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Taking with food significantly reduces gastrointestinal side effects (nausea, diarrhoea)."},
    "ibuprofen":         {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "NSAIDs must be taken with food or milk to protect the gastric lining. Risk of ulceration otherwise."},
    "naproxen":          {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Take with food or milk to reduce gastric irritation."},
    "aspirin":           {"relation": "with",   "gap_mins": 0,   "strict": False, "reason": "Take with or after food to reduce stomach irritation. Enteric-coated formulations are more flexible."},
    "nitrofurantoin":    {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Food improves absorption and reduces nausea."},
    "carbamazepine":     {"relation": "with",   "gap_mins": 0,   "strict": False, "reason": "Take with food to reduce GI side effects."},
    "lithium":           {"relation": "with",   "gap_mins": 0,   "strict": False, "reason": "Take with food to reduce nausea. Maintain consistent salt and fluid intake."},
    "prednisone":        {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Take with food to reduce stomach irritation."},
    "prednisolone":      {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Take with food to reduce gastric side effects."},
    "rivaroxaban":       {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Evening dose (15mg/20mg) MUST be taken with food to ensure adequate absorption."},
    "lapatinib":         {"relation": "with",   "gap_mins": 0,   "strict": True,  "reason": "Take with food — food increases bioavailability."},
    # Optimal timing (not strictly food-related)
    "simvastatin":       {"relation": "any",    "optimal_time": "evening", "reason": "Liver produces cholesterol mainly at night. Evening dosing maximises efficacy."},
    "atorvastatin":      {"relation": "any",    "reason": "Can be taken at any time but should be consistent daily."},
    "ramipril":          {"relation": "any",    "reason": "Not significantly affected by food. Take consistently."},
    "amlodipine":        {"relation": "any",    "reason": "Not significantly affected by food."},
    "bisoprolol":        {"relation": "any",    "reason": "Can be taken with or without food."},
    "warfarin":          {"relation": "any",    "consistent": True, "reason": "Take at the same time every day. Maintain consistent vitamin K intake (leafy greens)."},
}

# ─── Required Separation Rules ────────────────────────────────────────────────
# min_gap_mins: minimum minutes required between the two drugs/classes
SEPARATION_RULES: list[dict] = [
    {
        "trigger": ["iron", "ferrous sulphate", "ferrous fumarate", "ferrous gluconate"],
        "avoid_with": ["*"],
        "min_gap_mins": 120,
        "reason": "Iron chelates with many drugs, dramatically reducing their absorption.",
        "exceptions": []
    },
    {
        "trigger": ["antacid", "calcium carbonate", "gaviscon", "omeprazole", "lansoprazole", "pantoprazole"],
        "avoid_with": ["iron", "levothyroxine", "thyroxine", "ciprofloxacin", "doxycycline", "azithromycin"],
        "min_gap_mins": 120,
        "reason": "Antacids and PPIs alter gastric pH, significantly reducing absorption of many drugs.",
    },
    {
        "trigger": ["calcium"],
        "avoid_with": ["ciprofloxacin", "doxycycline", "tetracycline", "norfloxacin", "levofloxacin"],
        "min_gap_mins": 180,
        "reason": "Calcium forms insoluble complexes with fluoroquinolone and tetracycline antibiotics, preventing absorption.",
    },
    {
        "trigger": ["cholestyramine", "colestyramine"],
        "avoid_with": ["*"],
        "min_gap_mins": 240,
        "reason": "Cholestyramine binds to many drugs in the GI tract, preventing absorption. Take all other medications at least 4 hours before or after.",
    },
    {
        "trigger": ["levothyroxine", "thyroxine"],
        "avoid_with": ["iron", "calcium", "antacid", "omeprazole", "lansoprazole"],
        "min_gap_mins": 120,
        "reason": "Multiple drugs significantly reduce levothyroxine absorption. Administer at least 2 hours apart.",
    },
    {
        "trigger": ["ciprofloxacin", "norfloxacin", "levofloxacin"],
        "avoid_with": ["iron", "calcium", "antacid", "zinc", "magnesium"],
        "min_gap_mins": 120,
        "reason": "Divalent cations chelate fluoroquinolone antibiotics, dramatically reducing serum levels.",
    },
    {
        "trigger": ["doxycycline", "tetracycline"],
        "avoid_with": ["iron", "calcium", "antacid", "dairy"],
        "min_gap_mins": 120,
        "reason": "Divalent cations chelate tetracyclines. Do not take within 2 hours of dairy products, antacids, or iron.",
    },
    {
        "trigger": ["warfarin"],
        "avoid_with": ["aspirin", "ibuprofen", "naproxen", "diclofenac"],
        "min_gap_mins": 0,  # timing doesn't mitigate — it's a pharmacodynamic interaction
        "reason": "Warfarin + NSAIDs: dramatically increased bleeding risk. This is a pharmacodynamic interaction — timing gap does not reduce the risk. Avoid combination entirely.",
        "timing_mitigates": False,
    },
]

# ─── Drug Interaction Database ────────────────────────────────────────────────
# severity: "minor" | "moderate" | "major" | "contraindicated"
DRUG_INTERACTIONS: list[dict] = [
    # CONTRAINDICATED
    {
        "drugs": ["maoi", "tranylcypromine", "phenelzine", "isocarboxazid"],
        "interacts_with": ["ssri", "fluoxetine", "sertraline", "citalopram", "escitalopram", "paroxetine", "tramadol", "pethidine", "meperidine"],
        "severity": "contraindicated",
        "mechanism": "Serotonin syndrome — potentially fatal accumulation of serotonin",
        "timing_mitigates": False,
        "recommendation": "Do not combine MAOIs with serotonergic agents. Allow 14 days washout after stopping MAOI before starting SSRI.",
    },
    {
        "drugs": ["sildenafil", "tadalafil", "vardenafil"],
        "interacts_with": ["nitrate", "isosorbide mononitrate", "isosorbide dinitrate", "glyceryl trinitrate", "nitroglycerin"],
        "severity": "contraindicated",
        "mechanism": "Additive vasodilation — severe, potentially fatal hypotension",
        "timing_mitigates": False,
        "recommendation": "Absolute contraindication. Do not combine PDE5 inhibitors with any nitrate.",
    },
    # MAJOR
    {
        "drugs": ["warfarin"],
        "interacts_with": ["aspirin", "ibuprofen", "naproxen", "diclofenac", "celecoxib"],
        "severity": "major",
        "mechanism": "Warfarin anticoagulation + NSAID platelet inhibition + gastric mucosal damage = dramatically increased bleeding risk",
        "timing_mitigates": False,
        "recommendation": "Avoid combination. If NSAID required, use with PPI and monitor INR closely. Consider paracetamol instead.",
    },
    {
        "drugs": ["opioid", "morphine", "oxycodone", "fentanyl", "codeine", "tramadol", "buprenorphine"],
        "interacts_with": ["benzodiazepine", "diazepam", "lorazepam", "alprazolam", "clonazepam", "temazepam", "zopiclone", "zolpidem"],
        "severity": "major",
        "mechanism": "Combined CNS and respiratory depression — significantly increased risk of fatal respiratory arrest",
        "timing_mitigates": True,
        "min_safe_gap_mins": 240,
        "recommendation": "FDA Black Box Warning. If co-prescription is unavoidable, use lowest doses, monitor closely, and do not take at the same time.",
    },
    {
        "drugs": ["digoxin"],
        "interacts_with": ["amiodarone"],
        "severity": "major",
        "mechanism": "Amiodarone inhibits P-glycoprotein and CYP3A4, increasing digoxin levels by 50–100%, leading to digoxin toxicity",
        "timing_mitigates": False,
        "recommendation": "Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels and ECG.",
    },
    {
        "drugs": ["lithium"],
        "interacts_with": ["ibuprofen", "naproxen", "diclofenac", "celecoxib"],
        "severity": "major",
        "mechanism": "NSAIDs reduce renal lithium clearance, causing toxicity (tremor, confusion, renal failure)",
        "timing_mitigates": False,
        "recommendation": "Avoid NSAIDs with lithium. Use paracetamol instead. Monitor lithium levels if NSAID unavoidable.",
    },
    {
        "drugs": ["methotrexate"],
        "interacts_with": ["ibuprofen", "naproxen", "aspirin", "diclofenac"],
        "severity": "major",
        "mechanism": "NSAIDs reduce renal methotrexate clearance, causing severe toxicity",
        "timing_mitigates": False,
        "recommendation": "Avoid NSAIDs with methotrexate. If required, use with extreme caution and monitor FBC and renal function.",
    },
    {
        "drugs": ["simvastatin", "lovastatin"],
        "interacts_with": ["amiodarone", "clarithromycin", "erythromycin", "fluconazole", "itraconazole"],
        "severity": "major",
        "mechanism": "CYP3A4 inhibition dramatically increases statin levels — risk of rhabdomyolysis",
        "timing_mitigates": False,
        "recommendation": "Switch to pravastatin or rosuvastatin (less CYP3A4 dependent), or withhold statin during antibiotic course.",
    },
    {
        "drugs": ["clopidogrel"],
        "interacts_with": ["omeprazole", "esomeprazole"],
        "severity": "major",
        "mechanism": "Omeprazole inhibits CYP2C19, reducing conversion of clopidogrel to its active metabolite by ~40%",
        "timing_mitigates": True,
        "min_safe_gap_mins": 480,
        "recommendation": "Use pantoprazole or lansoprazole instead. If omeprazole required, take at different times of day (8+ hours apart).",
    },
    {
        "drugs": ["warfarin"],
        "interacts_with": ["fluconazole", "metronidazole", "clarithromycin", "ciprofloxacin"],
        "severity": "major",
        "mechanism": "CYP2C9 inhibition reduces warfarin metabolism, significantly increasing INR and bleeding risk",
        "timing_mitigates": False,
        "recommendation": "Monitor INR closely when starting/stopping these antibiotics. Anticipate dose adjustment needed.",
    },
    # MODERATE
    {
        "drugs": ["ssri", "fluoxetine", "sertraline", "paroxetine", "citalopram", "escitalopram"],
        "interacts_with": ["tramadol"],
        "severity": "moderate",
        "mechanism": "Combined serotonergic effect — serotonin syndrome risk; also tramadol seizure threshold lowered",
        "timing_mitigates": False,
        "recommendation": "Use with caution. Educate patient on serotonin syndrome symptoms (agitation, tremor, hyperthermia). Consider alternative analgesic.",
    },
    {
        "drugs": ["acei", "ramipril", "lisinopril", "enalapril", "perindopril"],
        "interacts_with": ["potassium", "spironolactone", "eplerenone", "amiloride"],
        "severity": "moderate",
        "mechanism": "Combined potassium-sparing effect — risk of hyperkalaemia, cardiac arrhythmia",
        "timing_mitigates": False,
        "recommendation": "Monitor potassium levels regularly. Avoid potassium supplements unless hypokalaemia confirmed.",
    },
    {
        "drugs": ["atorvastatin", "rosuvastatin"],
        "interacts_with": ["clarithromycin", "erythromycin", "fluconazole"],
        "severity": "moderate",
        "mechanism": "CYP3A4 inhibition increases statin exposure — myopathy risk",
        "timing_mitigates": False,
        "recommendation": "Temporarily withhold statin during short antibiotic course if possible.",
    },
]

# ─── Narrow Therapeutic Index Drugs ──────────────────────────────────────────
# These drugs require extra timing precision and monitoring
NARROW_TI_DRUGS: dict[str, dict] = {
    "warfarin":        {"monitor": "INR", "interval_critical": True,  "note": "Consistent daily timing essential. Any change in diet, drugs, or alcohol affects INR."},
    "digoxin":         {"monitor": "Digoxin level, HR, ECG", "interval_critical": True, "note": "Narrow therapeutic window. Signs of toxicity: nausea, visual disturbances, bradycardia."},
    "lithium":         {"monitor": "Lithium level, renal function", "interval_critical": True, "note": "12-hour dosing interval must be consistent for accurate level monitoring."},
    "phenytoin":       {"monitor": "Phenytoin level", "interval_critical": True, "note": "Non-linear kinetics. Small dose changes produce large level changes."},
    "ciclosporin":     {"monitor": "Ciclosporin trough level", "interval_critical": True, "note": "12-hour dosing interval. Food effect significant — take consistently with or without."},
    "tacrolimus":      {"monitor": "Tacrolimus trough level", "interval_critical": True, "note": "12-hour dosing interval critical. Many food and drug interactions."},
    "theophylline":    {"monitor": "Theophylline level", "interval_critical": True, "note": "Narrow therapeutic window. Half-life varies widely between patients."},
    "methotrexate":    {"monitor": "FBC, renal/hepatic function", "interval_critical": False, "note": "Weekly dosing — ensure patient does not take daily accidentally."},
    "aminoglycosides": {"monitor": "Drug levels, renal function", "interval_critical": True, "note": "Once-daily dosing preferred. Trough levels critical."},
}

# ─── High-Risk Drug Combinations ─────────────────────────────────────────────
HIGH_RISK_COMBOS: list[set] = [
    {"warfarin", "aspirin"},
    {"warfarin", "ibuprofen"},
    {"warfarin", "naproxen"},
    {"warfarin", "fluconazole"},
    {"warfarin", "metronidazole"},
    {"warfarin", "clarithromycin"},
    {"digoxin", "amiodarone"},
    {"lithium", "ibuprofen"},
    {"lithium", "naproxen"},
    {"clopidogrel", "omeprazole"},
    {"simvastatin", "amiodarone"},
    {"simvastatin", "clarithromycin"},
    {"tacrolimus", "fluconazole"},
    {"atorvastatin", "clarithromycin"},
    {"methotrexate", "ibuprofen"},
    {"methotrexate", "naproxen"},
]

# ─── Drug → ATC Class Mapping ─────────────────────────────────────────────────
DRUG_ATC_CLASS: dict[str, str] = {
    # Antidepressants
    "fluoxetine": "SSRI", "sertraline": "SSRI", "citalopram": "SSRI",
    "escitalopram": "SSRI", "paroxetine": "SSRI", "fluvoxamine": "SSRI",
    "venlafaxine": "SNRI", "duloxetine": "SNRI",
    "amitriptyline": "TCA", "nortriptyline": "TCA", "imipramine": "TCA",
    "clomipramine": "TCA", "doxepin": "TCA",
    "mirtazapine": "NaSSA", "trazodone": "SARI", "bupropion": "NDRI",
    # Antipsychotics
    "haloperidol": "FGA", "chlorpromazine": "FGA", "thioridazine": "FGA",
    "risperidone": "SGA", "olanzapine": "SGA", "quetiapine": "SGA",
    "aripiprazole": "SGA", "clozapine": "SGA", "amisulpride": "SGA",
    # Benzodiazepines
    "diazepam": "BDZ", "lorazepam": "BDZ", "alprazolam": "BDZ",
    "clonazepam": "BDZ", "temazepam": "BDZ", "oxazepam": "BDZ",
    # Beta-blockers
    "metoprolol": "BB", "bisoprolol": "BB", "atenolol": "BB",
    "propranolol": "BB", "carvedilol": "BB", "nebivolol": "BB",
    # ACE Inhibitors
    "ramipril": "ACEI", "lisinopril": "ACEI", "enalapril": "ACEI",
    "perindopril": "ACEI", "captopril": "ACEI",
    # ARBs
    "losartan": "ARB", "valsartan": "ARB", "irbesartan": "ARB",
    "candesartan": "ARB", "olmesartan": "ARB",
    # Statins
    "atorvastatin": "STATIN", "simvastatin": "STATIN", "rosuvastatin": "STATIN",
    "pravastatin": "STATIN", "fluvastatin": "STATIN",
    # NSAIDs
    "ibuprofen": "NSAID", "naproxen": "NSAID", "diclofenac": "NSAID",
    "celecoxib": "NSAID", "etoricoxib": "NSAID",
    # Opioids
    "morphine": "OPIOID", "oxycodone": "OPIOID", "codeine": "OPIOID",
    "tramadol": "OPIOID", "fentanyl": "OPIOID", "buprenorphine": "OPIOID",
    # Anticoagulants
    "warfarin": "VKA", "apixaban": "DOAC", "rivaroxaban": "DOAC",
    "dabigatran": "DOAC", "edoxaban": "DOAC",
    # PPIs
    "omeprazole": "PPI", "lansoprazole": "PPI", "pantoprazole": "PPI",
    "esomeprazole": "PPI", "rabeprazole": "PPI",
    # Diuretics
    "furosemide": "LOOP_DIURETIC", "bumetanide": "LOOP_DIURETIC",
    "bendroflumethiazide": "THIAZIDE", "indapamide": "THIAZIDE",
    "spironolactone": "K_SPARING", "amiloride": "K_SPARING",
}

# ─── Therapeutic Class → Indication Mapping ──────────────────────────────────
CLASS_INDICATIONS: dict[str, list[str]] = {
    "SSRI":          ["Depression", "Anxiety", "OCD", "PTSD", "Panic Disorder"],
    "SNRI":          ["Depression", "Anxiety", "Neuropathic Pain", "Fibromyalgia"],
    "TCA":           ["Depression", "Neuropathic Pain", "Migraine Prevention", "Bedwetting"],
    "BB":            ["Hypertension", "Heart Failure", "Angina", "Arrhythmia", "Anxiety"],
    "ACEI":          ["Hypertension", "Heart Failure", "Diabetic Nephropathy", "Post-MI"],
    "ARB":           ["Hypertension", "Heart Failure", "Diabetic Nephropathy"],
    "STATIN":        ["High Cholesterol", "Cardiovascular Prevention"],
    "NSAID":         ["Pain", "Inflammation", "Arthritis"],
    "OPIOID":        ["Pain", "Chronic Pain", "Palliative Care"],
    "VKA":           ["Atrial Fibrillation", "DVT", "PE", "Mechanical Heart Valve"],
    "DOAC":          ["Atrial Fibrillation", "DVT", "PE", "Stroke Prevention"],
    "PPI":           ["Acid Reflux", "GORD", "Gastric Ulcer", "Gastroprotection"],
    "BDZ":           ["Anxiety", "Insomnia", "Seizure", "Muscle Spasm"],
    "LOOP_DIURETIC": ["Heart Failure", "Oedema", "Hypertension"],
    "THIAZIDE":      ["Hypertension", "Oedema"],
    "K_SPARING":     ["Heart Failure", "Hypertension", "Oedema"],
    "SGA":           ["Schizophrenia", "Bipolar Disorder", "Depression Augmentation"],
    "FGA":           ["Schizophrenia", "Psychosis"],
}

# ─── Time Window Definitions ─────────────────────────────────────────────────
TIME_WINDOWS = [
    {"name": "Night",       "start": 0,  "end": 6,  "label": "Night (00:00–06:00)"},
    {"name": "Morning",     "start": 6,  "end": 10, "label": "Morning (06:00–10:00)"},
    {"name": "Mid-Morning", "start": 10, "end": 12, "label": "Mid-Morning (10:00–12:00)"},
    {"name": "Lunchtime",   "start": 12, "end": 14, "label": "Lunchtime (12:00–14:00)"},
    {"name": "Afternoon",   "start": 14, "end": 18, "label": "Afternoon (14:00–18:00)"},
    {"name": "Evening",     "start": 18, "end": 21, "label": "Evening (18:00–21:00)"},
    {"name": "Bedtime",     "start": 21, "end": 24, "label": "Bedtime (21:00–23:59)"},
]

# ─── Drug Absorption Windows (minutes to peak plasma) ────────────────────────
ABSORPTION_WINDOWS: dict[str, int] = {
    "immediate_release": 90,
    "extended_release":  240,
    "enteric_coated":    180,
    "sublingual":        10,
    "default":           90,
}
