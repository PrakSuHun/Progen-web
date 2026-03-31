#!/bin/bash

# Remove metadata from client-side pages
files=(
  "app/admin/page.tsx"
  "app/apply/page.tsx"
  "app/checkin/page.tsx"
  "app/event-reg/page.tsx"
  "app/feedback/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Remove the metadata import and export
    sed -i '' '/import { Metadata } from/d' "$file"
    sed -i '' '/^export const metadata: Metadata = {$/,/^}$/d' "$file"
    echo "Fixed: $file"
  fi
done

