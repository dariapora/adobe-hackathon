import { Container, Stack, Title, Text, Card, Button, Group, Avatar, Badge } from '@mantine/core'

export default function Home({ posts = [] }) {
  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Home</Title>
        <Text c="dimmed">Welcome to your CheckIn feed.</Text>

        <Stack>
          {posts.map((post) => (
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
      </Stack>
    </Container>
  )
}
