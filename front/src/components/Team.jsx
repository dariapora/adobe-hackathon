import { Container, Stack, Title, Text, Card, Group, Avatar, Badge } from '@mantine/core'

export default function Team({ posts = [], user }) {
  const teamId = user?.teamId
  const filtered = teamId ? posts.filter((p) => p.visibility === 'team' && p.teamId === teamId) : []
  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Team</Title>
        <Text c="dimmed">Posts for your team ({teamId || 'unknown'}).</Text>

        {filtered.length === 0 ? (
          <Card withBorder radius="md" p="md">
            <Text c="dimmed">No posts for this team yet.</Text>
          </Card>
        ) : (
          <Stack>
            {filtered.map((post) => (
              <Card key={post.id} withBorder radius="md" p="md">
                <Group align="flex-start">
                  <Avatar src={post.author.avatar} radius="xl" />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap={6}>
                      <Text fw={600}>{post.author.name}</Text>
                      <Text c="dimmed">@{post.author.handle}</Text>
                      <Badge variant="light">{post.teamId}</Badge>
                    </Group>
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
