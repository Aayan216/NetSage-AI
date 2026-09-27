# NetSage AI — 30-Case Evidence Pack

This pack holds the evidence for all 30 cases and keeps the evidence boundary honest.

## Important
The uploaded `.pkt` files are Cisco Packet Tracer binaries. This environment cannot execute Cisco Packet Tracer, so it cannot truthfully extract live `show` command output from those binaries.

Therefore:
- `expected_fault` is the documented known fault.
- `required_commands` are the commands to run.
- 21 rows carry real output transcribed verbatim from a Packet Tracer
  screenshot in `NETSAGE_AI/proof/` (`evidence_status=CAPTURED`,
  `evidence_source` cites the exact file).
- The other 9 rows (NET-004, 007, 008, 014, 015, 019, 025, 027, 029) keep
  `actual_show_output` blank with
  `evidence_status=PENDING_ACTUAL_CAPTURE` — their `notes` say what the proof
  set contains and which command output is still required.
- No synthetic output is presented as actual evidence.

## Use
Open each pending `.pkt` in Packet Tracer, run the listed commands, copy the output exactly, and paste it into `actual_show_output`. Then change the status to `CAPTURED` and point `evidence_source` at the saved screenshot.

This aligns the dataset with the official requirement that each case contain symptom/topology information plus show-command output and that the AI diagnosis be evidence-backed and human reviewed.
