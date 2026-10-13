# Converte classes Tailwind de um componente para o tema "tom sobre tom":
#   slate-*  -> ink-*   (neutros do tema)
#   matizes decorativos (emerald, blue, purple, cyan, amber, orange…) -> brand-*
#   rose/red continuam: são o sinal de erro de validação.
# Uso: python scripts/tom-sobre-tom.py <arquivo.tsx> [...]
import re, sys
MATIZES = 'emerald|green|blue|purple|violet|indigo|cyan|sky|teal|orange|amber|yellow|lime|pink|fuchsia'
for caminho in sys.argv[1:]:
    s = open(caminho, encoding='utf-8').read()
    antes = s
    s = re.sub(r'(?<=[-:\s"`\'])slate-(\d{2,3})', r'ink-\1', s)
    s = re.sub(r'(?<=-)(?:' + MATIZES + r')-(\d{2,3})\b', r'brand-\1', s)
    s = re.sub(r'(?<=[\s"`\'])(from|to|via)-(?:' + MATIZES + r')-(\d{2,3})', r'\1-brand-\2', s)
    open(caminho, 'w', encoding='utf-8').write(s)
    print(caminho, 'trocas:', sum(1 for a, b in zip(antes.split(), s.split()) if a != b))
