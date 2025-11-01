import React, { useMemo, useState } from 'react';
import {
  AppShell,
  MantineProvider,
  ColorSchemeScript,
  Container,
  Group,
  Text,
  Textarea,
  Button,
  Card,
  Avatar,
  ActionIcon,
  Divider,
  Badge,
  Stack,
  Box,
  Menu,
  Anchor,
  Input,
  SegmentedControl,
  ScrollArea,
  useMantineColorScheme,
  rem,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import {
  IconMoon,
  IconSun,
  IconDots,
  IconHeart,
  IconMessageCircle2,
  IconShare3,
  IconBookmark,
  IconSearch,
  IconPhotoPlus,
  IconSend,
} from '@tabler/icons-react';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];
  for (const [label, interval] of intervals) {
    const count = Math.floor(seconds / interval);
    if (count >= 1) return `${count}${label}`;
  }
  return 'now';
}

const initialPosts = [
  {
    id: '1',
    author: { name: 'Ava Collins', handle: 'ava', avatar: 'https://i.pravatar.cc/100?img=5' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    tags: ['#design', '#ui'],
    content:
      'Polished the onboarding flow and shaved ~20% off drop-off. Swapped to progressive disclosure for advanced options. Curious what you all think 👇',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
    likes: 12,
    comments: 4,
    bookmarked: false,
  },
  {
    id: '2',
    author: { name: 'Matei Ionescu', handle: 'matei', avatar: 'https://i.pravatar.cc/100?img=15' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    tags: ['#release'],
    content:
      'v1.4.0 is live 🎉 — includes faster search, keyboard shortcuts, and dark mode fixes. Release notes in the comments.',
    image: null,
    likes: 38,
    comments: 12,
    bookmarked: true,
  },
  {
    id: '3',
    author: { name: 'Zara Patel', handle: 'zara', avatar: 'https://i.pravatar.cc/100?img=30' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
    tags: ['#infra', '#kudos'],
    content:
      'Big kudos to @ops for squashing the flaky CI job. Pipelines are finally green again.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop',
    likes: 7,
    comments: 2,
    bookmarked: false,
  },
];

// ----- Components
function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const toggle = () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  return (
    <ActionIcon variant="subtle" onClick={toggle} aria-label="Toggle color scheme">
      {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}

function Composer({ onPost }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    // Fake network delay
    setTimeout(() => {
      onPost({
        id: String(Math.random()).slice(2),
        author: { name: 'You', handle: 'you', avatar: 'https://i.pravatar.cc/100?img=1' },
        createdAt: new Date(),
        tags: [],
        content: text.trim(),
        image: null,
        likes: 0,
        comments: 0,
        bookmarked: false,
      });
      setText('');
      setBusy(false);
    }, 600);
  };

  return (
    <Card withBorder radius="lg" p="md">
      <Group align="flex-start" wrap="nowrap">
        <Avatar radius="xl" src="https://i.pravatar.cc/100?img=1" />
        <Stack style={{ flex: 1 }} gap="xs">
          <Textarea
            placeholder="Share an update…"
            autosize
            minRows={2}
            maxRows={6}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          />
          <Group justify="space-between">
            <Group gap="xs">
              <ActionIcon variant="light" aria-label="Add photo"><IconPhotoPlus size={18} /></ActionIcon>
            </Group>
            <Button rightSection={<IconSend size={16} />} loading={busy} onClick={submit}>
              Post
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

function PostCard({ post, onToggleLike, onToggleBookmark }) {
  return (
    <Card withBorder radius="lg" p="md">
      <Group justify="space-between" align="flex-start">
        <Group wrap="nowrap">
          <Avatar src={post.author.avatar} radius="xl" />
          <Box>
            <Group gap={6}>
              <Text fw={600}>{post.author.name}</Text>
              <Text c="dimmed">@{post.author.handle}</Text>
              <Text c="dimmed">· {timeAgo(post.createdAt)}</Text>
            </Group>
            <Group gap="xs" mt={4}>
              {post.tags.map((t) => (
                <Badge key={t} radius="sm" variant="light">{t}</Badge>
              ))}
            </Group>
          </Box>
        </Group>
        <Menu withinPortal shadow="md">
          <Menu.Target>
            <ActionIcon variant="subtle" aria-label="More"><IconDots size={18} /></ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Copy link</Menu.Item>
            <Menu.Item>Edit (if owner)</Menu.Item>
            <Menu.Divider />
            <Menu.Item c="red">Report</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text mt="sm" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>

      {post.image && (
        <Box mt="sm" style={{ overflow: 'hidden', borderRadius: rem(12) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt="post" style={{ width: '100%', display: 'block' }} />
        </Box>
      )}

      <Group mt="sm" gap="xs">
        <ActionIcon
          variant={post.liked ? 'filled' : 'subtle'}
          onClick={() => onToggleLike(post.id)}
          aria-label="Like"
        >
          <IconHeart size={18} />
        </ActionIcon>
        <Text size="sm" c="dimmed">{post.likes}</Text>

        <ActionIcon variant="subtle" aria-label="Comment"><IconMessageCircle2 size={18} /></ActionIcon>
        <Text size="sm" c="dimmed">{post.comments}</Text>

        <ActionIcon variant="subtle" aria-label="Share"><IconShare3 size={18} /></ActionIcon>

        <ActionIcon
          variant={post.bookmarked ? 'filled' : 'subtle'}
          onClick={() => onToggleBookmark(post.id)}
          ml="auto"
          aria-label="Bookmark"
        >
          <IconBookmark size={18} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

function HeaderBar() {
  const [query, setQuery] = useState('');
  return (
    <Group justify="space-between" p="xs">
      <Group gap={8}>
        <Text fw={700}>Acme Social</Text>
        <Badge variant="light" radius="sm">beta</Badge>
      </Group>

      <Input
        leftSection={<IconSearch size={16} />}
        placeholder="Search posts, people, tags…"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        style={{ width: 380, maxWidth: '50vw' }}
      />

      <Group>
        <ThemeToggle />
        <Avatar src="https://i.pravatar.cc/100?img=1" radius="xl" />
      </Group>
    </Group>
  );
}

function FeedFilters({ value, onChange }) {
  return (
    <SegmentedControl
      fullWidth
      value={value}
      onChange={onChange}
      data={[
        { label: 'For you', value: 'for-you' },
        { label: 'Following', value: 'following' },
        { label: 'Trending', value: 'trending' },
      ]}
    />
  );
}

export default function MantineSocialFeed() {
  const [colorScheme, setColorScheme] = useLocalStorage({ key: 'theme', defaultValue: 'light' });
  const [filter, setFilter] = useState('for-you');
  const [posts, setPosts] = useState(initialPosts);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [posts]);

  const toggleLike = (id) => {
    setPosts((cur) =>
      cur.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleBookmark = (id) => {
    setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));
  };

  const addPost = (newPost) => setPosts((cur) => [newPost, ...cur]);

  return (
    <MantineProvider defaultColorScheme={colorScheme} theme={{ defaultRadius: 'md' }}>
      <ColorSchemeScript />
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <HeaderBar />
        </AppShell.Header>

        <AppShell.Main>
          <ScrollArea.Autosize mah="100vh" type="auto">
            <Container size="sm">
              <Stack gap="md" my="md">
                <FeedFilters value={filter} onChange={setFilter} />
                <Composer onPost={addPost} />
                <Divider label="Recent" labelPosition="center" my="sm" />
                {sortedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onToggleLike={toggleLike}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </Stack>
            </Container>
          </ScrollArea.Autosize>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
