import os

file_path = r'c:\Users\sumit\OneDrive\Desktop\Eventportal\frontend\src\pages\Dashboard.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Stop before the accidental AuthContext append (around line 888)
    if 'export const AuthProvider' in line:
        break
    
    # Uncomment lines
    if line.strip().startswith('// '):
        # Remove first occurrence of '// '
        new_line = line.replace('// ', '', 1)
        new_lines.append(new_line)
    elif line.strip() == '//':
        new_lines.append('\n')
    else:
        # Keep widely lines if they are not commented (though previous view showed they were)
        # But wait, lines 888+ were NOT commented.
        # Lines 1-886 WERE commented.
        # So acceptable lines are those in 1-886 range.
        if i < 887:
             new_lines.append(line)

# Ensure the last line is export default Dashboard
# It should be in the new_lines if we uncommented correctly.

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Dashboard.jsx fixed.")
