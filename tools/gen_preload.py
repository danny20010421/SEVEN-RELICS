# 掃描關卡程式裡用到的素材 ID，產生 js/preload.js（進關卡前要先下載完的清單）
import re, os, sys
root = sys.argv[1]
out = {}
for key, files in {'n01': ['js/n01.js'], 'n02': ['js/n02.js']}.items():
    src = ''.join(open(os.path.join(root, f), encoding='utf-8').read() for f in files)
    if key == 'n02': src += "N01-CHAR-012 N01-CHAR-013 N01-CHAR-014 N01-PROP-038 N01-DOC-062-front"
    ids = set(re.findall(r'N0[0-9]-[A-Z_]+-[0-9A-Za-z]+(?:-[a-z0-9]+)*', src))
    imgs = set()
    for i in sorted(ids):
        for ext in ('.webp', '.png'):
            if os.path.exists(os.path.join(root, 'assets/img', i + ext)): imgs.add(i + ext); break
    # 程式裡用字串組出來的檔名（例如抽屜、狀態圖）：該關前綴的圖全部一起下載
    pre = key.upper() + '-'
    imgs |= {f for f in os.listdir(os.path.join(root, 'assets/img')) if f.startswith(pre) and f.endswith(('.webp', '.png'))}
    imgs = sorted(imgs)
    auds = sorted(set(m for m in re.findall(r'assets/audio/[\w.-]+\.mp3', open(os.path.join(root, 'js/audio.js'), encoding='utf-8').read()) if (key.upper() in m) or (key == 'n01' and 'N01' in m) or (key == 'n02' and 'N02' in m)))
    out[key] = (imgs, auds)
with open(os.path.join(root, 'js/preload.js'), 'w', encoding='utf-8') as f:
    f.write('// 自動產生（tools/gen_preload.py）：進關卡前先下載完的素材\n')
    f.write('export const STAGE_ASSETS = {\n')
    for k, (imgs, auds) in out.items():
        f.write(f"  {k}: {{\n    img: {imgs!r},\n    audio: {auds!r},\n  }},\n".replace("'", "'"))
    f.write('};\n')
for k, (i, a) in out.items(): print(k, len(i), 'images', len(a), 'audio')
