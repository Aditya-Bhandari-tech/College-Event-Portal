# 🎓 Campus Pulse — College Event & Announcement Portal

### Progress Presentation | February 18, 2026

**Team Members:** Aditya Bhandari · Sumit · Omkar · Bhushan

---

## 📌 Project Overview

**Campus Pulse** is a web-based portal designed to streamline how college events, announcements, and recruitments are managed across departments. It connects **Students**, **Faculty**, and **Admins** through a single unified platform.

### 🎯 Problem Statement

- College events and announcements are scattered across WhatsApp groups, notice boards, and word-of-mouth.
- No centralized system for students to propose events or apply for volunteering roles.
- Faculty approval workflows are manual and error-prone.

### 💡 Our Solution

A **role-based web portal** where:
- **Students** can view events, propose new events, read announcements, and apply for recruitment roles.
- **Faculty** can manage events, review student proposals, post announcements, and create recruitment drives.
- **Admins** have full control — user management, faculty approvals, and system-wide access.

---

## 🛠️ Tech Stack

| Layer        | Technology                                    |
| :----------- | :-------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons    |
| **Backend**  | Node.js, Express 5                            |
| **Database** | MongoDB with Mongoose ODM                     |
| **Auth**     | JWT Tokens + Google OAuth 2.0                 |
| **Storage**  | Cloudinary (Image Uploads)                    |
| **Tools**    | Axios, React Router DOM, Bcrypt.js            |

---

## 🏗️ System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Welcome  │  │  Login / │  │ Dashboard│  │Faculty │  │
│  │  Page    │  │  Signup  │  │ (Admin/  │  │Dashbrd │  │
│  │          │  │ + Google │  │ Student) │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│          ↕ API Calls (Axios) ↕                          │
├─────────────────────────────────────────────────────────┤
│                     BACKEND (Express.js)                │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │ Auth Routes  │  │  Event &   │  │ Announcement & │   │
│  │ + Middleware │  │  Request   │  │ Recruitment    │   │
│  │ (JWT+Google) │  │  Routes    │  │ Routes         │   │
│  └──────────────┘  └────────────┘  └────────────────┘   │
│          ↕ Mongoose Queries ↕                           │
├─────────────────────────────────────────────────────────┤
│              DATABASE (MongoDB)  +  Cloudinary          │
│  ┌──────┐ ┌───────┐ ┌──────────┐ ┌────────┐ ┌───────┐  │
│  │ User │ │ Event │ │EvtReqst  │ │Announce│ │Recruit│  │
│  └──────┘ └───────┘ └──────────┘ └────────┘ └───────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Access

| Feature                | Student | Faculty | Admin |
| :--------------------- | :-----: | :-----: | :---: |
| View Events            |   ✅    |   ✅    |  ✅   |
| Propose Event (Request)|   ✅    |   ❌    |  ❌   |
| Create Events Directly |   ❌    |   ✅    |  ✅   |
| Approve/Reject Proposals|  ❌    |   ✅    |  ✅   |
| View Announcements     |   ✅    |   ✅    |  ✅   |
| Post Announcements     |   ❌    |   ✅    |  ✅   |
| Apply for Recruitment  |   ✅    |   ❌    |  ❌   |
| Create Recruitment Posts|  ❌    |   ✅    |  ✅   |
| Manage All Users       |   ❌    |   ❌    |  ✅   |
| Approve Faculty Signups|   ❌    |   ❌    |  ✅   |

---

## 🔐 Authentication Flow

```
   ┌──────────────┐
   │  User Visits  │
   │  Welcome Page │
   └──────┬───────┘
          │
    ┌─────▼──────┐
    │  Signup /   │
    │  Login Page │
    └──┬──────┬──┘
       │      │
  ┌────▼──┐ ┌─▼────────┐
  │ Email │ │  Google   │
  │ + Pwd │ │  OAuth    │
  └───┬───┘ └────┬─────┘
      │          │
   ┌──▼──────────▼───┐
   │ JWT Token Issued │
   │ (Students: Yes)  │
   │ (Faculty: After  │
   │  Admin Approval) │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Role-Based       │
   │ Dashboard Loads  │
   │ (Admin/Faculty/  │
   │  Student)        │
   └─────────────────┘
```

