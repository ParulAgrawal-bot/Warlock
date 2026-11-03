from datetime import date
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Preformatted, KeepTogether,
)

OUT = r"C:\Warlock\Warlock\output\pdf\warlock-project-guide.pdf"
NAVY = colors.HexColor("#10233F")
TEAL = colors.HexColor("#0F9D8A")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#5D6B82")
PALE = colors.HexColor("#F2F6FC")
LINE = colors.HexColor("#D9E2EF")
WHITE = colors.white
PAGE_W, PAGE_H = A4
LEFT = RIGHT = 17 * mm
WIDTH = PAGE_W - LEFT - RIGHT

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCover", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=33, textColor=WHITE, alignment=TA_LEFT, spaceAfter=10))
styles.add(ParagraphStyle(name="SubCover", parent=styles["Normal"], fontName="Helvetica", fontSize=11, leading=16, textColor=colors.HexColor("#D7E5F8")))
styles.add(ParagraphStyle(name="KickerX", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=TEAL, spaceAfter=4))
styles.add(ParagraphStyle(name="H1X", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=NAVY, spaceBefore=1, spaceAfter=7))
styles.add(ParagraphStyle(name="H2X", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=NAVY, spaceBefore=7, spaceAfter=4))
styles.add(ParagraphStyle(name="BodyX", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="SmallX", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.4, leading=10, textColor=MUTED, spaceAfter=2))
styles.add(ParagraphStyle(name="CardTitleX", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.2, leading=11, textColor=NAVY, spaceAfter=3))
styles.add(ParagraphStyle(name="CardBodyX", parent=styles["Normal"], fontName="Helvetica", fontSize=7.7, leading=10.4, textColor=INK))
styles.add(ParagraphStyle(name="CodeX", fontName="Courier", fontSize=7.3, leading=9.6, textColor=INK))
styles.add(ParagraphStyle(name="TableHeadX", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=7.5, leading=9, textColor=WHITE))
styles.add(ParagraphStyle(name="TableCellX", parent=styles["Normal"], fontName="Helvetica", fontSize=7.4, leading=9.5, textColor=INK))

def P(text, style="BodyX"):
    return Paragraph(text, styles[style])

def card(title, body, width=None):
    table = Table([[P(title, "CardTitleX")], [P(body, "CardBodyX")]], colWidths=[width] if width else None)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table

