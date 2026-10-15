#!/usr/bin/env python3
"""Génère img/logos/logo-ft-negatif.png, la version du logo pour fond sombre (footer).

Même principe que le bloc-marque du DSFR en thème sombre : le texte
« République française », la devise, le mot « France Travail » et les bulles
marine passent en blanc ; le drapeau et les bulles de couleur restent tels
quels. Le blanc du drapeau est transparent dans le logo d'origine : il est
rempli en blanc pour que Marianne reste lisible sur fond marine.

Usage : python3 scripts/build-logo-negatif.py (nécessite Pillow)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "img/logos/logo-ft.png"
OUTPUT = ROOT / "img/logos/logo-ft-negatif.png"
OUTPUT_WIDTH = 760  # 4 fois la largeur affichée dans le footer

FLAG_BLUE = (0, 0, 145)
FLAG_RED = (225, 0, 15)


def close(pixel, color, tolerance=40):
    return all(abs(a - b) <= tolerance for a, b in zip(pixel[:3], color))


def flag_box(image):
    """Rectangle du drapeau : étendue des pixels bleu et rouge du drapeau, en haut à gauche."""
    width, height = image.size
    xs, ys = [], []
    pixels = image.load()
    for y in range(height // 3):
        for x in range(width // 4):
            pixel = pixels[x, y]
            if pixel[3] > 200 and (close(pixel, FLAG_BLUE) or close(pixel, FLAG_RED)):
                xs.append(x)
                ys.append(y)
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def is_dark_ink(pixel):
    """Noir du texte d'État ou marine du mot-symbole et des bulles."""
    r, g, b, _ = pixel
    black = r < 70 and g < 70 and b < 70
    navy = r < 80 and g < 95 and 95 <= b <= 170 and b - r > 40
    return black or navy


def main():
    image = Image.open(SOURCE).convert("RGBA")
    left, top, right, bottom = flag_box(image)

    flag = image.crop((left, top, right, bottom))
    filled = Image.new("RGBA", flag.size, (255, 255, 255, 255))
    filled.alpha_composite(flag)

    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            pixel = pixels[x, y]
            if pixel[3] and is_dark_ink(pixel):
                pixels[x, y] = (255, 255, 255, pixel[3])
    image.paste(filled, (left, top))

    height = round(image.height * OUTPUT_WIDTH / image.width)
    image.resize((OUTPUT_WIDTH, height), Image.LANCZOS).save(OUTPUT, optimize=True)
    print(f"{OUTPUT.relative_to(ROOT)} ({OUTPUT_WIDTH}x{height}), drapeau {left},{top} -> {right},{bottom}")


if __name__ == "__main__":
    main()
