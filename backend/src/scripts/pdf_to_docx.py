#!/usr/bin/env python3
"""
PDF to DOCX converter using pdf2docx library.
Preserves images, tables, text formatting, margins and layout.

Usage: python pdf_to_docx.py <input_pdf_path> <output_docx_path>
Exit codes: 0 = success, 1 = error (message on stderr)
"""
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_docx.py <input.pdf> <output.docx>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(f"Error: Input file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    try:
        from pdf2docx import Converter

        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()

        if not os.path.exists(docx_path):
            print("Error: Output file was not created.", file=sys.stderr)
            sys.exit(1)

        print(f"Success: {docx_path}")
        sys.exit(0)

    except ImportError:
        print("Error: pdf2docx is not installed. Run: pip install pdf2docx", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error during conversion: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
