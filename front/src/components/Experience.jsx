import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Title, Card, Group, Avatar, Text, Badge, Progress } from '@mantine/core';
import axios from 'axios';

const XP_PER_POST = 10;

const ACHIEVEMENTS = [
  { xp: 0, label: 'Intern' },
  { xp: 50, label: 'Junior' },
  { xp: 200, label: 'Mid-Level' },
  { xp: 500, label: 'Senior' },
  { xp: 1000, label: 'Legend' },
];

function getBadgeForXp(xp) {
  if (xp >= 1000) return { label: 'Legend', color: 'grape' };
  if (xp >= 500) return { label: 'Senior', color: 'violet' };
  if (xp >= 200) return { label: 'Mid-Level', color: 'indigo' };
  if (xp >= 50) return { label: 'Junior', color: 'blue' };
  return { label: 'Intern', color: 'gray' };
}

export default function Experience({ user }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, meRes] = await Promise.all([
          axios.get(`${apiUrl}/api/user/leaderboard/month`, { withCredentials: true }),
          axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
        ]);
        const lb = Array.isArray(lbRes.data) ? lbRes.data : [];
        setLeaderboard(lb);
        const me = meRes.data?.user || user;
        setCurrentUser({
          id: me.id,
          firstName: me.first_name || me.firstName,
          lastName: me.last_name || me.lastName,
          picture: me.profile_picture || me.picture,
          experience: me.experience || 0
        });
      } catch (e) {
        console.error('Failed to load XP data', e);
      }
    };
    fetchData();
  }, [apiUrl]);

  const currentBadge = useMemo(() => getBadgeForXp(currentUser?.experience || 0), [currentUser]);
  const nextAchievement = useMemo(() => {
    const xp = currentUser?.experience || 0;
    for (const a of ACHIEVEMENTS) {
      if (a.xp > xp) return a;
    }
    return null;
  }, [currentUser]);

  const progress = useMemo(() => {
    const xp = currentUser?.experience || 0;
    const prev = [...ACHIEVEMENTS].reverse().find(a => xp >= a.xp) || { xp: 0 };
    const next = ACHIEVEMENTS.find(a => a.xp > xp) || { xp };
    const span = Math.max(next.xp - prev.xp, 1);
    return Math.min(100, Math.round(((xp - prev.xp) / span) * 100));
  }, [currentUser]);

  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Experience</Title>

        <Card withBorder radius="md" p="md">
          <Group>
            <Avatar src={currentUser?.picture} radius="xl" size="lg" />
            <Stack gap={4} style={{ flex: 1 }}>
              <Group gap="xs">
                <Text fw={600}>{currentUser?.firstName} {currentUser?.lastName}</Text>
                <Badge color={currentBadge.color} variant="light">{currentBadge.label}</Badge>
              </Group>
              <Text size="sm" c="dimmed">{currentUser?.experience || 0} XP</Text>
              {nextAchievement ? (
                <>
                  <Progress value={progress} size="sm" />
                  <Text size="xs" c="dimmed">Next: {nextAchievement.label} at {nextAchievement.xp} XP</Text>
                </>
              ) : (
                <Text size="xs" c="dimmed">Max tier achieved</Text>
              )}
            </Stack>
          </Group>
        </Card>

        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Top XP This Month</Text>
            <Text size="sm" c="dimmed">{XP_PER_POST} XP per post</Text>
          </Group>
          <Stack>
            {leaderboard.length === 0 ? (
              <Text c="dimmed">No activity yet this month.</Text>
            ) : (
              leaderboard.map((entry, idx) => {
                const badge = getBadgeForXp(entry.user?.experience || 0);
                return (
                  <Group key={entry.user?.id || idx} justify="space-between">
                    <Group>
                      <Text fw={600} w={24} ta="right">{idx + 1}</Text>
                      <Avatar src={entry.user?.profile_picture} radius="xl" />
                      <Text>{entry.user?.first_name} {entry.user?.last_name}</Text>
                      <Badge size="sm" variant="light" color={badge.color}>{badge.label}</Badge>
                    </Group>
                    <Group gap="xs">
                      <Text fw={600}>{entry.monthlyXp} XP</Text>
                      <Text c="dimmed">({entry.monthlyPosts} posts)</Text>
                    </Group>
                  </Group>
                );
              })
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="xs">Achievements</Text>
          <Group>
            {ACHIEVEMENTS.map(a => {
              const unlocked = (currentUser?.experience || 0) >= a.xp;
              const badge = getBadgeForXp(a.xp);
              return (
                <Badge key={a.xp} color={unlocked ? badge.color : 'gray'} variant="light">
                  {a.label}
                </Badge>
              );
            })}
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}


