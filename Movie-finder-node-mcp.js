// Project: movie-finder-mcp
// Files included below. Paste each into your project folder as shown.

/* === package.json === */
{
    "name": "movie-finder-mcp",
    "version": "0.1.0",
    "type": "module",
    "main": "server.js",
    "scripts": {
      "start": "node server.js",
      "dev": "NODE_ENV=development node server.js"
    },
    "dependencies": {
      "cors": "^2.8.5",
      "dotenv": "^16.0.0",
      "express": "^4.18.2",
      "node-fetch": "^3.4.1",
      "uuid": "^9.0.0"
    }
  }
  
  /* === .env.example === */
  # Copy to .env and fill values
  TMDB_API_KEY=your_tmdb_api_key_here
  PORT=8000
  
  /* === manifest.json === */
  {
    "name": "movie-finder",
    "display_name": "Movie Finder",
    "version": "0.1.0",
    "description": "Search TMDB for movies and return compact interactive results.",
    "author": "Your Name",
    "mcp": {
      "mcp_version": "1.0",
      "command": "/mcp"
    },
    "tools": [
      {
        "id": "search_movies",
        "name": "Search Movies",
        "description": "Search movies by query and return top results.",
        "json_schema": {
          "type": "object",
          "properties": {
            "query": { "type": "string", "description": "Search term (movie title or keyword)" },
            "limit": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 }
          },
          "required": ["query"]
        },
        "_meta": {
          "openai": {
            "outputTemplate": "{{#each results}}- **{{title}} ({{year}})** — {{overview}}\n{{/each}}"
          }
        }
      },
      {
        "id": "movie_details",
        "name": "Movie Details",
        "description": "Get detailed info for a movie by its TMDB id.",
        "json_schema": {
          "type": "object",
          "properties": {
            "id": { "type": "integer" }
          },
          "required": ["id"]
        }
      }
    ]
  }
  
  /* === server.js === */
  import express from 'express';
  import fetch from 'node-fetch';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import { v4 as uuidv4 } from 'uuid';
  
  dotenv.config();
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  const PORT = process.env.PORT || 8000;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    console.warn('Warning: TMDB_API_KEY not set. Set it in .env or environment.');
  }
  
  // Simple in-memory client-event streams for SSE (development only)
  const sseClients = new Map();
  
  // Helper: send an event to a connected SSE client
  function sendSseEvent(clientId, event) {
    const res = sseClients.get(clientId);
    if (!res) return false;
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      return true;
    } catch (err) {
      console.error('SSE write error', err);
      return false;
    }
  }
  
  app.get('/', (req, res) => {
    res.send('Movie Finder MCP server is running');
  });
  
  // SSE endpoint: ChatGPT or DevMode can connect to receive server messages/events
  // Example: GET /mcp/stream?client_id=abc123
  app.get('/mcp/stream', (req, res) => {
    const clientId = req.query.client_id || uuidv4();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();
  
    res.write(`:connected to client ${clientId}\n\n`);
    sseClients.set(clientId, res);
  
    req.on('close', () => {
      sseClients.delete(clientId);
    });
  });
  
  // POST /mcp/messages - simplified MCP message handler
  // DevMode may POST calls with structure containing tool calls. We support two formats:
  // 1) { tool: 'search_movies', input: {query, limit}, client_id }
  // 2) { type: 'tool_call', tool: 'search_movies', input: {...}, client_id }
  app.post('/mcp/messages', async (req, res) => {
    try {
      const payload = req.body || {};
      const clientId = payload.client_id || payload.clientId || payload.client || 'dev-client';
  
      // Normalize tool call
      const tool = payload.tool || (payload.type === 'tool_call' && payload.tool) || (payload.tool_call && payload.tool_call.name) || null;
      const input = payload.input || payload.inputs || (payload.tool_call && payload.tool_call.input) || {};
  
      if (!tool) {
        return res.json({ status: 'ok', message: 'no tool call detected' });
      }
  
      if (tool === 'search_movies') {
        const query = (input.query || '').trim();
        const limit = Number(input.limit || 5);
        if (!query) return res.status(400).json({ error: 'missing query' });
  
        // Inform client via SSE that we're working (optional)
        sendSseEvent(clientId, { type: 'status', status: 'searching', query });
  
        const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        const tmdbRes = await fetch(tmdbUrl);
        const tmdbJson = await tmdbRes.json();
  
        const results = (tmdbJson.results || []).slice(0, limit).map(m => ({
          id: m.id,
          title: m.title,
          year: (m.release_date || '').slice(0, 4) || 'N/A',
          overview: m.overview || 'No overview',
          score: m.vote_average || 0
        }));
  
        const responsePayload = { status: 'ok', tool: 'search_movies', results };
  
        // Try to push via SSE if client connected
        const pushed = sendSseEvent(clientId, { type: 'tool_result', tool: 'search_movies', results });
  
        return res.json(responsePayload);
      }
  
      if (tool === 'movie_details') {
        const id = Number(input.id);
        if (!id) return res.status(400).json({ error: 'missing id' });
  
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
        const tmdbRes = await fetch(tmdbUrl);
        const tmdbJson = await tmdbRes.json();
  
        const details = {
          id: tmdbJson.id,
          title: tmdbJson.title,
          year: (tmdbJson.release_date || '').slice(0, 4) || 'N/A',
          overview: tmdbJson.overview || 'No overview',
          runtime: tmdbJson.runtime || null,
          genres: (tmdbJson.genres || []).map(g => g.name),
          score: tmdbJson.vote_average || 0
        };
  
        sendSseEvent(clientId, { type: 'tool_result', tool: 'movie_details', details });
  
        return res.json({ status: 'ok', tool: 'movie_details', details });
      }
  
      // unknown tool
      return res.status(400).json({ error: 'unknown tool', tool });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server error', details: String(err) });
    }
  });
  
  // Simple endpoint that returns the manifest content so you can point ChatGPT to it if needed
  app.get('/manifest.json', (req, res) => {
    res.sendFile(new URL('./manifest.json', import.meta.url));
  });
  
  app.listen(PORT, () => {
    console.log(`Movie Finder MCP server listening on http://localhost:${PORT}`);
  });
  
  /* === README.md (short) === */
 