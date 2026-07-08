# NitWerse

A real-time campus chat application for NIT Warangal. NitWerse gives clubs, departments, and students a dedicated space to communicate — group rooms for events and discussions, direct messaging, user search, and online presence.

This started as a response to how scattered campus communication can get over WhatsApp groups. The goal was a simple, focused platform where a club like CSES can spin up a room for an overnight event prep session, or anyone can find a classmate by username and start a conversation.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Real-time | Socket.io |

## Features

- User registration and authentication (JWT + HTTP-only cookies)
- Direct messaging between users
- Group chat rooms with optional password protection
- Username search to find and message other users
- Online/offline status indicators
- Real-time message delivery via WebSockets

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB Atlas account (free tier works fine)

### Installation

```bash
# Clone the repository
git clone https://github.com/nikik3/NitWerse.git
cd NitWerse

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set up environment variables
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_CONNECT=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Under **Database Access**, create a database user
3. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development)
4. Copy the connection string into `MONGODB_CONNECT` in your `.env` file

### Running the App

```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The frontend dev server proxies API and WebSocket requests to the backend port set in `.env`.

## Project Structure

```
NitWerse/
├── backend/
│   ├── Models/          # Mongoose schemas
│   ├── routControlers/  # Route handlers
│   ├── rout/            # Express routes
│   ├── Socket/          # Socket.io setup
│   └── middleware/      # Auth middleware
├── frontend/
│   └── src/
│       ├── landing/     # Landing page
│       ├── home/        # Chat interface
│       ├── login/       # Auth pages
│       └── context/     # React context providers
└── .env.example         # Environment template
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/register` | User registration |
| `/chat` | Main application (requires authentication) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port |
| `MONGODB_CONNECT` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

## License

Personal project — NIT Warangal.
