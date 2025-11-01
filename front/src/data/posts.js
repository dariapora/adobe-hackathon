export const initialPosts = [
  {
    id: '1',
    author: { name: 'Daria Pora', handle: 'pdaria05', avatar: 'https://media.istockphoto.com/id/185233538/photo/smiling-pug-walking-in-summer-park.jpg?s=612x612&w=0&k=20&c=DOzStXr1YD1Wx5-12N5X2wUGu0w1gmu7iAikVnWGIoU=' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    tags: ['#design', '#ui'],
    teamId: 'T-123',
    visibility: 'team',
    content:
      'Got my coffee from the new place today. Who else tried it?',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
    likes: 12,
    comments: 4,
    bookmarked: false,
  },
  {
    id: '2',
    author: { name: 'Matei Ionescu', handle: 'matei', avatar: 'https://i.pravatar.cc/100?img=15' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    tags: ['#release'],
    teamId: 'T-456',
    visibility: 'team',
    content:
      'v1.4.0 is live 🎉 — includes faster search, keyboard shortcuts, and dark mode fixes. Release notes in the comments.',
    image: null,
    likes: 38,
    comments: 12,
    bookmarked: true,
  },
  {
    id: '3',
    author: { name: 'Zara Patel', handle: 'zara', avatar: 'https://i.pravatar.cc/100?img=30' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
    tags: ['#infra', '#kudos'],
    teamId: 'T-123',
    visibility: 'all',
    content:
      'Big kudos to @ops for squashing the flaky CI job. Pipelines are finally green again. 🚦',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop',
    likes: 7,
    comments: 2,
    bookmarked: false,
  },
];
