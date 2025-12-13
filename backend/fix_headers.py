
import os

def fix_headers(directory):
    count = 0
    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if not file.endswith('.ts'):
                continue
                
            filepath = os.path.join(root, file)
            # Calculate relative path from backend root (assuming script runs in backend/)
            rel_path = os.path.relpath(filepath, '.')
            expected_header = f"// backend/{rel_path}"
            
            with open(filepath, 'r') as f:
                lines = f.readlines()
                
            if not lines:
                continue
                
            first_line = lines[0].strip()
            
            # Only replace if it looks like a file header comment (starts with // backend/src/)
            # or if we want to enforce it on all files (but let's be safe and only target existing wrong ones)
            if first_line.startswith('// backend/src/'):
                if first_line != expected_header:
                    print(f"Fixing {rel_path}")
                    print(f"  Old: {first_line}")
                    print(f"  New: {expected_header}")
                    lines[0] = expected_header + '\n'
                    with open(filepath, 'w') as f:
                        f.writelines(lines)
                    count += 1

    print(f"Fixed {count} files.")

if __name__ == "__main__":
    fix_headers('src')
