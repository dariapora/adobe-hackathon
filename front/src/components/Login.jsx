import { useState } from 'react'
import { Container, Paper, Title, Text, Stack, Divider, Grid, TextInput, Group, Button, Center } from '@mantine/core'
import { useForm } from '@mantine/form'

export default function Login({ onLogin }) {
  const [isAuthed, setIsAuthed] = useState(() => (
    import.meta.env.VITE_BYPASS_AUTH === '1' || import.meta.env.VITE_BYPASS_AUTH === 'true'
  ))

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      role: '',
      teamId: '',
    },
    validate: {
      firstName: (v) => (v.trim().length === 0 ? 'First name is required' : null),
      lastName: (v) => (v.trim().length === 0 ? 'Last name is required' : null),
      role: (v) => (v.trim().length === 0 ? 'Role is required' : null),
      teamId: (v) => (v.trim().length === 0 ? 'Team ID is required' : null),
    },
  })

  

  const handleSubmit = (values) => {
    // Submit values to backend or proceed to app
    // For now, simply log
    // eslint-disable-next-line no-console
    console.log('Sign-up values', values);
    // Notify parent (App) that login/profile completed
    if (typeof onLogin === 'function') {
      onLogin(values)
    }
  }

  return (
    <Center h="100vh">
      <Container size="sm">
        <Paper radius="md" p="xl" withBorder>
          <Stack align="center" ta="center">
          <Stack gap={4} ta="center">
            <Title order={2} c="checkin.8">CheckIn</Title>
            <Text c="dimmed">Sign up to continue</Text>
          </Stack>

          {!isAuthed ? (
            <Stack align="center" gap="md">
              <Button color="checkin" disabled>
                Sign in with Google
              </Button>
              <Group>
                <Button variant="light" color="checkin" onClick={() => setIsAuthed(true)}>
                  Skip for now
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                To auto-skip, set VITE_BYPASS_AUTH=1 in your env.
              </Text>
            </Stack>
          ) : (
            <Stack align="center" ta="left">
              <Divider label="Complete your profile" labelPosition="center" my="sm" />
              <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="First-name" placeholder="Jane" key={form.key('firstName')} {...form.getInputProps('firstName')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="Last-name" placeholder="Doe" key={form.key('lastName')} {...form.getInputProps('lastName')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="Role" placeholder="Engineer" key={form.key('role')} {...form.getInputProps('role')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="Team-id" placeholder="e.g. T-123" key={form.key('teamId')} {...form.getInputProps('teamId')} />
                  </Grid.Col>
                </Grid>
                <Group justify="center" mt="lg">
                  <Button type="submit" color="checkin">
                    Continue
                  </Button>
                </Group>
              </form>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  </Center>
  )
}
