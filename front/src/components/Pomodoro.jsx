import { useEffect, useMemo, useRef, useState } from 'react'
import { Container, Stack, Title, Card, Group, Button, Text, SegmentedControl, NumberInput, Progress } from '@mantine/core'

function secondsToMMSS(total) {
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = Math.floor(total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Pomodoro() {
  const [mode, setMode] = useState('work') // 'work' | 'short' | 'long'
  const [workMinutes, setWorkMinutes] = useState(25)
  const [shortMinutes, setShortMinutes] = useState(5)
  const [longMinutes, setLongMinutes] = useState(15)
  const [autoContinue, setAutoContinue] = useState(true)

  const initialSeconds = useMemo(() => {
    if (mode === 'work') return workMinutes * 60
    if (mode === 'short') return shortMinutes * 60
    return longMinutes * 60
  }, [mode, workMinutes, shortMinutes, longMinutes])

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const tickRef = useRef(null)
  const completedWorkSessionsRef = useRef(0)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tickRef.current)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [running])

  function handleComplete() {
    setRunning(false)
    if (mode === 'work') {
      completedWorkSessionsRef.current += 1
      // every 4th work session -> long break
      const nextMode = completedWorkSessionsRef.current % 4 === 0 ? 'long' : 'short'
      setMode(nextMode)
      if (autoContinue) setRunning(true)
    } else {
      setMode('work')
      if (autoContinue) setRunning(true)
    }
  }

  function start() {
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setSecondsLeft(initialSeconds)
  }

  function skip() {
    setRunning(false)
    handleComplete()
  }

  const total = initialSeconds || 1
  const progress = Math.round(((total - secondsLeft) / total) * 100)

  return (
    <Container size="lg">
      <Stack my="md" gap="md">
        <Title order={2}>Pomodoro</Title>

        <Card withBorder radius="md" p="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <SegmentedControl
                value={mode}
                onChange={setMode}
                data={[
                  { label: 'Work', value: 'work' },
                  { label: 'Short Break', value: 'short' },
                  { label: 'Long Break', value: 'long' },
                ]}
              />
              <Group gap="xs">
                <NumberInput
                  label="Work"
                  value={workMinutes}
                  onChange={(v) => setWorkMinutes(Number(v) || 0)}
                  min={1}
                  max={120}
                  step={1}
                  style={{ width: 110 }}
                />
                <NumberInput
                  label="Short"
                  value={shortMinutes}
                  onChange={(v) => setShortMinutes(Number(v) || 0)}
                  min={1}
                  max={60}
                  step={1}
                  style={{ width: 110 }}
                />
                <NumberInput
                  label="Long"
                  value={longMinutes}
                  onChange={(v) => setLongMinutes(Number(v) || 0)}
                  min={1}
                  max={120}
                  step={1}
                  style={{ width: 110 }}
                />
              </Group>
            </Group>

            <Stack align="center" gap={6}>
              <Text size="xl" fw={700}>{secondsToMMSS(secondsLeft)}</Text>
              <Progress value={progress} w={420} />
            </Stack>

            <Group justify="center" gap="sm">
              {!running ? (
                <Button color="checkin" onClick={start}>Start</Button>
              ) : (
                <Button variant="light" onClick={pause}>Pause</Button>
              )}
              <Button variant="light" onClick={reset}>Reset</Button>
              <Button variant="light" onClick={skip}>Skip</Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}


