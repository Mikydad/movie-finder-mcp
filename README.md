# Movie Finder MCP Server

A Model Context Protocol (MCP) server that provides movie search functionality using The Movie Database (TMDB) API.

## Features

- Search for movies by title or keyword
- Get detailed movie information
- Real-time updates via Server-Sent Events (SSE)
- Compatible with ChatGPT's MCP system

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your TMDB API key:
   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   PORT=8000
   ```

3. **Get a TMDB API key:**
   - Visit [TMDB API](https://www.themoviedb.org/settings/api)
   - Create an account and request an API key
   - Add the key to your `.env` file

4. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
   ```

## Usage

The server will be available at `http://localhost:8000` (or your configured PORT).

### Available Tools

1. **search_movies** - Search for movies by query
   - Parameters: `query` (required), `limit` (optional, default: 5)
   
2. **movie_details** - Get detailed information for a specific movie
   - Parameters: `id` (required, TMDB movie ID)

### Endpoints

- `GET /` - Server status
- `GET /mcp/stream` - SSE endpoint for real-time updates
- `POST /mcp/messages` - MCP message handler
- `GET /manifest.json` - MCP manifest

## MCP Integration

This server is designed to work with ChatGPT's MCP system. The manifest defines the available tools and their schemas for proper integration.
