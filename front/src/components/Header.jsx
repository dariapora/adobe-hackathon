import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group, Image, Tabs, Box, Container, AppShell, Textarea, SegmentedControl, Button, Card, Stack, Text, Avatar, ActionIcon } from "@mantine/core";
import axios from "axios";
import Home from "./Home";
import Team from "./Team"; 
import Chat from "./Chat";
import Schedule from "./Schedule";
import Experience from "./Experience";
import { initialPosts } from "../data/posts";
import Nav from "./Nav.jsx";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
  const [activeTab, setActiveTab] = useState("home");
  const [activeView, setActiveView] = useState("Home");
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    axios.get(`${apiUrl}/auth/user`, { withCredentials: true })
      .then(response => {
        const userData = response.data.user;
        
        if (!userData.username || !userData.team_id) {
          navigate('/onboarding');
        } else {
          setUser({
            id: userData.id,  
            firstName: userData.first_name || 'User',
            lastName: userData.last_name || '',
            username: userData.username,
            email: userData.email,
            teamId: userData.team_id,
            picture: userData.profile_picture,
            experience: userData.experience || 0
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
    if (user) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const url = `${apiUrl}/api/post/`;
        const response = await axios.get(url, { withCredentials: true });
        const data = Array.isArray(response.data) ? response.data : [];
        const result = activeTab === 'team'
          ? data.filter((p) => p.team_id && p.team_id === user.teamId)
          : data.filter((p) => p.team_id == null);
        setPosts(result);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [user, activeTab, apiUrl]);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerScope, setComposerScope] = useState('all');

  const handleNavSelect = (label) => {
    // Route all navigation from left sidebar
    if (label === "Home") {
      setActiveView("Home");
      setActiveTab("home");
      setComposerOpen(false);
      return;
    }
    if (label === "Team") {
      setActiveView("Home");
      setActiveTab("team");
      setComposerOpen(false);
      return;
    }
    if (label === "Experience") {
      setActiveView("Home");
      setActiveTab("experience");
      setComposerOpen(false);
      return;
    }
    if (label === "Chat") {
      setActiveView("Chat");
      setComposerOpen(false);
      return;
    }
    if (label === "Schedule") {
      setActiveView("Home");
      setActiveTab("schedule");
      setComposerOpen(false);
      return;
    }
  };

  const handleAddPost = () => {
    setComposerScope(activeTab === 'team' ? 'team' : 'all');
    setComposerOpen(true);
  };
  const submitPost = async () => {
    const text = composerText.trim();
    if (!text || !user) return;
    
    try {
      const isTeamPost = composerScope === 'team';
      const teamIdToSend = isTeamPost ? user.teamId : null;
      const postData = {
        user_id: user.id,
        content: text,
        image: null,
        team_id: teamIdToSend,
        visibility: isTeamPost ? 'team' : 'all'
      };
      
      console.log('Submitting post:', postData);
      
      const response = await axios.post(
        `${apiUrl}/api/post/create-post`,
        postData,
        { withCredentials: true }
      );

      console.log('Post created successfully:', response.data);

      // Refresh posts list based on current tab
      // Re-fetch and apply same filtering rules
      const url = `${apiUrl}/api/post/`;
      const postsResponse = await axios.get(url, { withCredentials: true });
      const allData = Array.isArray(postsResponse.data) ? postsResponse.data : [];
      const next = activeTab === 'team'
        ? allData.filter((p) => p.team_id && p.team_id === user.teamId)
        : allData.filter((p) => p.team_id == null);
      setPosts(next);
      
      setComposerText("");
      setComposerScope('all');
      setComposerOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to create post. Please try again.');
    }
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
              {/* Header links removed; navigation moved to left sidebar */}
              <ActionIcon 
                variant="subtle" 
                size="lg" 
                radius="xl"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                <Avatar 
                  src={user?.picture} 
                  size={36} 
                  radius="xl"
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                />
              </ActionIcon>
            </Group>
        </Box>
      </AppShell.Header>

      <AppShell.Navbar>
        <Box p="sm">
          <Nav onAddPost={handleAddPost} onSelect={handleNavSelect} />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p={activeView === "Chat" ? 0 : "md"}>
          {activeView === "Chat" ? (
            <Chat user={user} />
          ) : (
            <>
              {composerOpen && activeTab !== 'experience' && (
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
              {activeTab === "experience" && <Experience user={user} />}
              {activeTab === "schedule" && <Schedule user={user} />}
            </>
          )}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
