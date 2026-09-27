# NetSage AI — 30-Case Evidence Pack

This pack prepares all 30 cases for evidence capture and keeps the evidence boundary honest.

## Important
The uploaded `.pkt` files are Cisco Packet Tracer binaries. This environment cannot execute Cisco Packet Tracer, so it cannot truthfully extract live `show` command output from those binaries.

Therefore:
- `expected_fault` is the documented known fault.
- `required_commands` are the commands to run.
- `actual_show_output` is intentionally blank.
- `evidence_status=PENDING_ACTUAL_CAPTURE` means real Packet Tracer output is still required.
- No synthetic output is presented as actual evidence.

## Use
Open each `.pkt` in Packet Tracer, run the listed commands, copy the output exactly, and paste it into `actual_show_output`. Then change the status to `CAPTURED`.

This aligns the dataset with the official requirement that each case contain symptom/topology information plus show-command output and that the AI diagnosis be evidence-backed and human reviewed.
