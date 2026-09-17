from pathlib import Path

p = Path("tests/browser/coordination.spec.js")
lines = p.read_text().splitlines()
changed = False
for i, line in enumerate(lines):
    if "await expect(page).toHaveURL" in line and "coordination-service" in line and line.count("\\") >= 4:
        lines[i] = r' await expect(page).toHaveURL(/coordination-service\.html\?/);'
        changed = True
if not changed:
    raise SystemExit("Over-escaped coordination-service URL assertion was not found")
p.write_text("\n".join(lines) + "\n")
