#!/usr/bin/env bash
# Regenere les PDFs depuis docs/fr/*.md. Prerequis (Ubuntu): sudo apt install pandoc wkhtmltopdf
set -euo pipefail
cd "$(dirname "$0")/.."
for f in docs/fr/*.md; do
  out="${f%.md}.pdf"
  pandoc "$f" -f gfm -t html5 -s --metadata pagetitle="Documentation LYTEN" --metadata lang=fr -c pdf.css -o "${f%.md}.html"
  wkhtmltopdf --enable-local-file-access -q --page-size A4 -T 16mm -B 16mm -L 14mm -R 14mm "${f%.md}.html" "$out"
  rm "${f%.md}.html"
  echo "OK $out"
done
