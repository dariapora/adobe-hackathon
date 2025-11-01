import axios from 'axios'

export async function fetchUsers() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const { data } = await axios.get(`${apiUrl}/api/user/`, { withCredentials: true })
  return data
}

export async function fetchUserById(id) {
  if (!id) throw new Error('fetchUserById: id is required')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const { data } = await axios.get(`${apiUrl}/api/user/${id}`, { withCredentials: true })
  return data
}