import { Container, Stack, Title, Text, Card, Group, Avatar, Badge, Image } from '@mantine/core'

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
                <Avatar 
                  src={post.author?.profile_picture} 
                  radius="xl" 
                />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Group gap={6}>
                    <Text fw={600}>
                      {post.author?.first_name} {post.author?.last_name}
                    </Text>
                    {post.author?.username && (
                      <Text c="dimmed">@{post.author?.username}</Text>
                    )}
                    {post.team_id && <Badge variant="light">{post.team_id}</Badge>}
                  </Group>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
                  {post.image && (
                    <Image src={post.image} alt="attachment" radius="sm" w={320} />
                  )}
                  <Text size="xs" c="dimmed">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
