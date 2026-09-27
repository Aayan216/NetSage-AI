# NetSage AI Evidence Capture

`cases.csv` records the commands to run. It does not itself contain the terminal/device output.

Use `data/evidence_capture.csv` as the capture register. For each NET-001..NET-030:
1. Open the matching Packet Tracer `.pkt` file.
2. Run every command listed in `required_commands`.
3. Paste the output verbatim into `actual_show_output`.
4. Keep `evidence_status` as `CAPTURED` only after checking it against the Packet Tracer screen.
5. Do not invent or reconstruct output from the expected fault.

The deterministic checker reads `actual_show_output`, not the command list. Run:

`python scripts/NetSage_rule_checker_FIXED.py`

This controlled validation demonstrates all six required deterministic checks before running the checker on captured lab evidence.
