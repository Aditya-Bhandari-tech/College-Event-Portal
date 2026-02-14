# 🎓 College Event Portal Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=flat&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg?style=flat&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-forestgreen.svg?style=flat&logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-6.x-red.svg?style=flat&logo=mongoose)
![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg?style=flat&logo=json-web-tokens)

This repository contains the robust backend API for the College Event Portal. It is designed to streamline event management, facilitate student participation, and provide administrative control through a secure and scalable architecture.

## 🚀 Project Overview

The EventPortal Backend is the central nervous system of the application, handling:

*   **🔐 Secure Authentication**: Multi-method login support (standard Email/Password + Google OAuth) with JWT session management.
*   **📅 Event Lifecycle**: Complete management of events from creation to public listing.
*   **📝 Approval Workflows**: A hierarchical system where students request events, and faculty/admins review and approve them.
*   **📢 Announcements**: A broadcast system for faculty to share important updates with students.
*   **🤝 Recruitments**: A module for event organizers to recruit volunteers and coordinators.
*   **👥 Role-Based Access Control (RBAC)**: Strict permission enforcement for Students, Faculty, and Admins.

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | High-performance JavaScript runtime. |
| **Express.js** | Minimalist web framework for routing and middleware. |
| **MongoDB** | NoSQL database for flexible data schemas. |
| **Mongoose** | Elegant object modeling for Node.js. |
| **JWT** | Stateless authentication mechanism. |
| **Google OAuth** | Seamless "Sign in with Google" integration. |
| **Bcrypt.js** | Industry-standard password hashing. |

## 🏗️ System Architecture

### User Roles
1.  **Student**:
    *   Browse active events and announcements.
    *   Request new events (requires approval).
    *   Apply for recruitment roles (volunteers, anchors, etc.).
2.  **Faculty**:
    *   Create and manage events directly.
    *   Approve or reject student event requests.
    *   Manage recruitments and view applicants.
    *   Post announcements.
3.  **Admin**:
    *   Superuser privileges.
    *   Manage user roles and accounts.
    *   Global content moderation (delete any event/announcement).

### Event Workflow
1.  **Submission**: A **Student** submits an event proposal. System status: `Pending`.
2.  **Review**: **Faculty/Admin** receives the request.
3.  **Decision**:
    *   **Approve**: Event is created and becomes visible to prompt.
    *   **Reject**: Request is closed with a review comment.

### Recruitment Module
*   **Faculty** creates a recruitment drive for an event (e.g., "Need 5 volunteers for TechFest").
*   **Students** apply via the portal.
*   **Faculty** reviews applicants and selects candidates.

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register new user | Public |
| `POST` | `/login` | Login & receive JWT | Public |
| `POST` | `/google` | Google OAuth Login | Public |
| `POST` | `/google/check` | Check if Google user exists | Public |

### 👤 User Management (`/api/users` & `/api/admin`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Get current profile | Authenticated |
| `GET` | `/admin/users` | List all users | **Admin** |
| `PATCH` | `/admin/users/:id/role` | Update user role | **Admin** |
| `DELETE` | `/admin/users/:id` | Delete user | **Admin** |

### 📅 Events (`/api/events`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all public events | Public |
| `GET` | `/:id` | Get event details | Public |
| `POST` | `/` | Create new event | **Faculty/Admin** |
| `PUT` | `/:id` | Update event | **Faculty/Admin** |
| `DELETE` | `/:id` | Delete event | **Admin** |

### 📝 Event Requests (`/api/event-requests`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submit event request | **Student** |
| `GET` | `/my` | View my requests | **Student** |
| `GET` | `/` | View all pending requests | **Faculty/Admin** |
| `PATCH` | `/:id/approve` | Approve request | **Faculty/Admin** |
| `PATCH` | `/:id/reject` | Reject request | **Faculty/Admin** |

### 📢 Announcements (`/api/announcements`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | View announcements | Public |
| `POST` | `/` | Post announcement | **Faculty/Admin** |
| `DELETE` | `/:id` | Delete announcement | **Admin** |

### 🤝 Recruitments (`/api/recruitments`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List open recruitments | Public |
| `POST` | `/:id/apply` | Apply for a role | **Student** |
| `GET` | `/:id/applicants` | View applicants | **Faculty/Admin** |
| `POST` | `/` | Create recruitment | **Faculty/Admin** |

## 📂 Folder Structure

```
backend/
├── config/             # DB Connection (db.js)
├── controllers/        # Business logic for Auth, Events, etc.
├── middleware/         # Auth verification & Error handling
├── models/             # Mongoose Schemas (User, Event, Recruitment...)
├── routes/             # API Route definitions
├── utils/              # Helpers (JWT generation, formatters)
├── server.js           # App Entry Point
└── .env                # Environment Variables (GitIgnored)
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eventportal
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🏃‍♂️ How to Run

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd backend
    npm install
    ```

2.  **Configure**
    *   Create `.env` file with your credentials.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    *Server runs on `http://localhost:5000` by default.*

4.  **Production Build**
    ```bash
    npm start
    ```

---
*Built for the College Event Portal Project.*