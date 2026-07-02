with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace {!isRegistering ? ( with {!isRegistering ? (<>
target1 = """          {!isRegistering ? (
            <div className="grid"""

replacement1 = """          {!isRegistering ? (
            <>
            <div className="grid"""

# Replace </div> before ) : ( with </div></>
target2 = """                </div>
              </div>
            </div>
          ) : ("""

replacement2 = """                </div>
              </div>
            </div>
            </>
          ) : ("""

content_fixed = content.replace(target1, replacement1, 1).replace(target2, replacement2, 1)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("Ternary formatting fixed!")
