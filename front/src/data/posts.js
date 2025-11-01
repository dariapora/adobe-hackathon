export const initialPosts = [
  {
    id: '1',
    author: { name: 'Daria Pora', handle: 'pdaria05', avatar: 'https://media.istockphoto.com/id/185233538/photo/smiling-pug-walking-in-summer-park.jpg?s=612x612&w=0&k=20&c=DOzStXr1YD1Wx5-12N5X2wUGu0w1gmu7iAikVnWGIoU=' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    teamId: 'T-123',
    visibility: 'team',
    content:
      'Got my coffee from the new place today. Who else tried it?',
    image: 'https://media.gettyimages.com/id/2161651297/video/woman-with-a-cup-of-morning-coffee-in-hand.jpg?s=640x640&k=20&c=-FB5kgY-LNlaoBRxPIQO0f1em9ieISHy6v7xCoBda98=',
    likes: 12,
    comments: 4,
    bookmarked: false,
  },
  {
    id: '2',
    author: { name: 'Razvan Petcu', handle: 'rzv_ptc_', avatar: 'https://thumbs.dreamstime.com/b/portrait-handsome-teenage-boy-playing-guitar-outdoor-boy-using-classic-guitar-male-alone-making-music-portrait-handsome-234820927.jpg' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    teamId: 'T-456',
    visibility: 'team',
    content:
      'Dreaming of a teambuilding in Hawaii... but back to work now.',
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
