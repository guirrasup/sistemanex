# Deixa o "*" dos rótulos de campos obrigatórios em vermelho (text-danger).
# Uso: python scripts/asterisco-obrigatorio.py <arquivo.tsx> [...]
import re, sys
for q in sys.argv[1:]:
    t = open(q, encoding='utf-8').read()
    t = re.sub(r'(?<!>)\s\*(</label>)', r' <span className="text-danger">*</span>\1', t)
    t = re.sub(r'(<label[^>]*>[^<{]*?) \*(\s*<span)', r'\1 <span className="text-danger">*</span>\2', t)
    open(q, 'w', encoding='utf-8').write(t)
    print(q, 'asteriscos:', t.count('text-danger">*'))
