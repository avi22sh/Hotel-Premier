"""Create vector QR invitation cards from the verified public PWA destinations."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from PIL import Image
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
     'RESTAURANT MENU', ['Pride Pure Veg', 'AC Restaurant'],
     ['Scan to explore the', 'culinary collection.']),
    ('Lobby', 'https://avi22sh.github.io/Hotel-Premier/?entry=home#home',
     'WELCOME', ['Welcome to', 'Hotel Premier'],
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
    # Tint the existing transparent brand mark for the navy print masthead.
    source = Image.open(ROOT / 'assets' / 'premier-original-logo.png').convert('RGBA')
    logo = Image.new('RGBA', source.size, '#e4c889')
    logo.putalpha(source.getchannel('A'))
    c.drawImage(ImageReader(logo), 20 * mm, 140 * mm, width=60 * mm, height=27.54 * mm, mask='auto')
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
    c.setFillColor(HexColor('#e4c889'))
    c.rect(3 * mm, 3 * mm, 94 * mm, 14 * mm, fill=1, stroke=0)
    centered(c, 'HOTEL PREMIER', 10.8, font='PremierSerif', size=9, color=NAVY)
    centered(c, 'Dining / Stays / Hospitality', 6.3, size=6.5, color=NAVY)
    c.showPage();c.save()
    page=PdfReader(path).pages[0]
    assert len(PdfReader(path).pages)==1
    assert abs(float(page.mediabox.width)-W)<.1
    assert eyebrow in page.extract_text()
    assert page['/Annots'][0].get_object()['/A']['/URI']==url
    print(f'Created {path.name}: 100 x 180 mm; vector QR; {url}')
