import { useState, useEffect } from 'react'
import { Container, Paper, Title, Text, Stack, Button, TextInput, Loader, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Onboarding() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)

  const form = useForm({
    initialValues: {
      username: '',
      teamId: '',
    },
    validate: {
      username: (v) => (v.trim().length === 0 ? 'Username is required' : null),
      teamId: (v) => (v.trim().length === 0 ? 'Team ID is required' : null),
    },
  })

  useEffect(() => {
    // Fetch teams from backend
    axios.get(`${apiUrl}/api/team`, { withCredentials: true })
      .then(response => {
        const teamOptions = response.data.map(team => ({
          value: team.id.toString(),
          label: `${team.department} - ${team.id}`
        }))
        setTeams(teamOptions)
        setLoadingTeams(false)
      })
      .catch(error => {
        console.error('Error fetching teams:', error)
        setLoadingTeams(false)
      })
  }, [apiUrl])

  useEffect(() => {
    // Check if user is authenticated
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        setUser(response.data.user)
        
        // If user already has username and team_id, redirect to home
        if (response.data.user.username && response.data.user.team_id) {
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
          username: values.username,
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
              Welcome, {user?.first_name} {user?.last_name}! Please complete your profile.
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="e.g., johndoe"
                description="Choose a unique username"
                required
                {...form.getInputProps('username')}
              />
              
              <Select
                label="Team"
                placeholder={loadingTeams ? "Loading teams..." : "Select your team"}
                description="Choose your team/department"
                data={teams}
                required
                searchable
                disabled={loadingTeams}
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
