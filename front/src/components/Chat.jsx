import { useEffect, useState, useRef } from 'react';
import { 
  Paper, 
  TextInput, 
  Button, 
  Text, 
  ScrollArea, 
  Stack, 
  Group, 
  Avatar, 
  Box,
  Divider,
  ActionIcon,
  Loader,
  Center,
  Switch
} from '@mantine/core';
import { IconSend, IconArrowLeft } from '@tabler/icons-react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';

export default function Chat({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [allUsers, setAllUsers] = useState([]);
  const [teamOnly, setTeamOnly] = useState(false);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user?.id) return;

    const socketIo = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketIo.on('connect', () => {
      console.log('Connected to Socket.IO');
      socketIo.emit('user:join', user.id);
    });

    socketIo.on('message:new', (message) => {
      setMessages((prev) => {
        // If we have an optimistic temp message, replace it
        const tempIndex = prev.findIndex((m) => 
          String(m.id).startsWith('temp-') &&
          m.conversationId === message.conversationId &&
          m.senderId === message.senderId &&
          m.content === message.content
        );
        if (tempIndex !== -1) {
          const next = prev.slice();
          next[tempIndex] = message;
          return next;
        }

        const exists = prev.some((m) => m.id === message.id);
        return exists ? prev : [...prev, message];
      });
      

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt
            };
          }
          return conv;
        });

        return updated.sort((a, b) => 
          new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });

      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTo({ 
            top: scrollRef.current.scrollHeight, 
            behavior: 'smooth' 
          });
        }, 100);
      }
    });

    socketIo.on('typing:user', ({ userId }) => {
      setTypingUsers(prev => new Set(prev).add(userId));
    });

    socketIo.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketIo.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketIo.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [user?.id]);


  useEffect(() => {
    if (!user?.id) return;
    
    const loadConversations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/conversations`, {
          withCredentials: true
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();

    loadUsers();
  }, [user?.id]);


  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/`, {
        withCredentials: true
      });
      const otherUsers = response.data.filter(u => u.id !== user.id);
      setAllUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/messages/conversations`,
        { otherUserId: otherUser.id },
        { withCredentials: true }
      );
      

      setConversations(prev => {
        const exists = prev.find(c => c.id === response.data.id);
        if (exists) return prev;
        return [response.data, ...prev];
      });
      
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };


  useEffect(() => {
    if (!selectedConversation || !socket) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/messages/conversations/${selectedConversation.id}/messages`,
          { withCredentials: true }
        );
        setMessages(response.data);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ 
              top: scrollRef.current.scrollHeight, 
              behavior: 'instant' 
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };


    socket.emit('conversation:join', selectedConversation.id);
    loadMessages();


    return () => {
      if (socket) {
        socket.emit('conversation:leave', selectedConversation.id);
      }
    };
  }, [selectedConversation, socket]);


  useEffect(() => {
    if (!selectedConversation) return;

    const poll = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/messages/conversations/${selectedConversation.id}/messages`,
          { withCredentials: true }
        );
        const next = Array.isArray(response.data) ? response.data : [];

        setMessages((prev) => {

          const temp = prev.filter((m) => String(m.id).startsWith('temp-'));


          const prevReal = prev.filter((m) => !String(m.id).startsWith('temp-'));
          const prevLen = prevReal.length;
          const nextLen = next.length;
          const prevLast = prevReal.at(-1)?.id;
          const nextLast = next.at(-1)?.id;
          if (prevLen === nextLen && prevLast === nextLast) return prev;


          const viewport = scrollRef.current;
          const nearBottom = viewport
            ? viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 40
            : false;

          const updated = [...next, ...temp];

          if (nearBottom && viewport) {
            queueMicrotask(() => {
              viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'instant' });
            });
          }

          return updated;
        });
      } catch (e) {
        // silent
      }
    };

    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [selectedConversation]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    const content = newMessage.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        profile_picture: user.profile_picture || user.picture || ''
      }
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');


    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ 
          top: scrollRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 10);
    }

    socket.emit('message:send', {
      conversationId: selectedConversation.id,
      content
    });
    

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing:stop', selectedConversation.id);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedConversation) return;


    socket.emit('typing:start', selectedConversation.id);


    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }


    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', selectedConversation.id);
    }, 2000);
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!user) {
    return (
      <Center h={600}>
        <Text c="dimmed">Please log in to use chat</Text>
      </Center>
    );
  }

  return (
    <>
      <Paper shadow="xs" p={0} style={{ height: '600px', display: 'flex', width: '600px' }}>
        <Box 
          style={{ 
            width: selectedConversation ? '240px' : '100%',
            borderRight: selectedConversation ? '1px solid var(--mantine-color-gray-3)' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="lg" fw={600}>Messages</Text>
          </Group>
        
        <ScrollArea style={{ flex: 1 }}>
          {conversations.length === 0 ? (
            <Center p="xl">
              <Text c="dimmed" size="sm">No conversations yet</Text>
            </Center>
          ) : (
            conversations.map((conversation) => (
              <Box
                key={conversation.id}
                p="md"
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conversation.id ? 
                    'var(--mantine-color-gray-1)' : 'transparent',
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => selectConversation(conversation)}
              >
                <Group gap="sm" wrap="nowrap">
                  <Avatar 
                    src={conversation.otherUser.profile_picture} 
                    radius="xl" 
                    size="md" 
                  />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {conversation.otherUser.first_name} {conversation.otherUser.last_name}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </Text>
                  </Box>
                  {conversation.lastMessageAt && (
                    <Text size="xs" c="dimmed">
                      {formatDate(conversation.lastMessageAt)}
                    </Text>
                  )}
                </Group>
              </Box>
            ))
          )}
          <Divider my="sm" label="Users" labelPosition="center" />
          <Group justify="space-between" px="md" pb="xs">
            <Text size="xs" c="dimmed">My team only</Text>
            <Switch size="xs" checked={teamOnly} onChange={(e) => setTeamOnly(e.currentTarget.checked)} />
          </Group>
          <Stack gap={0}>
            {(teamOnly ? allUsers.filter(u => u.team_id === user.teamId) : allUsers).map((u) => (
              <Box
                key={u.id}
                p="md"
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--mantine-color-gray-2)'
                }}
                onClick={() => startNewConversation(u)}
              >
                <Group gap="sm" wrap="nowrap">
                  <Avatar 
                    src={u.profile_picture} 
                    radius="xl" 
                    size="md" 
                  />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {u.first_name} {u.last_name}
                    </Text>
                    {u.username && (
                      <Text size="xs" c="dimmed" truncate>@{u.username}</Text>
                    )}
                  </Box>
                </Group>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      </Box>

      {/* Chat Area */}
      {selectedConversation && (
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Group p="md" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <ActionIcon 
              variant="subtle" 
              onClick={() => setSelectedConversation(null)}
              style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Avatar 
              src={selectedConversation.otherUser.profile_picture} 
              radius="xl" 
              size="md" 
            />
            <Box>
              <Text size="sm" fw={500}>
                {selectedConversation.otherUser.first_name} {selectedConversation.otherUser.last_name}
              </Text>
              {typingUsers.size > 0 && (
                <Text size="xs" c="dimmed" fs="italic">typing...</Text>
              )}
            </Box>
          </Group>

          {/* Messages */}
          <ScrollArea flex={1} p="md" viewportRef={scrollRef}>
            {loading ? (
              <Center h="100%">
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack gap="md">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id;
                  return (
                    <Group 
                      key={message.id} 
                      gap="sm" 
                      align="flex-start"
                      style={{ 
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' 
                      }}
                    >
                      {!isOwnMessage && (
                        <Avatar 
                          src={message.sender.profile_picture} 
                          radius="xl" 
                          size="sm" 
                        />
                      )}
                      <Box
                        style={{
                          maxWidth: '70%',
                          backgroundColor: isOwnMessage ? 
                            'var(--mantine-color-blue-6)' : 
                            'var(--mantine-color-gray-1)',
                          color: isOwnMessage ? 'white' : 'inherit',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          wordWrap: 'break-word'
                        }}
                      >
                        {!isOwnMessage && (
                          <Text size="xs" fw={500} mb={4}>
                            {message.sender.first_name} {message.sender.last_name}
                          </Text>
                        )}
                        <Text size="sm">{message.content}</Text>
                        <Text 
                          size="xs" 
                          mt={4} 
                          style={{ 
                            opacity: 0.7,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(message.createdAt)}
                        </Text>
                      </Box>
                      {isOwnMessage && (
                        <Avatar 
                          src={user.profile_picture} 
                          radius="xl" 
                          size="sm" 
                        />
                      )}
                    </Group>
                  );
                })}
              </Stack>
            )}
          </ScrollArea>

          {/* Message Input */}
          <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <form onSubmit={sendMessage}>
              <Group gap="sm">
                <TextInput
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  style={{ flex: 1 }}
                  radius="xl"
                />
                <ActionIcon 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  size="lg"
                  radius="xl"
                  variant="filled"
                  color="blue"
                >
                  <IconSend size={20} />
                </ActionIcon>
              </Group>
            </form>
          </Box>
        </Box>
      )}
      </Paper>

    </>
  );
}