def codebox(code):
    t = Table([[Preformatted(code, styles["CodeX"])]], colWidths=[WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7F9FC")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t

def data_table(headers, rows, widths):
    data = [[P(h, "TableHeadX") for h in headers]]
    data += [[P(str(c), "TableCellX") for c in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t

def page_chrome(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(LINE)
        canvas.line(LEFT, PAGE_H - 11 * mm, PAGE_W - RIGHT, PAGE_H - 11 * mm)
        canvas.setFont("Helvetica-Bold", 7)
        canvas.setFillColor(NAVY)
        canvas.drawString(LEFT, PAGE_H - 8.5 * mm, "WARLOCK  /  PROJECT GUIDE")
    canvas.setStrokeColor(LINE)
    canvas.line(LEFT, 11 * mm, PAGE_W - RIGHT, 11 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(LEFT, 7 * mm, "Repository review: 2 November 2026")
    canvas.drawRightString(PAGE_W - RIGHT, 7 * mm, f"{doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(
    OUT, pagesize=A4, rightMargin=RIGHT, leftMargin=LEFT,
    topMargin=16 * mm, bottomMargin=16 * mm,
    title="Warlock Project Guide and Code Evaluation",
    author="OpenAI Codex",
)
story = []

# Page 1: project overview
cover = Table([
    [P("WARLOCK  /  PROJECT GUIDE", "KickerX")],
    [P("Code, games, and<br/>evaluation", "TitleCover")],
    [P("A technical overview of the React application, arcade modes, 1v1 rooms, JavaScript evaluation, build commands, and deployment workflow.", "SubCover")],
], colWidths=[WIDTH])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), NAVY),
    ("LEFTPADDING", (0, 0), (-1, -1), 22),
    ("RIGHTPADDING", (0, 0), (-1, -1), 22),
    ("TOPPADDING", (0, 0), (-1, -1), 15),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 15),
    ("ROUNDEDCORNERS", [8, 8, 8, 8]),
]))
story += [cover, Spacer(1, 8 * mm)]
facts = Table([[
    [P("2", "H1X"), P("Arcade game modes", "SmallX")],
    [P("1v1", "H1X"), P("Live coding battle", "SmallX")],
    [P("JS", "H1X"), P("Challenge evaluation language", "SmallX")],
]], colWidths=[WIDTH / 3] * 3)
facts.setStyle(TableStyle([
    ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [facts, Spacer(1, 7 * mm), P("Executive summary", "H1X")]
story.append(P("Warlock is a browser-based coding game built with React, Vite, Monaco Editor, and HTML canvas. Players can control a claw machine or a bowling game with JavaScript. A separate 1v1 mode connects two players over a Node WebSocket server and compares solutions to one of three challenge problems."))
story.append(card("Current code evaluation", "Dual-mode submissions run in a dedicated browser Web Worker. The worker executes a named JavaScript function against fixed cases, stops after two seconds, and returns the number passed. The interface reports an 80% correctness score plus a 20% heuristic efficiency score."))
story.append(Spacer(1, 4 * mm))
story.append(P("Repository review", "H2X"))
story.append(P("This review reflects the source currently in the repository. The latest production build completed successfully with Vite. The build still reports a large Monaco-related bundle warning. Oxlint exits successfully but reports warnings about unused imports, refs during render, and hook dependencies."))
story.append(PageBreak())

# Page 2: architecture and product flows
story += [P("01  /  SYSTEM OVERVIEW", "KickerX"), P("How the application fits together", "H1X")]
story.append(P("The app is a single-page React frontend plus a small Node service. The frontend owns the interface and local game simulation. The server owns temporary room coordination and broadcasts updates over WebSockets."))
architecture = data_table(
    ["Layer", "Main files", "Responsibilities"],
    [
        ("Browser UI", "src/App.jsx, src/components/DualRoom.jsx", "Mode selection, editor controls, room flow, feedback and scores."),
        ("Editor and game", "MonacoEditor.jsx, GameCanvas.jsx, BowlingCanvas.jsx", "JavaScript editing, canvas animation, game state and game APIs."),
        ("Challenge runner", "dualChallenges.js, codeRunner.worker.js", "Challenge definitions, test data, score heuristic and bounded worker execution."),
        ("Room service", "server/dualServer.js", "Room membership, challenge selection, code sharing, submissions and winner state."),
        ("Build and deploy", "vite.config.js, render.yaml, package.json", "Vite build/dev server and Render WebSocket service configuration."),
    ], [29 * mm, 59 * mm, WIDTH - 88 * mm])
story += [architecture, Spacer(1, 5 * mm), P("Two main player journeys", "H2X")]
story.append(data_table(
    ["Journey", "Steps"],
    [
        ("Single player", "Choose Claw Machine or Bowling; edit the supplied JavaScript manual; run it; the script repeatedly calls the selected game API as the canvas animates."),
        ("Double player", "Create or join a room; connect a second player; start a shared random challenge; edit code while it syncs live; run tests; compare scores."),
    ], [35 * mm, WIDTH - 35 * mm]))
story.append(Spacer(1, 4 * mm))
story.append(card("Frontend and backend are separate processes", "`npm run build` creates static files in `dist`. It does not start a website server or the room server. `npm run dev` starts Vite for frontend development. `npm run dual-server` starts the Node HTTP and WebSocket service on port 3001."))
story.append(PageBreak())

# Page 3: games and editor
story += [P("02  /  SINGLE-PLAYER ARCADE", "KickerX"), P("The games are programmable", "H1X")]
story.append(P("The single-player editor receives a manual as starter code. Clicking Run compiles that text as a function with a game API parameter. The canvas loop invokes the compiled function on every animation frame until the player runs another script or changes game."))
story.append(data_table(
    ["Game", "JavaScript API", "What the game does"],
    [
        ("Claw Machine", "`claw.move(speed)`<br/>`claw.moveTo(x, speed)`<br/>`claw.drop()`<br/>`claw.release()`<br/>Sensors: x, y, isIdle, hasPlushie, atChute, nearestPlushie.", "A 480 x 420 canvas simulation with a claw, plushies, a chute, hit/miss odds, score and sound effects. Aim, drop, carry a plushie to the chute and release."),
        ("Bowling", "`ball.move(speed)`<br/>`ball.moveTo(x, speed)`<br/>`ball.setAngle(deg)`<br/>`ball.turn(deg)`<br/>`ball.roll(power)`<br/>Sensors: x, y, angle, isIdle, isRolling, pinsStanding, pinsDown.", "A canvas lane with a ball and ten pins. Code aims and rolls the ball; physics update position and pin state, and score/strike feedback is shown."),
    ], [31 * mm, 62 * mm, WIDTH - 93 * mm]))
story += [Spacer(1, 5 * mm), P("Single-player execution sequence", "H2X")]
story.append(codebox("Editor source\n    -> new Function('claw' or 'ball', source)\n    -> store compiled function in a React ref\n    -> requestAnimationFrame loop calls the function each frame\n    -> game API mutates the canvas simulation state"))
story.append(Spacer(1, 4 * mm))
story.append(card("Execution limitation", "This single-player path runs user code on the browser main thread and calls it every frame. A long-running loop can freeze the interface. Runtime exceptions are swallowed in the animation loop, so syntax errors are visible but many runtime errors have little feedback. Use only code you trust."))
story.append(Spacer(1, 4 * mm))
story.append(P("Other frontend pieces", "H2X"))
story.append(P("`src/App.jsx` controls the lobby and mode switching. `src/components/MonacoEditor.jsx` configures Monaco themes, language workers, keyboard shortcuts and controlled text updates. `src/index.css` and `src/App.css` provide the dark neon visual system and responsive layouts. `src/assets/` contains game illustrations and objects."))
story.append(PageBreak())

# Page 4: multiplayer
story += [P("03  /  MULTIPLAYER", "KickerX"), P("Room flow and shared state", "H1X")]
story.append(P("The server is a stateful Node process using the `ws` library. It exposes `/health` over HTTP and `/dual-ws` over WebSockets. Room data lives in Maps in process memory; no database is used."))
story.append(data_table(
    ["Event", "Effect"],
    [
        ("join", "Validates a 4 to 8 character alphanumeric room code, attaches a player ID/name, and sends the room snapshot."),
        ("code:update", "Stores up to 100 KB of code and broadcasts it to the other player."),
        ("round:start", "Requires two connected players, picks challenge 1-3, starts a 120-second round and clears prior submissions."),
        ("round:submit", "Stores passed/total/score and chooses a winner or draw after two submissions arrive."),
        ("round:expire", "Marks the round expired when the client timer reaches zero."),
    ], [38 * mm, WIDTH - 38 * mm]))
story += [Spacer(1, 5 * mm), P("Room lifecycle", "H2X")]
story.append(codebox("Browser A  -- join/code/submit -->  Node WebSocket server\nBrowser A  <-- room:state/code:opponent --  Node server  <-- Browser B\n\nRoom code: 4-8 letters/numbers; generated as 6 characters\nRoom size: 2 players\nRound: random challenge, 120 seconds\nCleanup: after both disconnect, room is removed after 5 minutes"))
story.append(Spacer(1, 5 * mm))
story.append(card("Deployment behavior", "Render runs the room server as a Web Service and checks `/health`. Configure the frontend build with `VITE_DUAL_SERVER_URL=wss://<service>.onrender.com/dual-ws`. For same-network local play, leave it blank and open the Vite host from both devices; allow ports 5173 and 3001 through the host firewall."))
story.append(Spacer(1, 4 * mm))
story.append(P("Current multiplayer limits", "H2X"))
story.append(P("A server restart clears rooms and submissions. Room codes and player IDs are not authentication. The server accepts the score sent by the browser rather than independently running the challenge, so a modified client can falsify a score. Room submission values are clamped, but correctness is not verified server-side."))
story.append(PageBreak())

# Page 5: evaluation
story += [P("04  /  CODE EVALUATION", "KickerX"), P("How dual-mode code is evaluated", "H1X")]
story.append(P("The challenge editor currently supports JavaScript only. `QUESTION_BANK` defines three named functions and fixed input/expected-output cases. Submission runs the provided function once against each case in `codeRunner.worker.js`."))
steps = [
    ("1. Submit", "The app requires an active round and non-empty solution, sends the latest code to the room, then starts the local worker."),
    ("2. Resolve function", "The worker evaluates the source and looks up the named function: `twoSum`, `reverseString`, or `isPalindrome`."),
    ("3. Execute cases", "Each case gets a structured clone of its inputs. The function result is compared with expected output via JSON serialization. If it returns null/undefined, the first argument is used, which supports in-place `reverseString`."),
    ("4. Enforce timeout", "The parent terminates the Web Worker after 2 seconds. Syntax/runtime errors return a message; failed runs remain editable and can be retried."),
    ("5. Score and share", "The browser computes correctness plus heuristic efficiency and sends the result to the WebSocket server for comparison."),
]
for title, body in steps:
    story.append(card(title, body))
    story.append(Spacer(1, 2 * mm))
story.append(Spacer(1, 2 * mm))
story.append(codebox("score = round((passed / total) * 80 + (efficiency / 100) * 20)\n\nExamples with efficiency=100:\n  4/4 cases -> 100\n  3/4 cases -> 80\n\nExamples with efficiency=80:\n  4/4 cases -> 96\n  3/4 cases -> 76"))
story.append(Spacer(1, 4 * mm))
story.append(P("Challenge bank", "H2X"))
story.append(data_table(
    ["Problem", "Cases", "Current efficiency hint"],
    [
        ("Two Sum", "4", "Awards 100 for `new Map`; otherwise 80."),
        ("Reverse String", "4", "The generic loop regex currently gives 80 for `while`, otherwise 100."),
        ("Palindrome Number", "5", "Awards 100 for `% 10` or `Math.floor`; otherwise 80."),
    ], [34 * mm, 20 * mm, WIDTH - 54 * mm]))
story.append(Spacer(1, 3 * mm))
story.append(P("Important scoring caveat: the `optimal` and `optimalityHint` fields in the question data are not used by the scoring path. The Reverse String heuristic can reward less appropriate code because it penalizes `while` loops. These values are source-pattern hints, not time/space complexity analysis." , "SmallX"))
story.append(PageBreak())

# Page 6: build and run
story += [P("05  /  BUILD, RUN, DEPLOY", "KickerX"), P("Commands and environment", "H1X")]
story.append(P("Install the project dependencies once. During local development, run the frontend and multiplayer service in separate terminal windows."))
story.append(codebox("npm install\n\n# Terminal 1: multiplayer WebSocket server\nnpm run dual-server\n\n# Terminal 2: frontend development server\nnpm run dev\n\n# Production static bundle only\nnpm run build\n\n# Serve a built bundle locally (build first)\nnpm run preview"))
story.append(Spacer(1, 4 * mm))
story.append(data_table(
    ["Command/config", "Purpose"],
    [
        ("`npm run dev`", "Starts Vite, usually at http://localhost:5173. Does not start the WebSocket server."),
        ("`npm run dual-server`", "Starts the Node service at port 3001 (or Render's `PORT`). Required for dual rooms only."),
        ("`npm run build`", "Creates the static `dist/` bundle. It exits; it is not a long-running web server."),
        ("`VITE_DUAL_SERVER_URL`", "Optional WebSocket URL. Blank means same host on port 3001; production should use the Render `wss://.../dual-ws` address."),
    ], [42 * mm, WIDTH - 42 * mm]))
story += [Spacer(1, 4 * mm), P("Deployment checklist", "H2X")]
for line in [
    "Render service: repository root, Node runtime, `npm install`, `npm run dual-server`, health path `/health`.",
    "Vercel frontend: build with `npm run build`; publish `dist`; define `VITE_DUAL_SERVER_URL` before build and redeploy.",
    "Remote players need HTTPS frontend plus reachable WSS room service. A local Render free service may sleep and cold-start.",
    "No external evaluator or API key is configured in the current project. Dual-mode evaluation is performed in each player's browser.",
]:
    story.append(P("- " + line))
story.append(Spacer(1, 3 * mm))
story.append(card("Same Wi-Fi/LAN", "Run `npm run dual-server` and `npm run dev -- --host 0.0.0.0`. Both devices visit `http://<host-LAN-IP>:5173`; allow inbound TCP ports 5173 and 3001."))
story.append(PageBreak())

# Page 7: assessment and source map
story += [P("06  /  REVIEW AND FILE MAP", "KickerX"), P("What is solid, what to improve", "H1X")]
story.append(data_table(
    ["Area", "Current state / recommendation"],
    [
        ("Bundle size", "Build succeeds, but the main minified JavaScript is about 3.87 MB and Monaco language workers add large chunks. Load Monaco/dual mode lazily and reduce bundled language workers."),
        ("Single-player code", "`new Function` runs on the UI thread every animation frame. A runaway script can freeze the page. Move it to a worker or document that only trusted code should be run."),
        ("Dual worker trust", "The worker has a 2-second timeout and no DOM, but browser workers can still use network APIs. This is not a secure multi-tenant code sandbox."),
        ("Fair scoring", "Correctness and score are computed by the browser and trusted by the server. A competitive deployment should validate submissions and scores server-side."),
        ("Efficiency signal", "Regex heuristics are easy to game and one current heuristic is misleading. Use them as optional coaching hints, not as a decisive winner score."),
        ("Room durability", "Room state is memory-only. Add persistent storage if rooms must survive server restarts or scale across multiple server instances."),
        ("Lint", "Oxlint exits 0 with warnings, including unused App imports, refs read during render, and incomplete effect dependency lists. Clean these up before expanding features."),
    ], [34 * mm, WIDTH - 34 * mm]))
story += [Spacer(1, 4 * mm), P("Source map", "H2X")]
story.append(data_table(
    ["Path", "Role"],
    [
        ("`src/App.jsx`", "Lobby and single-player orchestration."),
        ("`src/components/GameCanvas.jsx`", "Claw machine simulation and API."),
        ("`src/components/BowlingCanvas.jsx`", "Bowling physics, pin simulation and API."),
        ("`src/components/DualRoom.jsx`", "Room UI, live editor sync, timer, submission and score UI."),
        ("`src/dualChallenges.js` + `codeRunner.worker.js`", "Problem definitions, test cases, score heuristic and JavaScript worker."),
        ("`server/dualServer.js`", "HTTP health route and in-memory WebSocket room server."),
        ("`vite.config.js`, `render.yaml`", "Frontend tooling and Render deployment configuration."),
    ], [55 * mm, WIDTH - 55 * mm]))
story.append(Spacer(1, 4 * mm))
story.append(P("Dependency note: `apify-client` and `@monaco-editor/react` are listed in `package.json`, but the reviewed source imports neither. Confirm whether they are still needed before removing them.", "SmallX"))

doc.build(story, onFirstPage=page_chrome, onLaterPages=page_chrome)
print(OUT)
