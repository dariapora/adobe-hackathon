import axios from 'axios'

export const initialPosts = []

export async function fetchPosts() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'

  const [{ data: posts }, { data: users }] = await Promise.all([
    axios.get(`${apiUrl}/api/post/`, { withCredentials: true }),
    axios.get(`${apiUrl}/api/user/`, { withCredentials: true }),
  ])

  const usersById = new Map(users.map((u) => [u.id, u]))

  return posts.map((p) => {
    const u = usersById.get(p.user_id) || {}
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown'
    // Set "username" shown in UI to the user's full name
    const handle = name

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
      teamId: u.team_id || null,
      visibility: p.visibility || 'all',
    }
  })
}
