import React, { useState } from 'react';
import { Card, Group, Stack, Avatar, Textarea, ActionIcon, Button } from '@mantine/core';
import { IconPhotoPlus, IconSend } from '@tabler/icons-react';

export default function UserPost({ onPost }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
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
              <ActionIcon variant="light" aria-label="Add photo">
                <IconPhotoPlus size={18} />
              </ActionIcon>
            </Group>
            <Button
              rightSection={<IconSend size={16} />}
              loading={busy}
              onClick={submit}
            >
              Post
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}