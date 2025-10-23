# Deployment Guide for Movie Finder MCP Server

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended)
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select your repository
3. **Set environment variables:**
   - `TMDB_API_KEY`: `173161b8cbe19cfb7be32295ddc2a216`
   - `PORT`: `8000` (Railway will override this)
4. **Deploy** - Railway will automatically detect Node.js and deploy
5. **Get your URL** - Railway provides a URL like `https://your-app.railway.app`

### Option 2: Render
1. **Sign up** at [render.com](https://render.com)
2. **Create New Web Service**
3. **Connect GitHub** repository
4. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add `TMDB_API_KEY`
5. **Deploy** and get your URL

### Option 3: Heroku
1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-movie-finder-mcp`
4. **Set environment:** `heroku config:set TMDB_API_KEY=173161b8cbe19cfb7be32295ddc2a216`
5. **Deploy:** `git push heroku main`

## 🔧 Testing Your Deployed Server

Once deployed, test your endpoints:

```bash
# Test main endpoint
curl https://your-app-url.com

# Test manifest
curl https://your-app-url.com/manifest.json

# Test movie search
curl -X POST https://your-app-url.com/mcp/messages \
  -H "Content-Type: application/json" \
  -d '{"tool": "search_movies", "input": {"query": "inception", "limit": 3}}'
```

## 🤖 ChatGPT Integration

### Method 1: Direct URL (if supported)
1. Use your deployed server URL as the MCP server endpoint
2. Configure ChatGPT to connect to: `https://your-app-url.com`

### Method 2: MCP Configuration
1. **Create MCP config file:**
```json
{
  "mcpServers": {
    "movie-finder": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "TMDB_API_KEY": "173161b8cbe19cfb7be32295ddc2a216"
      }
    }
  }
}
```

2. **Point ChatGPT to your manifest:** `https://your-app-url.com/manifest.json`

## 📋 Environment Variables

Make sure to set these in your deployment platform:
- `TMDB_API_KEY`: `173161b8cbe19cfb7be32295ddc2a216`
- `PORT`: `8000` (most platforms override this)

## 🔍 Troubleshooting

- **Check logs** in your deployment platform dashboard
- **Verify environment variables** are set correctly
- **Test endpoints** individually to isolate issues
- **Ensure CORS** is enabled for cross-origin requests

## 📞 Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify your TMDB API key is valid
3. Test locally first: `npm start`
4. Check network connectivity and firewall settings
