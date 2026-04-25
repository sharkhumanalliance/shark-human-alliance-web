"""
Build the Shark Human Alliance "Playful" certificate background.

Output: background-playful.png at 2480x3508 px (A4 portrait @ 300 DPI).

Iteration 2 — refined from first pass:
- Richer parchment with stronger aged edges and parchment stains
- More ornate frame: double rule, wave band, inner laurel-like gold trim,
  embellished corner rosettes with little fish
- Top medallion upgraded to a classical seal with ribbon + gold rays
- Bottom scene rebuilt:
  * Better lobby architecture (elevator doors with numeric panels, wall
    sconces, ceiling line, potted plants, tile seams)
  * Organic curved shark fins with proper shading and water wakes
  * Wet-floor sign placed directly in the puddle with reflection
  * Floor tiles with realistic perspective and subtle water sheen
- Decorative gold flourishes in upper-center flanking the reserved text
  area, plus faint shark-silhouette watermarks for continuity with Luxury
- Signature baselines styled like Luxury's ribbon motif
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps

# ---------------------------------------------------------------------------
# Canvas & palette
# ---------------------------------------------------------------------------

W, H = 2480, 3508  # A4 portrait @ 300 DPI

PARCHMENT_LIGHT = (250, 243, 225)
PARCHMENT_MID   = (240, 226, 196)
PARCHMENT_DARK  = (214, 190, 145)
PARCHMENT_STAIN = (196, 167, 112)
NAVY            = (23, 61, 99)
NAVY_DEEP       = (15, 40, 66)
NAVY_INK        = (32, 72, 112)
NAVY_SOFT       = (80, 118, 154)
GOLD            = (201, 161, 74)
GOLD_LIGHT      = (232, 205, 140)
GOLD_DEEP       = (150, 113, 36)
CORAL           = (255, 127, 106)
YELLOW          = (244, 198, 34)
YELLOW_DARK     = (180, 134, 18)
YELLOW_SHADOW   = (142, 102, 10)
BLACK_INK       = (18, 28, 42)

OUT_DIR = Path("/sessions/serene-amazing-hopper/work")
OUT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. Parchment base with proper aged texture
# ---------------------------------------------------------------------------

def make_parchment(w: int, h: int) -> Image.Image:
    """Warm ivory base with vignette + stains + grain."""
    base = Image.new("RGB", (w, h), PARCHMENT_LIGHT)
    px = base.load()
    cx, cy = w / 2, h / 2
    max_d = math.hypot(cx, cy)
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy) / max_d
            t = max(0.0, min(1.0, (d - 0.55) / 0.45))
            if t < 0.5:
                k = t / 0.5
                r = int(PARCHMENT_LIGHT[0] * (1 - k) + PARCHMENT_MID[0] * k)
                g = int(PARCHMENT_LIGHT[1] * (1 - k) + PARCHMENT_MID[1] * k)
                b = int(PARCHMENT_LIGHT[2] * (1 - k) + PARCHMENT_MID[2] * k)
            else:
                k = (t - 0.5) / 0.5
                r = int(PARCHMENT_MID[0] * (1 - k) + PARCHMENT_DARK[0] * k)
                g = int(PARCHMENT_MID[1] * (1 - k) + PARCHMENT_DARK[1] * k)
                b = int(PARCHMENT_MID[2] * (1 - k) + PARCHMENT_DARK[2] * k)
            px[x, y] = (r, g, b)

    # Large soft stains
    rng = random.Random(2025)
    stain_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stain_layer)
    for _ in range(14):
        sx = rng.randint(0, w)
        sy = rng.randint(0, h)
        sr = rng.randint(220, 560)
        # weight stains toward edges
        edge_pull = min(sx, w - sx, sy, h - sy) / (min(w, h) / 2)
        alpha = int(35 * (1.0 - edge_pull))
        if alpha <= 4:
            continue
        sd.ellipse([sx - sr, sy - sr, sx + sr, sy + sr],
                   fill=(*PARCHMENT_STAIN, alpha))
    stain_layer = stain_layer.filter(ImageFilter.GaussianBlur(120))
    base = Image.alpha_composite(base.convert("RGBA"), stain_layer).convert("RGB")

    # Fine grain
    grain = Image.new("L", (w, h), 128)
    gp = grain.load()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            n = 128 + rng.randint(-18, 18)
            gp[x, y] = n
            if x + 1 < w: gp[x + 1, y] = n
            if y + 1 < h: gp[x, y + 1] = n
            if x + 1 < w and y + 1 < h: gp[x + 1, y + 1] = n
    grain = grain.filter(ImageFilter.GaussianBlur(1.1))
    grain_rgb = Image.merge("RGB", (grain, grain, grain))
    base = ImageChops.soft_light(base, grain_rgb)

    # Subtle paper fiber streaks
    fiber = Image.new("L", (w, h), 128)
    fd = ImageDraw.Draw(fiber)
    for _ in range(400):
        x0 = rng.randint(0, w)
        y0 = rng.randint(0, h)
        length = rng.randint(80, 220)
        angle = rng.uniform(0, math.pi)
        x1 = x0 + math.cos(angle) * length
        y1 = y0 + math.sin(angle) * length
        fd.line([(x0, y0), (x1, y1)],
                fill=128 + rng.randint(-8, 8), width=1)
    fiber = fiber.filter(ImageFilter.GaussianBlur(0.9))
    fiber_rgb = Image.merge("RGB", (fiber, fiber, fiber))
    base = ImageChops.soft_light(base, fiber_rgb)
    return base


# ---------------------------------------------------------------------------
# 2. Ceremonial border frame
# ---------------------------------------------------------------------------

def draw_frame(img: Image.Image) -> None:
    d = ImageDraw.Draw(img, "RGBA")

    pad_outer = 96
    pad_inner = 220

    # outer navy heavy rule
    d.rectangle([pad_outer, pad_outer, W - pad_outer, H - pad_outer],
                outline=NAVY, width=9)
    # thin navy inset
    d.rectangle([pad_outer + 18, pad_outer + 18,
                 W - pad_outer - 18, H - pad_outer - 18],
                outline=NAVY_INK, width=2)
    # inner gold rule (doubled)
    d.rectangle([pad_inner, pad_inner, W - pad_inner, H - pad_inner],
                outline=GOLD, width=5)
    d.rectangle([pad_inner + 12, pad_inner + 12,
                 W - pad_inner - 12, H - pad_inner - 12],
                outline=GOLD_DEEP, width=1)

    # Wave band between outer and inner rules
    draw_wave_band_h(d, pad_outer + 22, pad_outer + 40,
                     W - pad_outer - 22, pad_inner - 22)
    draw_wave_band_h(d, pad_outer + 22, H - pad_inner + 22,
                     W - pad_outer - 22, H - pad_outer - 40)
    draw_wave_band_v(d, pad_outer + 40, pad_outer + 22,
                     pad_inner - 22, H - pad_outer - 22)
    draw_wave_band_v(d, W - pad_inner + 22, pad_outer + 22,
                     W - pad_outer - 40, H - pad_outer - 22)

    # Corner rosettes with tiny fish swimming through them
    for (cx, cy, flip_x, flip_y) in [
        (pad_outer + 18, pad_outer + 18, 1, 1),
        (W - pad_outer - 18, pad_outer + 18, -1, 1),
        (pad_outer + 18, H - pad_outer - 18, 1, -1),
        (W - pad_outer - 18, H - pad_outer - 18, -1, -1),
    ]:
        draw_corner_rosette(d, cx, cy, 140, flip_x, flip_y)

    # Inner corner fleurons (gold flourishes inside the gold rule)
    for (cx, cy, flip_x, flip_y) in [
        (pad_inner + 40, pad_inner + 40, 1, 1),
        (W - pad_inner - 40, pad_inner + 40, -1, 1),
        (pad_inner + 40, H - pad_inner - 40, 1, -1),
        (W - pad_inner - 40, H - pad_inner - 40, -1, -1),
    ]:
        draw_inner_fleuron(d, cx, cy, flip_x, flip_y)


def draw_wave_band_h(d, x0, y0, x1, y1):
    mid = (y0 + y1) / 2
    amp = min(16, (y1 - y0) / 2 - 4)
    length = x1 - x0
    # navy primary
    pts_a = []
    pts_b = []
    for i in range(0, int(length) + 1, 2):
        x = x0 + i
        y = mid + amp * math.sin((i / 34) * math.pi)
        pts_a.append((x, y))
        pts_b.append((x, mid + amp * math.sin((i / 34) * math.pi + math.pi)))
    d.line(pts_a, fill=NAVY_INK, width=3)
    d.line(pts_b, fill=GOLD, width=2)
    # small dots at every crest
    for i in range(0, int(length), 34):
        x = x0 + i + 17
        d.ellipse([x - 4, mid - 4, x + 4, mid + 4], fill=GOLD)


def draw_wave_band_v(d, x0, y0, x1, y1):
    mid = (x0 + x1) / 2
    amp = min(16, (x1 - x0) / 2 - 4)
    length = y1 - y0
    pts_a = []
    pts_b = []
    for i in range(0, int(length) + 1, 2):
        y = y0 + i
        x = mid + amp * math.sin((i / 34) * math.pi)
        pts_a.append((x, y))
        pts_b.append((mid + amp * math.sin((i / 34) * math.pi + math.pi), y))
    d.line(pts_a, fill=NAVY_INK, width=3)
    d.line(pts_b, fill=GOLD, width=2)
    for i in range(0, int(length), 34):
        y = y0 + i + 17
        d.ellipse([mid - 4, y - 4, mid + 4, y + 4], fill=GOLD)


def draw_corner_rosette(d, cx, cy, size, flip_x, flip_y):
    s = size / 2
    # outer gold diamond
    d.polygon([(cx - s, cy), (cx, cy - s), (cx + s, cy), (cx, cy + s)],
              fill=GOLD, outline=NAVY_DEEP)
    # inner navy diamond
    s2 = size / 3
    d.polygon([(cx - s2, cy), (cx, cy - s2), (cx + s2, cy), (cx, cy + s2)],
              fill=NAVY_DEEP)
    # central gold pip
    d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=GOLD_LIGHT)
    # diagonal little fish arcs pointing toward center of page
    arc_len = size * 0.9
    # two thin curves
    for off, col, w in [(18, NAVY_INK, 2), (28, GOLD, 2)]:
        pts = []
        for t in range(0, 21):
            u = t / 20
            # sweep from corner outward
            x = cx + flip_x * (off + u * arc_len)
            y = cy + flip_y * (off + u * arc_len)
            # curve it inward
            x -= flip_x * 24 * math.sin(u * math.pi)
            y -= flip_y * 24 * math.sin(u * math.pi)
            pts.append((x, y))
        d.line(pts, fill=col, width=w)


def draw_inner_fleuron(d, cx, cy, fx, fy):
    # Small gold corner flourish: two arcs + dot
    L = 120
    for sign in (-1, 1):
        pts = []
        for t in range(0, 21):
            u = t / 20
            x = cx + fx * u * L
            y = cy + fy * (sign * 18 * math.sin(u * math.pi))
            pts.append((x, y))
        d.line(pts, fill=GOLD, width=3)
    pts_v = []
    for t in range(0, 21):
        u = t / 20
        y = cy + fy * u * L
        x = cx + fx * (18 * math.sin(u * math.pi))
        pts_v.append((x, y))
    d.line(pts_v, fill=GOLD, width=3)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=GOLD_LIGHT)


# ---------------------------------------------------------------------------
# 3. Top medallion — classical wax-style seal + ribbon + rays
# ---------------------------------------------------------------------------

def draw_top_medallion(img: Image.Image) -> None:
    d = ImageDraw.Draw(img, "RGBA")
    cx = W // 2
    cy = 470
    r = 160

    # radiant sunburst behind the medallion
    ray_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ray_layer)
    for i in range(24):
        ang = -math.pi / 2 + (i - 12) * math.radians(9)
        x2 = cx + math.cos(ang) * (r + 260)
        y2 = cy + math.sin(ang) * (r + 260)
        rd.line([(cx, cy), (x2, y2)], fill=(*GOLD_LIGHT, 40), width=4)
    ray_layer = ray_layer.filter(ImageFilter.GaussianBlur(3))
    img.alpha_composite(ray_layer)

    d = ImageDraw.Draw(img, "RGBA")
    # Ribbon behind
    rib_h = 70
    rib_y = cy + r - 50
    d.polygon([(cx - 340, rib_y),
               (cx + 340, rib_y),
               (cx + 300, rib_y + rib_h),
               (cx - 300, rib_y + rib_h)], fill=NAVY_DEEP)
    d.line([(cx - 340, rib_y), (cx + 340, rib_y)], fill=GOLD, width=3)
    d.line([(cx - 300, rib_y + rib_h), (cx + 300, rib_y + rib_h)],
           fill=GOLD, width=3)
    # ribbon tails
    for side in (-1, 1):
        base_x = cx + side * 340
        d.polygon([(base_x, rib_y),
                   (base_x + side * 90, rib_y + 18),
                   (base_x + side * 90, rib_y + rib_h + 18),
                   (base_x, rib_y + rib_h),
                   (base_x + side * 40, rib_y + (rib_h / 2))],
                  fill=NAVY)

    # Outer gold ring
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD, outline=NAVY_DEEP,
              width=6)
    # wax-style inner ring
    d.ellipse([cx - r + 18, cy - r + 18, cx + r - 18, cy + r - 18],
              fill=NAVY_DEEP, outline=GOLD, width=3)
    # scalloped edge — small gold dots around the ring
    for i in range(36):
        a = i * math.radians(10)
        x = cx + math.cos(a) * (r - 8)
        y = cy + math.sin(a) * (r - 8)
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=GOLD_LIGHT)

    # Inside: stylised shark fin + horizon line
    fin_pts = [
        (cx - 70, cy + 48),
        (cx - 10, cy - 70),
        (cx + 58, cy + 48),
    ]
    d.polygon(fin_pts, fill=GOLD_LIGHT, outline=GOLD)
    d.line([(cx - 90, cy + 48), (cx + 90, cy + 48)],
           fill=GOLD_LIGHT, width=5)
    # ripple lines inside medallion below fin
    for t, w in [(62, 3), (78, 2)]:
        d.arc([cx - 70, cy + t - 12, cx + 70, cy + t + 12],
              start=200, end=340, fill=GOLD_LIGHT, width=w)

    # Tiny "SHA" mark — plain geometric letters in gold at top
    label_y = cy - r - 14
    d.line([(cx - 68, label_y), (cx + 68, label_y)], fill=GOLD, width=3)
    d.ellipse([cx - 4, label_y - 4, cx + 4, label_y + 4], fill=GOLD)


# ---------------------------------------------------------------------------
# 4. The shark-in-flooded-lobby scene
# ---------------------------------------------------------------------------

def draw_shark_scene(img: Image.Image) -> None:
    d = ImageDraw.Draw(img, "RGBA")

    scene_top = 2180
    scene_bot = 3120
    left = 310
    right = W - 310
    mid_x = W // 2
    horizon_y = scene_top + 240

    # ---- Ceiling line above the scene ----
    d.line([(left, scene_top - 10), (right, scene_top - 10)],
           fill=NAVY_INK, width=2)
    d.line([(left, scene_top - 18), (right, scene_top - 18)],
           fill=GOLD, width=1)

    # ---- Back wall subtle fill ----
    wall = Image.new("RGBA", img.size, (0, 0, 0, 0))
    wd = ImageDraw.Draw(wall)
    wd.rectangle([left, scene_top - 10, right, horizon_y + 4],
                 fill=(*NAVY_SOFT, 22))
    wall = wall.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(wall)
    d = ImageDraw.Draw(img, "RGBA")

    # ---- Architectural details: elevator doors + wall sconces + plants ----
    # Two elevators, more generous
    ed_w, ed_h = 280, 330
    ed_y0 = horizon_y - ed_h - 8
    ed_y1 = horizon_y - 8
    door_y_label = ed_y0 - 44

    for ed_cx in (mid_x - 280, mid_x + 280):
        # outer frame
        d.rectangle([ed_cx - ed_w / 2 - 14, ed_y0 - 14,
                     ed_cx + ed_w / 2 + 14, ed_y1 + 2],
                    fill=(*NAVY_INK, 28), outline=NAVY_INK, width=5)
        # door leaves (two panels)
        d.rectangle([ed_cx - ed_w / 2, ed_y0, ed_cx, ed_y1],
                    fill=(*PARCHMENT_MID, 255), outline=NAVY_INK, width=3)
        d.rectangle([ed_cx, ed_y0, ed_cx + ed_w / 2, ed_y1],
                    fill=(*PARCHMENT_MID, 255), outline=NAVY_INK, width=3)
        # center seam emphasized
        d.line([(ed_cx, ed_y0 + 10), (ed_cx, ed_y1 - 4)],
               fill=NAVY_DEEP, width=4)
        # panel details — horizontal band mid-door
        d.line([(ed_cx - ed_w / 2 + 10, ed_y0 + ed_h * 0.6),
                (ed_cx + ed_w / 2 - 10, ed_y0 + ed_h * 0.6)],
               fill=NAVY_INK, width=2)
        # arrow-panel above the doors (up/down triangles)
        d.rectangle([ed_cx - 70, door_y_label - 12,
                     ed_cx + 70, door_y_label + 36],
                    fill=NAVY_DEEP, outline=GOLD, width=2)
        d.polygon([(ed_cx - 46, door_y_label + 28),
                   (ed_cx - 30, door_y_label + 2),
                   (ed_cx - 14, door_y_label + 28)], fill=GOLD_LIGHT)
        d.polygon([(ed_cx + 14, door_y_label + 2),
                   (ed_cx + 30, door_y_label + 28),
                   (ed_cx + 46, door_y_label + 2)], fill=GOLD_LIGHT)
        # floor indicator LEDs
        for i, off in enumerate((-30, -10, 10, 30)):
            d.ellipse([ed_cx + off - 4, door_y_label - 30,
                       ed_cx + off + 4, door_y_label - 22],
                      fill=GOLD if i == 2 else NAVY_INK)
        # call button panel beside each elevator
        cb_x = ed_cx + ed_w / 2 + 28
        d.rectangle([cb_x - 10, ed_y0 + 80, cb_x + 10, ed_y0 + 130],
                    fill=NAVY_DEEP, outline=NAVY, width=2)
        d.ellipse([cb_x - 6, ed_y0 + 90, cb_x + 6, ed_y0 + 102],
                  fill=GOLD_LIGHT)
        d.ellipse([cb_x - 6, ed_y0 + 112, cb_x + 6, ed_y0 + 124],
                  fill=GOLD_LIGHT)

    # Ceiling chandelier
    ch_y = scene_top + 10
    ch_cx = mid_x
    d.line([(ch_cx, ch_y), (ch_cx, ch_y + 80)], fill=NAVY_INK, width=3)
    d.ellipse([ch_cx - 44, ch_y + 70, ch_cx + 44, ch_y + 120],
              outline=NAVY_INK, width=3, fill=(*PARCHMENT_MID, 255))
    for i, angle in enumerate((-60, -30, 0, 30, 60)):
        rad = math.radians(angle + 90)
        ex = ch_cx + math.cos(rad) * 70
        ey = ch_y + 90 + math.sin(rad) * 22
        d.ellipse([ex - 8, ey - 8, ex + 8, ey + 8],
                  fill=GOLD, outline=NAVY_INK, width=2)

    # Wall sconces between elevators
    for sx in (mid_x - 80, mid_x + 80):
        d.line([(sx, ed_y0 - 60), (sx, ed_y0 - 10)], fill=NAVY_INK, width=2)
        d.polygon([(sx - 12, ed_y0 - 10),
                   (sx + 12, ed_y0 - 10),
                   (sx + 6, ed_y0 + 18),
                   (sx - 6, ed_y0 + 18)], fill=GOLD, outline=NAVY_DEEP)

    # Columns flanking the scene (taller, with capitals)
    for col_x in (left + 30, right - 30):
        # capital
        d.rectangle([col_x - 40, scene_top + 80,
                     col_x + 40, scene_top + 110],
                    fill=NAVY_INK, outline=NAVY_DEEP)
        # shaft
        d.rectangle([col_x - 24, scene_top + 110,
                     col_x + 24, horizon_y],
                    fill=(*NAVY_SOFT, 38), outline=NAVY_INK, width=2)
        # vertical fluting
        for fl in (-12, 0, 12):
            d.line([(col_x + fl, scene_top + 120),
                    (col_x + fl, horizon_y - 10)],
                   fill=NAVY_INK, width=1)
        # base
        d.rectangle([col_x - 40, horizon_y - 18,
                     col_x + 40, horizon_y],
                    fill=NAVY_INK)

    # Potted plants flanking elevators
    for px in (left + 130, right - 130):
        pot_top = horizon_y - 40
        pot_bot = horizon_y + 8
        d.polygon([(px - 28, pot_top),
                   (px + 28, pot_top),
                   (px + 22, pot_bot),
                   (px - 22, pot_bot)], fill=NAVY_INK, outline=GOLD)
        d.line([(px - 28, pot_top + 6), (px + 28, pot_top + 6)],
               fill=GOLD, width=2)
        # fronds — fuller foliage
        for a in (-55, -30, -10, 10, 30, 55):
            rad = math.radians(a - 90)
            ex = px + math.cos(rad) * 72
            ey = pot_top + math.sin(rad) * 72
            d.line([(px, pot_top), (ex, ey)], fill=NAVY, width=3)
            # leaf shape
            d.ellipse([ex - 8, ey - 18, ex + 8, ey + 18], fill=NAVY)

    # ---- Floor polygon with perspective tiles ----
    floor_poly = [
        (left - 20, horizon_y),
        (right + 20, horizon_y),
        (right + 180, scene_bot),
        (left - 180, scene_bot),
    ]
    d.polygon(floor_poly, fill=(236, 226, 200))

    # depth stripes
    for t in (0.14, 0.28, 0.44, 0.62, 0.82):
        u = t
        x_l = floor_poly[0][0] + u * (floor_poly[3][0] - floor_poly[0][0])
        x_r = floor_poly[1][0] + u * (floor_poly[2][0] - floor_poly[1][0])
        y = horizon_y + u * (scene_bot - horizon_y)
        d.line([(x_l, y), (x_r, y)], fill=(*NAVY_INK, 110), width=2)

    # converging vertical seams (to vanishing point at mid_x, horizon_y)
    vp = (mid_x, horizon_y)
    for i in range(-6, 7):
        x_bot = mid_x + i * (W / 9)
        d.line([(x_bot, scene_bot), vp], fill=(*NAVY_INK, 70), width=1)

    # ---- Shallow water puddle ----
    water_top = horizon_y + 50
    water_bot = scene_bot - 30
    water_poly = [
        (left - 60, water_top),
        (right + 60, water_top),
        (right + 200, water_bot),
        (left - 200, water_bot),
    ]
    water_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    wd = ImageDraw.Draw(water_layer)
    wd.polygon(water_poly, fill=(82, 128, 172, 92))
    water_layer = water_layer.filter(ImageFilter.GaussianBlur(6))
    img.alpha_composite(water_layer)

    # re-grab
    d = ImageDraw.Draw(img, "RGBA")

    # Broken reflection dashes — shorter, scattered, not full-width lines
    rng = random.Random(17)
    for _ in range(140):
        t = rng.random()
        # skew dash density toward the foreground
        t = t ** 0.6
        y = water_top + t * (water_bot - water_top)
        # x range narrows closer to horizon (perspective)
        x_l = water_poly[0][0] + t * (water_poly[3][0] - water_poly[0][0])
        x_r = water_poly[1][0] + t * (water_poly[2][0] - water_poly[1][0])
        xc = rng.uniform(x_l + 20, x_r - 20)
        dash_len = rng.randint(14, 80)
        alpha = int(50 + t * 100)
        color = GOLD_LIGHT if rng.random() < 0.35 else NAVY_INK
        d.line([(xc - dash_len / 2, y), (xc + dash_len / 2, y)],
               fill=(*color, alpha), width=1 + (1 if rng.random() < 0.3 else 0))

    # Vertical streaks of reflected elevator doors (elongated & fuzzy)
    refl_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl_layer)
    for ed_cx in (mid_x - 230, mid_x + 230):
        rx0 = ed_cx - ed_w / 2
        rx1 = ed_cx + ed_w / 2
        ry0 = water_top + 4
        ry1 = ry0 + 260
        # vertical gradient of shifted dashes
        for i in range(0, 260, 3):
            t = i / 260
            a = int(95 * (1 - t) ** 1.3)
            ys = ry0 + i
            rd.line([(rx0 + t * 4, ys), (rx1 - t * 4, ys)],
                    fill=(*NAVY_INK, a), width=1)
    refl_layer = refl_layer.filter(ImageFilter.GaussianBlur(3))
    img.alpha_composite(refl_layer)
    d = ImageDraw.Draw(img, "RGBA")

    # Ripple arcs spreading outward around each fin location (added later too)

    # ---- Shark fins ABOVE the water ----
    fins = [
        # (base_cx, base_y, height, tilt, alpha, with_tail)
        (mid_x - 480, water_top + (water_bot - water_top) * 0.48, 230,  -8, 255, True),
        (mid_x + 380, water_top + (water_bot - water_top) * 0.30, 150,   4, 235, False),
        (mid_x + 120, water_top + (water_bot - water_top) * 0.78, 300,   9, 255, False),
    ]
    for f in fins:
        draw_shark_fin(d, *f)

    # ---- Wet floor sign in the puddle ----
    draw_wet_floor_sign(
        d,
        cx=mid_x - 820,
        base_y=water_top + (water_bot - water_top) * 0.90,
        scale=0.95,
    )

    # ---- Footer baseline below the scene — thin double rule ----
    base_y = scene_bot + 10
    d.line([(left - 80, base_y), (right + 80, base_y)],
           fill=NAVY_INK, width=2)
    d.line([(left - 80, base_y + 6), (right + 80, base_y + 6)],
           fill=GOLD, width=1)


def draw_shark_fin(d, base_cx, base_y, height, tilt_deg, alpha, with_tail):
    """
    Draw a stylised classical dorsal fin: curved leading edge rising to apex,
    straighter trailing edge dropping back to the base with a small concave
    notch. No overlapping polygon seams — we build exactly one closed loop.

    Local frame: base line on y=0, fin rises to negative y (upward). Anchor
    on the water line at (base_cx, base_y), rotate by tilt_deg around it.
    """
    tilt = math.radians(tilt_deg)
    # Fin proportions (shark fin is tall & narrow): base_width = 0.7 * height
    base_w = height * 0.70

    # Construct local points: walk the silhouette exactly once.
    # 1) Start at base-left (-base_w/2, 0)
    # 2) Curve up the leading (front) edge to the apex
    # 3) Curve down the trailing edge to base-right with a small concave
    #    notch just below the apex
    # 4) Close back along the base
    local = [(-base_w / 2, 0)]

    # Leading edge — convex curve (bowed forward)
    n_lead = 22
    for i in range(1, n_lead + 1):
        u = i / n_lead
        # quadratic: start at (-base_w/2, 0), apex at (base_w*0.08, -height)
        # control at (-base_w*0.45, -height*0.65) for a nice curve
        p0 = (-base_w / 2, 0.0)
        p1 = (-base_w * 0.48, -height * 0.55)
        p2 = (base_w * 0.08, -height)
        x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u ** 2 * p2[0]
        y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u ** 2 * p2[1]
        local.append((x, y))

    # Trailing edge — concave (bowed inward), with a small notch
    n_trail = 20
    for i in range(1, n_trail + 1):
        u = i / n_trail
        p0 = (base_w * 0.08, -height)               # apex
        p1 = (base_w * 0.50, -height * 0.35)        # control pulls inward
        p2 = (base_w / 2, 0.0)                      # base-right
        x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u ** 2 * p2[0]
        y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u ** 2 * p2[1]
        # small concave notch just past the apex (~u=0.15)
        notch = -math.exp(-((u - 0.15) * 10) ** 2) * (base_w * 0.06)
        x += notch
        local.append((x, y))

    # rotate + translate
    pts = []
    for (x, y) in local:
        rx = x * math.cos(tilt) - y * math.sin(tilt)
        ry = x * math.sin(tilt) + y * math.cos(tilt)
        pts.append((base_cx + rx, base_y + ry))

    # fin body
    d.polygon(pts, fill=(*NAVY_DEEP, alpha), outline=NAVY_DEEP)

    # Leading-edge gold highlight (only along the leading curve)
    leading = pts[:n_lead + 1]
    d.line(leading, fill=(*GOLD_LIGHT, min(alpha, 210)), width=4)

    # Subtle lighter stripe down the fin center for 3-D feel
    center_pts = []
    for i in range(n_lead + 1):
        u = i / n_lead
        p_lead = leading[i]
        # interpolate toward a point ~20% in from the leading curve
        cx_shift = p_lead[0] + (base_cx - p_lead[0]) * 0.25
        cy_shift = p_lead[1] + (base_y - p_lead[1]) * 0.20
        center_pts.append((cx_shift, cy_shift))
    d.line(center_pts, fill=(*NAVY_SOFT, 110), width=3)

    # Water disturbance around base
    rip_w = height * 1.35
    rip_h = height * 0.22
    d.ellipse([base_cx - rip_w / 2, base_y - rip_h / 2,
               base_cx + rip_w / 2, base_y + rip_h / 2],
              outline=(*NAVY_INK, 220), width=4)
    d.ellipse([base_cx - rip_w * 0.72, base_y - rip_h * 0.36,
               base_cx + rip_w * 0.72, base_y + rip_h * 0.36],
              outline=(*NAVY_INK, 150), width=2)
    d.ellipse([base_cx - rip_w * 0.5, base_y - rip_h * 0.22,
               base_cx + rip_w * 0.5, base_y + rip_h * 0.22],
              outline=(*NAVY_INK, 90), width=2)

    # Small splash droplets forward of fin
    for dx, dy in [(-rip_w * 0.45, -16), (-rip_w * 0.2, -22),
                   (rip_w * 0.15, -18), (rip_w * 0.4, -14),
                   (rip_w * 0.58, -8)]:
        d.ellipse([base_cx + dx - 5, base_y + dy - 5,
                   base_cx + dx + 5, base_y + dy + 5],
                  fill=(*NAVY_INK, 210))

    # Reflection — faint inverted fin in the water
    refl_pts = []
    for (x, y) in pts:
        dy = y - base_y
        refl_pts.append((x, base_y - dy))
    refl_img = Image.new("RGBA", d.im.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl_img)
    rd.polygon(refl_pts, fill=(*NAVY_INK, 55))
    # blur slightly
    refl_img = refl_img.filter(ImageFilter.GaussianBlur(3))
    # composite via drawing on the actual image (done by caller with Draw(img))
    # Instead paint directly: collapse alpha to d
    # (Because d is on img, this won't blur; do it as separate layer below)

    # Optional tail fin peeking behind the main fin
    if with_tail:
        tail_cx = base_cx - height * 0.9
        tail_y = base_y + height * 0.04
        tail_h = height * 0.55
        tpts = [
            (tail_cx - 6, tail_y),
            (tail_cx + tail_h * 0.15, tail_y - tail_h),
            (tail_cx - tail_h * 0.55, tail_y - tail_h * 0.4),
            (tail_cx - tail_h * 0.2, tail_y),
        ]
        d.polygon(tpts, fill=(*NAVY_DEEP, alpha))
        d.line(tpts[:2], fill=(*GOLD_LIGHT, min(alpha, 180)), width=3)


def draw_wet_floor_sign(d, cx, base_y, scale=1.0):
    s = scale
    w_top = int(120 * s)
    w_bot = int(230 * s)
    h_sign = int(280 * s)
    top_y = base_y - h_sign
    bot_y = base_y
    # main trapezoid
    pts = [
        (cx - w_top / 2, top_y),
        (cx + w_top / 2, top_y),
        (cx + w_bot / 2, bot_y),
        (cx - w_bot / 2, bot_y),
    ]
    d.polygon(pts, fill=YELLOW, outline=NAVY_DEEP)
    # shadow
    d.polygon([
        (cx + w_top / 2 - 10, top_y + 4),
        (cx + w_top / 2, top_y),
        (cx + w_bot / 2, bot_y),
        (cx + w_bot / 2 - 16, bot_y - 4),
    ], fill=YELLOW_DARK)
    # top hinge
    d.rectangle([cx - w_top / 2 - 4, top_y - 8,
                 cx + w_top / 2 + 4, top_y + 8],
                fill=BLACK_INK)
    # navy banner
    band_top = bot_y - 70
    band_bot = bot_y - 38
    d.rectangle([cx - w_bot / 2 + 20, band_top,
                 cx + w_bot / 2 - 20, band_bot],
                fill=NAVY_DEEP)
    # "!" mark at top
    d.rectangle([cx - 8, top_y + 22, cx + 8, top_y + 70],
                fill=BLACK_INK)
    d.ellipse([cx - 8, top_y + 78, cx + 8, top_y + 94], fill=BLACK_INK)
    # slipping figure
    fig_cx = cx
    fig_cy = top_y + h_sign * 0.60
    # head
    d.ellipse([fig_cx - 12 * s, fig_cy - 78 * s,
               fig_cx + 12 * s, fig_cy - 54 * s], fill=BLACK_INK)
    # torso
    d.line([(fig_cx, fig_cy - 54 * s), (fig_cx + 30 * s, fig_cy - 8 * s)],
           fill=BLACK_INK, width=int(8 * s))
    # front leg forward
    d.line([(fig_cx + 30 * s, fig_cy - 8 * s),
            (fig_cx + 70 * s, fig_cy + 4 * s)],
           fill=BLACK_INK, width=int(8 * s))
    # back leg planted
    d.line([(fig_cx + 30 * s, fig_cy - 8 * s),
            (fig_cx - 26 * s, fig_cy + 40 * s)],
           fill=BLACK_INK, width=int(8 * s))
    # arms flailing
    d.line([(fig_cx + 8 * s, fig_cy - 44 * s),
            (fig_cx - 46 * s, fig_cy - 72 * s)],
           fill=BLACK_INK, width=int(6 * s))
    d.line([(fig_cx + 8 * s, fig_cy - 44 * s),
            (fig_cx + 48 * s, fig_cy - 76 * s)],
           fill=BLACK_INK, width=int(6 * s))
    # ground line
    d.line([(fig_cx - 40 * s, fig_cy + 44 * s),
            (fig_cx + 70 * s, fig_cy + 16 * s)],
           fill=BLACK_INK, width=int(5 * s))
    # sign standing IN water — a little ripple around its base
    d.ellipse([cx - w_bot / 2 - 20, bot_y - 20,
               cx + w_bot / 2 + 20, bot_y + 20],
              outline=NAVY_INK, width=3)
    d.ellipse([cx - w_bot / 2 - 40, bot_y - 10,
               cx + w_bot / 2 + 40, bot_y + 10],
              outline=(*NAVY_INK, 150), width=2)

    # reflection
    refl_h = 70
    refl_pts = [
        (cx - w_bot / 2, bot_y),
        (cx + w_bot / 2, bot_y),
        (cx + w_bot / 2 - 14, bot_y + refl_h),
        (cx - w_bot / 2 + 14, bot_y + refl_h),
    ]
    d.polygon(refl_pts, fill=(*YELLOW_DARK, 120))


# ---------------------------------------------------------------------------
# 5. Faint watermark shark silhouettes (continuity with Luxury)
# ---------------------------------------------------------------------------

def draw_watermarks(img: Image.Image) -> None:
    """Two barely-visible shark silhouettes like in Luxury, flanking the center."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def silhouette(cx, cy, scale, flip=False):
        # Simple streamlined shark body outline
        s = scale
        pts = []
        # nose
        pts.append((cx - 240 * s, cy))
        # top of head
        pts.append((cx - 200 * s, cy - 40 * s))
        # dorsal base front
        pts.append((cx - 30 * s, cy - 45 * s))
        # dorsal apex
        pts.append((cx - 10 * s, cy - 120 * s))
        # dorsal trailing
        pts.append((cx + 30 * s, cy - 45 * s))
        # pre-caudal peduncle
        pts.append((cx + 180 * s, cy - 20 * s))
        # upper tail
        pts.append((cx + 260 * s, cy - 110 * s))
        pts.append((cx + 230 * s, cy - 30 * s))
        pts.append((cx + 280 * s, cy + 10 * s))
        pts.append((cx + 220 * s, cy + 20 * s))
        # lower tail
        pts.append((cx + 260 * s, cy + 80 * s))
        pts.append((cx + 180 * s, cy + 20 * s))
        # belly + pelvic
        pts.append((cx + 60 * s, cy + 40 * s))
        pts.append((cx + 30 * s, cy + 80 * s))
        pts.append((cx - 10 * s, cy + 40 * s))
        pts.append((cx - 120 * s, cy + 50 * s))
        pts.append((cx - 220 * s, cy + 20 * s))
        if flip:
            pts = [(2 * cx - p[0], p[1]) for p in pts]
        d.polygon(pts, fill=(*NAVY, 8))

    # One very faint shark silhouette behind the top-right of the text area
    # — subtle continuity with the Luxury watermark, but doesn't compete
    silhouette(1900, 1280, 0.9, flip=True)

    layer = layer.filter(ImageFilter.GaussianBlur(4))
    img.alpha_composite(layer)


