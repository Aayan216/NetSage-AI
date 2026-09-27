# NetSage AI — Evidence-Based Network Troubleshooting

An AI-assisted troubleshooting workflow for Cisco Packet Tracer labs: a reported
symptom plus real device evidence produces a structured, evidence-backed
diagnosis — and a human always makes the final call.

**Status:** 30-case dataset complete · AI diagnosis + human review complete ·
live Packet Tracer evidence capture still pending (see [Honest status](#honest-status)).

## Workflow

```
symptom → Packet Tracer evidence → deterministic rule checks
        → structured JSON AI diagnosis → human review (Accepted / Edited / Rejected)
        → responsible-AI log → dashboard
```

## Repository layout

```
NETSAGE_AI/
├── cases/        30 deliberately broken .pkt labs (NET-001 … NET-030)
├── data/         cases.csv, evidence_capture.csv, ai_diagnoses.csv,
│                 rule_checker_results*.csv
├── prompts/      diagnose_prompt.md (structured-JSON prompt), helper_prompts.md
├── scripts/      NetSage_rule_checker_FIXED.py, run_diagnosis.py,
│                 validation fixtures, reference_builders/
├── dashboard/    NetSage_Dashboard.html + .xlsx
└── docs/         Final report, presentation, evidence READMEs,
                  responsible_ai_log.md
```

## Dataset

30 cases across 8 networking domains:

| Category | Cases | Category | Cases |
|---|---|---|---|
| VLAN | 5 | Routing | 4 |
| Gateway | 3 | ACL | 3 |
| DHCP | 4 | NAT | 3 |
| DNS | 3 | Wireless | 5 |

Each case records the symptom, topology note, commands to run, expected fault,
and OSI layer. Lab files live in `NETSAGE_AI/cases/`.

## Components

### Deterministic rule checker
`scripts/NetSage_rule_checker_FIXED.py` — transparent regex/keyword checks for
six deterministic fault patterns: `duplicate_ip`, `wrong_mask`,
`gateway_mismatch`, `interface_down`, `missing_vlan`, `missing_route`. It reads
**actual command output only** — a list of command names is never treated as
evidence.

```bash
python NETSAGE_AI/scripts/NetSage_rule_checker_FIXED.py
```

Both validation fixtures (`scripts/NetSage_rule_checker_validation.csv` and
`scripts/rule_checker_validation_6.csv`) exercise all six checks — 6/6 pass.

### AI diagnosis + human review
`prompts/diagnose_prompt.md` defines an evidence-first prompt that returns a
single JSON object (`root_cause`, `osi_layer`, `confidence`, `evidence`,
`next_command`, `fix_steps`, `concept_tag`). `scripts/run_diagnosis.py`
reproduces the recorded diagnosis run without needing live API credentials.

```bash
python NETSAGE_AI/scripts/run_diagnosis.py
```

### Results

| Metric | Value |
|---|---|
| Total cases | 30 |
| Accepted (AI = human) | 25 |
| Edited | 2 |
| Rejected | 3 |
| AI/human direct agreement | 83.3% |

Every edited/rejected case is written up in
`NETSAGE_AI/docs/responsible_ai_log.md` so model errors stay visible and
auditable. The dashboard in `NETSAGE_AI/dashboard/` summarizes the same numbers.

## Honest status

- All 30 rows in `data/evidence_capture.csv` are `PENDING_ACTUAL_CAPTURE`:
  the `.pkt` labs must be opened in Cisco Packet Tracer, the listed commands
  run, and their output pasted in verbatim. No output has been invented.
- Consequently `rule_checker_results.csv` reports 0 flags on real cases —
  the checker only flags evidence it is actually given.
- The diagnosis records are a reproducible evaluation dataset built from the
  documented case faults and review decisions, not live external-model API logs.

## Responsible AI

Human review is mandatory before any fix is applied. The reviewer can accept,
edit, or reject an AI recommendation; corrections are retained in the
responsible-AI log. The AI never applies or claims to apply a fix.
