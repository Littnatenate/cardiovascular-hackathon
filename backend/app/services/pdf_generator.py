import io
import markdown2
from datetime import datetime
from xhtml2pdf import pisa
from typing import Optional

# Professional Hospital CSS to style the generated PDF
PDF_STYLESHEET = """
<style>
    @page {
        size: A4 portrait;
        margin: 2cm;
        margin-bottom: 3cm;
        @frame footer {
            -pdf-frame-content: footerContent;
            bottom: 0.5cm;
            margin-left: 2cm;
            margin-right: 2cm;
            height: 2cm;
        }
    }
    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        color: #2d3748;
        line-height: 1.6;
    }
    /* ── Professional Header Bar ── */
    .report-header {
        background-color: #1a365d;
        color: #ffffff;
        padding: 16px 20px;
        margin: -10px -10px 25px -10px;
        border-radius: 4px;
    }
    .report-header h1 {
        color: #ffffff;
        font-size: 20pt;
        margin: 0;
        padding: 0;
        border: none;
        font-weight: bold;
        letter-spacing: 0.5px;
    }
    .report-header .timestamp {
        color: #cbd5e0;
        font-size: 9pt;
        margin-top: 4px;
    }
    /* ── Headings ── */
    h1 {
        color: #1a365d;
        font-size: 22pt;
        margin-bottom: 16px;
        border-bottom: 3px solid #2b6cb0;
        padding-bottom: 8px;
        font-weight: bold;
    }
    h2 {
        color: #2b6cb0;
        font-size: 15pt;
        margin-top: 22px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    h3 {
        color: #2c5282;
        font-size: 13pt;
        margin-top: 16px;
        margin-bottom: 8px;
        font-weight: bold;
    }
    /* ── Tables ── */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        margin-bottom: 20px;
        border: 1px solid #cbd5e0;
        border-radius: 4px;
    }
    th {
        background-color: #1a365d;
        color: #ffffff;
        font-weight: bold;
        text-align: left;
        padding: 10px 12px;
        border-bottom: 2px solid #2b6cb0;
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    td {
        padding: 9px 12px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 10.5pt;
        vertical-align: top;
    }
    tr:nth-child(even) td {
        background-color: #f8f9fa;
    }
    tr:nth-child(odd) td {
        background-color: #ffffff;
    }
    tr:hover td {
        background-color: #edf2f7;
    }
    /* ── Alert Boxes ── */
    .alert-important {
        background-color: #fff5f5;
        border-left: 4px solid #e53e3e;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 16px 0;
        color: #9b2c2c;
        font-size: 10.5pt;
        line-height: 1.5;
    }
    .alert-warning {
        background-color: #fffff0;
        border-left: 4px solid #dd6b20;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 16px 0;
        color: #9c4221;
        font-size: 10.5pt;
        line-height: 1.5;
    }
    .alert-note {
        background-color: #ebf8ff;
        border-left: 4px solid #3182ce;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 16px 0;
        color: #2a4365;
        font-size: 10.5pt;
        line-height: 1.5;
    }
    /* ── Lists ── */
    ul, ol {
        margin-bottom: 14px;
        padding-left: 20px;
    }
    li {
        margin-bottom: 5px;
        line-height: 1.5;
    }
    /* ── Blockquotes ── */
    blockquote {
        border-left: 4px solid #e2e8f0;
        padding: 10px 16px;
        margin: 14px 0;
        background-color: #f7fafc;
        border-radius: 4px;
        color: #4a5568;
    }
    /* ── Horizontal Rule ── */
    hr {
        border: none;
        border-top: 2px solid #e2e8f0;
        margin: 20px 0;
    }
    /* ── Footer Styles ── */
    .footer-content {
        text-align: center;
        color: #a0aec0;
        font-size: 8pt;
        line-height: 1.4;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
    }
    .footer-content .confidential {
        font-weight: bold;
        color: #e53e3e;
        font-size: 7.5pt;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 2px;
    }
    .footer-content .page-info {
        color: #a0aec0;
        font-size: 7.5pt;
    }
    /* ── Strong/Em ── */
    strong {
        color: #1a202c;
    }
    em {
        color: #4a5568;
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
                      r'<div class="alert-warning"><strong>Warning:</strong>\1</div>', html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r'<blockquote>\s*<p>\[!NOTE\](.*?)</p>\s*</blockquote>', 
                      r'<div class="alert-note">\1</div>', html, flags=re.IGNORECASE | re.DOTALL)
        return html

    def generate_pdf(self, markdown_text: str, patient_name: str = "Patient") -> Optional[bytes]:
        """Converts Markdown text to a PDF binary stream."""
        
        # 1. Convert Markdown to HTML (supporting tables)
        html_content = markdown2.markdown(markdown_text, extras=["tables"])
        
        # 2. Process special alert blocks
        html_content = self._convert_alerts(html_content)

        # 3. Generate timestamp
        timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

        # 4. Build Full HTML Document
        full_html = f"""
        <html>
        <head>{PDF_STYLESHEET}</head>
        <body>
            <div id="footerContent" class="footer-content">
                <div class="confidential">CONFIDENTIAL — FOR AUTHORIZED PERSONNEL ONLY</div>
                <div class="page-info">MedSafe Discharge Report — Generated {timestamp} — {patient_name}</div>
            </div>
            <div class="report-header">
                <h1>MedSafe Discharge Report</h1>
                <div class="timestamp">Generated on {timestamp}</div>
            </div>
            {html_content}
        </body>
        </html>
        """

        # 5. Convert HTML to PDF using xhtml2pdf
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
