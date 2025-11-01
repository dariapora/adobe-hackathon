import { Container, Stack, Title, Text, Card, Group, Avatar, Badge } from '@mantine/core'

export default function Team({ posts = [], user }) {
  const teamId = user?.teamId
  
  // Posts are already filtered from backend, just display them
  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Team</Title>
        <Text c="dimmed">Posts for your team ({teamId || 'unknown'}).</Text>

        {posts.length === 0 ? (
          <Card withBorder radius="md" p="md">
            <Text c="dimmed">No posts for this team yet.</Text>
          </Card>
        ) : (
          <Stack>
            {posts.map((post) => (
              <Card key={post.id} withBorder radius="md" p="md">
                <Group align="flex-start">
                  <Avatar 
                    src={post.author?.profile_picture} 
                    radius="xl" 
                  />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap={6}>
                      <Text fw={600}>
                        {post.author?.first_name} {post.author?.last_name}
                      </Text>
                      <Text c="dimmed">@{post.author?.username}</Text>
                      {post.team_id && <Badge variant="light">{post.team_id}</Badge>}
                    </Group>
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
                    <Text size="xs" c="dimmed">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
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
