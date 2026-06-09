#!/usr/bin/env python3
"""
Convert all JPG/JPEG/PNG images in product_images to small WebP format,
then delete the originals.
"""

import os
from pathlib import Path
from PIL import Image

# Config
IMAGES_DIR = Path(__file__).parent / "product_images"
QUALITY = 75        # WebP quality (0-100), 75 is a good balance
MAX_SIZE = (800, 800)  # Max width/height — images will be scaled down if larger

def convert_image(src_path: Path):
    webp_path = src_path.with_suffix(".webp")

    try:
        with Image.open(src_path) as img:
            # Convert to RGB (handles RGBA, palette, etc.)
            img = img.convert("RGB")

            # Resize if larger than MAX_SIZE, preserving aspect ratio
            img.thumbnail(MAX_SIZE, Image.LANCZOS)

            img.save(webp_path, format="WEBP", quality=QUALITY, method=6)

        original_size = src_path.stat().st_size
        webp_size = webp_path.stat().st_size
        reduction = (1 - webp_size / original_size) * 100

        print(f"✓ {src_path.name}")
        print(f"  {original_size // 1024} KB → {webp_size // 1024} KB ({reduction:.0f}% smaller)")

        # Delete original
        src_path.unlink()

    except Exception as e:
        print(f"✗ FAILED: {src_path.name} — {e}")

def main():
    extensions = {".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".PNG"}
    images = [f for f in IMAGES_DIR.iterdir() if f.suffix in extensions]

    if not images:
        print("No images found to convert.")
        return

    print(f"Found {len(images)} images to convert...\n")

    for img_path in sorted(images):
        convert_image(img_path)

    print(f"\nDone. Converted {len(images)} images to WebP.")

if __name__ == "__main__":
    main()
