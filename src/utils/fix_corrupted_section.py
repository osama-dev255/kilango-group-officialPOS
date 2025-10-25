# Script to fix the corrupted section in printUtils.ts
with open('printUtils.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Look for the corrupted section and remove it
# Find the end of the printReceiptFallback method
start_marker = 'document.body.innerHTML = originalContent;'
end_marker = '// Print inventory report'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos)

if start_pos != -1 and end_pos != -1:
    # Extract content before the start marker
    before = content[:start_pos + len(start_marker)]
    # Extract content after the end marker
    after = content[end_pos:]
    # Combine with proper closing
    fixed_content = before + '\n    } catch (error) {\n      console.error("Fallback print error:", error);\n    }\n  }\n\n  ' + after
    
    with open('printUtils.ts', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print("Corrupted section fixed successfully!")
else:
    print("Could not locate the markers to fix the file.")