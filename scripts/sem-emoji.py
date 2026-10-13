# Remove emojis decorativos de textos de interface (comentários ficam como estão).
# Uso: python scripts/sem-emoji.py <arquivo.tsx> [...]
import re, sys
EMOJI = re.compile(r'[🌀-🫿☀-➿⭐✅❌⏳️]\s?')
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    out, n = [], 0
    for linha in s.split('\n'):
        t = linha.strip()
        if t.startswith(('//', '{/*', '*', '/*')):
            out.append(linha)
            continue
        nova = EMOJI.sub('', linha)
        n += nova != linha
        out.append(nova)
    open(p, 'w', encoding='utf-8').write('\n'.join(out))
    print(p, 'linhas:', n)
