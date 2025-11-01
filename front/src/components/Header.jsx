import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group, Image, Tabs, Box, Container, AppShell, Textarea, SegmentedControl, Button, Card, Stack, Text, Avatar, ActionIcon, Checkbox } from "@mantine/core";
import axios from "axios";
import Home from "./Home";
import Team from "./Team"; 
import Chat from "./Chat";
import Schedule from "./Schedule";
import Pomodoro from "./Pomodoro";
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
  const [composerImageFile, setComposerImageFile] = useState(null);
  const [composerImagePreview, setComposerImagePreview] = useState("");
  const [composerUploading, setComposerUploading] = useState(false);
  const [composerUrgent, setComposerUrgent] = useState(false);
  const [composerHelp, setComposerHelp] = useState(false);

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
    if (label === "Pomodoro") {
      setActiveView("Pomodoro");
      setComposerOpen(false);
      return;
    }
  };

  const handleAddPost = () => {
    // Redirect to the Home view and open the composer
    setActiveView("Home");
    setActiveTab("home");
    setComposerScope('all');
    setComposerOpen(true);
  };
  const handleDelete = async (postId) => {
    if (!postId) return;
    const ok = window.confirm('Delete this post?');
    if (!ok) return;
    try {
      await axios.delete(`${apiUrl}/api/post/${postId}`, { withCredentials: true });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      alert('Failed to delete post');
    }
  };
  const submitPost = async () => {
    const text = composerText.trim();
    if (!text || !user) return;
    
    try {
      const isTeamPost = composerScope === 'team';
      const teamIdToSend = isTeamPost ? user.teamId : null;
      let imageUrl = null;

      if (composerImageFile) {
        setComposerUploading(true);
        // Convert to data URL
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(composerImageFile);
        });
        try {
          const up = await axios.post(
            `${apiUrl}/api/post/upload-image`,
            { dataUrl, fileName: composerImageFile.name || 'image' },
            { withCredentials: true }
          );
          imageUrl = up.data?.url || up.data?.file || null;
        } finally {
          setComposerUploading(false);
        }
      }
      const postData = {
        user_id: user.id,
        content: text,
        image: imageUrl,
        team_id: teamIdToSend,
        visibility: isTeamPost ? 'team' : 'all',
        urgent: composerUrgent,
        help: composerHelp
      };
      
      console.log('Submitting post:', postData);
      
      const response = await axios.post(
        `${apiUrl}/api/post/create-post`,
        postData,
        { withCredentials: true }
      );

      console.log('Post created successfully:', response.data);

      // Optimistically inject the new post if it belongs in the current tab
      const created = response.data;
      const shouldShow = activeTab === 'team'
        ? !!created.team_id && created.team_id === user.teamId
        : created.team_id == null;
      if (shouldShow) {
        setPosts((prev) => [created, ...prev]);
      }

      // Re-fetch to reconcile with server ordering and ensure persistence
      try {
        const url = `${apiUrl}/api/post/`;
        const postsResponse = await axios.get(url, { withCredentials: true });
        const allData = Array.isArray(postsResponse.data) ? postsResponse.data : [];
        const next = activeTab === 'team'
          ? allData.filter((p) => p.team_id && p.team_id === user.teamId)
          : allData.filter((p) => p.team_id == null);
        setPosts(next);
      } catch (e) {
        // ignore
      }
      
      setComposerText("");
      setComposerScope('all');
      setComposerImageFile(null);
      setComposerImagePreview("");
      setComposerUrgent(false);
      setComposerHelp(false);
      setComposerOpen(false);
      // Ensure we land on Home after adding a post
      setActiveView("Home");
      setActiveTab("home");
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${apiUrl}/api/post/${postId}/like`, {}, { withCredentials: true });
      const { likes, liked } = res.data || {};
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: likes ?? p.likes, __liked: liked } : p));
    } catch (e) {
      // no-op
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
            background: "var(--mantine-color-checkin-7)",
            color: 'white',
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

      <AppShell.Navbar style={{ background: 'var(--mantine-color-checkin-0)' }}>
        <Box p="sm">
          <Nav onAddPost={handleAddPost} onSelect={handleNavSelect} />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p={activeView === "Chat" ? 0 : "md"}>
          {activeView === "Chat" ? (
            <Chat user={user} />
          ) : activeView === "Pomodoro" ? (
            <Pomodoro />
          ) : (
            <>
              {composerOpen && activeTab !== 'experience' && (
                <Card withBorder radius="md" p="md" mb="md" shadow="sm" style={{ borderLeft: '4px solid var(--mantine-color-checkin-5)' }}>
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
                    <Group gap="sm">
                      <input
                        id="composer-image-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] || null;
                          setComposerImageFile(file);
                          setComposerImagePreview(file ? URL.createObjectURL(file) : "");
                        }}
                      />
                      <Button variant="light" onClick={() => document.getElementById('composer-image-input').click()}>
                        {composerImageFile ? 'Change photo' : 'Add photo'}
                      </Button>
                      {composerImageFile && (
                        <Text size="sm" c="dimmed">{composerImageFile.name}</Text>
                      )}
                    </Group>
                    {composerImagePreview && (
                      <Image src={composerImagePreview} alt="preview" radius="sm" w={320} />
                    )}
                    <Group gap="md">
                      <Checkbox
                        label="Urgent"
                        checked={composerUrgent}
                        onChange={(e) => setComposerUrgent(e.currentTarget.checked)}
                      />
                      <Checkbox
                        label="Help me out!"
                        checked={composerHelp}
                        onChange={(e) => setComposerHelp(e.currentTarget.checked)}
                      />
                    </Group>
                    <Group justify="flex-end">
                      <Button variant="light" onClick={() => setComposerOpen(false)}>Cancel</Button>
                      <Button color="checkin" onClick={submitPost} loading={composerUploading}>Post</Button>
                    </Group>
                  </Stack>
                </Card>
              )}
              {activeTab === "home" && <Home posts={posts} user={user} onLike={handleLike} onDelete={handleDelete} />}
              {activeTab === "team" && <Team posts={posts} user={user} onLike={handleLike} onDelete={handleDelete} />}
              {activeTab === "experience" && <Experience user={user} />}
              {activeTab === "schedule" && <Schedule user={user} />}
            </>
          )}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
