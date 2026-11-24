// VITE_API_URL is injected at BUILD time (Docker build arg / GitHub Actions).
// Example: http://localhost:5000  or  https://blog-backend-xxxx.a.run.app
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const getPosts = () => request('/posts');
export const createPost = (post) =>
  request('/posts', { method: 'POST', body: JSON.stringify(post) });
export const updatePost = ({ id, ...post }) =>
  request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(post) });
export const deletePost = (id) => request(`/posts/${id}`, { method: 'DELETE' });
export const API_BASE = BASE;
