import { Container, Stack, Title, Text, Card, Group, Avatar, Badge, Image, ActionIcon, Button, TextInput } from '@mantine/core'
import { IconHeart, IconHeartFilled, IconMessageCircle, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import axios from 'axios'

function getBadgeForXp(xp = 0) {
  if (xp >= 1000) return { label: 'Legend', color: 'grape' };
  if (xp >= 500) return { label: 'Senior', color: 'violet' };
  if (xp >= 200) return { label: 'Mid-Level', color: 'indigo' };
  if (xp >= 50) return { label: 'Junior', color: 'blue' };
  return { label: 'Intern', color: 'gray' };
}

export default function Team({ posts = [], user, onLike, onDelete }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090'
  const teamId = user?.teamId
  const [openCommentsFor, setOpenCommentsFor] = useState(null)
  const [commentsByPost, setCommentsByPost] = useState({})
  const [newComment, setNewComment] = useState("")
  const [department, setDepartment] = useState("")
  const urgentPosts = posts.filter((p) => !!p.urgent)
  const helpOnlyPosts = posts.filter((p) => !p.urgent && !!p.help)
  const otherPosts = posts.filter((p) => !p.urgent && !p.help)

  // Fetch department name for this team id
  useState(() => {
    if (!teamId) return
    ;(async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/team`, { withCredentials: true })
        const teams = Array.isArray(res.data) ? res.data : []
        const t = teams.find((t) => String(t.id) === String(teamId))
        setDepartment(t?.department || "")
      } catch (e) {
        setDepartment("")
      }
    })()
  }, [teamId, apiUrl])
  
  // Posts are already filtered from backend, just display them
  return (
    <Container size="lg">
      <Stack my="md" gap="md">

        <Stack>
            {(urgentPosts.length + helpOnlyPosts.length) > 0 && (
              <>
                <Title order={4}>Help me out</Title>
                {[...urgentPosts, ...helpOnlyPosts].map((post) => (
                  <Card key={post.id} withBorder radius="md" p="md" shadow="sm" style={{ borderLeft: '4px solid var(--mantine-color-checkin-5)' }}>
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
                          {post.urgent && <Badge color="red" variant="filled">Urgent</Badge>}
                          {post.help && <Badge color="yellow" variant="light">Help</Badge>}
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
                          <Group gap={6}>
                            <ActionIcon variant="subtle" onClick={async () => {
                              const open = openCommentsFor === post.id ? null : post.id
                              setOpenCommentsFor(open)
                              if (open && !commentsByPost[post.id]) {
                                try {
                                  const res = await axios.get(`${apiUrl}/api/comments/post/${post.id}`, { withCredentials: true })
                                  setCommentsByPost((prev) => ({ ...prev, [post.id]: Array.isArray(res.data) ? res.data : [] }))
                                } catch (e) {
                                  setCommentsByPost((prev) => ({ ...prev, [post.id]: [] }))
                                }
                              }
                            }}>
                              <IconMessageCircle size={18} />
                            </ActionIcon>
                            <Text size="sm" c="dimmed">{(commentsByPost[post.id]?.length ?? post.commentsCount ?? 0)}</Text>
                          </Group>
                        </Group>
                        {openCommentsFor === post.id && (
                          <Stack gap={6} mt="xs">
                            <Stack gap={6}>
                              {(commentsByPost[post.id] || []).map((c) => (
                                <Group key={c.id} align="flex-start">
                                  <Avatar src={c.author?.profile_picture} radius="xl" size="sm" />
                                  <Stack gap={2} style={{ flex: 1 }}>
                                    <Group gap={6}>
                                      <Text size="sm" fw={600}>{c.author?.first_name} {c.author?.last_name}</Text>
                                      {c.author?.username && <Text size="xs" c="dimmed">@{c.author.username}</Text>}
                                    </Group>
                                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{c.content}</Text>
                                  </Stack>
                                </Group>
                              ))}
                            </Stack>
                            <Group align="flex-end">
                              <TextInput style={{ flex: 1 }} placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.currentTarget.value)} />
                              <Button size="xs" color="checkin" onClick={async () => {
                                const text = newComment.trim()
                                if (!text) return
                                try {
                                  const res = await axios.post(`${apiUrl}/api/comments`, { postId: post.id, content: text }, { withCredentials: true })
                                  setCommentsByPost((prev) => ({ ...prev, [post.id]: [ ...(prev[post.id] || []), res.data ] }))
                                  setNewComment("")
                                } catch (e) {}
                              }}>Post</Button>
                            </Group>
                          </Stack>
                        )}
                        <Text size="xs" c="dimmed">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </>
            )}
            {otherPosts.map((post) => (
              <Card key={post.id} withBorder radius="md" p="md" shadow="sm" style={{ borderLeft: '4px solid var(--mantine-color-checkin-5)' }}>
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
                      {post.urgent && <Badge color="red" variant="filled">Urgent</Badge>}
                      {post.help && <Badge color="yellow" variant="light">Help</Badge>}
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
                      <Group gap={6}>
                        <ActionIcon variant="subtle" onClick={async () => {
                          const open = openCommentsFor === post.id ? null : post.id
                          setOpenCommentsFor(open)
                          if (open && !commentsByPost[post.id]) {
                            try {
                              const res = await axios.get(`${apiUrl}/api/comments/post/${post.id}`, { withCredentials: true })
                              setCommentsByPost((prev) => ({ ...prev, [post.id]: Array.isArray(res.data) ? res.data : [] }))
                            } catch (e) {
                              setCommentsByPost((prev) => ({ ...prev, [post.id]: [] }))
                            }
                          }
                        }}>
                          <IconMessageCircle size={18} />
                        </ActionIcon>
                        <Text size="sm" c="dimmed">{(commentsByPost[post.id]?.length ?? post.commentsCount ?? 0)}</Text>
                        {user?.id && post.author?.id && String(user.id) === String(post.author.id) && (
                          <ActionIcon variant="subtle" color="red" onClick={() => onDelete && onDelete(post.id)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                    {openCommentsFor === post.id && (
                      <Stack gap={6} mt="xs">
                        <Stack gap={6}>
                          {(commentsByPost[post.id] || []).map((c) => (
                            <Group key={c.id} align="flex-start">
                              <Avatar src={c.author?.profile_picture} radius="xl" size="sm" />
                              <Stack gap={2} style={{ flex: 1 }}>
                                <Group gap={6}>
                                  <Text size="sm" fw={600}>{c.author?.first_name} {c.author?.last_name}</Text>
                                  {c.author?.username && <Text size="xs" c="dimmed">@{c.author.username}</Text>}
                                </Group>
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{c.content}</Text>
                              </Stack>
                            </Group>
                          ))}
                        </Stack>
                        <Group align="flex-end">
                          <TextInput style={{ flex: 1 }} placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.currentTarget.value)} />
                          <Button size="xs" color="checkin" onClick={async () => {
                            const text = newComment.trim()
                            if (!text) return
                            try {
                              const res = await axios.post(`${apiUrl}/api/comments`, { postId: post.id, content: text }, { withCredentials: true })
                              setCommentsByPost((prev) => ({ ...prev, [post.id]: [ ...(prev[post.id] || []), res.data ] }))
                              setNewComment("")
                            } catch (e) {}
                          }}>Post</Button>
                        </Group>
                      </Stack>
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
