# 🧠 Collabridge

A real-time team collaboration platform to manage tasks, projects, and communication featuring Kanban boards, file sharing, real-time chat, and activity feed.

---

## 🎯 What is Collabridge?

Collabridge helps teams manage work efficiently with:

- 🗂 **Kanban boards** to track tasks visually
- 💬 **Real-time chat** for instant communication
- ☁️ **File uploads & sharing** within projects
- 🔔 **Activity feed** to stay up to date
- 👥 **Role-based access control** for secure collaboration

---

## 🧠 Learning Goals

### 🧩 Frontend

- Use React + TypeScript effectively
- Build accessible UIs with Tailwind CSS and shadcn/ui
- Manage local state using Zustand
- Work with Socket.IO for live events
- Share types between backend and frontend

### 🛠 Backend

- Structure a scalable Express + TypeScript backend
- Handle JWT authentication securely
- Build clean REST APIs with validation
- Model data using Mongoose
- Enable real-time sync with Socket.IO

---

## 🛠 Tech Stack

| Layer      | Technology                     | Purpose                              |
| ---------- | ------------------------------ | ------------------------------------ |
| Frontend   | React + Vite + TypeScript      | Component-based UI, routing, state   |
| Styling    | Tailwind CSS v4 + shadcn/ui    | Utility-first styling, accessible UI |
| State      | Zustand                        | Local state management               |
| API        | Axios                          | Client-server communication          |
| Realtime   | Socket.IO (client)             | Live chat & events                   |
| Backend    | Node.js + Express + TypeScript | API logic, routing, middleware       |
| Database   | MongoDB + Mongoose             | NoSQL schemas, relationships         |
| Auth       | JWT + bcrypt                   | Secure authentication                |
| Uploads    | Multer / Cloudinary            | Media handling                       |
| Dev Tools  | ts-node-dev, dotenv            | Development tooling                  |
| Versioning | Git + GitHub                   | Code management, issues              |

---

## 🧱 Architecture

### 🟩 Frontend Flow

- User logs in → receives JWT token
- Dashboard loads → fetches projects, tasks, and chats
- Kanban UI enables drag-and-drop task management
- Chat UI connects to Socket.IO → receives messages/events
- File uploads via picker → sent to server/cloud
- Mentions and activity trigger real-time UI alerts

### 🟦 Backend Flow

- `/api/register` and `/api/login` issue JWT tokens
- Auth middleware protects private routes
- REST APIs:
  - `/tasks`, `/projects`, `/teams`, `/chat`
- MongoDB stores all documents (users, messages, etc.)
- Socket.IO emits task/chat events in real time
- Multer or Cloudinary handles file uploads
- Middleware handles error, validation, and logging

---

## ✅ Core Features (MVP)

- 👤 Secure user authentication with JWT
- 👥 Create and manage teams & projects
- 🗂 Organize work using a Kanban board
- 💬 Real-time chat using Socket.IO
- ☁️ Upload and view files & images
- 🔔 Stay informed with mentions & activity feed
- 🧾 Comment system for tasks/messages
- 📧 Invite team members via email or link

---

## 🔮 Upcoming Enhancements

- 📍 Pin important messages or tasks
- 🔎 Filter tasks by tag, status, or priority
- 🌙 Dark mode toggle
- 📊 Team analytics dashboard
- 🔐 Role-Based Access Control (RBAC)
- 🧩 Plugin/module system for extensibility

---

## 🧭 Project Milestones

### 🟦 Backend

| Milestone                          | Status   |
| ---------------------------------- | -------- |
| TypeScript Express server init     | ✅ Done  |
| MongoDB + Mongoose setup           | ✅ Done  |
| Auth routes + JWT                  | ✅ Done  |
| Mongoose models (User, Task, etc.) | ✅ Done  |
| CRUD for tasks/projects/teams      | ✅ Done  |
| Real-time messaging with Socket.IO | 🔜 Soon  |
| File upload setup (Multer/Cloud)   | 🔜 Soon  |
| Backend deployment                 | 🔜 Later |

### 🟩 Frontend

| Milestone                      | Status   |
| ------------------------------ | -------- |
| React + Vite + TS setup        | ✅ Done  |
| Tailwind CSS + shadcn/ui setup | ✅ Done  |
| Register/Login UI              | ✅ Done  |
| Zustand store + Axios setup    | ✅ Done  |
| Dashboard layout               | 🔜 Soon  |
| Kanban drag-and-drop UI        | 🔜 Soon  |
| Socket.IO client setup         | 🔜 Soon  |
| File upload UI                 | 🔜 Soon  |
| Mentions & activity UI         | 🔜 Later |
| Frontend deployment (Vercel)   | 🔜 Later |

---

## 📁 Folder Structure

```txt
collabridge/
├── backend/ # Express + TypeScript API
│ ├── src/
│ │ ├── controllers/ # Route logic
│ │ ├── routes/ # API handlers
│ │ ├── models/ # Mongoose schemas
│ │ ├── middleware/ # Auth, error handlers
│ │ ├── utils/ # Helpers
│ │ ├── config/ # DB, env setup
│ │ └── index.ts # Server entry point
│ ├── .env
│ └── tsconfig.json
│
├── frontend/ # React + Vite + TS
│ ├── src/
│ │ ├── pages/ # Screens (Login, Dashboard, etc.)
│ │ ├── components/ # Reusable UI components
│ │ ├── store/ # Zustand store
│ │ ├── utils/ # API utils, date formatting
│ │ ├── hooks/ # Custom hooks (auth, socket)
│ │ └── main.tsx # App bootstrap
│ └── vite.config.ts
│
└── README.md
```

---

## 🧾 License

MIT © 2025 Subhan Shaikh ([@subhan-0073](https://github.com/subhan-0073))

## 📬 Contributions

Contributions are currently limited as this is a **learning-focused solo project**. Feel free to fork or follow along!

## 📌 Project Status

**IN DEVELOPMENT:** Follow the milestones for progress updates!

## 📚 Developer References

| Resource        | Link                                             |
| --------------- | ------------------------------------------------ |
| Express + TS    | https://expressjs.com/en/starter/installing.html |
| Mongoose Docs   | https://mongoosejs.com/docs/guide                |
| Socket.IO       | https://socket.io/docs/v4                        |
| Tailwind CSS v4 | https://tailwindcss.com/docs                     |
| shadcn/ui       | https://ui.shadcn.com/docs/installation          |
| Vite            | https://vitejs.dev/guide                         |
| Zustand         | https://docs.pmnd.rs/zustand                     |
| Cloudinary      | https://cloudinary.com/documentation             |
| Multer          | https://github.com/expressjs/multer              |
