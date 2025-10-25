# Script to fix the printUtils.ts file
with open('printUtils.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the problematic section
start_marker = 'document.body.innerHTML = originalContent;'
end_marker = '// Print inventory report'

# Find the positions
start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos)

if start_pos != -1 and end_pos != -1:
    # Extract the part before the start marker
    before = content[:start_pos + len(start_marker)]
    # Extract the part after the end marker
    after = content[end_pos:]
    # Combine them with the correct closing
    fixed_content = before + '\n    } catch (error) {\n      console.error("Fallback print error:", error);\n    }\n  }\n\n  ' + after
    # Write back to file
    with open('printUtils.ts', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print("File fixed successfully!")
else:
    print("Could not find the markers to fix the file.")