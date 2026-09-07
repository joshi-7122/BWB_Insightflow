import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { IncomingMessage, ServerResponse } from 'http'

// ─── Gemini Secure Proxy Plugin ──────────────────────────────────────────────
// Intercepts POST /api/gemini requests in the dev server.
// Reads GEMINI_API_KEY from .env (loaded via loadEnv) or x-gemini-api-key header.
// Calls the Gemini API server-side and forwards the response to the frontend.
function geminiProxyPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'gemini-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/gemini',
        async (req: IncomingMessage, res: ServerResponse) => {
          // CORS preflight
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key')

          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          // Check for API key in request header or .env file
          const headerKey = req.headers['x-gemini-api-key'] as string | undefined
          const envKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
          const apiKey = (headerKey && headerKey.trim() !== '') ? headerKey : envKey

          if (!apiKey || apiKey === 'your-gemini-api-key-here' || apiKey.trim() === '') {
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: 'GEMINI_API_KEY not configured',
                message:
                  'Open your .env file and set GEMINI_API_KEY=your_key or configure it in the app settings.',
              })
            )
            return
          }

          // Read full request body
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', async () => {
            let parsedBody: any = {}
            try {
              parsedBody = JSON.parse(Buffer.concat(chunks).toString())
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid JSON body' }))
              return
            }

            const model = parsedBody.__model || 'gemini-2.5-flash'
            delete parsedBody.__model

            try {
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(parsedBody),
                }
              )

              const data = await geminiRes.json()
              res.statusCode = geminiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            } catch (err: any) {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({ error: 'Gemini API request failed', detail: err.message })
              )
            }
          })
        }
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), geminiProxyPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
