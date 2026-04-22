import re
import os

log_path = r"C:\Users\ASUS\.gemini\antigravity\brain\ebca3c57-d02d-4433-9dc7-e718af755f78\.system_generated\logs\overview.txt"
with open(log_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscamos el contenido de index.tsx
index_match = re.search(r"File Path: `file:///c:/andes-city-core/app/app/%28tabs%29/index\.tsx`\nTotal Lines: 668\nTotal Bytes: 27004\nShowing lines 1 to 668\n.*?\n1: (.*?)\n668: (.*?)\nThe above content", content, re.DOTALL)

if index_match:
    lines = index_match.group(0).split('\n')
    out_lines = []
    capture = False
    for line in lines:
        if line.startswith('1: '):
            capture = True
        if capture and line.startswith('The above content'):
            break
        if capture:
            # remove line number prefix like "1: "
            parts = line.split(': ', 1)
            if len(parts) == 2 and parts[0].isdigit():
                out_lines.append(parts[1])
            elif not line.strip():
                # blank line
                out_lines.append("")
    
    with open(r"c:\andes-city-core\app\app\(tabs)\index.tsx", 'w', encoding='utf-8') as out_f:
        out_f.write('\n'.join(out_lines))
    print("index.tsx recovered!")
else:
    print("index.tsx not found in logs")

# Buscamos el contenido de MapWebView.tsx
map_match = re.search(r"File Path: `file:///c:/andes-city-core/app/components/MapWebView\.tsx`\nTotal Lines: 463\nTotal Bytes: 19481\nShowing lines 1 to 463\n.*?\n1: (.*?)\n463: (.*?)\nThe above content", content, re.DOTALL)

if map_match:
    lines = map_match.group(0).split('\n')
    out_lines = []
    capture = False
    for line in lines:
        if line.startswith('1: '):
            capture = True
        if capture and line.startswith('The above content'):
            break
        if capture:
            # remove line number prefix like "1: "
            parts = line.split(': ', 1)
            if len(parts) == 2 and parts[0].isdigit():
                out_lines.append(parts[1])
            elif not line.strip():
                # blank line
                out_lines.append("")
    
    with open(r"c:\andes-city-core\app\components\MapWebView.tsx", 'w', encoding='utf-8') as out_f:
        out_f.write('\n'.join(out_lines))
    print("MapWebView.tsx recovered!")
else:
    print("MapWebView.tsx not found in logs")
