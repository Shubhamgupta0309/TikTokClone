export interface VideoData {
  id: string;
  uri: string;
  title: string;
  username: string;
  userId: string;
  avatar: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

export const sampleVideos: VideoData[] = [
  {
    id: '1',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Amazing nature video! 🌸',
    username: 'nature_lover',
    userId: 'user_1',
    avatar: 'https://i.pravatar.cc/150?img=1',
    likes: 15600,
    comments: 832,
    shares: 2100,
    isLiked: false,
  },
  {
    id: '2',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Creative animation ✨',
    username: 'animator_pro',
    userId: 'user_2',
    avatar: 'https://i.pravatar.cc/150?img=2',
    likes: 28400,
    comments: 1250,
    shares: 3200,
    isLiked: false,
  },
  {
    id: '3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Epic adventure time! 🏔️',
    username: 'adventure_seeker',
    userId: 'user_3',
    avatar: 'https://i.pravatar.cc/150?img=3',
    likes: 42300,
    comments: 2100,
    shares: 5600,
    isLiked: false,
  },
  {
    id: '4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Beautiful landscapes 🌄',
    username: 'traveler',
    userId: 'user_4',
    avatar: 'https://i.pravatar.cc/150?img=4',
    likes: 19800,
    comments: 945,
    shares: 2800,
    isLiked: false,
  },
  {
    id: '5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Fun times ahead! 🎉',
    username: 'fun_creator',
    userId: 'user_5',
    avatar: 'https://i.pravatar.cc/150?img=5',
    likes: 35700,
    comments: 1680,
    shares: 4200,
    isLiked: false,
  },
  {
    id: '6',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    title: 'Road trip vibes 🚗',
    username: 'road_warrior',
    userId: 'user_6',
    avatar: 'https://i.pravatar.cc/150?img=6',
    likes: 24500,
    comments: 1320,
    shares: 3400,
    isLiked: false,
  },
  {
    id: '7',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    title: 'Incredible moments 🔥',
    username: 'moment_capture',
    userId: 'user_7',
    avatar: 'https://i.pravatar.cc/150?img=7',
    likes: 31200,
    comments: 1540,
    shares: 3800,
    isLiked: false,
  },
  {
    id: '8',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    title: 'Artistic masterpiece 🎨',
    username: 'digital_artist',
    userId: 'user_8',
    avatar: 'https://i.pravatar.cc/150?img=8',
    likes: 47600,
    comments: 2340,
    shares: 6100,
    isLiked: false,
  },
];
