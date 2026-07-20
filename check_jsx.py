import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# We care about lines 20300 to 21850
start_line = 20300
end_line = 21850

brace_level = 0
paren_level = 0
tag_stack = []

# To find tags, let's do a simple tag parser
def get_tags(line):
    # Find all JSX tags, ignoring self-closing ones and comments
    # Strip string literals to avoid matching tags in strings
    line = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', line)
    line = re.sub(r'`[^`\\]*(?:\\.[^`\\]*)*`', '``', line)
    line = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", line)
    
    tags = []
    # Find tag start or end
    # We can match <tag_name, </tag_name, <>, </>
    pos = 0
    while pos < len(line):
        if line[pos:pos+2] == '</':
            end = line.find('>', pos)
            if end != -1:
                tag_name = line[pos+2:end].strip()
                if not tag_name: # </>
                    tag_name = 'FRAGMENT'
                tags.append(('close', tag_name, pos))
                pos = end + 1
            else:
                pos += 2
        elif line[pos:pos+2] == '<>':
            tags.append(('open', 'FRAGMENT', pos))
            pos += 2
        elif line[pos] == '<':
            # check if comment or expression
            if pos + 1 < len(line) and (line[pos+1].isalpha() or line[pos+1] == '_'):
                end = line.find('>', pos)
                if end != -1:
                    # check if self-closing
                    if line[end-1] == '/':
                        pos = end + 1
                        continue
                    # Extract tag name
                    tag_content = line[pos+1:end].strip()
                    tag_name = tag_content.split()[0] if tag_content else ''
                    tags.append(('open', tag_name, pos))
                    pos = end + 1
                else:
                    pos += 1
            else:
                pos += 1
        else:
            pos += 1
    return tags

for idx in range(start_line - 1, end_line):
    line_num = idx + 1
    line = lines[idx]
    
    # Strip comments
    line_no_comment = re.sub(r'//.*', '', line)
    
    # Track parens and braces
    for pos, char in enumerate(line_no_comment):
        if char == '{':
            brace_level += 1
        elif char == '}':
            brace_level -= 1
            if brace_level < 0:
                print(f"ERROR: Negative brace level at line {line_num}")
                brace_level = 0
        elif char == '(':
            paren_level += 1
        elif char == ')':
            paren_level -= 1
            if paren_level < 0:
                print(f"ERROR: Negative paren level at line {line_num}")
                paren_level = 0
                
    # Track tags if brace level is inside JSX (which can be hard to know perfectly, but let's track all tags)
    tags = get_tags(line_no_comment)
    for action, name, _ in tags:
        # ignore standard html/jsx inside comments or strings
        if action == 'open':
            tag_stack.append((name, line_num))
        elif action == 'close':
            if tag_stack:
                last_name, last_line = tag_stack[-1]
                if last_name == name:
                    tag_stack.pop()
                else:
                    print(f"Mismatch: close </{name}> at line {line_num} does not match open <{last_name}> at line {last_line}")
            else:
                print(f"ERROR: close </{name}> at line {line_num} with empty tag stack")

print(f"Analysis completed up to line {end_line}")
print(f"Remaining brace level: {brace_level}")
print(f"Remaining paren level: {paren_level}")
print("Remaining tag stack:")
for name, line_num in tag_stack:
    print(f"  <{name}> opened at line {line_num}")

