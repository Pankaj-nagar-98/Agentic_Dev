# TaskFlow &mdash; Modern Todo Web Application

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS-Modern-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A fast, elegant, and responsive productivity application built with **React** and **modern Vanilla CSS**. Features mock authentication, browser `localStorage` persistence, inline task editing, priority badges, and reactive state management without heavy third-party UI bloat.

[Key Features](#-key-features) • [Quick Start](#-quick-start) • [Architecture](#-project-architecture) • [Demo Credentials](#-demo-credentials)

</div>

---

## ✨ Key Features

- 🔐 **Mock Authentication**: Secure client-side login with input validation and quick 1-click demo auto-fill.
- ⚡ **Zero-Dependency UI**: Hand-crafted design system with glassmorphism, fluid animations, and custom SVG icons.
- 📝 **Task Management**:
  - Add tasks with priority levels (**Normal**, **Medium**, **High**).
  - Quick inline editing (double-click or edit button) with `Enter` to save.
  - Custom animated checkboxes to toggle completion.
  - Delete individual tasks or clear all completed items.
- 🏷️ **Smart Filters & Counters**:
  - Filter by `All`, `Active`, and `Completed` with dynamic count badges.
  - Real-time pending items counter.
- 🔔 **Interactive Feedback**: Responsive toast notifications for key user actions.
- 💾 **Persistent Storage**: Retains authenticated user sessions and todo items across browser refreshes via `localStorage`.
- 📱 **Fully Responsive**: Optimized for desktops, tablets, and mobile screens.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (v9 or newer)

### Installation
```bash
# Clone the repository
git clone https://github.com/Pankaj-nagar-98/Agentic_Dev.git

# Navigate into the project folder
cd Agentic_Dev

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be accessible at: `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

---

## 🔑 Demo Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `student@example.com` |
| **Password** | `password123` |

*A 1-click **Auto Fill** button is also available directly on the login card.*

---

## 🏛️ Project Architecture

```
Agentic_Dev/
├── index.html                   # HTML entry point with Plus Jakarta Sans & SEO meta
├── package.json                 # Project configuration & npm scripts
├── vite.config.js               # Vite build configuration
└── src/
    ├── main.jsx                 # React root mount
    ├── index.css                # Global design system tokens, themes & animations
    ├── App.jsx                  # Root component (Auth router, global state & toasts)
    └── components/
        ├── Navbar.jsx           # Sticky header, date display, user badge & logout
        ├── LoginPage.jsx        # Glassmorphic login card with password toggle
        ├── TodoPage.jsx         # Todo dashboard, stats, input form & toast manager
        ├── TodoItem.jsx         # Task item with priority tags & inline editing
        ├── TodoFilter.jsx       # Filter tabs with live count indicators
        └── Toast.jsx            # Toast notification banner
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
