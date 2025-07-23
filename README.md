# TikTok Clone - React Native Expo App

A TikTok-like vertical video feed app built with React Native, Ex## Current Features (Phase 3 Complete)

- **Multiple Authentication Options**: Google Sign-in and Email/Password
- **User Profile Management**: User data stored and retrieved from Firestore
- **Vertical Video Feed**: TikTok-style infinite scrolling video feed
- **Video Player**: Full-screen video playback with expo-av
- **Auto-play**: Videos auto-play when in view, pause when not
- **Enhanced Like System**: Interactive like button with real-time updates and heart animations
- **Double-tap to Like**: Double-tap anywhere on video to like with animated heart
- **Comment System**: Real-time comment system with Firestore integration
- **Share Functionality**: Native sharing capabilities with multiple options
- **Follow/Unfollow**: User follow system with Firestore persistence
- **Mute Controls**: Visual mute/unmute toggle with indicator feedback
- **Progress Indicators**: Visual progress bars for video playback
- **Loading States**: Smooth loading animations and transitions
- **Pull-to-Refresh**: Refresh video feed with pull gesture
- **Navigation**: 5-tab navigation (Home, Discover, Upload, Notifications, Profile)
- **Responsive Design**: Works seamlessly on both iOS and Android devicesase.

## Development Phases

### Phase 1: Authentication & Basic Setup ✅ (Complete)

- [x] Firebase Authentication with Google Sign-in
- [x] Email/Password Authentication
- [x] User profile storage in Firestore
- [x] Basic tab navigation (Home, Profile)
- [x] Login screen with multiple authentication options
- [x] Profile screen with user information
- [x] Authentication context and state management
- [x] Form validation and error handling

### Phase 2: Video Feed Foundation ✅ (Complete)

- [x] Basic vertical video feed with FlatList
- [x] Video player component with expo-av
- [x] Sample video data with multiple videos
- [x] FlatList with pagination and smooth scrolling
- [x] Video autoplay on focus with viewability detection
- [x] Loading screen with smooth transitions
- [x] Pull-to-refresh functionality
- [x] Video progress indicator
- [x] Like notification system
- [x] Enhanced video overlay with metadata

### Phase 3: Video Interactions ✅ (Complete)

- [x] Enhanced like functionality with heart animation
- [x] Comment system with real-time updates
- [x] Share functionality with native sharing
- [x] Mute/unmute toggle with visual feedback
- [x] Video progress controls
- [x] Double-tap to like gesture
- [x] Follow/unfollow functionality

### Phase 4: Social Features (Next)

- [ ] Comments system
- [ ] Share functionality
- [ ] Follow/unfollow users
- [ ] User profiles with video grids

### Phase 5: Content Discovery

- [ ] Discover tab with trending content
- [ ] Search functionality
- [ ] Hashtag support
- [ ] Category filtering

### Phase 6: Upload & Creation

- [ ] Video recording with camera
- [ ] Video upload from gallery
- [ ] Basic video editing
- [ ] Music/sound selection

### Phase 7: Advanced Features

- [ ] Push notifications
- [ ] Real-time updates
- [ ] Video effects and filters
- [ ] Analytics dashboard

### Phase 8: Polish & Performance

- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Offline support

## Installation

1. Clone the repository:

```bash
git clone https://github.com/YourUsername/TikTokClone.git
cd TikTokClone
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase:

   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase config to `config/firebase.ts`
   - Set up Google Sign-in in Firebase Console

4. Update Google OAuth:

   - Add your Google Client IDs in `contexts/AuthContext.tsx`

5. Start the development server:

```bash
npm start
```

## Current Features (Phase 2 Complete)

- **Multiple Authentication Options**: Google Sign-in and Email/Password
- **User Profile Management**: User data stored and retrieved from Firestore
- **Vertical Video Feed**: TikTok-style infinite scrolling video feed
- **Video Player**: Full-screen video playback with expo-av
- **Auto-play**: Videos auto-play when in view, pause when not
- **Like System**: Interactive like button with real-time updates
- **Progress Indicators**: Visual progress bars for video playback
- **Loading States**: Smooth loading animations and transitions
- **Pull-to-Refresh**: Refresh video feed with pull gesture
- **Navigation**: 5-tab navigation (Home, Discover, Upload, Notifications, Profile)
- **Responsive Design**: Works seamlessly on both iOS and Android devices

## Tech Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform and tools
- **Firebase**: Authentication and database
- **TypeScript**: Type safety and development experience

## Project Structure

```
TikTokClone/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── contexts/              # React contexts (Auth)
├── config/                # Configuration files
├── screens/               # Screen components
└── data/                  # Sample data and types
```

## Contributing

This is a learning project. Each phase represents a milestone in building a complete TikTok-like application.

## License

MIT License - feel free to use this for learning purposes.
