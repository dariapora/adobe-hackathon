import { Container, Stack, Title, Text, Card } from '@mantine/core'
import PostCard from './PostCard'

export default function Team({ posts = [], user }) {
  const teamId = user?.teamId
  const filtered = teamId ? posts.filter((p) => p.visibility && p.visibility === teamId) : []
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
              <PostCard key={post.id} post={post} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
