import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    full_content = f.read()

lines = full_content.splitlines()

stack = []
in_tag = False
current_tag = []
tag_start_line = 0

for idx, line in enumerate(lines):
    line_num = idx + 1
    
    # Precise comments stripping: do not strip URL protocol slashes like in http:// or https://
    line_clean = re.sub(r'{/\*.*?\*/}', '', line)
    line_clean = re.sub(r'(?<!:)\/\/.*', '', line_clean)
    
    char_idx = 0
    while char_idx < len(line_clean):
        char = line_clean[char_idx]
        if char == '<':
            # Check if next char starts a valid tag: alpha, '/', or '>' (for fragments)
            if char_idx + 1 < len(line_clean) and (line_clean[char_idx+1].isalpha() or line_clean[char_idx+1] in ['/', '>']):
                in_tag = True
                current_tag = [char]
                tag_start_line = line_num
        elif char == '>' and in_tag:
            in_tag = False
            current_tag.append(char)
            tag_text = "".join(current_tag).strip()
            current_tag = []
            
            # Now analyze the tag_text
            if tag_text.startswith('</'):
                tag_name = tag_text.replace('</', '').replace('>', '').strip()
                if tag_name == '': # fragment </>
                    tag_name = ""
                
                # Pop from stack
                if not stack:
                    if 14900 <= tag_start_line <= 16800:
                        print(f"ERROR: Extra closing tag {tag_text} on line {tag_start_line}")
                        exit(1)
                else:
                    top = stack.pop()
                    if top['name'] != tag_name:
                        if 14900 <= tag_start_line <= 16800 or 14900 <= top['line'] <= 16800:
                            print(f"ERROR: Mismatched tags! Expected </{top['name']}> (opened on line {top['line']}), but found {tag_text} on line {tag_start_line}")
                            print(f"Stack trace of open tags in target range:")
                            for item in reversed(stack + [top]):
                                if 14900 <= item['line'] <= 16800:
                                    print(f"  Line {item['line']}: {item['text']}")
                            exit(1)
            else:
                # Opening or self-closing tag
                is_self_close = tag_text.endswith('/>') or tag_text.startswith('<img') or tag_text.startswith('<input') or tag_text.startswith('<br') or tag_text.startswith('<hr')
                if not is_self_close:
                    parts = tag_text.replace('<', '').replace('>', '').split()
                    tag_name = parts[0].strip() if parts else ""
                    
                    if tag_name.lower() in ['img', 'input', 'br', 'hr', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr', 'textarea']:
                        pass
                    else:
                        stack.append({'line': tag_start_line, 'name': tag_name, 'text': tag_text})
        elif in_tag:
            current_tag.append(char)
        
        char_idx += 1

print("Completed checking full file.")
if stack:
    print("Unclosed tags remaining:")
    for item in stack:
        if 14900 <= item['line'] <= 16800:
            print(f"  Line {item['line']}: {item['text']}")
