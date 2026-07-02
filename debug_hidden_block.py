import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

block_lines = lines[15711:16585]

stack = []
for idx, line in enumerate(block_lines):
    line_num = 15712 + idx
    line_clean = re.sub(r'{/\*.*?\*/}', '', line)
    line_clean = re.sub(r'(?<!:)\/\/.*', '', line_clean)
    
    char_idx = 0
    while char_idx < len(line_clean):
        char = line_clean[char_idx]
        if char == '<':
            if char_idx + 1 < len(line_clean) and (line_clean[char_idx+1].isalpha() or line_clean[char_idx+1] in ['/', '>']):
                in_tag = True
                current_tag = [char]
                tag_start_line = line_num
                
                f_idx = char_idx + 1
                while f_idx < len(line_clean) and line_clean[f_idx] != '>':
                    current_tag.append(line_clean[f_idx])
                    f_idx += 1
                if f_idx < len(line_clean):
                    current_tag.append('>')
                    
                tag_text = "".join(current_tag).strip()
                
                if tag_text.startswith('</'):
                    tag_name = tag_text.replace('</', '').replace('>', '').strip()
                    if tag_name == '':
                        tag_name = ""
                    if stack:
                        top = stack.pop()
                    else:
                        print(f"[{line_num}] Extra closing tag: {tag_text}")
                else:
                    is_self_close = tag_text.endswith('/>') or tag_text.startswith('<img') or tag_text.startswith('<input') or tag_text.startswith('<br') or tag_text.startswith('<hr')
                    if not is_self_close:
                        parts = tag_text.replace('<', '').replace('>', '').split()
                        tag_name = parts[0].strip() if parts else ""
                        if tag_name.lower() in ['img', 'input', 'br', 'hr', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr', 'textarea']:
                            pass
                        else:
                            stack.append({'line': line_num, 'name': tag_name, 'text': tag_text})
                char_idx = f_idx
        char_idx += 1

print("--- REMAINING STACK AT END OF HIDDEN BLOCK ---")
for item in stack:
    print(f"Line {item['line']}: {item['text']}")
