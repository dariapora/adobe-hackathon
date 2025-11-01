import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, Stack, Title, Text, Avatar, Button, Group, Loader } from '@mantine/core'
import { IconArrowLeft, IconLogout } from '@tabler/icons-react'
import axios from 'axios'

export default function Profile() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user data
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        setUser(response.data.user)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching user:', error)
        navigate('/login')
      })
  }, [apiUrl, navigate])

  const handleLogout = () => {
    window.location.href = `${apiUrl}/auth/logout`
  }

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

  return (
    <Container size="sm" style={{ marginTop: 80 }}>
      <Paper radius="md" p="xl" withBorder>
        <Stack gap="lg">
          <Group>
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Group>

          <Stack align="center" gap="md">
            <Avatar 
              src={user?.profile_picture} 
              size={120} 
              radius={120}
              alt={`${user?.first_name} ${user?.last_name}`}
              style={{ border: '3px solid var(--mantine-color-gray-3)' }}
            />
            
            <Stack align="center" gap="xs">
              <Title order={2}>
                {user?.first_name} {user?.last_name}
              </Title>
              
              <Text size="lg" c="dimmed">
                @{user?.username}
              </Text>
            </Stack>
          </Stack>

          <Stack gap="sm" mt="md">
            <Paper withBorder p="md" radius="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Email</Text>
                <Text>{user?.email}</Text>
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Department/Team</Text>
                <Text>{user?.team_id || 'Not assigned'}</Text>
              </Stack>
            </Paper>

            {user?.role && (
              <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>Role</Text>
                  <Text>{user?.role}</Text>
                </Stack>
              </Paper>
            )}
          </Stack>

          <Button 
            variant="light" 
            color="red" 
            leftSection={<IconLogout size={18} />}
            onClick={handleLogout}
            fullWidth
            mt="md"
          >
            Logout
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
