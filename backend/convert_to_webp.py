#!/usr/bin/env python3
"""
Convert images in uploads/products to WebP at quality 80.
Applies EXIF orientation correction (exif_transpose) so images display upright.
Deletes originals after conversion.
"""

from pathlib import Path
from PIL import Image, ImageOps

IMAGES_DIR = Path(__file__).parent / "uploads" / "products"
QUALITY = 80

def main():
    images = [f for f in IMAGES_DIR.iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".webp"}]

    if not images:
        print("No images found to convert.")
        return

    print(f"Found {len(images)} images to reconvert...")
    success, failed = 0, []

    for i, src in enumerate(sorted(images), 1):
        dst = src.with_suffix(".webp")
        try:
            with Image.open(src) as img:
                # Fix orientation from EXIF data — no manual rotation
                img = ImageOps.exif_transpose(img)
                img = img.convert("RGB")
                img.save(dst, "WEBP", quality=QUALITY)
            # Remove original (also handles replacing existing .webp in-place)
            if src != dst:
                src.unlink()
            success += 1
            if i % 50 == 0:
                print(f"  Progress: {i}/{len(images)}...")
        except Exception as e:
            failed.append((src.name, str(e)))

    print(f"\nDone. Converted {success}/{len(images)} images.")
    if failed:
        print("Failed:")
        for name, err in failed:
            print(f"  {name}: {err}")

if __name__ == "__main__":
    main()
