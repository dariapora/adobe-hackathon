import { Card, Group, Avatar, Stack, Text, Badge, Image } from '@mantine/core'

export default function PostCard({ post }) {
  const handle = post?.author?.handle
  return (
    <Card withBorder radius="md" p="md">
      <Group align="flex-start">
        <Avatar src={post.author.avatar} radius="xl" />
        <Stack gap={2} style={{ flex: 1 }}>
          <Group gap={6}>
            <Text fw={600}>{post.author.name}</Text>
            {handle && <Text c="dimmed">@{handle}</Text>}
            {post.teamId && (
              <Badge variant="light">{post.teamId}</Badge>
            )}
          </Group>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
          {post.image && (
            <Image src={post.image} alt="attachment" radius="sm" w={320} />
          )}
        </Stack>
      </Group>
    </Card>
  )
}


