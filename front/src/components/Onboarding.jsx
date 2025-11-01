import { useState, useEffect } from 'react'
import { Container, Paper, Title, Text, Stack, Button, TextInput, Loader } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Onboarding() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)

  const form = useForm({
    initialValues: {
      role: '',
      teamId: '',
    },
    validate: {
      role: (v) => (v.trim().length === 0 ? 'Role is required' : null),
      teamId: (v) => (v.trim().length === 0 ? 'Team ID is required' : null),
    },
  })

  useEffect(() => {
    // Check if user is authenticated
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        setUser(response.data.user)
        
        // If user already has role and team_id, redirect to home
        if (response.data.user.role && response.data.user.team_id) {
          navigate('/')
        } else {
          setLoading(false)
        }
      })
      .catch(error => {
        console.error('Not authenticated:', error)
        navigate('/login')
      })
  }, [apiUrl, navigate])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    
    try {
      const response = await axios.post(
        `${apiUrl}/auth/complete-profile`,
        {
          role: values.role,
          teamId: values.teamId
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Redirect to home
        navigate('/')
      }
    } catch (error) {
      console.error('Error completing profile:', error)
      alert('Failed to complete profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container size="sm">
        <Paper radius="md" p="xl" withBorder style={{ marginTop: 80 }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text>Loading...</Text>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="sm">
      <Paper radius="md" p="xl" withBorder style={{ marginTop: 80 }}>
        <Stack gap="lg">
          <div>
            <Title order={2}>Complete Your Profile</Title>
            <Text c="dimmed" mt="xs">
              Welcome, {user?.name}! Please tell us a bit more about yourself.
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Role"
                placeholder="e.g., Engineer, Designer, Manager"
                required
                {...form.getInputProps('role')}
              />
              
              <TextInput
                label="Team ID"
                placeholder="e.g., T-123"
                required
                {...form.getInputProps('teamId')}
              />

              <Button 
                type="submit" 
                size="lg" 
                loading={submitting}
                fullWidth
                mt="md"
              >
                Complete Profile
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
