# Code Editor

Minimal Monaco-based editor. Change language from the toolbar and write your own code.

## Run the single-player games

From the project folder, install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Choose **Single Player**, select Claw or Bowling, and press **Run** to execute the example in the editor. Edit the example and press **Run** again to try your code. **Stop** disables the running game script. **Reset Game** stops the script, restores the selected game's example, and resets its board and score. The editor also supports Ctrl+Enter to run.

### Bowling example

The **Manual** button loads and runs an example. Each frame, the game calls the code with a `ball` (or `claw`) API object and a persistent `state` object. Define a function that accepts those objects, then call the function at the bottom of the editor:

```js
function playBowling(ball, state) {
  if (!state.thrown && ball.isIdle) {
    ball.moveTo(230, 3);
    ball.setAngle(-4);
    ball.roll(8);
    state.thrown = true;
  }
}
playBowling(ball, state);
```

Bowling commands: `move`, `moveTo`, `setAngle`, `turn`, `roll`, `resetLane`. Sensors: `x`, `y`, `angle`, `isIdle`, `isRolling`, `pinsStanding`, and `pinsDown`.

### Claw example

```js
function controlClaw(claw, state) {
  if (!state.finished && claw.isIdle) {
    if (claw.hasPlushie) {
      if (claw.atChute) {
        claw.release();
        state.finished = true;
      } else claw.moveToChute(4);
    } else {
      const target = claw.nearestPlushie;
      if (target && Math.abs(claw.x - target.x) > 5) claw.moveTo(target.x, 4);
      else if (target) claw.drop();
    }
  }
}
controlClaw(claw, state);
```

Claw commands: `move`, `moveTo`, `moveToChute`, `drop`, and `release`. Sensors: `x`, `isIdle`, `hasPlushie`, `atChute`, and `nearestPlushie`.

## Dual mode code checking

Dual mode supports two-player rooms with live code sharing, synchronized challenges, and head-to-head scores. The second player can connect from another device using the room code, provided both devices can reach the WebSocket server.

Run the app and the WebSocket server in separate terminals:

```bash
npm run dual-server
npm run dev -- --host 0.0.0.0
```

The WebSocket server listens on port 3001. Share the Vite URL and room code with the other player. For a remote opponent, allow inbound traffic to the Vite and WebSocket ports through the host firewall. To deploy the app, set `VITE_DUAL_SERVER_URL` to the reachable `ws://` or `wss://` URL ending in `/dual-ws`.

### Deploy the dual server on Render

The repository root contains `package.json`, `server/dualServer.js`, and `render.yaml`. Create a Render Blueprint from the repository root (or create a Web Service with the root directory left blank). Render uses `npm install` to build and `npm run dual-server` to start the WebSocket server. The `/health` endpoint is used for Render health checks, and the server listens on Render's assigned `PORT`.

After deployment, set `VITE_DUAL_SERVER_URL` in the frontend hosting provider to `wss://<render-service-name>.onrender.com/dual-ws`, then rebuild/redeploy the frontend. Do not use the Vercel website domain with port `3001` as the WebSocket server URL.

Deployment is not required for two players on the same Wi-Fi/LAN. Leave `VITE_DUAL_SERVER_URL` blank so the browser uses the hostname serving the site, then run `npm run dev -- --host 0.0.0.0` and `npm run dual-server`. The opponent opens `http://<host-computer-LAN-IP>:5173` and enters the room code. Allow inbound ports 5173 and 3001 through the host firewall. Players on different networks need a publicly reachable deployment or tunnel.

Dual mode evaluates JavaScript submissions in a short-lived Web Worker, so code execution does not require Docker or an external code runner. JavaScript is the supported evaluation language. Scores combine 80% correctness with a 20% efficiency heuristic; the efficiency component is a hint, not a formal complexity proof.

```bash
npm run dev
```
