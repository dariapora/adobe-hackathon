import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group, Image, Tabs, Box, Container, AppShell, Textarea, SegmentedControl, Button, Card, Stack, Text } from "@mantine/core";
import axios from "axios";
import Home from "./Home";
import Team from "./Team"; 
import { initialPosts } from "../data/posts";
import Nav from "./Nav.jsx";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState(initialPosts);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch authenticated user from backend
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        const userData = response.data.user;
        
        // Check if user needs to complete onboarding
        if (!userData.role || !userData.team_id) {
          navigate('/onboarding');
        } else {
          // Parse name into firstName/lastName
          const nameParts = userData.name?.split(' ') || [];
          const firstName = nameParts[0] || 'User';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setUser({
            firstName,
            lastName,
            email: userData.email,
            role: userData.role,
            teamId: userData.team_id,
            picture: userData.profile_picture
          });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Not authenticated:', error);
        navigate('/login');
      });
  }, [apiUrl, navigate]);

  useEffect(() => {
    // keep user in localStorage for persistence across reloads
    if (user) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
    }
  }, [user]);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerScope, setComposerScope] = useState('all');

  const handleAddPost = () => {
    setComposerScope(activeTab === 'team' ? 'team' : 'all');
    setComposerOpen(true);
  };
  const submitPost = () => {
    const text = composerText.trim();
    if (!text || !user) return;
    const authorName = `${user?.firstName || 'You'} ${user?.lastName || ''}`.trim();
    const authorHandle = (user?.firstName || 'you').toLowerCase();
    const newPost = {
      id: String(Math.random()).slice(2),
      author: { 
        name: authorName || 'You', 
        handle: authorHandle, 
        avatar: user?.picture || 'https://i.pravatar.cc/100?img=1' 
      },
      createdAt: new Date(),
      tags: [],
      content: text,
      image: null,
      likes: 0,
      comments: 0,
      bookmarked: false,
      teamId: composerScope === 'team' ? (user?.teamId || 'T-000') : (user?.teamId || null),
      visibility: composerScope,
    };
    setPosts((cur) => [newPost, ...cur]);
    setComposerText("");
    setComposerScope('all');
    setComposerOpen(false);
  };

  if (loading) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 240, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Box
          style={{
            borderBottom: "1px solid var(--mantine-color-gray-3)",
            background: "var(--mantine-color-body)",
          }}
        >
            <Group justify="space-between" h={60} px="md">
              <Group gap="xs">
                <Image src={logo} alt="Logo" width={32} height={32} radius="sm" />
              </Group>
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="home">Home</Tabs.Tab>
                  <Tabs.Tab value="team">Team</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>
        </Box>
      </AppShell.Header>

      <AppShell.Navbar>
        <Box p="sm">
          <Nav onAddPost={handleAddPost} />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p="md">
          {composerOpen && (
            <Card withBorder radius="md" p="md" mb="md">
              <Stack gap="sm">
                <Text fw={600}>Create a post</Text>
                <SegmentedControl
                  fullWidth
                  value={composerScope}
                  onChange={setComposerScope}
                  data={[{ label: 'Everyone', value: 'all' }, { label: 'Team', value: 'team' }]}
                />
                <Textarea
                  placeholder={composerScope === 'team' ? 'Share an update with your team…' : 'Share an update with everyone…'}
                  minRows={3}
                  value={composerText}
                  onChange={(e) => setComposerText(e.currentTarget.value)}
                />
                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setComposerOpen(false)}>Cancel</Button>
                  <Button color="checkin" onClick={submitPost}>Post</Button>
                </Group>
              </Stack>
            </Card>
          )}
          {activeTab === "home" && <Home posts={posts} />}
          {activeTab === "team" && <Team posts={posts} user={user} />}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
