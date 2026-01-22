# Study Overseas Map 🎓

An interactive study abroad roadmap platform that helps international students navigate their journey to studying overseas. Features an AI-powered chatbot for personalized guidance, comprehensive step-by-step roadmap, and modern responsive design.

## ✨ Features

### Core Features
- **Interactive Visual Roadmap**: Navigate through study abroad phases using React Flow
- **AI Study Advisor**: Get personalized guidance with an integrated chatbot powered by AI
- **Progress Tracking**: Save your progress with Firebase + Google authentication
- **Custom Roadmaps**: Generate personalized roadmaps for specific universities
- **Guest Mode**: Start immediately without account creation

### Technical Features
- **🌍 Internationalization**: Full support for English and Vietnamese (i18n)
- **📱 Mobile-First Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **🎨 Modern UI/UX**: Clean, professional interface with gradient designs
- **⚡ Performance Optimized**: Fast loading with static generation and code splitting
- **🔒 Secure**: Firebase authentication with proper security rules

### Recent Major Updates (2025)
- ✅ **Fixed i18n Bug**: Translation keys no longer show on page reload
- ✅ **Modern Layout System**: New header with mobile menu, professional footer
- ✅ **Responsive Redesign**: Mobile-first approach across all pages
- ✅ **Component Refactoring**: Following React best practices
- ✅ **Clean Experience**: Removed all advertisements for distraction-free learning

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Firebase account (for authentication features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-onboarding-v2
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Firebase Auth with Google Sign-in
- **Database**: Supabase (with SSR support)
- **Visualization**: React Flow for interactive roadmap
- **Internationalization**: next-i18next
- **UI Components**: Custom components with Tailwind

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AIChatbot.tsx   # AI-powered study advisor
│   ├── Header.tsx      # Navigation header
│   ├── Modal.tsx       # Modal component
│   └── ...
├── constants/          # Static data and configurations
│   ├── roadmap.ts      # Study abroad roadmap steps
│   ├── chatbot.ts      # AI chatbot configuration
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
│   ├── useRoadmap.ts   # Roadmap data management
│   └── useReactQuery.ts# API query hooks
├── lib/                # Third-party service configurations
│   └── firebase.ts     # Firebase setup
├── pages/              # Next.js pages
│   ├── index.tsx       # Landing page (redirects to dashboard)
│   ├── dashboard.tsx   # Main interactive roadmap
│   ├── login.tsx       # Authentication page
│   └── api/            # API routes
│       ├── chat.ts     # AI chatbot endpoint
│       └── ...
├── prompts/            # AI prompts and templates
├── styles/             # Global styles
└── utils/              # Utility functions
    ├── translateRoadmap.ts # Internationalization utilities
    └── debounce.ts     # Helper functions
```

### Key Components

#### Interactive Roadmap (`dashboard.tsx`)
- Visual representation using React Flow
- Custom node components for each study phase
- Progress tracking and completion status
- Responsive design for mobile and desktop

#### AI Chatbot (`AIChatbot.tsx`)
- Integrated study abroad advisor
- Context-aware responses about the roadmap
- Markdown rendering for rich responses
- Persistent chat history

#### Authentication (`AuthContext.tsx`)
- Firebase Google Sign-in integration
- Guest mode support (local storage)
- Progressive enhancement approach

#### Internationalization
- English and Vietnamese support
- Localized roadmap content
- RTL/LTR text direction support

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

```

### Customizing the Roadmap

The study abroad roadmap is defined in `src/constants/roadmap.ts`. Each section includes:

- **Steps**: Required and optional tasks
- **Descriptions**: Detailed explanations
- **Reference Links**: External resources
- **Positioning**: Visual layout coordinates
- **Styling**: Colors and visual themes

## 📱 Pages and Routes

- `/` - Landing page (redirects to dashboard)
- `/dashboard` - Main interactive roadmap interface
- `/login` - Authentication page
- `/api/chat` - AI chatbot API endpoint
- `/api/hello` - Health check endpoint
- `/api/og-image` - Dynamic Open Graph image generation

## 🌐 Internationalization

Supports multiple languages through next-i18next:

- **English** (`/public/locales/en/`)
- **Vietnamese** (`/public/locales/vi/`)

Translation files include:
- `common.json` - UI text and navigation
- `roadmap.json` - Roadmap-specific content

## 🎨 Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Consistent dark color scheme
- **Animations**: Smooth transitions and micro-interactions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform supporting Next.js:

```bash
npm run build
npm run start
```

## 📄 API Routes

- `/api/chat` - POST endpoint for AI chatbot interactions
- `/api/hello` - GET endpoint for health checks
- `/api/og-image` - Dynamic Open Graph image generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Flow Documentation](https://reactflow.dev/) - Interactive diagrams and flows
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase Auth](https://firebase.google.com/docs/auth) - Authentication service
- [Supabase](https://supabase.com/docs) - Backend as a service

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
