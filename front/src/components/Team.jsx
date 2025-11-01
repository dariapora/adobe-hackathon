import { Container, Stack, Title, Text, Card, Group, Avatar, Badge, Image, ActionIcon } from '@mantine/core'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'

function getBadgeForXp(xp = 0) {
  if (xp >= 1000) return { label: 'Legend', color: 'grape' };
  if (xp >= 500) return { label: 'Senior', color: 'violet' };
  if (xp >= 200) return { label: 'Mid-Level', color: 'indigo' };
  if (xp >= 50) return { label: 'Junior', color: 'blue' };
  return { label: 'Intern', color: 'gray' };
}

export default function Team({ posts = [], user, onLike }) {
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
                      <Badge size="sm" variant="light" color={getBadgeForXp(post.author?.experience || 0).color}>
                        {getBadgeForXp(post.author?.experience || 0).label}
                      </Badge>
                    </Group>
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
                {post.image && (
                  <Image 
                    src={post.image} 
                    alt="attachment" 
                    radius="sm" 
                    style={{ maxWidth: 720, width: '100%', height: 'auto' }}
                  />
                )}
                    <Group justify="space-between" mt="xs">
                      <Group gap={6}>
                        <ActionIcon variant="subtle" onClick={() => onLike && onLike(post.id)}>
                          {post.__liked ? <IconHeartFilled size={18} color="red" /> : <IconHeart size={18} />}
                        </ActionIcon>
                        <Text size="sm" c="dimmed">{post.likes || 0}</Text>
                      </Group>
                    </Group>
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
