from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, HRFlowable,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor

OUT = r"C:\Warlock\Warlock\output\pdf\warlock-project-achievements.pdf"
NAVY = HexColor("#10233F")
BLUE = HexColor("#1D4ED8")
TEAL = HexColor("#0F9D8A")
INK = HexColor("#172033")
MUTED = HexColor("#5D6B82")
PALE = HexColor("#F2F6FC")
LINE = HexColor("#D9E2EF")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=29, leading=34, textColor=WHITE, alignment=TA_LEFT, spaceAfter=10))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["Normal"], fontName="Helvetica", fontSize=12, leading=18, textColor=HexColor("#D7E5F8"), alignment=TA_LEFT))
styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=TEAL, spaceAfter=5, tracking=1.2))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=NAVY, spaceBefore=2, spaceAfter=9))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=NAVY, spaceBefore=8, spaceAfter=4))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=14, textColor=INK, spaceAfter=5))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="CardTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=NAVY, spaceAfter=3))
styles.add(ParagraphStyle(name="CardBody", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=INK))
styles.add(ParagraphStyle(name="Metric", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=19, leading=22, textColor=NAVY, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="MetricLabel", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Callout", parent=styles["Normal"], fontName="Helvetica", fontSize=8.7, leading=13, textColor=NAVY))
styles.add(ParagraphStyle(name="CenterSmall", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=NAVY, alignment=TA_CENTER))

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def card(title, body, width):
    t = Table([[P(title, "CardTitle")], [P(body, "CardBody")]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), PALE),
        ("BOX", (0,0), (-1,-1), 0.6, LINE),
        ("LINEBEFORE", (0,0), (0,-1), 3, TEAL),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 9),
        ("TOPPADDING", (0,0), (-1,0), 8),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 8),
    ]))
    return t

def on_page(canvas, doc):
    page = canvas.getPageNumber()
    if page == 1:
        return
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(18*mm, h-14*mm, w-18*mm, h-14*mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(18*mm, h-11*mm, "WARLOCK  /  PROJECT ACHIEVEMENTS")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 11*mm, "Prepared 27 October 2026")
    canvas.drawRightString(w-18*mm, 11*mm, f"{page}  /  3")
    canvas.restoreState()

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    rightMargin=18*mm, leftMargin=18*mm,
    topMargin=21*mm, bottomMargin=18*mm,
    title="Warlock Project - Achievements with Codex",
    author="OpenAI Codex",
    subject="Project work completed collaboratively",
)
W = A4[0] - 36*mm
story = []

# Page 1: cover and highlights
cover = Table([
    [P("WARLOCK PROJECT  /  COLLABORATION SUMMARY", "Kicker")],
    [P("What we built<br/>together", "CoverTitle")],
    [P("A record of the coding editor, live dual-player challenge mode, code checking, and deployment setup developed through our work.", "CoverSub")],
], colWidths=[W-24*mm])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), NAVY),
    ("BOX", (0,0), (-1,-1), 0, NAVY),
    ("LEFTPADDING", (0,0), (-1,-1), 13*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 11*mm),
    ("TOPPADDING", (0,0), (0,0), 12*mm),
    ("BOTTOMPADDING", (0,0), (0,0), 4*mm),
    ("TOPPADDING", (0,1), (0,1), 2*mm),
    ("BOTTOMPADDING", (0,1), (0,1), 2*mm),
    ("TOPPADDING", (0,2), (0,2), 1*mm),
    ("BOTTOMPADDING", (0,2), (0,2), 13*mm),
]))
story.append(Spacer(1, 15*mm))
story.append(cover)
story.append(Spacer(1, 11*mm))
metrics = Table([[
    P("<font size='19' color='#10233F'><b>1</b></font><br/><font size='7.5' color='#5D6B82'>supported language</font>", "Metric"),
    P("<font size='19' color='#10233F'><b>2</b></font><br/><font size='7.5' color='#5D6B82'>players per room</font>", "Metric"),
    P("<font size='19' color='#10233F'><b>80 / 20</b></font><br/><font size='7.5' color='#5D6B82'>correctness / efficiency</font>", "Metric"),
]], colWidths=[W/3]*3)
metrics.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), WHITE),
    ("BOX", (0,0), (-1,-1), 0.7, LINE),
    ("INNERGRID", (0,0), (-1,-1), 0.6, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 10),
    ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(metrics)
story.append(Spacer(1, 9*mm))
story.append(P("The result", "H2x"))
story.append(P("Warlock grew from a browser-based code editor into a multiplayer coding challenge experience: players can join a room, work in parallel, run JavaScript solutions against challenge cases, and compare results.", "Bodyx"))
story.append(Spacer(1, 3*mm))
story.append(card("A clear split of responsibilities", "<b>Vercel</b> serves the frontend. <b>Render</b> runs the room and WebSocket server. JavaScript challenge solutions run in a short-lived browser Web Worker.", W))
story.append(Spacer(1, 7*mm))
story.append(P("This summary covers the implemented project work and its current browser-based evaluation flow.", "Smallx"))
story.append(PageBreak())

# Page 2: feature work
story.append(P("FEATURES  /  IMPLEMENTED WORK", "Kicker"))
story.append(P("From editor to head-to-head coding", "H1x"))
story.append(P("The main product work centered on making JavaScript coding challenges playable by two people at once.", "Bodyx"))
story.append(Spacer(1, 3*mm))

