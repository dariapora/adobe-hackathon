import { Container, Paper, Title, Text, Stack, Button, Group } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'

export default function Login() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google`
  }

  const handleBypass = () => {
    const fake = { 
      firstName: 'Demo', 
      lastName: 'User', 
      role: 'Engineer', 
      teamId: 'T-000', 
      email: 'demo@local' 
    }
    localStorage.setItem('user', JSON.stringify(fake))
    window.location.href = '/'
  }

  return (
    <Container size="sm">
      <Paper radius="md" p="xl" withBorder style={{ marginTop: 80 }}>
        <Stack align="center" ta="center" gap="lg">
          <Title order={2}>CheckIn</Title>
          <Text c="dimmed">Sign in with Google to continue</Text>

          {/* Team selection moved to onboarding after Google auth */}

          <Button 
            leftSection={<IconBrandGoogle size={20} />}
            size="lg"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </Button>

          <Group>
            <Button variant="light" onClick={handleBypass}>
              Demo Mode
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
