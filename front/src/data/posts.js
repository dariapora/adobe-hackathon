import axios from 'axios'

export const initialPosts = []

export async function fetchPosts() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'

  const [{ data: posts }, { data: users }] = await Promise.all([
    axios.get(`${apiUrl}/api/post/`, { withCredentials: true }),
    axios.get(`${apiUrl}/api/user/`, { withCredentials: true }),
  ])

  const usersById = new Map(users.map((u) => [u.id, u]))

  const shaped = posts.map((p) => {
    const u = usersById.get(p.user_id) || {}
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown'
    // Prefer actual username; otherwise create a simple slug from full name
    const fallbackSlug = [u.first_name, u.last_name].filter(Boolean).join('.').toLowerCase()
    const handle = (u.username || fallbackSlug || 'user').trim()

    return {
      id: p.id,
      author: {
        name,
        handle,
        avatar: u.profile_picture || 'https://i.pravatar.cc/100?img=1',
      },
      createdAt: p.createdAt,
      tags: [],
      content: p.content || '',
      image: p.image || null,
      likes: p.likes ?? 0,
      comments: 0,
      bookmarked: false,
      // visibility is team id or null; teamId used for badge display
      teamId: p.visibility || null,
      visibility: p.visibility ?? null,
    }
  })

  // Ensure newest first in case backend ordering changes
  return shaped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