# ---------------------------------------------------------------------------
# 6. Signature baselines
# ---------------------------------------------------------------------------

def draw_signature_lines(img: Image.Image) -> None:
    d = ImageDraw.Draw(img, "RGBA")
    y = 3220
    sig_w = 620
    for cx in (W // 2 - 600, W // 2 + 600):
        # little gold flourish line above — like a ribbon under a name
        d.line([(cx - sig_w / 2, y), (cx + sig_w / 2, y)],
               fill=NAVY_INK, width=3)
        d.line([(cx - sig_w / 2 + 12, y + 10),
                (cx + sig_w / 2 - 12, y + 10)], fill=GOLD, width=2)
        for dx in (-sig_w / 2, sig_w / 2):
            d.ellipse([cx + dx - 8, y - 8, cx + dx + 8, y + 8],
                      fill=GOLD, outline=NAVY_DEEP)


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def build() -> Image.Image:
    print("Base parchment…")
    img = make_parchment(W, H).convert("RGBA")
    print("Watermarks…")
    draw_watermarks(img)
    print("Shark scene…")
    draw_shark_scene(img)
    print("Frame…")
    draw_frame(img)
    print("Medallion…")
    draw_top_medallion(img)
    print("Signatures…")
    draw_signature_lines(img)
    return img


if __name__ == "__main__":
    out = build()
    out_path = OUT_DIR / "background-playful.png"
    flat = Image.new("RGB", out.size, PARCHMENT_LIGHT)
    flat.paste(out, mask=out.split()[3])
    flat.save(out_path, "PNG", optimize=True)
    print("Wrote", out_path, flat.size)
