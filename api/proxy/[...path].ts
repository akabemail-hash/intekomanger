import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const path = req.query.path as string[] || []

  const targetUrl = `http://31.210.36.169:5050/${path.join('/')}`

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body:
        req.method === 'GET' || req.method === 'HEAD'
          ? undefined
          : JSON.stringify(req.body)
    })

    const text = await response.text()

    res.status(response.status).send(text)
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: String(err) })
  }
}
