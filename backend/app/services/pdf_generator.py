import io
import markdown2
from xhtml2pdf import pisa
from typing import Optional

# Professional Hospital CSS to style the generated PDF
PDF_STYLESHEET = """
<style>
    @page {
        size: A4 portrait;
        margin: 2cm;
        @frame footer {
            -pdf-frame-content: footerContent;
            bottom: 1cm;
            margin-left: 2cm;
            margin-right: 2cm;
            height: 1cm;
        }
    }
    body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 11pt;
        color: #333333;
        line-height: 1.5;
    }
    h1 {
        color: #1a56db;
        font-size: 24pt;
        margin-bottom: 20px;
        border-bottom: 2px solid #1a56db;
        padding-bottom: 10px;
    }
    h2 {
        color: #1e40af;
        font-size: 16pt;
        margin-top: 20px;
        margin-bottom: 10px;
    }
    h3 {
        color: #2563eb;
        font-size: 14pt;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 20px;
    }
    th {
        background-color: #f3f4f6;
        color: #374151;
        font-weight: bold;
        text-align: left;
        padding: 10px;
        border-bottom: 2px solid #d1d5db;
    }
    td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
    }
    .alert-important {
        background-color: #fee2e2;
        border-left: 4px solid #ef4444;
        padding: 10px;
        margin: 15px 0;
        color: #991b1b;
    }
    .alert-note {
        background-color: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 10px;
        margin: 15px 0;
        color: #1e3a8a;
    }
    ul, ol {
        margin-bottom: 15px;
    }
    li {
        margin-bottom: 5px;
    }
</style>
"""

class PDFGenerator:
    """Service to convert AI Markdown reports into Branded PDFs."""
    def __init__(self):
        pass

    def _convert_alerts(self, html: str) -> str:
        """Converts GitHub style blockquotes into CSS alerts."""
        import re
        html = re.sub(r'<blockquote>\s*<p>\[!IMPORTANT\](.*?)</p>\s*</blockquote>', 
                      r'<div class="alert-important">\1</div>', html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r'<blockquote>\s*<p>\[!WARNING\](.*?)</p>\s*</blockquote>', 
                      r'<div class="alert-important"><strong>Warning:</strong>\1</div>', html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r'<blockquote>\s*<p>\[!NOTE\](.*?)</p>\s*</blockquote>', 
                      r'<div class="alert-note">\1</div>', html, flags=re.IGNORECASE | re.DOTALL)
        return html

    def generate_pdf(self, markdown_text: str, patient_name: str = "Patient") -> Optional[bytes]:
        """Converts Markdown text to a PDF binary stream."""
        
        # 1. Convert Markdown to HTML (supporting tables)
        html_content = markdown2.markdown(markdown_text, extras=["tables"])
        
        # 2. Process special alert blocks
        html_content = self._convert_alerts(html_content)

        # 3. Build Full HTML Document
        full_html = f"""
        <html>
        <head>{PDF_STYLESHEET}</head>
        <body>
            <div id="footerContent" style="text-align: center; color: #6b7280; font-size: 9pt;">
                CONFIDENTIAL: {patient_name} Downloaded from MedSafe AI Engine
            </div>
            {html_content}
        </body>
        </html>
        """

        # 4. Convert HTML to PDF using xhtml2pdf
        result_file = io.BytesIO()
        pisa_status = pisa.CreatePDF(
            src=full_html,
            dest=result_file
        )

        if pisa_status.err:
            print(f"[pdf_generator] Error generating PDF: {pisa_status.err}")
            return None
            
        return result_file.getvalue()

# Singleton instance
pdf_engine = PDFGenerator()
