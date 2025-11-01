import { useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  ActionIcon,
  Collapse,
} from '@mantine/core';
import { 
  IconSearch, 
  IconSend, 
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'SJ',
    lastMessage: 'Thanks for the update on the project!',
    timestamp: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Marketing Team',
    avatar: 'MT',
    lastMessage: 'Meeting scheduled for tomorrow at 10 AM',
    timestamp: '15m ago',
    unread: 0,
    online: false,
    isGroup: true,
  },
  {
    id: 3,
    name: 'David Chen',
    avatar: 'DC',
    lastMessage: 'Can you review the document?',
    timestamp: '1h ago',
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    avatar: 'ER',
    lastMessage: 'Great work on the presentation!',
    timestamp: '3h ago',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Engineering Team',
    avatar: 'ET',
    lastMessage: 'Code review requested',
    timestamp: '5h ago',
    unread: 3,
    online: false,
    isGroup: true,
  },
];

// Mock data for messages by conversation
const mockMessagesByConversation = {
  1: [
    {
      id: 1,
      sender: 'Sarah Johnson',
      content: 'Hi! How are you doing?',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Hey Sarah! I\'m doing great, thanks for asking.',
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      content: 'I wanted to discuss the Q4 project timeline. Do you have time for a quick call?',
      timestamp: '10:33 AM',
      isOwn: false,
    },
    {
      id: 4,
      sender: 'You',
      content: 'Sure! I\'m free now. Let me know when you\'re ready.',
      timestamp: '10:35 AM',
      isOwn: true,
    },
    {
      id: 5,
      sender: 'Sarah Johnson',
      content: 'Thanks for the update on the project!',
      timestamp: '10:40 AM',
      isOwn: false,
    },
  ],
  2: [
    {
      id: 1,
      sender: 'Michael Brown',
      content: 'Hey team! We need to finalize the marketing campaign for next quarter.',
      timestamp: '9:15 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'I agree. What\'s our timeline looking like?',
      timestamp: '9:20 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Jessica Lee',
      content: 'We should have the final designs ready by Friday.',
      timestamp: '9:25 AM',
      isOwn: false,
    },
    {
      id: 4,
      sender: 'Michael Brown',
      content: 'Meeting scheduled for tomorrow at 10 AM',
      timestamp: '9:30 AM',
      isOwn: false,
    },
  ],
  3: [
    {
      id: 1,
      sender: 'David Chen',
      content: 'Hey! Did you get a chance to look at the new design mockups?',
      timestamp: '2:15 PM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Not yet, I\'ll check them out this afternoon.',
      timestamp: '2:20 PM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'David Chen',
      content: 'Can you review the document?',
      timestamp: '3:00 PM',
      isOwn: false,
    },
  ],
  4: [
    {
      id: 1,
      sender: 'Emily Rodriguez',
      content: 'The presentation went really well!',
      timestamp: '11:00 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'That\'s awesome! What was the feedback?',
      timestamp: '11:05 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Emily Rodriguez',
      content: 'Everyone loved it. The client wants to move forward!',
      timestamp: '11:10 AM',
      isOwn: false,
    },
    {
      id: 4,
      sender: 'Emily Rodriguez',
      content: 'Great work on the presentation!',
      timestamp: '11:15 AM',
      isOwn: false,
    },
  ],
  5: [
    {
      id: 1,
      sender: 'Alex Turner',
      content: 'New PR submitted for the authentication module.',
      timestamp: '8:30 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'I\'ll review it this morning.',
      timestamp: '8:45 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Rachel Kim',
      content: 'Found a bug in the payment flow. Working on a fix.',
      timestamp: '9:00 AM',
      isOwn: false,
    },
    {
      id: 4,
      sender: 'Alex Turner',
      content: 'Code review requested',
      timestamp: '9:30 AM',
      isOwn: false,
    },
  ],
};

