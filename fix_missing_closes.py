with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Target line to insert before:
target = '            <div className="hidden">'
replacement = """                    </div> {/* Column 2 close */}
                  </div> {/* Grid close */}
                </form> {/* Form close */}

            <div className="hidden">"""

new_content = content.replace(target, replacement, 1)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Modification done!")
