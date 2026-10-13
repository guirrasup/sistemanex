# Converte as imagens da landing (public/landing/*.png) para WebP leve, na
# resolução em que são exibidas (com folga para telas retina), e apaga os PNG.
# Uso: python scripts/landing-shots/otimizar.py   (rodar depois de gerar as capturas)
import glob, os
from PIL import Image

PASTA = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'landing')
# telas do app aparecem com ~1200px; documentos com até ~720px (NFC-e ~340px)
LARGURA = {'app-': 1600, 'danfce': 640}
PADRAO_DOC = 1100

for png in sorted(glob.glob(os.path.join(PASTA, '*.png'))):
    nome = os.path.basename(png)
    largura = next((v for k, v in LARGURA.items() if nome.startswith(k)), PADRAO_DOC)
    img = Image.open(png)
    img = img.convert('RGB') if img.mode not in ('RGB', 'L') else img
    if img.width > largura:
        img = img.resize((largura, round(img.height * largura / img.width)), Image.LANCZOS)
    destino = png[:-4] + '.webp'
    img.save(destino, 'WEBP', quality=78, method=6)
    print(f'{nome}: {os.path.getsize(png)//1024} KB -> {os.path.basename(destino)} {os.path.getsize(destino)//1024} KB ({img.width}x{img.height})')
    os.remove(png)
