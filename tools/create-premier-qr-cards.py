"""Create vector QR invitation cards from the verified public PWA destinations."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('PremierSerif', 'C:/Windows/Fonts/georgiab.ttf'))
W, H = 100 * mm, 180 * mm
NAVY, GOLD, IVORY, RED = map(HexColor, ['#182638', '#b79961', '#fbf7ef', '#6b111d'])

def centered(c, text, y, font='Helvetica', size=8, color=NAVY):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(W / 2, y * mm, text)

CARDS = [
    ('Restaurant', 'https://avi22sh.github.io/Hotel-Premier/?entry=restaurant#menu',
     'PRIDE PURE VEG AC RESTAURANT', ['Your table.', 'Our collection.'],
     ['Scan to explore the', 'culinary collection.']),
    ('Lobby', 'https://avi22sh.github.io/Hotel-Premier/?entry=home#home',
     'WELCOME TO HOTEL PREMIER', ['Your Premier stay', 'begins here.'],
     ['Scan for rooms, dining', 'and hotel enquiries.']),
]

for name, url, eyebrow, title, instruction in CARDS:
    path = OUT / f'Hotel-Premier-{name}-QR.pdf'
    c = canvas.Canvas(str(path), pagesize=(W, H))
    c.setTitle(f'Hotel Premier - {name} QR invitation')
    c.setAuthor('Hotel Premier')
    c.setFillColor(IVORY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(.8)
    c.roundRect(3 * mm, 3 * mm, 94 * mm, 174 * mm, 3 * mm, fill=0, stroke=1)
    c.setFillColor(NAVY)
    c.rect(3 * mm, 132 * mm, 94 * mm, 45 * mm, fill=1, stroke=0)
    c.setFillColor(IVORY)
    c.roundRect(12 * mm, 139 * mm, 76 * mm, 35 * mm, 2 * mm, fill=1, stroke=1)
    c.drawImage(str(ROOT / 'assets' / 'premier-original-logo.png'),
                20 * mm, 142.7 * mm, width=60 * mm, height=27.54 * mm, mask='auto')
    centered(c, 'BHUSAWAL  /  THOUGHTFUL HOSPITALITY', 134.2, size=5.5, color=HexColor('#edd4a0'))
    c.setLineWidth(.7)
    c.line(3 * mm, 132 * mm, 97 * mm, 132 * mm)
    centered(c, eyebrow, 124, size=6.8, color=RED)
    for i, line in enumerate(title):
        centered(c, line, 116 - i * 6.7, font='PremierSerif', size=14, color=RED)
    # Plain white surround plus the encoder's four-module border; no logo overlays.
    c.setFillColor(white)
    c.setStrokeColor(HexColor('#d8c8aa'))
    c.roundRect(16 * mm, 39 * mm, 68 * mm, 64 * mm, 2 * mm, fill=1, stroke=1)
    qr = QrCodeWidget(url, barLevel='H', barBorder=4)
    x0, y0, x1, y1 = qr.getBounds()
    size = 60 * mm
    drawing = Drawing(size, size, transform=[size/(x1-x0), 0, 0, size/(y1-y0), 0, 0])
    drawing.add(qr)
    renderPDF.draw(drawing, c, 20 * mm, 41 * mm)
    c.linkURL(url, (16 * mm, 39 * mm, 84 * mm, 103 * mm), relative=0, thickness=0)
    for i, line in enumerate(instruction):
        centered(c, line, 33 - 4 * i, size=8.5)
    centered(c, 'Open your phone camera. Scan. Explore.', 23.5, size=6.3, color=HexColor('#62616a'))
    c.setStrokeColor(GOLD)
    c.line(28 * mm, 20 * mm, 46 * mm, 20 * mm)
    c.line(54 * mm, 20 * mm, 72 * mm, 20 * mm)
    c.setFillColor(GOLD)
    p=c.beginPath();p.moveTo(50*mm,21*mm);p.lineTo(51*mm,20*mm);p.lineTo(50*mm,19*mm);p.lineTo(49*mm,20*mm);p.close();c.drawPath(p,fill=1,stroke=0)
    centered(c, 'Jamner Road / Near Nahata College', 15.7, size=6.1, color=HexColor('#565b66'))
    c.setFillColor(NAVY)
    c.rect(3 * mm, 3 * mm, 94 * mm, 10 * mm, fill=1, stroke=0)
    centered(c, 'A HOME IN BHUSAWAL', 8.9, font='PremierSerif', size=7.2, color=HexColor('#edd4a0'))
    centered(c, 'Dining / Stays / Hospitality', 5.4, size=5.8, color=HexColor('#d0d6df'))
    c.showPage();c.save()
    page=PdfReader(path).pages[0]
    assert len(PdfReader(path).pages)==1
    assert abs(float(page.mediabox.width)-W)<.1
    assert eyebrow in page.extract_text()
    assert page['/Annots'][0].get_object()['/A']['/URI']==url
    print(f'Created {path.name}: 100 x 180 mm; vector QR; {url}')
