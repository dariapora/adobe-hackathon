import { useEffect, useRef, useState } from 'react'
import { Container, Paper, Title, Text, Stack, Button, Group, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'

// Simple JWT payload parser (for Google ID token)
function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(decoded)))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse JWT', e)
    return null
  }
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem('users')
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function saveUserToStore(email, profile) {
  const users = getStoredUsers()
  users[email] = profile
  localStorage.setItem('users', JSON.stringify(users))
}

export default function Login({ onLogin }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const bypass = import.meta.env.VITE_BYPASS_AUTH === '1' || import.meta.env.VITE_BYPASS_AUTH === 'true'

  const googleButtonRef = useRef(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [googleUser, setGoogleUser] = useState(null) // info from ID token
  const [registeredUser, setRegisteredUser] = useState(null) // user profile in our store

  useEffect(() => {
    if (!clientId) return setScriptReady(false)
    if (document.getElementById('gsi-script')) return setScriptReady(true)
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.id = 'gsi-script'
    s.async = true
    s.defer = true
    s.onload = () => setScriptReady(true)
    document.head.appendChild(s)
  }, [clientId])

  useEffect(() => {
    if (!scriptReady || !clientId || !googleButtonRef.current) return
    // eslint-disable-next-line no-undef
    if (window.google && googleButtonRef.current) {
      // render the Google Sign-In button into our ref
      // eslint-disable-next-line no-undef
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          const data = parseJwt(resp.credential)
          if (data) {
            const [firstName = '', ...rest] = (data.name || '').split(' ')
            const lastName = rest.join(' ')
            const profile = {
              firstName,
              lastName,
              email: data.email,
              picture: data.picture,
            }
            setGoogleUser(profile)
            // check stored users
            const users = getStoredUsers()
            if (users[data.email]) {
              setRegisteredUser(users[data.email])
              if (typeof onLogin === 'function') onLogin(users[data.email])
            }
          }
        },
      })

      // eslint-disable-next-line no-undef
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large' })
    }
  }, [scriptReady, clientId, onLogin])

  // Form for registering additional fields
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      role: '',
      teamId: '',
      email: '',
    },
    validate: {
      firstName: (v) => (v.trim().length === 0 ? 'First name required' : null),
      lastName: (v) => (v.trim().length === 0 ? 'Last name required' : null),
      role: (v) => (v.trim().length === 0 ? 'Role required' : null),
      teamId: (v) => (v.trim().length === 0 ? 'Team ID required' : null),
    },
  })

  useEffect(() => {
    if (googleUser) {
      form.setValues({ firstName: googleUser.firstName || '', lastName: googleUser.lastName || '', email: googleUser.email || '', role: '', teamId: '' })
    }
  }, [googleUser])

  const handleRegister = (values) => {
    const profile = {
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      teamId: values.teamId,
      email: values.email,
    }
    saveUserToStore(values.email, profile)
    setRegisteredUser(profile)
    if (typeof onLogin === 'function') onLogin(profile)
  }

  const handleBypass = () => {
    const fake = { firstName: 'Demo', lastName: 'User', role: 'Engineer', teamId: 'T-000', email: 'demo@local' }
    saveUserToStore(fake.email, fake)
    setRegisteredUser(fake)
    if (typeof onLogin === 'function') onLogin(fake)
  }

  return (
    <Container size="sm">
      <Paper radius="md" p="xl" withBorder style={{ marginTop: 80 }}>
        <Stack align="center" ta="center">
          <Title order={2}>CheckIn</Title>
          <Text c="dimmed">Sign in with Google to continue</Text>

          {!registeredUser ? (
            <Stack align="center" spacing="md">
              {clientId ? (
                <div ref={googleButtonRef} />
              ) : (
                <Button disabled>Google client not configured</Button>
              )}

              {bypass && (
                <Group>
                  <Button variant="light" onClick={handleBypass}>Skip / Demo</Button>
                </Group>
              )}

              {/* If googleUser exists but not registered, show registration form */}
              {googleUser && !registeredUser && (
                <Paper withBorder p="md" radius="md" style={{ width: '100%' }}>
                  <Text fw={600} mb="xs">Complete your profile</Text>
                  <form onSubmit={form.onSubmit(handleRegister)}>
                    <Stack>
                      <TextInput label="First-name" placeholder="Jane" {...form.getInputProps('firstName')} />
                      <TextInput label="Last-name" placeholder="Doe" {...form.getInputProps('lastName')} />
                      <TextInput label="Role" placeholder="Engineer" {...form.getInputProps('role')} />
                      <TextInput label="Team-id" placeholder="T-123" {...form.getInputProps('teamId')} />
                      <Button type="submit">Continue</Button>
                    </Stack>
                  </form>
                </Paper>
              )}
            </Stack>
          ) : (
            <Stack align="center">
              <Text fw={600}>Welcome, {registeredUser.firstName} {registeredUser.lastName}!</Text>
              <Text c="dimmed">Role: {registeredUser.role} · Team: {registeredUser.teamId}</Text>
              <Button onClick={() => { if (typeof onLogin === 'function') onLogin(registeredUser) }}>Continue to app</Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