export function Chat({ floating = true, height }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const contentHeight = height ?? (floating ? 500 : 600);

  const handleSelectChat = (conversation) => {
    setSelectedChat(conversation);
    setMessages(mockMessagesByConversation[conversation.id] || []);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <Box
      style={floating ? {
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      } : {}}
    >
      <Paper shadow="lg" radius="md" withBorder w={floating ? 350 : '100%'}>
        {/* Header */}
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
          <Group gap="xs">
            <Text fw={600} size="lg">Messages</Text>
            {totalUnread > 0 && (
              <Badge size="sm" circle style={{ backgroundColor: '#4C5897' }}>
                {totalUnread}
              </Badge>
            )}
          </Group>
          <ActionIcon 
            variant="subtle" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
          </ActionIcon>
        </Group>

        {/* Content */}
        <Collapse in={isExpanded}>
          <Box h={contentHeight}>
          {!selectedChat ? (
            // Conversation List View
            <Stack gap={0}>
              <Box p="sm">
                <TextInput
                  placeholder="Search conversations..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  radius="md"
                  size="sm"
                />
              </Box>

              <ScrollArea h={440}>
                <Stack gap={0}>
                  {filteredConversations.map((conversation) => (
                    <UnstyledButton
                      key={conversation.id}
                      onClick={() => handleSelectChat(conversation)}
                      style={{ width: '100%' }}
                    >
                      <Box
                        p="sm"
                        style={{ 
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f3f5',
                        }}
                        sx={(theme) => ({
                          '&:hover': {
                            backgroundColor: theme.colors.gray[0],
                          },
                        })}
                      >
                        <Group wrap="nowrap" gap="sm">
                          <Box pos="relative">
                            <Avatar color="#4C5897" radius="xl" size="md">
                              {conversation.avatar}
                            </Avatar>
                            {conversation.online && (
                              <Box
                                pos="absolute"
                                bottom={0}
                                right={0}
                                w={10}
                                h={10}
                                bg="green"
                                style={{
                                  border: '2px solid white',
                                  borderRadius: '50%',
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group justify="space-between" gap="xs">
                              <Text fw={500} size="sm" truncate>
                                {conversation.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {conversation.timestamp}
                              </Text>
                            </Group>
                            <Group justify="space-between" gap="xs" mt={2}>
                              <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
                                {conversation.lastMessage}
                              </Text>
                              {conversation.unread > 0 && (
                                <Badge size="xs" circle style={{ backgroundColor: '#4C5897' }}>
                                  {conversation.unread}
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        </Group>
                      </Box>
                    </UnstyledButton>
                  ))}
                </Stack>
              </ScrollArea>
            </Stack>
          ) : (
            // Chat View
            <Flex direction="column" h="100%">
              {/* Chat Header */}
              <Group p="sm" style={{ borderBottom: '1px solid #e9ecef' }}>
                <ActionIcon variant="subtle" onClick={handleBackToList}>
                  <IconChevronDown size={18} style={{ transform: 'rotate(90deg)' }} />
                </ActionIcon>
                <Avatar color="#4C5897" radius="xl" size="sm">
                  {selectedChat.avatar}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text fw={500} size="sm">{selectedChat.name}</Text>
                  <Text size="xs" c="dimmed">
                    {selectedChat.online ? 'Active now' : 'Offline'}
                  </Text>
                </Box>
              </Group>

              {/* Messages Area */}
              <ScrollArea flex={1} p="sm">
                <Stack gap="sm">
                  {messages.map((message) => (
                    <Flex
                      key={message.id}
                      justify={message.isOwn ? 'flex-end' : 'flex-start'}
                    >
                      <Paper
                        p="xs"
                        radius="md"
                        bg={message.isOwn ? '#4C5897' : 'gray.1'}
                        maw="80%"
                      >
                        {!message.isOwn && (
                          <Text size="xs" fw={500} mb={2} c={message.isOwn ? 'white' : 'dark'}>
                            {message.sender}
                          </Text>
                        )}
                        <Text size="sm" c={message.isOwn ? 'white' : 'dark'}>
                          {message.content}
                        </Text>
                        <Text
                          size="xs"
                          c={message.isOwn ? 'gray.3' : 'dimmed'}
                          mt={2}
                          ta="right"
                        >
                          {message.timestamp}
                        </Text>
                      </Paper>
                    </Flex>
                  ))}
                </Stack>
              </ScrollArea>

              {/* Message Input */}
              <Box p="sm" style={{ borderTop: '1px solid #e9ecef' }}>
                <Group gap="xs">
                  <TextInput
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    radius="md"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    onClick={handleSendMessage}
                    radius="md"
                    size="lg"
                    style={{ backgroundColor: '#4C5897', color: 'white' }}
                    disabled={!messageInput.trim()}
                  >
                    <IconSend size={18} />
                  </ActionIcon>
                </Group>
              </Box>
            </Flex>
          )}
        </Box>
      </Collapse>
    </Paper>
    </Box>
  );
}