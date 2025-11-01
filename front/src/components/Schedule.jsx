import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Title, Group, ActionIcon, Text, Card, Badge, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import axios from 'axios';

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule({ user }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.teamId) return;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/api/event`, {
          params: { team_id: user.teamId },
          withCredentials: true,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        // Normalize to Date instances
        const normalized = data.map((e) => ({
          ...e,
          dateObj: new Date(e.date),
        }));
        setEvents(normalized);
      } catch (e) {
        console.error('Error fetching events', e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [apiUrl, user?.teamId]);

  const daysMatrix = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const startOffset = start.getDay(); // 0..6 (Sun..Sat)
    const gridStart = addDays(start, -startOffset);
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const day = addDays(gridStart, i);
      const isCurrent = day.getMonth() === currentMonth.getMonth();
      const dayEvents = events.filter((ev) => isSameDay(ev.dateObj, day));
      cells.push({ day, isCurrent, events: dayEvents });
    }
    return cells;
  }, [currentMonth, events]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  return (
    <Container fluid>
      <Stack my="md" gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Schedule</Title>
          <Group>
            <ActionIcon variant="light" onClick={() => setCurrentMonth(startOfMonth(addDays(currentMonth, -1 * 30)))}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Text fw={600} size="lg">{monthLabel}</Text>
            <ActionIcon variant="light" onClick={() => setCurrentMonth(startOfMonth(addDays(currentMonth, 30)))}>
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <Card withBorder radius="md" p="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, gridAutoRows: 'minmax(140px, auto)' }}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} c="dimmed" ta="center" fw={600} size="sm">{wd}</Text>
            ))}
            {daysMatrix.map(({ day, isCurrent, events: dayEvents }) => (
              <Card key={day.toISOString()} withBorder p="md" radius="sm" style={{ opacity: isCurrent ? 1 : 0.5, minHeight: 140 }}>
                <Stack gap={8}>
                  <Group justify="space-between" align="center">
                    <Text size="lg" fw={700}>{day.getDate()}</Text>
                    {dayEvents.length > 0 && (
                      <Badge size="sm" variant="light" color="checkin">{dayEvents.length}</Badge>
                    )}
                  </Group>
                  <Stack gap={6}>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Tooltip key={ev.id} label={ev.description} withArrow>
                        <Text size="sm" truncate="end">{ev.title}</Text>
                      </Tooltip>
                    ))}
                    {dayEvents.length > 3 && (
                      <Text size="sm" c="dimmed">+{dayEvents.length - 3} more</Text>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </div>
          {!loading && events.length === 0 && (
            <Text c="dimmed" mt="md">No team events for this month.</Text>
          )}
        </Card>
      </Stack>
    </Container>
  );
}


