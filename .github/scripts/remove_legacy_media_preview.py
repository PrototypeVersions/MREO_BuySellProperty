from pathlib import Path
import re

path = Path("seller.html")
text = path.read_text()
pattern = re.compile(r'\n\s*<div\s+id="media-preview"\s+class="media-preview"\s+aria-live="polite"\s*></div>\s*\n', re.MULTILINE)
updated, count = pattern.subn("\n", text, count=1)
if count != 1:
    raise SystemExit("legacy media preview block not found")
path.write_text(updated)
