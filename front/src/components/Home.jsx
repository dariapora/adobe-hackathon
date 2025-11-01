import { Container, Stack, Title, Text } from '@mantine/core'
import PostCard from './PostCard'

export default function Home({ posts = [] }) {
  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Home</Title>
        <Text c="dimmed">Welcome to your CheckIn feed.</Text>

        <Stack>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
