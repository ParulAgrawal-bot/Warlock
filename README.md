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

Deployment is not required for two players on the same Wi-Fi/LAN. Leave `VITE_DUAL_SERVER_URL` blank so the browser uses the hostname serving the site, then run `npm run dev -- --host 0.0.0.0` and `npm run dual-server`. The opponent opens `http://<host-computer-LAN-IP>:5173` and enters the room code. Allow inbound ports 5173 and 3001 through the host firewall. Players on different networks need a publicly reachable deployment or tunnel.

Submissions in JavaScript, Python, Java, C++, and C# compile and run through a self-hosted Piston API. Start a Piston instance, copy `.env.example` to `.env`, and set `VITE_PISTON_URL` to its `/api/v2/execute` endpoint. For remote players, this must be a URL reachable from both players' browsers (not `localhost` on each device). Restart Vite after changing the environment file. The endpoint must allow browser requests from this app (CORS).

The runner executes the challenge test cases and reports a score weighted 80% for correctness and 20% for a language-specific efficiency heuristic. The efficiency component is a hint, not a formal complexity proof. User code is sent to the configured Piston instance for compilation and execution.

```bash
npm run dev
```