---

## 📊 Current Progress Summary

### ✅ What's Working

| Module              | Status       | Details                                           |
| :------------------ | :----------- | :------------------------------------------------ |
| User Authentication | ✅ Complete  | Email/Password + Google OAuth, JWT Tokens          |
| Role-Based Access   | ✅ Complete  | Student, Faculty, Admin with middleware protection |
| Event Management    | ✅ Complete  | Full CRUD for events (Create, Read, Update, Delete)|
| Event Requests      | ✅ Complete  | Students propose → Faculty/Admin approve/reject    |
| Announcements       | ✅ Complete  | Faculty/Admin can post, all users can view         |
| Recruitment System  | ✅ Complete  | Create drives, students apply, manage applicants   |
| Admin Panel         | ✅ Complete  | User management, faculty approval, role changes    |
| Frontend Dashboards | ✅ Complete  | Admin Dashboard + Faculty Dashboard + Student view |
| Image Uploads       | ✅ Complete  | Cloudinary integration with Multer                 |

### 🔄 In Progress / Upcoming

- Enhanced UI/UX polish and responsive design improvements
- Email notifications for approvals and event updates
- Student-specific dashboard enhancements
- Search and filter functionality improvements
- Event gallery with image uploads

---

## 🧑‍💻 Team Responsibilities & Module Ownership

Below is how the project is divided across our team of four. Each member presents their module — explaining the **idea, working flow, and user experience** of their part.

| Member | Module | Difficulty |
|:--|:--|:--|
| 🔵 Aditya | Authentication, Security & Admin Panel | ⭐⭐⭐ |
| 🟢 Sumit | Event Management & Event Requests | ⭐⭐ |
| 🟡 Omkar | Announcements Module | ⭐ |
| 🔴 Bhushan | Project Introduction, Recruitment & Future Scope | ⭐ |

---

### 🔴 Bhushan — Project Introduction, Recruitment & Future Scope ⭐ Easy

> **Bhushan opens the presentation** — introduces the project, explains recruitment, and closes with future plans.

**Part 1 — Project Introduction (Opening)**
- What is **Campus Pulse**? — A college portal to manage events, announcements, and recruitments
- **The Problem** — Events info is scattered on WhatsApp, notice boards; no central system
- **Our Solution** — One portal for Students, Faculty, and Admins
- **Tech Stack** — React, Node.js, MongoDB, Cloudinary (just name them, no deep explanation needed)
- Show the **System Architecture diagram** (the box diagram above)

**Part 2 — Recruitment System**
- Faculty/Admin can create **Recruitment Posts** for events (e.g., "Need 5 Volunteers for Tech Fest")
- Posts have a role type — Volunteer, Coordinator, Anchor, Technical, etc.
- Students can browse open posts and click **"Apply"** with a short note
- Faculty can see who applied and **select or reject** them

**Part 3 — Future Scope (Closing)**
- Present what's coming next: Email Notifications, Mobile Support, Event Gallery, Analytics, etc.
- **Closes the presentation** with the Thank You slide

**Simple Flow to Explain:**
```
Faculty creates Recruitment Post → Students browse & apply → Faculty selects applicants
```

---

### � Omkar — Announcements Module ⭐ Easy

> **Omkar explains the Announcements feature** — how information reaches students.

**What He Presents:**
- **What are Announcements?** — Important notices posted by Faculty/Admin for students
- Announcements can be for **all branches** or a **specific branch** (e.g., only IT students)
- Faculty goes to Announcements tab → clicks **"New Announcement"** → fills title + message + target branch → done!
- Students see announcements **on their dashboard**, filtered by their branch
- Faculty/Admin can also **edit** or **delete** their announcements

**Simple Flow to Explain:**
```
Faculty posts announcement → Students see it on their dashboard → Filtered by branch
```

