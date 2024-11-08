# Neuman - AI-Powered Data Generation Platform

<p align="center">
 A powerful data generation platform built with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#data-generation"><strong>Data Generation</strong></a> ·
  <a href="#api-reference"><strong>API Reference</strong></a>
</p>
<br/>

## Demo

<video src="public/neuman-demo.mp4" autoplay loop muted playsinline />

## Features

- 🤖 AI-powered data generation using Groq LLM
- 🔄 Multiple output formats (JSON, CSV, TXT)
- 🔐 Secure authentication via Supabase
- 📊 Customizable data size and diversity
- 🚀 Built on Next.js App Router
- 💾 Automatic data persistence
- 🔍 Duplicate detection and removal
- ⚡ Edge-ready deployment

## Quick Start

1. **Installation**
   ```bash
   npx create-next-app -e with-supabase
   ```

2. **Environment Setup**  
   Create a `.env.local` file with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Architecture

The application uses a modern stack with:
- Next.js 13+ with App Router
- Supabase for authentication and data storage
- Groq for AI model integration
- TypeScript for type safety
- Tailwind CSS for styling

## Data Generation

The platform uses sophisticated algorithms to:
1. Generate diverse data chunks
2. Remove similarities between generated data
3. Merge and validate results
4. Store in Supabase database

## API Reference

### Authentication

All API requests require an API key. Generate one through the console interface after signing up.

#### Generate API Key
```bash
curl -X POST https://api.neuman.ai/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "My API Key"}'
```

### Data Generation API

#### Endpoint
`POST /api/generate-data`

#### Request Format

**JavaScript/Node.js**
```javascript
const response = await fetch('https://api.neuman.ai/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Generate user profiles",
    format: "JSON",
    dataSize: "medium"
  })
});
```

**Python**
```python
import requests

response = requests.post(
    'https://api.neuman.ai/v1/generate',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'prompt': 'Generate user profiles',
        'format': 'JSON',
        'dataSize': 'medium'
    }
)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| prompt | string | Description of data to generate |
| format | string | Output format (JSON/CSV/TXT) |
| dataSize | string | Amount of data (small/medium/large) |

#### Response Format

```json
{
  "data": "<generated_data>",
  "type": "complete",
  "stored": true,
  "record_id": "uuid"
}
```

## Deployment

1. Fork this repository
2. Connect your fork to Vercel
3. Add the following environment variables in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - GROQ_API_KEY
4. Deploy!

## Support and Feedback

Please file feedback and issues over on the [GitHub repository](https://github.com/yourusername/neuman/issues).
