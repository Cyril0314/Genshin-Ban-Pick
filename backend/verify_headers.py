
import os

def verify_headers(directory):
    mismatches = []
    missing = []
    
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
                first_line = f.readline().strip()
                
            if first_line.startswith('// backend/src/'):
                if first_line != expected_header:
                    mismatches.append({
                        'file': rel_path,
                        'found': first_line,
                        'expected': expected_header
                    })
            else:
                missing.append(rel_path)

    return mismatches, missing

if __name__ == "__main__":
    mismatches, missing = verify_headers('src')
    
    if mismatches:
        print("Found mismatches:")
        for m in mismatches:
            print(f"File: {m['file']}")
            print(f"  Found:    {m['found']}")
            print(f"  Expected: {m['expected']}")
            print("-" * 20)
    
    if not mismatches and not missing:
        print("All headers are correct!")
