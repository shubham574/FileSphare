#!/usr/bin/env python3
"""
PDF Compressor using PyMuPDF (fitz).

Re-renders each page with downsampled/re-encoded images for genuine file size reduction.

Usage:
    python compress_pdf.py <input.pdf> <output.pdf> [level]

    level: "low" | "medium" | "high"  (default: "medium")

Exit codes: 0 = success, 1 = error (message on stderr)
"""
import sys
import os
import json

# ── Compression profiles ─────────────────────────────────────────────────────
PROFILES = {
    "low": {
        "dpi": 150,        # Image resolution cap (dots per inch)
        "jpg_quality": 85, # JPEG quality 0-100
        "deflate": True,   # Compress non-image streams
    },
    "medium": {
        "dpi": 96,
        "jpg_quality": 70,
        "deflate": True,
    },
    "high": {
        "dpi": 72,
        "jpg_quality": 50,
        "deflate": True,
    },
}


def compress_pdf(input_path: str, output_path: str, level: str = "medium"):
    import fitz  # PyMuPDF

    profile = PROFILES.get(level, PROFILES["medium"])
    dpi = profile["dpi"]
    jpg_quality = profile["jpg_quality"]
    deflate = profile["deflate"]

    doc = fitz.open(input_path)
    out = fitz.open()  # new empty PDF

    zoom = dpi / 72.0  # 72 is PDF's default DPI
    mat = fitz.Matrix(zoom, zoom)

    for page in doc:
        # Render the page to a pixmap (rasterise at target DPI)
        pix = page.get_pixmap(matrix=mat, alpha=False)

        # Re-encode as JPEG at target quality
        img_bytes = pix.tobytes(output="jpeg", jpg_quality=jpg_quality)

        # Insert the image as a new page with the same paper size
        img_pdf = fitz.open("pdf", fitz.open("jpeg", img_bytes).convert_to_pdf())
        # Scale the image page back to original page dimensions
        img_page = img_pdf[0]
        img_page.set_mediabox(page.rect)

        out.insert_pdf(img_pdf)

    # Save with maximum deflate compression on streams
    out.save(
        output_path,
        deflate=deflate,
        deflate_images=deflate,
        deflate_fonts=deflate,
        garbage=4,        # Remove unused objects aggressively
        clean=True,       # Clean and sanitise content streams
    )
    out.close()
    doc.close()

    input_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    reduction = ((input_size - output_size) / input_size * 100) if input_size > 0 else 0

    # Return stats as JSON on stdout so Node.js can parse them
    result = {
        "success": True,
        "inputSize": input_size,
        "outputSize": output_size,
        "reductionPercent": round(reduction, 1),
        "level": level,
    }
    print(json.dumps(result))


def main():
    if len(sys.argv) < 3:
        print("Usage: python compress_pdf.py <input.pdf> <output.pdf> [level]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    level = sys.argv[3] if len(sys.argv) > 3 else "medium"

    if level not in PROFILES:
        print(f"Error: level must be one of: {', '.join(PROFILES.keys())}", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        compress_pdf(input_path, output_path, level)
        sys.exit(0)
    except Exception as e:
        print(f"Error during compression: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
