import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Container, Loader, Stack, Text } from '@mantine/core'
import axios from 'axios'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'

  useEffect(() => {
    // Check if user is authenticated
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        if (response.data.user) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Not authenticated:', error)
        setIsAuthenticated(false)
        setLoading(false)
      })
  }, [apiUrl])

  if (loading) {
    return (
      <Container size="sm" style={{ marginTop: 100 }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