items = [
    ("01  JavaScript editor", "Focused the challenge editor on JavaScript and added starter templates for the available problems."),
    ("02  Live dual-player rooms", "Built room creation and joining with short room codes, player names, shared challenge state, and live code updates between two players."),
    ("03  Submit and compare", "Added individual submissions, test-case results, score comparison, and winner selection. The submit control and dual-editor layout were adjusted so the action remains visible."),
    ("04  Correctness plus efficiency", "The score weights test correctness at 80% and a JavaScript efficiency heuristic at 20%. The heuristic provides guidance; it is not a formal complexity proof."),
    ("05  Challenge evaluation", "Runs submitted JavaScript against the challenge cases in a short-lived Web Worker."),
    ("06  Execution timeout", "Added a worker timeout so an infinite loop cannot keep the evaluation running indefinitely."),
]
for i in range(0, len(items), 2):
    pair = [card(items[i][0], items[i][1], W/2-3*mm), card(items[i+1][0], items[i+1][1], W/2-3*mm)]
    row = Table([[pair[0], pair[1]]], colWidths=[W/2, W/2])
    row.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(row)
    story.append(Spacer(1, 4*mm))

story.append(Spacer(1, 2*mm))
story.append(P("Product decisions and fixes", "H2x"))
bullets = [
    "Kept the frontend and the long-running multiplayer WebSocket process as separate deployable services.",
    "Added a health endpoint and Render port handling so the dual server can run as a web service.",
    "Runs evaluation in a separate worker so the editor remains responsive while test cases execute.",
]
for b in bullets:
    story.append(P("<font color='#0F9D8A'><b>-</b></font>  " + b, "Bodyx"))

story.append(PageBreak())

# Page 3: deployment and status
story.append(P("DEPLOYMENT  /  WHAT'S NEXT", "Kicker"))
story.append(P("How the pieces fit", "H1x"))
story.append(P("We worked through Vercel build settings, Render service settings, and public WebSocket URLs for multiplayer rooms.", "Bodyx"))
story.append(Spacer(1, 4*mm))

arch = Table([
    [P("PLAYERS' BROWSER", "CenterSmall"), P("LINK", "CenterSmall"), P("SERVICE", "CenterSmall")],
    [P("Vercel frontend<br/><font color='#5D6B82'>Vite build output: dist</font>", "CenterSmall"), P("<font color='#0F9D8A' size='11'><b>&lt;-&gt;</b></font>", "CenterSmall"), P("JavaScript worker<br/><font color='#5D6B82'>Runs in the browser</font>", "CenterSmall")],
    [P("Room creation, editors,<br/>challenge and scoring UI", "CenterSmall"), P("<font color='#0F9D8A' size='9'><b>test cases</b></font>", "CenterSmall"), P("Executes challenge code<br/>with a two-second timeout", "CenterSmall")],
    [P("Render Web Service<br/><font color='#5D6B82'>Node WebSocket server</font>", "CenterSmall"), P("<font color='#0F9D8A' size='11'><b>&lt;-&gt;</b></font>", "CenterSmall"), P("Room state and live<br/>code synchronization", "CenterSmall")],
], colWidths=[W*0.42, W*0.16, W*0.42])
arch.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), PALE),
    ("BOX", (0,0), (-1,-1), 0.7, LINE),
    ("INNERGRID", (0,0), (-1,-1), 0.5, LINE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
]))
story.append(arch)
story.append(Spacer(1, 6*mm))
story.append(P("Deployment knowledge gained", "H2x"))
steps = [
    ("Vercel", "Build the Vite frontend with `npm run build`; the output folder is `dist`. The live frontend needs `VITE_DUAL_SERVER_URL` set to the Render WebSocket URL ending in `/dual-ws`, then a redeploy."),
    ("Render", "Deploy the Node server as a Web Service from the repository root. The service starts with `npm run dual-server` and listens on Render's assigned `PORT`. The `/health` route provides a health check; the root URL can return 404 by design."),
    ("Browser evaluation", "Run `npm run dev`; JavaScript challenge evaluation runs in a short-lived Web Worker without a separate runner service."),
]
for title, body in steps:
    t = Table([[P(title, "CardTitle"), P(body, "CardBody")]], colWidths=[26*mm, W-26*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), WHITE),
        ("LINEBELOW", (0,0), (-1,-1), 0.6, LINE),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(t)

story.append(Spacer(1, 5*mm))
story.append(P("Current status and remaining dependency", "H2x"))
callout = Table([[P("<b>Completed in the project:</b> JavaScript challenge editing and evaluation, dual rooms, code synchronization, score comparison, and Render/Vercel configuration. The browser runs challenge code in a short-lived Web Worker; no external code runner is required.", "Callout")]], colWidths=[W])
callout.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), HexColor("#EAF7F5")),
    ("BOX", (0,0), (-1,-1), 0.7, HexColor("#A6DED5")),
    ("LINEBEFORE", (0,0), (0,-1), 3, TEAL),
    ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("TOPPADDING", (0,0), (-1,-1), 9),
    ("BOTTOMPADDING", (0,0), (-1,-1), 9),
]))
story.append(callout)
story.append(Spacer(1, 4*mm))
story.append(P("Warlock now supports writing JavaScript solutions, checking them against challenge cases, and competing live with another player.", "Smallx"))

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print(OUT)
