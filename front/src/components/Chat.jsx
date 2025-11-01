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
  Modal,
  Input
} from '@mantine/core';
import { IconSend, IconArrowLeft, IconPlus, IconSearch } from '@tabler/icons-react';
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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
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
      setMessages((prev) => [...prev, message]);
      
      // Update conversation list with new message
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
        // Sort by most recent
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

  // Load conversations
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
  }, [user?.id]);

  // Load all users for new chat
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('Loading users from:', `${API_URL}/api/user/`);
      const response = await axios.get(`${API_URL}/api/user/`, {
        withCredentials: true
      });
      console.log('Users response:', response.data);
      // Filter out current user
      const otherUsers = response.data.filter(u => u.id !== user.id);
      console.log('Filtered users (excluding self):', otherUsers);
      setAllUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoadingUsers(false);
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/messages/conversations`,
        { otherUserId: otherUser.id },
        { withCredentials: true }
      );
      
      // Add to conversations list if not already there
      setConversations(prev => {
        const exists = prev.find(c => c.id === response.data.id);
        if (exists) return prev;
        return [response.data, ...prev];
      });
      
      setSelectedConversation(response.data);
      setShowNewChatModal(false);
      setUserSearchQuery('');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const query = userSearchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  // Load messages when conversation is selected
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
        
        // Join conversation room
        socket.emit('conversation:join', selectedConversation.id);

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

    loadMessages();

    // Cleanup: leave conversation room when switching
    return () => {
      if (socket) {
        socket.emit('conversation:leave', selectedConversation.id);
      }
    };
  }, [selectedConversation, socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    socket.emit('message:send', {
      conversationId: selectedConversation.id,
      content: newMessage.trim()
    });

    setNewMessage('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing:stop', selectedConversation.id);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedConversation) return;

    // Send typing start
    socket.emit('typing:start', selectedConversation.id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing stop after 2 seconds of no typing
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
      <Paper shadow="xs" p={0} style={{ height: '600px', display: 'flex' }}>
        {/* Conversations List */}
        <Box 
          style={{ 
            width: selectedConversation ? '300px' : '100%',
            borderRight: selectedConversation ? '1px solid var(--mantine-color-gray-3)' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="lg" fw={600}>Messages</Text>
            <ActionIcon 
              variant="filled" 
              color="blue" 
              radius="xl"
              onClick={() => {
                setShowNewChatModal(true);
                loadUsers();
              }}
            >
              <IconPlus size={18} />
            </ActionIcon>
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

      {/* New Chat Modal */}
      <Modal
        opened={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setUserSearchQuery('');
        }}
        title="Start a new conversation"
        size="md"
      >
        <Stack gap="md">
          <Input
            placeholder="Search users..."
            leftSection={<IconSearch size={16} />}
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
          
          <ScrollArea h={300}>
            {loadingUsers ? (
              <Center h={300}>
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack gap="xs">
                {filteredUsers.length === 0 ? (
                  <Center p="xl">
                    <Text c="dimmed" size="sm">
                      {allUsers.length === 0 ? 'No users available' : 'No users found'}
                    </Text>
                  </Center>
                ) : (
                  filteredUsers.map((u) => (
                    <Box
                      key={u.id}
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => startNewConversation(u)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Group gap="sm">
                        <Avatar 
                          src={u.profile_picture} 
                          radius="xl" 
                          size="md" 
                        />
                        <Box>
                          <Text size="sm" fw={500}>
                            {u.first_name} {u.last_name}
                          </Text>
                          {u.username && (
                            <Text size="xs" c="dimmed">
                              @{u.username}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Modal>
    </>
  );
}