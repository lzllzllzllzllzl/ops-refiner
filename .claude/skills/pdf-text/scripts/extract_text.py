#!/usr/bin/env python3
"""
PDF 文本提取脚本

将 PDF 文档转换为结构化的 JSON 格式，包含：
- 每页的文本内容
- 表格数据（如果有）
- 元数据信息

输出格式与 XLSX/PPTX skill 保持一致，便于模型处理。
"""

import json
import sys
from typing import Any


def extract_pdf_content(pdf_path: str) -> dict[str, Any]:
    """
    提取 PDF 文档的文本内容和表格数据

    Args:
        pdf_path: PDF 文件路径

    Returns:
        包含文本和表格的结构化数据
    """
    try:
        import pdfplumber
    except ImportError:
        print("Error: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

    result = {
        "status": "success",
        "file_path": pdf_path,
        "total_pages": 0,
        "metadata": {},
        "pages": []
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            result["total_pages"] = len(pdf.pages)

            # 提取元数据
            if pdf.metadata:
                result["metadata"] = {
                    "title": pdf.metadata.get("Title", ""),
                    "author": pdf.metadata.get("Author", ""),
                    "subject": pdf.metadata.get("Subject", ""),
                    "creator": pdf.metadata.get("Creator", ""),
                    "producer": pdf.metadata.get("Producer", ""),
                    "creation_date": str(pdf.metadata.get("CreationDate", "")),
                    "modification_date": str(pdf.metadata.get("ModDate", "")),
                }

            for i, page in enumerate(pdf.pages):
                page_data = {
                    "page_number": i + 1,
                    "width": float(page.width),
                    "height": float(page.height),
                    "text": "",
                    "tables": [],
                    "has_images": False
                }

                # 提取文本
                text = page.extract_text()
                if text:
                    page_data["text"] = text.strip()

                # 提取表格
                tables = page.extract_tables()
                if tables:
                    for j, table in enumerate(tables):
                        if table and len(table) > 0:
                            # 清理表格数据
                            cleaned_table = []
                            for row in table:
                                cleaned_row = [
                                    cell.strip() if cell else ""
                                    for cell in row
                                ]
                                cleaned_table.append(cleaned_row)

                            page_data["tables"].append({
                                "table_index": j + 1,
                                "rows": len(cleaned_table),
                                "columns": len(cleaned_table[0]) if cleaned_table else 0,
                                "data": cleaned_table
                            })

                # 检查是否有图片
                if page.images:
                    page_data["has_images"] = True
                    page_data["image_count"] = len(page.images)

                result["pages"].append(page_data)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def extract_text_only(pdf_path: str) -> dict[str, Any]:
    """
    仅提取 PDF 文本（轻量模式）

    Args:
        pdf_path: PDF 文件路径

    Returns:
        包含纯文本的结构化数据
    """
    try:
        import pdfplumber
    except ImportError:
        # 尝试使用 pypdf 作为后备
        try:
            from pypdf import PdfReader
            return extract_text_with_pypdf(pdf_path)
        except ImportError:
            print("Error: Neither pdfplumber nor pypdf installed.", file=sys.stderr)
            sys.exit(1)

    result = {
        "status": "success",
        "file_path": pdf_path,
        "total_pages": 0,
        "full_text": "",
        "pages": []
    }

    try:
        all_text = []
        with pdfplumber.open(pdf_path) as pdf:
            result["total_pages"] = len(pdf.pages)

            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                page_data = {
                    "page_number": i + 1,
                    "text": text.strip()
                }
                result["pages"].append(page_data)
                all_text.append(f"--- Page {i + 1} ---\n{text.strip()}")

        result["full_text"] = "\n\n".join(all_text)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def extract_text_with_pypdf(pdf_path: str) -> dict[str, Any]:
    """
    使用 pypdf 提取文本（后备方案）
    """
    from pypdf import PdfReader

    result = {
        "status": "success",
        "file_path": pdf_path,
        "total_pages": 0,
        "full_text": "",
        "pages": []
    }

    try:
        reader = PdfReader(pdf_path)
        result["total_pages"] = len(reader.pages)

        all_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            page_data = {
                "page_number": i + 1,
                "text": text.strip()
            }
            result["pages"].append(page_data)
            all_text.append(f"--- Page {i + 1} ---\n{text.strip()}")

        result["full_text"] = "\n\n".join(all_text)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: extract_text.py <pdf_path> [--full | --text-only]")
        print("")
        print("Options:")
        print("  --full       Extract text, tables, and metadata (default)")
        print("  --text-only  Extract text only (lighter output)")
        sys.exit(1)

    pdf_path = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else "--full"

    if mode == "--text-only":
        result = extract_text_only(pdf_path)
    else:
        result = extract_pdf_content(pdf_path)

    # 输出 JSON 到 stdout
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
