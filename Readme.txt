 # Movie Finder MCP (Node + Express)
  
  1. Copy files into a folder.
  2. Run `cp .env.example .env` and add your `TMDB_API_KEY`.
  3. Install deps: `npm install`.
  4. Start server: `npm start`.
  5. In another terminal run `ngrok http 8000` and copy the HTTPS URL (e.g. https://abcd.ngrok.app).
  6. Point ChatGPT Developer Mode / App manifest command URL to `https://<ngrok>/mcp/messages` and the SSE URL to `https://<ngrok>/mcp/stream?client_id=dev-client` (DevMode UI varies).
  
  Notes:
  - This scaffold is intentionally simple for learning. In production replace in-memory SSE with a durable solution and secure secrets.
  - If Developer Mode sends a different payload format, check your server logs and adapt the field mapping in `POST /mcp/messages`.
  
  Enjoy!
  