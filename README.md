# Code Editor

Minimal Monaco-based editor. Change language from the toolbar and write your own code.

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
