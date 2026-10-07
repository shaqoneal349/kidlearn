# 匯入 AI 生成的美術圖：依對照表改名、縮放、壓成 WebP，放進 assets/
# 用法：python tools/import-art.py <生成圖資料夾> [對照表.json]
# 對照表格式：{"<來源檔名>": "<assets 內的目標路徑>"}；沒有給就用下面的 MAP（依建立時間排序的編號）。
import sys, os, glob, json
from PIL import Image

src = sys.argv[1]
root = os.path.join(os.path.dirname(__file__), '..')
files = sorted(glob.glob(os.path.join(src, '*.png')), key=os.path.getmtime)

# 第一批（2026-10-07，113 張）：依建立時間排序後的編號 → 目標檔名
MAP = {
    0: 'bg/home-island', 1: 'char/fox-idle', 2: 'bg/game-zh', 3: 'bg/game-ma', 4: 'bg/game-en', 5: 'bg/boss', 6: 'bg/library',
    7: 'bg/lessons', 8: 'bg/puzzle', 9: 'bg/garage', 10: 'bg/race-track', 11: 'bg/result', 12: 'bg/welcome',
    13: 'char/fox-wave', 14: 'char/fox-point', 15: 'char/fox-think', 16: 'char/fox-cheer', 17: 'char/fox-comfort', 18: 'char/fox-read',
    19: 'char/fox-rest', 20: 'char/fox-trophy', 21: 'char/bunny-happy', 22: 'char/bunny-idle', 23: 'char/bunny-hmm',
    24: 'char/bear-hungry', 25: 'char/bear-happy', 26: 'char/owl-teach', 27: 'char/owl-happy',
    28: 'char/pet-0-egg', 29: 'char/pet-1-hatch', 30: 'char/pet-2-chick', 31: 'char/pet-3-dino', 32: 'char/pet-4-dragon',
    33: 'char/boss-octopus', 34: 'char/boss-star', 35: 'char/boss-dragon',
    36: 'ui/panel-wood', 37: 'ui/panel-paper', 38: 'ui/btn-yellow', 39: 'ui/btn-green', 40: 'ui/btn-yellow-down', 41: 'ui/btn-round',
    42: 'ui/option-card', 43: 'ui/option-right', 44: 'ui/option-wrong', 45: 'ui/tabbar', 46: 'ui/progress-vine', 47: 'ui/progress-fill',
    48: 'ui/bubble', 49: 'ui/frame-card',
    50: 'icon/coin', 51: 'icon/star', 52: 'icon/star-empty', 53: 'icon/heart', 54: 'icon/sticker', 55: 'icon/calendar',
    58: 'icon/parent', 59: 'icon/sound', 60: 'icon/hint', 61: 'icon/nav-island', 62: 'icon/nav-explore', 63: 'icon/nav-story', 64: 'icon/nav-home',
    65: 'icon/subj-zh', 66: 'icon/subj-ma', 67: 'icon/subj-en', 68: 'icon/portal-lessons', 69: 'icon/portal-library', 70: 'icon/portal-garage',
}
# 第 111 張起是第二階段的物件，依 docs/art/assets.csv 裡物件的順序（同一批生成時照清單順序產生）
import re
ITEMS = re.findall(r'assets/(item/[0-9a-f-]+)\.webp', open(os.path.join(root, 'docs/art/assets.csv'), encoding='utf-8-sig').read())
for i, t in enumerate(ITEMS): MAP[111 + i] = t
GAMES = 'e1 e2 e3 e4 e5 m1 m2 m3 m4 m5 c1 c2 c3 c4 c5 e6 c8 e7 m6 c6 c7 c10 c9 c11 e8 c12 e9 m9 c13 e10 m7 m8 c14 c15 m10 pz-match pz-tetris pz-merge pz-blocks pz-sort'.split()
for i, g in enumerate(GAMES): MAP[71 + i] = 'game/' + g

# 各類別的輸出大小（長邊）與品質
SIZE = {'bg': 1254, 'char': 512, 'item': 384, 'icon': 256, 'game': 384, 'ui': 768}
QUAL = {'bg': 80, 'char': 85, 'item': 85, 'icon': 88, 'game': 85, 'ui': 90}

def convert(path, target):
    kind = target.split('/')[0]
    im = Image.open(path)
    im = im.convert('RGBA') if kind != 'bg' else im.convert('RGB')
    if kind == 'ui':  # 介面元件：裁掉透明邊，邊框才會貼齊（給 border-image 拉伸用）
        bb = im.getchannel('A').point(lambda a: 255 if a > 12 else 0).getbbox()
        if bb: im = im.crop(bb)
    im.thumbnail((SIZE[kind], SIZE[kind]), Image.LANCZOS)
    out = os.path.join(root, 'assets', target + '.webp')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, 'WEBP', quality=QUAL[kind], method=6)
    return out, im.size

mapping = json.load(open(sys.argv[2], encoding='utf-8')) if len(sys.argv) > 2 else None
total = 0; done = []
for i, f in enumerate(files):
    target = mapping.get(os.path.basename(f)) if mapping else MAP.get(i)
    if not target: print('略過', i, os.path.basename(f)); continue
    out, size = convert(f, target)
    total += os.path.getsize(out); done.append(target)
    print(f'{i:3} → assets/{target}.webp {size[0]}x{size[1]} {os.path.getsize(out)//1024}KB')
print(len(done), '張', total // 1024, 'KB')
