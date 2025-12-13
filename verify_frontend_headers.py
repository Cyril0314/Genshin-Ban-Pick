import os
import sys

# Directory of the frontend source files
FRONTEND_SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), 'genshin-ban-pick', 'src'))

# File extensions to check
EXTENSIONS = ('.ts', '.tsx', '.vue')

mismatches = []

for root, _, files in os.walk(FRONTEND_SRC):
    for filename in files:
        if filename.endswith(EXTENSIONS):
            file_path = os.path.join(root, filename)
            rel_path = os.path.relpath(file_path, FRONTEND_SRC)
            expected_comment = f"// src/{rel_path.replace(os.sep, '/')}"
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                if first_line != expected_comment:
                    mismatches.append((file_path, first_line, expected_comment))
            except Exception as e:
                print(f"Error reading {file_path}: {e}", file=sys.stderr)

if mismatches:
    print('Found mismatches:')
    for path, found, expected in mismatches:
        print(f"File: {path}\n  Found:    {found}\n  Expected: {expected}\n{'-'*40}")
    sys.exit(1)
else:
    print('All frontend headers are correct.')
    sys.exit(0)
