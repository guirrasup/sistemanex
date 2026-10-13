# Converte os PNGs dos documentos fiscais da landing para preto e branco, como
# sairiam impressos (os layouts de tela usam cores; documento fiscal não).
# Uso: python scripts/landing-shots/monocromatico.py  (rodar após gerar os PNGs)
from PIL import Image

for nome in ['danfe', 'danfse', 'danfce', 'dacte', 'danfae', 'damdfe']:
    caminho = f'public/landing/{nome}.png'
    img = Image.open(caminho).convert('RGBA')
    fundo = Image.new('RGBA', img.size, (255, 255, 255, 255))
    fundo.alpha_composite(img)
    # quase-branco (fundos tintos) vira branco; o resto escurece como tinta de impressão
    cinza = fundo.convert('L').point(lambda v: 255 if v >= 236 else int(v * 0.7))
    cinza.save(caminho, optimize=True)
