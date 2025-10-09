# Santa Teresa Surf Cam - Application Architecture Documentation

## 📋 Table of Contents
1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Models & Relationships](#data-models--relationships)
5. [Authentication & Authorization](#authentication--authorization)
6. [Service Layer Architecture](#service-layer-architecture)
7. [Component Architecture](#component-architecture)
8. [API Routes & Endpoints](#api-routes--endpoints)
9. [Admin Panel Functionality](#admin-panel-functionality)
10. [PWA Features](#pwa-features)
11. [Development Patterns](#development-patterns)
12. [Environment Configuration](#environment-configuration)

---

## 🏄‍♂️ Application Overview

**Santa Teresa Surf Cam** is a modern Progressive Web App (PWA) that provides real-time access to surf conditions in Santa Teresa, Costa Rica. The application features a freemium model with time-limited free access and premium unlimited access.

### Core Features
- **Live Video Streaming**: HLS-based live stream from Santa Teresa surf cam
- **Dual Access Model**: Free (60 seconds) and Premium (unlimited) access
- **Multiple Authentication Methods**: Email magic links, Google OAuth, and premium password
- **Real-time Chat System**: Group-based chat with password protection
- **Tide Data Integration**: Real-time tide information and forecasts
- **Admin Panel**: Comprehensive user management and analytics
- **PWA Capabilities**: Installable on mobile and desktop devices
- **Responsive Design**: Optimized for all device types

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **Lucide React** - Consistent icon library

### Backend & Database
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Next.js API Routes** - Server-side endpoints
- **bcryptjs** - Password hashing

### PWA & Streaming
- **HLS.js** - HTTP Live Streaming client
- **Service Worker** - Offline capabilities and caching
- **Web App Manifest** - PWA installation configuration

### Authentication
- **Google OAuth 2.0** - Social login
- **Magic Links** - Passwordless authentication
- **JWT-like tokens** - Session management

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── auth/          # Authentication
│   │   ├── chat/          # Chat functionality
│   │   ├── hls-proxy/     # HLS streaming proxy
│   │   └── user/          # User management
│   ├── admin/             # Admin panel pages
│   ├── contacto/          # Contact/premium plans
│   ├── hospedaje/         # Accommodation info
│   ├── restaurantes/      # Restaurant info
│   ├── surf-lessons/      # Surf lessons info
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── AppHeader.tsx     # Main navigation
│   ├── SurfCam.tsx       # Main surf cam component
│   ├── Login.tsx         # Authentication component
│   ├── Chat.tsx          # Chat system
│   ├── HlsPlayer.tsx     # Video player
│   └── TideWidget.tsx    # Tide information
├── context/              # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── ThemeContext.tsx  # Theme management
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Authentication hook
│   └── usePWA.ts         # PWA functionality
├── lib/                  # Utilities
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Helper functions
├── models/               # MongoDB schemas
│   ├── User.ts           # User model
│   ├── Admin.ts          # Admin model
│   ├── ChatGroup.ts      # Chat groups
│   ├── ChatMessage.ts    # Chat messages
│   ├── Metrics.ts        # Analytics data
│   ├── TideData.ts       # Tide information
│   └── WaveReport.ts     # Wave reports
├── repositories/         # Data access layer
│   ├── UserRepository.ts
│   ├── ChatGroupRepository.ts
│   └── ChatMessageRepository.ts
└── services/             # Business logic
    ├── UserService.ts
    ├── GroupService.ts
    └── ChatMessageService.ts
```

---

## 🗄️ Data Models & Relationships

### User Model
```typescript
{
  _id: ObjectId,
  email: string (unique, lowercase),
  accessType: 'free' | 'premium',
  role: 'user' | 'moderator' | 'admin',
  username?: string,
  instagram?: string,
  password?: string (hashed, premium only),
  subscription?: {
    plan: 'individual' | 'business',
    startDate: Date,
    endDate: Date,
    paymentMethod: 'SINPE' | 'other',
    status: 'active' | 'expired' | 'cancelled',
    paymentProof?: string
  },
  // Analytics & Metrics
  totalViews: number,
  loginCount: number,
  sessionHistory: [{
    loginTime: Date,
    logoutTime?: Date,
    sessionDuration: number,
    userAgent: string,
    ipAddress: string,
    deviceType: 'mobile' | 'tablet' | 'desktop',
    browser: string,
    os: string
  }],
  activityStats: {
    firstLogin: Date,
    lastActivity: Date,
    totalDaysActive: number,
    consecutiveDaysActive: number,
    preferredLoginTime: string,
    mostActiveDay: string
  },
  preferences: {
    emailNotifications: boolean,
    autoPlay: boolean,
    quality: 'auto' | '720p' | '1080p'
  }
}
```

### ChatGroup Model
```typescript
{
  _id: ObjectId,
  name: string (unique),
  password: string (hashed),
  members: [ObjectId] (ref: User),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### ChatMessage Model
```typescript
{
  _id: ObjectId,
  group: string,
  userId: ObjectId (ref: User),
  username: string,
  message: string,
  edited: boolean,
  reactions: [{
    emoji: string,
    userId: ObjectId (ref: User)
  }],
  timestamp: Date
}
```

### Admin Model
```typescript
{
  _id: ObjectId,
  email: string (unique),
  role: 'admin' | 'super_admin',
  password: string (hashed),
  lastLogin: Date,
  isActive: boolean,
  permissions: {
    canManageUsers: boolean,
    canManageSubscriptions: boolean,
    canViewMetrics: boolean
  }
}
```

### Metrics Model
```typescript
{
  _id: ObjectId,
  timestamp: Date,
  activeUsers: number,
  freeUsers: number,
  premiumUsers: number,
  totalViews: number,
  hourlyStats: {
    views: number,
    uniqueUsers: number
  },
  dailyStats: {
    views: number,
    uniqueUsers: number,
    newUsers: number,
    premiumConversions: number
  }
}
```

### TideData Model
```typescript
{
  _id: ObjectId,
  location: {
    lat: number,
    lng: number
  },
  dailyData: [{
    date: Date,
    dayOfWeek: string,
    lunarPhase?: string,
    sunrise: string,
    sunset: string,
    tides: [{
      time: Date,
      height: number,
      type: 'high' | 'low'
    }],
    coefficient: {
      value: number,
      level: 'bajo' | 'medio' | 'alto'
    },
    fishingActivity?: string
  }],
  currentHeight: number,
  nextHighTide: {
    time: Date,
    height: number
  },
  nextLowTide: {
    time: Date,
    height: number
  }
}
```

### WaveReport Model
```typescript
{
  _id: ObjectId,
  waveHeight: number (0-20 feet),
  reportedBy: ObjectId (ref: User),
  reporterName: string,
  location: string (default: 'Santa Teresa'),
  notes?: string (max 500 chars),
  isActive: boolean
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

#### 1. Free Access (Magic Link)
```typescript
// User enters email → Magic link sent → User clicks link → Temporary code → Login
POST /api/auth/magic-link
{
  email: string
}
// Response: { success: boolean, message: string }

POST /api/auth/validate
{
  email: string,
  code: string
}
// Response: { success: boolean, user: User }
```

#### 2. Premium Access (Password)
```typescript
// User enters email + premium password → Direct login
POST /api/auth/register
{
  email: string,
  password?: string,
  accessType: 'free' | 'premium'
}
// Response: { success: boolean, user: User }
```

#### 3. Google OAuth
```typescript
// User clicks Google login → OAuth flow → Code exchange → Login
POST /api/auth/google
{
  code: string
}
// Response: { user: User }
```

### Authorization Levels
- **Free Users**: 60-second access limit, basic features
- **Premium Users**: Unlimited access, all features
- **Moderators**: Chat moderation capabilities
- **Admins**: Full system access, user management

### Session Management
- **Timer System**: Free users get 60-second countdown
- **Persistent Sessions**: Timer state saved in localStorage
- **Activity Tracking**: Login/logout events recorded
- **Device Detection**: Browser, OS, and device type tracking

---

## 🏗️ Service Layer Architecture

### UserService
```typescript
class UserService {
  async updateProfile({ userId, username, instagram })
  async register({ email, password, accessType, userAgent, ipAddress, loginTime })
}
```

### ChatMessageService
```typescript
class ChatMessageService {
  async getMessages({ group, startOfDay, endOfDay })
  async createMessage(data)
  async editMessage({ id, userId, message }) // 5-minute edit window
  async deleteMessage({ id, userEmail, adminEmail })
}
```

### GroupService
```typescript
class GroupService {
  async joinGroup({ groupName, password, userId })
  async createGroup({ name, password, createdBy })
  async changePassword({ name, newPassword })
  async isMember({ name, userId })
  async getAllGroups()
}
```

### Repository Pattern
- **UserRepository**: User CRUD operations
- **ChatGroupRepository**: Group management
- **ChatMessageRepository**: Message operations

---

## 🧩 Component Architecture

### Main Components

#### SurfCam (Main Component)
```typescript
// Features:
- Progressive loading (TideWidget → Chat)
- Time expiration handling
- Fullscreen management
- PWA installation prompts
- Scroll-to-chat functionality
```

#### Login Component
```typescript
// Features:
- Dual mode (Guest/Premium)
- Google OAuth integration
- Magic link flow
- Email validation
- PWA installation
```

#### AppHeader
```typescript
// Features:
- Responsive navigation
- User status display
- Theme toggle
- Mobile menu
```

#### Chat Component
```typescript
// Features:
- Real-time messaging
- Group management
- Message editing (5-min window)
- Admin moderation
```

#### HlsPlayer
```typescript
// Features:
- HLS stream playback
- CORS proxy integration
- Error handling
- Pause on time expiration
```

### Component Patterns

#### 1. Context-Based State Management
```typescript
// AuthContext provides global auth state
const { user, login, logout, timeLeft, isTimeExpired } = useAuth();
```

#### 2. Progressive Loading
```typescript
// Lazy loading with priority
const TideWidget = lazy(() => import("./TideWidget"));
const Chat = lazy(() => import("./Chat"));
```

#### 3. Custom Hooks
```typescript
// usePWA for PWA functionality
const { isInstallable, isInstalled, installApp } = usePWA();
```

#### 4. Skeleton Loading
```typescript
// Loading states for better UX
const TideWidgetSkeleton = () => <div className="animate-pulse">...</div>;
```

---

## 🌐 API Routes & Endpoints

### Authentication Routes
```
POST /api/auth/register          # User registration/login
POST /api/auth/magic-link        # Send magic link
POST /api/auth/validate          # Validate magic link code
POST /api/auth/google            # Google OAuth
POST /api/auth/activity          # Track login activity
POST /api/auth/logout            # User logout
GET  /api/auth/me                # Get current user
```

### Admin Routes
```
GET  /api/admin/users            # List all users
PUT  /api/admin/users/[id]       # Update user
GET  /api/admin/moderators       # List moderators
POST /api/admin/moderators       # Promote/demote moderators
GET  /api/admin/metrics          # Get analytics
POST /api/admin/login            # Admin login
```

### Chat Routes
```
GET  /api/chat/groups/list       # List chat groups
POST /api/chat/groups/create     # Create group
POST /api/chat/groups/join       # Join group
POST /api/chat/groups/change-password # Change group password
GET  /api/chat/history           # Get chat history
POST /api/chat/messages/[id]     # Edit/delete message
```

### User Routes
```
GET  /api/user/profile           # Get user profile
PUT  /api/user/profile           # Update profile
```

### Utility Routes
```
GET  /api/hls-proxy/[...path]    # HLS stream proxy (CORS)
GET  /api/tide-data              # Tide information
POST /api/wave-report            # Submit wave report
```

---

## 👨‍💼 Admin Panel Functionality

### Dashboard Features
- **User Metrics**: Total users, active users, premium/free breakdown
- **Login Analytics**: Total logins, today's logins
- **Real-time Stats**: Live user activity monitoring

### User Management
- **User List**: Searchable, sortable user table
- **User Editing**: Update username, email, role, access type
- **Status Management**: Activate/deactivate users
- **Access Type Filtering**: Filter by free/premium users

### Moderator Management
- **Promote Users**: Convert users to moderators
- **Demote Moderators**: Remove moderator privileges
- **Moderator List**: View all moderators with activity

### Analytics & Reporting
- **User Growth**: Track new user registrations
- **Premium Conversions**: Monitor free-to-premium upgrades
- **Session Analytics**: User engagement metrics
- **Device Analytics**: Browser, OS, device type breakdown

---

## 📱 PWA Features

### Installation
- **Installable**: Meets PWA criteria
- **Install Prompts**: Custom installation banners
- **Installation Instructions**: Platform-specific guidance

### Offline Capabilities
- **Service Worker**: Caching and offline functionality
- **App Shell**: Core UI cached for offline use
- **Background Sync**: Queue actions when offline

### Native-like Experience
- **App Manifest**: Native app-like appearance
- **Splash Screen**: Custom loading screen
- **Icon Sets**: Multiple icon sizes for different devices
- **Theme Colors**: Consistent branding

### Performance
- **Lazy Loading**: Components loaded on demand
- **Progressive Enhancement**: Core features work without JS
- **Optimized Assets**: Compressed images and code

---

## 🎨 Development Patterns

### 1. Component Composition
```typescript
// Main component composes smaller components
<SurfCam>
  <AppHeader />
  <HlsPlayer />
  <TideWidget />
  <Chat />
</SurfCam>
```

### 2. Context Pattern
```typescript
// Global state management
<AuthProvider>
  <ThemeProvider>
    <PWAProvider>
      {children}
    </PWAProvider>
  </ThemeProvider>
</AuthProvider>
```

### 3. Custom Hooks
```typescript
// Reusable logic
const useAuth = () => useContext(AuthContext);
const usePWA = () => { /* PWA logic */ };
```

### 4. Error Boundaries
```typescript
// Graceful error handling
<Suspense fallback={<Skeleton />}>
  <LazyComponent />
</Suspense>
```

### 5. Progressive Enhancement
```typescript
// Core functionality first, enhancements second
const { loadTideWidget, loadChat } = useProgressiveLoading();
```

### 6. Repository Pattern
```typescript
// Data access abstraction
UserRepository.findByEmail(email)
ChatMessageRepository.createMessage(data)
```

---

## ⚙️ Environment Configuration

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXT_PUBLIC_PREMIUM_PASSWORD=your_premium_password
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Application
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# HLS Streaming (Optional)
NEXT_PUBLIC_HLS_STREAM_URL=http://your-hls-server.com/hls
```

### Development vs Production
- **Development**: Local MongoDB, localhost URLs
- **Production**: MongoDB Atlas, Vercel deployment
- **Environment-specific**: Different OAuth credentials, database connections

---

## 🚀 Deployment & Infrastructure

### Vercel Deployment
- **Automatic Deployments**: Git-based CI/CD
- **Environment Variables**: Secure configuration management
- **Edge Functions**: Global CDN distribution
- **Analytics**: Built-in performance monitoring

### Database
- **MongoDB Atlas**: Managed cloud database
- **Connection Pooling**: Efficient database connections
- **Indexes**: Optimized query performance
- **Backups**: Automated data protection

### Monitoring
- **Vercel Analytics**: Performance metrics
- **Speed Insights**: Core Web Vitals
- **Error Tracking**: Application monitoring
- **User Analytics**: Behavior tracking

---

## 📊 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js automatic optimization
- **Bundle Analysis**: Webpack bundle optimization
- **Caching**: Service worker caching strategies

### Backend
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database usage
- **API Caching**: Response caching where appropriate
- **Error Handling**: Graceful error recovery

### PWA
- **Service Worker**: Offline functionality
- **App Shell**: Fast initial load
- **Background Sync**: Offline action queuing
- **Push Notifications**: User engagement (future)

---

## 🔧 Maintenance & Updates

### Regular Tasks
- **Database Cleanup**: Remove old session data
- **User Analytics**: Generate usage reports
- **Security Updates**: Keep dependencies current
- **Performance Monitoring**: Track Core Web Vitals

### Feature Updates
- **A/B Testing**: Gradual feature rollouts
- **User Feedback**: Collect and implement improvements
- **Analytics Review**: Data-driven decisions
- **Bug Fixes**: Rapid issue resolution

---

## 📝 Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Testing
- **Unit Tests**: Component and service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing
- **Performance Tests**: Load and stress testing

### Documentation
- **Code Comments**: Inline documentation
- **API Documentation**: Endpoint specifications
- **Component Documentation**: Usage examples
- **Architecture Documentation**: This document

---

*This documentation serves as a comprehensive guide for understanding, maintaining, and extending the Santa Teresa Surf Cam application. It should be updated as the application evolves.*
