import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Title, Group, ActionIcon, Text, Card, Badge, Tooltip, Button, TextInput, Textarea } from '@mantine/core';
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(''); // ISO local string from datetime-local input
  const [saving, setSaving] = useState(false);

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

  const handleCreateEvent = async () => {
    if (!user?.teamId) {
      alert('Your team is not set.');
      return;
    }
    if (!newTitle.trim() || !newDescription.trim() || !newDate) {
      alert('Please fill in title, description and date.');
      return;
    }
    setSaving(true);
    try {
      const isoDate = new Date(newDate).toISOString();
      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        date: isoDate,
        team_id: user.teamId,
      };
      const res = await axios.post(`${apiUrl}/api/event`, payload, { withCredentials: true });
      const created = res.data;
      const normalized = { ...created, dateObj: new Date(created.date) };
      setEvents((prev) => {
        const next = [...prev, normalized];
        // Keep events sorted by date ascending for consistent rendering
        next.sort((a, b) => a.dateObj - b.dateObj);
        return next;
      });
      setAddOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDate('');
    } catch (e) {
      console.error('Failed to create event', e);
      alert('Failed to create event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid>
      <Stack my="md" gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Schedule</Title>
          <Group>
            <Button onClick={() => setAddOpen(true)} color="checkin" variant="filled">Add Event</Button>
            <ActionIcon variant="light" onClick={() => setCurrentMonth(startOfMonth(addDays(currentMonth, -1 * 30)))}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Text fw={600} size="lg">{monthLabel}</Text>
            <ActionIcon variant="light" onClick={() => setCurrentMonth(startOfMonth(addDays(currentMonth, 30)))}>
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>
        </Group>

        {addOpen && (
          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Text fw={600}>Create a new event</Text>
              <TextInput
                label="Title"
                placeholder="Team Standup"
                value={newTitle}
                onChange={(e) => setNewTitle(e.currentTarget.value)}
              />
              <Textarea
                label="Description"
                placeholder="Daily sync with the team"
                minRows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.currentTarget.value)}
              />
              <TextInput
                label="Date & Time"
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.currentTarget.value)}
              />
              <Group justify="flex-end">
                <Button variant="light" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleCreateEvent} loading={saving} color="checkin">Create</Button>
              </Group>
            </Stack>
          </Card>
        )}

        <Card withBorder radius="md" p="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} c="dimmed" ta="center" fw={600} size="sm">{wd}</Text>
            ))}
            {daysMatrix.map(({ day, isCurrent, events: dayEvents }) => (
              <Card 
                key={day.toISOString()} 
                withBorder 
                p="md" 
                radius="sm" 
                onClick={() => setSelectedDay(day)}
                style={{ 
                  opacity: isCurrent ? 1 : 0.5, 
                  aspectRatio: '1 / 1', 
                  display: 'flex', 
                  cursor: 'pointer',
                  borderColor: selectedDay && isSameDay(selectedDay, day) ? 'var(--mantine-color-checkin-filled)' : undefined,
                  boxShadow: selectedDay && isSameDay(selectedDay, day) ? '0 0 0 2px var(--mantine-color-checkin-filled)' : 'none'
                }}
              >
                <Stack gap={8} style={{ flex: 1 }}>
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

        {selectedDay && (
          <Card withBorder radius="md" p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Events on {selectedDay.toLocaleDateString()}</Text>
              <Button variant="light" onClick={() => setSelectedDay(null)}>Close</Button>
            </Group>
            <Stack>
              {events.filter((e) => isSameDay(e.dateObj, selectedDay)).length === 0 ? (
                <Text c="dimmed">No events on this day.</Text>
              ) : (
                events
                  .filter((e) => isSameDay(e.dateObj, selectedDay))
                  .sort((a, b) => a.dateObj - b.dateObj)
                  .map((e) => (
                    <Card key={e.id} withBorder radius="sm" p="sm">
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Text fw={600}>{e.title}</Text>
                          <Text size="sm" c="dimmed">{new Date(e.date).toLocaleString()}</Text>
                          {e.description && <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{e.description}</Text>}
                        </Stack>
                        <Badge variant="light">{user?.teamId}</Badge>
                      </Group>
                    </Card>
                  ))
              )}
            </Stack>
          </Card>
        )}
      </Stack>

      
    </Container>
  );
}


