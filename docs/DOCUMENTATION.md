# Santa Teresa Surf Cam - Documentation

> Consolidated documentation for the Santa Teresa Surf Cam project.

---

## Table of Contents

1. [Application Architecture](#application-architecture)
2. [PWA Features](#pwa-features)
3. [Ad Overlay System](#ad-overlay-system)
4. [Tab System](#tab-system)
5. [Tide Overlay](#tide-overlay)
6. [YouTube Integration](#youtube-integration)
7. [UI/UX Guidelines](#uiux-guidelines)

---

## Application Architecture

### Overview

**Santa Teresa Surf Cam** is a modern Progressive Web App (PWA) providing real-time surf conditions in Santa Teresa, Costa Rica.

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: MongoDB, Mongoose, Next.js API Routes
- **PWA**: Service Worker, Web App Manifest
- **Streaming**: YouTube/Twitch embeds

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Admin panel
│   └── [locale]/          # i18n routes
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── context/              # React contexts
├── lib/                  # Utilities
├── models/               # MongoDB schemas
└── services/             # Business logic
```

### Data Models

- **User**: Authentication, subscriptions, analytics
- **ChatGroup**: Group-based chat system
- **ChatMessage**: Messages with reactions, editing
- **AdOverlay**: Ad system for monetization
- **TideData**: Tide information

### API Endpoints

```
Auth:    POST /api/auth/register, /api/auth/magic-link, /api/auth/google
Admin:   GET/PUT /api/admin/users, /api/admin/ad-overlays
Chat:    GET /api/chat/history, POST /api/chat/messages
Utility: GET /api/tide-data, /api/ad-overlays
```

---

## PWA Features

### Capabilities

- **Installable**: Native app-like installation
- **Service Worker**: Caching and offline support
- **Adaptive Icons**: Multiple sizes for all devices
- **Push Notifications**: Ready for future implementation

### Installation Flow

1. User visits app in compatible browser
2. Install button appears automatically
3. User confirms installation
4. App appears on home screen/desktop

### Browser Support

- Chrome (Android, Desktop)
- Edge (Windows, Android)
- Firefox (Android, Desktop)
- Safari (iOS 11.3+, macOS)

---

## Ad Overlay System

### Features

- **4 positions**: All screen corners
- **Auto-rotation**: Changes every 10 seconds
- **Smart visibility**: Hides after 5s, reappears every 15s
- **Click tracking**: Automatic interaction counting
- **Campaign dates**: Start/end date control

### Admin Panel

- Create/edit/delete overlays
- Real-time metrics
- Campaign management

### API

```
GET  /api/ad-overlays           # Active overlays
GET  /api/admin/ad-overlays     # All overlays (admin)
POST /api/admin/ad-overlays     # Create overlay
PUT  /api/admin/ad-overlays     # Update overlay
POST /api/admin/ad-overlays/click # Track click
```

---

## Tab System

### Server Tabs

- **YouTube**: Default, universal access
- **Twitch**: HD + Replays option

### Chat Tabs

- Multiple chat groups
- Password protection
- Real-time messaging

---

## Tide Overlay

### Features

- Real-time tide data
- Daily forecasts
- Lunar phase integration
- Fishing activity info

### Data Structure

```typescript
{
  currentHeight: number,
  nextHighTide: { time: Date, height: number },
  nextLowTide: { time: Date, height: number },
  dailyData: [{ date, tides, sunrise, sunset }]
}
```

---

## YouTube Integration

### Embed Features

- Autoplay support
- Lazy loading
- Error handling with fallback
- Ad overlay integration

### Restrictions Handled

- CORS via preconnect hints
- Cross-origin iframe security
- Mobile playback policies

---

## UI/UX Guidelines

### Design System

- **Colors**: Ocean-inspired (cyan, blue, teal)
- **Typography**: PT Serif (headlines), Open Sans (body)
- **Animations**: Subtle, performance-optimized
- **Components**: shadcn/ui based

### Performance

- Lazy loading components
- Optimized images
- Preconnect hints
- Code splitting

### Accessibility

- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

---

## Environment Variables

```env
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_YT_CHANNEL_ID=your_channel_id
NEXTAUTH_URL=https://your-domain.com
```

---

*Last updated: February 2026*
