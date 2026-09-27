# NetSage AI — Helper Prompt Templates

## 1. Pre-Diagnosis Rule Check
Use deterministic checker findings as supporting evidence.

```text
You are given deterministic rule-checker findings and a Packet Tracer case.
Use the findings only when they are relevant and traceable to the supplied evidence.
Then produce the same JSON diagnosis defined in diagnose_prompt.md.
Do not invent missing evidence.

Rule checker findings:
{rule_checker_json}

Case:
{case_data}
```

## 2. Confidence Self-Check
```text
Review the diagnosis against the original evidence.

Return JSON:
{
  "evidence_traceable": true,
  "alternative_cause": null,
  "revised_confidence": "high"
}
```

## 3. Human Review Log
```text
Case ID: {case_id}
AI diagnosis: {ai_diagnosis_json}
Reviewer decision: Accepted|Edited|Rejected
Reviewer notes: {reviewer_notes}

Return:
{
  "case_id": "...",
  "decision": "Accepted|Edited|Rejected",
  "ai_root_cause": "...",
  "corrected_root_cause": "...",
  "reason_for_correction": "...",
  "category_of_error": "wrong-layer|wrong-fault|insufficient-evidence|overconfident|correct|other"
}
```

## 4. Dashboard Summary
```text
Given aggregated case statistics, write 3-5 sentences describing:
- most common fault categories,
- where AI required correction,
- one recommended study/improvement area.
Do not invent numbers.
```
