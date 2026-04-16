const API_URL = process.env.EXPO_PUBLIC_API_URL!

export const api = {
  get: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`).then(r => r.json()),
  post: (endpoint: string, body: object) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json())
}
