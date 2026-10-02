# 產生 App 圖示（需要 Pillow）
import math, os
from PIL import Image, ImageDraw
out = os.path.join(os.path.dirname(__file__), '..', 'icons')
def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill)
def make(size, name, maskable=False):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y in range(S):
        t = y / S
        d.line([(0, y), (S, y)], fill=(int(37 + (14 - 37) * t), int(99 + (165 - 99) * t), int(235 + (233 - 235) * t), 255))
    if not maskable:
        m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=255); im.putalpha(m)
    k = 0.30 if maskable else 0.36
    star(d, S / 2, S * 0.5, S * k * 1.08, (180, 83, 9, 255))
    star(d, S / 2, S * 0.49, S * k, (253, 224, 71, 255))
    e = S * 0.03
    for dx in (-0.09, 0.09):
        d.ellipse([S * (0.5 + dx) - e, S * 0.47 - e, S * (0.5 + dx) + e, S * 0.47 + e], fill=(31, 41, 55, 255))
    d.arc([S * 0.43, S * 0.47, S * 0.57, S * 0.60], 20, 160, fill=(31, 41, 55, 255), width=int(S * 0.018))
    im.resize((size, size), Image.LANCZOS).save(os.path.join(out, name))
make(180, 'icon-180.png', True); make(192, 'icon-192.png'); make(512, 'icon-512.png'); make(512, 'icon-maskable-512.png', True)
print('ok')
