# SkillNet - Professional Networking Platform

SkillNet is a modern, full-stack professional networking application built to connect professionals, share stories, and foster career growth. It features real-time messaging, post and story creation with rich media support, and intelligent user connections.

## 🚀 Key Features

*   **Authentication & User Management**: Secure login and signup via Clerk (Google, GitHub, Email).
*   **Professional Profiles**: Customizable user profiles with bio, location, and skills.
*   **Network & Connections**: Connect with other professionals, follow users, and manage requests.
*   **Feed & Posts**: Create text and image posts to share updates with your network.
*   **Stories**: Share ephemeral photo/video stories that disappear after 24 hours.
*   **Real-time Messaging**: Instant chat functionality to communicate with connections.
*   **Smart Notifications**: Background jobs (via Inngest) for connection reminders and unseen message alerts.

## 🛠️ Tech Stack

### Frontend uses [Vite](https://vitejs.dev/) + [React](https://react.dev/)
*   **Framework**: React 19
*   **Styling**: Tailwind CSS v4 (Modern utility-first CSS)
*   **State Management**: Redux Toolkit (for global app state)
*   **Routing**: React Router v7
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast

### Backend uses [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
*   **API Framework**: Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Authentication**: Clerk (Server-side middleware verification)
*   **Image Storage**: ImageKit (for optimized media handling)
*   **Background Jobs**: Inngest (Serverless queues for cron jobs & event-driven logic)
*   **Real-time**: Server-Sent Events (SSE) (for instant messaging)

## 📂 Project Structure

```
skillNet/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application routes/pages
│   │   ├── api/            # Axios API configuration
│   │   └── assets/         # Static assets
│   └── package.json
│
└── server/                 # Backend Node.js API
    ├── configs/            # Configs (DB, ImageKit, Multer)
    ├── controllers/        # Route logic handlers
    ├── models/             # Mongoose database schemas
    ├── routes/             # API route definitions
    ├── inngest/            # Background job functions
    └── server.js           # Entry point
```

## 🔧 Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas Account
*   Clerk Account
*   ImageKit Account
*   Inngest Account (for local dev)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd skillNet
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=4000
MONGODB_URL=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
INNGEST_EVENT_KEY=your_inngest_event_key (optional for local)
INNGEST_SIGNING_KEY=your_inngest_signing_key (optional for local)
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run server
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the frontend development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🚀 Deployment

### Backend (Vercel)
The backend is configured for Vercel deployment (`vercel.json` included).
1.  Push code to GitHub.
2.  Import `server` directory project in Vercel.
3.  Add all environment variables from server `.env`.
4.  **Important**: Ensure `IMAGEKIT_URL_ENDPOINT` matches exactly what ImageKit provides.
5.  **Important**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access.

### Frontend (Vercel/Netlify)
1.  Import `client` directory project.
2.  Add `VITE_CLERK_PUBLISHABLE_KEY` to environment variables.
3.  Deploy!

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.
