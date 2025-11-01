import { useEffect, useState, useRef } from 'react';
import { Paper, TextInput, Button, Text, ScrollArea, Stack, Group, Avatar } from '@mantine/core';
import { io } from 'socket.io-client';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef(null);


  useEffect(() => {
    const socketIo = io('http://localhost:8090', {
      withCredentials: true,
      transports: ['websocket']
    });

    socketIo.on('connect', () => {
      console.log('Connected to Socket.IO');
    });

    socketIo.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    });

    socketIo.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      type: 'message',
      content: newMessage,
      sender: {
        id: user.id,
        name: user.firstName,
        picture: user.picture
      },
      timestamp: new Date().toISOString()
    };

    socket.emit('message', messageData);
    setNewMessage('');
  };

  return (
    <Paper shadow="xs" p="md" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <ScrollArea flex={1} mb="md" viewportRef={scrollRef}>
        <Stack gap="sm">
          {messages.map((message, index) => (
            <Group key={index} gap="sm" align="flex-start">
              <Avatar src={message.sender.picture} radius="xl" size="md" />
              <div style={{ flex: 1 }}>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{message.sender.name}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </Group>
                <Text size="sm">{message.content}</Text>
              </div>
            </Group>
          ))}
        </Stack>
      </ScrollArea>
      
      <form onSubmit={sendMessage}>
        <Group gap="sm">
          <TextInput
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </Group>
      </form>
    </Paper>
  );
}