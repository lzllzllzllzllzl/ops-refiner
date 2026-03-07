---
name: pdf
description: PDF 文档处理工具包。支持提取文本和表格、创建新 PDF、合并/拆分文档、处理表单。当需要填写 PDF 表单或批量处理、生成、分析 PDF 文档时使用。
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide (Text Mode)

## Overview

This guide covers essential PDF processing operations using Python libraries and command-line tools. This version uses **text extraction** instead of image conversion, making it compatible with all LLM models (including GPT and Gemini).

**Key Difference from standard PDF skill**: This skill extracts text content directly from PDFs instead of converting pages to images. This approach:
- Produces smaller output (JSON text vs. large base64 images)
- Works with all LLM models (GPT, Gemini, Claude)
- Preserves table structure when possible
- Is faster and more efficient

## Quick Start - Reading PDF Content

### Extract Text and Tables (Recommended)

Run this script to extract all text and tables from a PDF:

```bash
python scripts/extract_text.py <file.pdf>
```

Output format (JSON):
```json
{
  "status": "success",
  "file_path": "document.pdf",
  "total_pages": 5,
  "metadata": {
    "title": "Document Title",
    "author": "Author Name"
  },
  "pages": [
    {
      "page_number": 1,
      "text": "Page 1 content...",
      "tables": [
        {
          "table_index": 1,
          "rows": 5,
          "columns": 3,
          "data": [["Header1", "Header2", "Header3"], ["Row1Col1", "Row1Col2", "Row1Col3"]]
        }
      ],
      "has_images": true,
      "image_count": 2
    }
  ]
}
```

### Text-Only Mode (Lighter Output)

For simpler documents or when you only need text:

```bash
python scripts/extract_text.py <file.pdf> --text-only
```

## Python Libraries

### pypdf - Basic Operations

#### Read and Extract Text
```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text from all pages
text = ""
for page in reader.pages:
    text += page.extract_text()
```

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### Advanced Table Extraction
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # Check if table is not empty
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Combine all tables
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - Create PDFs

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Add text
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# Add a line
c.line(100, height - 140, 400, height - 140)

# Save
c.save()
```

#### Create PDF with Multiple Pages
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Add content
title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# Page 2
story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

# Build PDF
doc.build(story)
```

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
# Extract text
pdftotext input.pdf output.txt

# Extract text preserving layout
pdftotext -layout input.pdf output.txt

# Extract specific pages
pdftotext -f 1 -l 5 input.pdf output.txt  # Pages 1-5
```

### qpdf
```bash
# Merge PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Split pages
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# Rotate pages
qpdf input.pdf output.pdf --rotate=+90:1  # Rotate page 1 by 90 degrees

# Remove password
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

### pdftk (if available)
```bash
# Merge
pdftk file1.pdf file2.pdf cat output merged.pdf

# Split
pdftk input.pdf burst

# Rotate
pdftk input.pdf rotate 1east output rotated.pdf
```

## Common Tasks

### Add Watermark
```python
from pypdf import PdfReader, PdfWriter

# Create watermark (or load existing)
watermark = PdfReader("watermark.pdf").pages[0]

# Apply to all pages
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Password Protection
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Add password
writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Extract text | extract_text.py | `python scripts/extract_text.py file.pdf` |
| Extract tables | extract_text.py | Included in JSON output |
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per file |
| Create PDFs | reportlab | Canvas or Platypus |
| Command line text | pdftotext | `pdftotext input.pdf output.txt` |
| Fill PDF forms | pypdf | See forms.md |

## Form Filling

If you need to fill out a PDF form, read forms.md and follow its instructions. The form filling workflow uses text-based field extraction and does not require image conversion.

## Notes on Scanned PDFs

For scanned PDFs (where text is embedded as images), this skill may not be able to extract text directly. In such cases:

1. Check if `extract_text.py` returns empty text
2. If the PDF contains scanned pages, consider using OCR tools separately
3. The `has_images` and `image_count` fields in the output indicate if pages contain images

## Next Steps

- For form filling, see forms.md
- For advanced pypdf usage, see reference.md (if available)
