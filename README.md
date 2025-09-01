# Sub2X - Daily tweets. Zero effort.

A modern, responsive landing page with X (Twitter) OAuth authentication that redirects to a protected dashboard. Built with Next.js App Router, TypeScript, TailwindCSS, and shadcn/ui.

## Features

- 🎨 **Modern Design**: Light theme with subtle glassmorphism effects
- 🔐 **X OAuth**: Secure authentication with Twitter/X
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🛡️ **Protected Routes**: Middleware-protected dashboard
- ⚡ **Fast**: Built with Next.js App Router and optimized components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js with Twitter/X OAuth
- **Icons**: Lucide React

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment example file and fill in your credentials:

```bash
cp env.example .env.local
```

### 3. Twitter/X OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Get your `Client ID` and `Client Secret`
4. Add the callback URL: `http://localhost:3000/api/auth/callback/twitter`
5. Update your `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
TWITTER_CLIENT_ID=your_x_client_id
TWITTER_CLIENT_SECRET=your_x_client_secret
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API routes
│   ├── dashboard/page.tsx               # Protected dashboard
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   └── globals.css                      # Global styles
├── components/
│   ├── ui/                              # shadcn/ui components
│   ├── FeatureCard.tsx                  # Feature display component
│   ├── Footer.tsx                       # Site footer
│   ├── GlassCard.tsx                    # Glassmorphism card
│   ├── Header.tsx                       # Site header
│   ├── SignInButton.tsx                 # OAuth sign-in button
│   └── SignOutButton.tsx                # Sign-out button
├── lib/
│   ├── auth.ts                          # NextAuth configuration
│   ├── theme.ts                         # Theme configuration
│   └── utils.ts                         # Utility functions
├── types/
│   └── next-auth.d.ts                   # NextAuth type extensions
├── middleware.ts                        # Route protection
└── tailwind.config.ts                   # Tailwind configuration
```

## Features Overview

### Landing Page
- Hero section with compelling copy
- Feature cards explaining the value proposition
- Step-by-step process visualization
- Call-to-action buttons

### Authentication
- X (Twitter) OAuth integration
- JWT-based sessions (no database required)
- Protected dashboard route
- Automatic redirects

### Dashboard
- User profile display
- Connected account status
- Posting plan configuration
- Community management
- Activity status
- Quick action buttons

## Customization

### Theme
The app uses a light theme with glassmorphism effects. You can customize colors in:
- `lib/theme.ts` - Theme configuration
- `app/globals.css` - CSS custom properties and utilities

### Components
All components are built with shadcn/ui and can be customized by modifying the component files in the `components/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to:
1. Set `NEXTAUTH_URL` to your production URL
2. Update Twitter callback URL to your production domain
3. Set a secure `NEXTAUTH_SECRET`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