**What Makes It Useful:**
- No more missed notices — everything is in one place
- Branch-specific targeting means students only see what's relevant to them
- Replaces the old notice board and scattered WhatsApp messages

---

### 🟢 Sumit — Event Management & Event Requests ⭐⭐ Moderate

> **Sumit covers the core feature** — how events are created and how students can propose ideas.

**Part 1 — Event Management:**
- Faculty/Admin can **create events** with title, description, date, venue, and target branch
- All users (Students, Faculty, Admin) can **browse and view** events
- Faculty can **update** event details; Admin can **delete** events

**Part 2 — Event Requests (Student Proposals):**
- Students can **propose event ideas** by submitting a request
- The request goes to Faculty/Admin for **review**
- Faculty/Admin can **Approve** (automatically creates an official event!) or **Reject** (with a reason)
- Students can track their proposal status — Pending / Approved / Rejected

**Simple Flow to Explain:**
```
Creating Events:    Faculty → Create Event → All students can view it
Student Proposals:  Student submits idea → Faculty reviews → Approve (becomes event) / Reject
```

---

### � Aditya Bhandari — Authentication, Security & Admin Panel ⭐⭐⭐ Advanced

> **Aditya explains the security backbone and admin controls** that power the entire system.

**Part 1 — Authentication System:**
- **Signup** — Users register with Name, Email, Password, Phone, Branch, and Role (Student/Faculty)
- **Login** — Email + Password verification, JWT token issued for session
- **Google Sign-In** — One-click login with Google account, auto-creates user profile
- **Faculty Approval** — Faculty can't use the system until Admin approves their registration
- **Role-Based Access** — Each page and action checks the user's role before allowing access

**Part 2 — Admin Panel:**
- Admin Dashboard shows **system stats** — total users, events, announcements, etc.
- **User Management** — View all registered users in a table, search, view profiles
- **Faculty Approval** — See pending faculty registrations, approve or reject them
- **Role Changes** — Admin can change any user's role (Student ↔ Faculty)
- **Delete Controls** — Admin can remove any user, event, announcement, or recruitment post

**Authentication Flow to Explain:**
```
Signup → Role selected → Students get instant access / Faculty waits for Admin approval
Login → Credentials verified → JWT token → Redirected to role-specific dashboard
```

**Admin Flow to Explain:**
```
Admin logs in → Sees dashboard stats → Manages users → Approves faculty → Full system control
```

---

## 📁 Project Structure at a Glance

```
College-Event-Portal/
├── backend/
│   ├── config/          → Database & Cloudinary config
│   ├── controllers/     → Business logic (8 controllers)
│   ├── middleware/       → Auth, error handling, file uploads
│   ├── models/          → 5 MongoDB schemas
│   ├── routes/          → 8 API route files
│   ├── utils/           → JWT, validation, response helpers
│   └── server.js        → App entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  → Reusable UI (Auth, Common, Layout, Specific)
│   │   ├── pages/       → Dashboard, Events, Announcements, etc.
│   │   ├── services/    → API call functions (6 service files)
│   │   ├── contexts/    → Auth state management
│   │   ├── hooks/       → Custom React hooks
│   │   └── App.jsx      → Routing configuration
│   └── index.html       → Entry HTML
```

---

## 🔮 Future Scope

- 📧 **Email Notifications** — Auto-notify users on approvals, new events, and recruitment updates
- 📱 **Mobile Responsive** — Fully optimized for mobile devices
- 📸 **Event Gallery** — Photo uploads and gallery view for past events
- 🔍 **Advanced Search & Filters** — Search events by date, branch, category
- 📊 **Analytics Dashboard** — Event attendance tracking and participation reports
- 🔔 **Real-time Notifications** — Push notifications using WebSockets

---

## 🙏 Thank You!

**Campus Pulse** — *Connecting Campus, One Event at a Time.*

> **Team:** Aditya · Sumit · Omkar · Bhushan
> **Tech:** React + Node.js + MongoDB + Cloudinary
> **Date:** February 18, 2026
