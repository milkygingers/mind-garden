# 🌱 Mind Garden

A beautiful personal productivity and knowledge-management app inspired by Notion, Obsidian, and bullet journaling.

![Mind Garden](https://via.placeholder.com/800x400/22c55e/ffffff?text=Mind+Garden)

## ✨ Features (MVP)

- **Authentication**: Secure signup/login with email and password
- **PARA Organization**: Built-in folder system (Projects, Areas, Resources, Archive)
- **Rich Page Editor**: Create pages with headings, lists, checklists, quotes, and code
- **Favorites**: Star pages for quick access
- **Dark/Light Mode**: Easy on your eyes, day or night

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd mind-garden
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Database (SQLite for development)
   DATABASE_URL="file:./dev.db"

   # NextAuth (generate a random secret)
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   To generate a secure secret, run:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mind-garden/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Login/signup pages
│   │   ├── (dashboard)/    # Authenticated pages
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   │   ├── editor/         # Page editor
│   │   ├── layout/         # Sidebar, navigation
│   │   └── providers/      # Context providers
│   ├── lib/                # Utilities
│   │   ├── auth.ts         # NextAuth configuration
│   │   └── db.ts           # Database client
│   └── types/              # TypeScript types
└── package.json
```

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 15 | React with App Router, SSR, API routes |
| **Styling** | Tailwind CSS | Utility-first, easy customization |
| **Database** | SQLite + Prisma | Zero-config database, type-safe ORM |
| **Auth** | NextAuth.js | Secure, flexible authentication |
| **Editor** | Tiptap | Headless rich text editor |
| **Icons** | Lucide React | Beautiful, consistent icons |

## 🎨 Design System

### Colors

- **Garden Green**: Primary brand color (`#22c55e`)
- **Warmth**: Accent for highlights (`#f59e0b`)
- **Dark Mode**: Deep blue-black background

### Fonts

- **Outfit**: Clean, modern sans-serif for UI
- **Playfair Display**: Elegant serif for headings
- **JetBrains Mono**: Monospace for code

## 📋 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Run linting
npm run lint
```

## 🗺️ Roadmap

### Phase 2: Enhanced Pages
- [ ] Page templates
- [ ] Nested pages
- [ ] Color-coded pages
- [ ] Seasonal themes

### Phase 3: Databases & Trackers
- [ ] Custom databases (Notion-style)
- [ ] Habit tracker
- [ ] Financial tracker
- [ ] Shopping lists with calculations

### Phase 4: Widgets & Actions
- [ ] Pomodoro timer widget
- [ ] Clock widget
- [ ] Quick action panel
- [ ] Keyboard shortcuts

### Phase 5: AI & Export
- [ ] AI text summaries
- [ ] Auto-tagging
- [ ] Export to Markdown/PDF
- [ ] Google Calendar import

## 🤝 Contributing

This is a learning project! Feel free to:
1. Open issues for bugs or feature requests
2. Submit pull requests with improvements
3. Share feedback and ideas

## 📝 License

MIT License - feel free to use this for your own projects!

---

Built with 💚 for personal productivity

