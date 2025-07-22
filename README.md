# TikTok Clone - React Native Expo App

A TikTok-like vertical video feed app built with React Native, Expo, and Firebase.

## Development Phases

### Phase 1: Authentication & Basic Setup ✅ (Current)
- [x] Firebase Authentication with Google Sign-in
- [x] User profile storage in Firestore
- [x] Basic tab navigation (Home, Profile)
- [x] Login screen with Google authentication
- [x] Profile screen with user information
- [x] Authentication context and state management

### Phase 2: Video Feed Foundation (Next)
- [ ] Basic vertical video feed
- [ ] Video player component with expo-av
- [ ] Sample video data
- [ ] FlatList with pagination
- [ ] Video autoplay on focus

### Phase 3: Video Interactions
- [ ] Like functionality with heart animation
- [ ] Mute/unmute toggle
- [ ] Video progress indicator
- [ ] Play/pause controls

### Phase 4: Social Features
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

## Current Features (Phase 1)

- **Google Authentication**: Users can sign in with their Google account
- **Profile Management**: User data is stored and retrieved from Firestore
- **Basic Navigation**: Home and Profile tabs with clean UI
- **Responsive Design**: Works on both iOS and Android devices

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
