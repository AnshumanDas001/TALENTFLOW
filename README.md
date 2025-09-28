# 🚀 TALENTFLOW: Full-Stack Job Portal UI 🔥

Modern, full-stack job portal UI built with **React**, **Tailwind CSS**, and **Shadcn UI**, featuring candidate tracking and role-specific assessments.



## ✨ Overview

`TALENTFLOW` is a robust React + Vite application designed to simulate a professional job portal environment for managing jobs, candidates, and assessments. It provides a clean, responsive, and feature-rich interface for both job seekers (public board) and employers (management views).

---

## 🔑 Key Features

### 💼 Jobs Management
* **CRUD Operations:** Easily create, edit, archive, and reorder job postings.
* **Public Job Board:** A searchable, filterable, and paginated `/jobs` page.
* **Detailed Views:** Individual job detail pages at `/jobs/:id`.
* **Assessment Link:** Direct link to role-specific assessments on job cards: `/assessments/:jobId`.

### 👥 Candidate Tracking
* **Browse & Search:** Comprehensive list and search functionality for candidates.
* **Kanban & List Views:** Flexible views with **drag-and-drop** functionality to update a candidate's stage (e.g., Application, Screening, Interview).
* **Candidate Profile:** Dedicated page with a timeline and notes (render-only in this mock).

### 📝 Assessments
* **Assessment Builder:** Index view and a dedicated builder for creating per-job assessments.
* **Submission Flow:** Simulate submitting candidate responses via the mock backend.

### 🎨 UI/UX & Technology
* **Modern Design:** Clean, responsive layout with a dark theme option.
* **Tech Stack:** TailwindCSS for utility-first styling, **Radix UI** primitives, and **shadcn-style components** for accessible, composable UI.
* **Authentication:** Auth-enabled workflows using **Clerk** (optional/simulated) to protect employer features.

---

## 🛠 Technical Decisions

| Aspect | Technology/Decision | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React** + **Vite** | Fast development, hot module replacement, and efficient builds. |
| **Styling** | **TailwindCSS**, **Radix UI**, **Shadcn UI** | Utility-first styling for speed and accessible, high-quality components. |
| **Mock Backend** | **MirageJS** | Simulates a full API with endpoints under `/api`, allowing rapid frontend development without a live server setup. |
| **State Management** | Local Component State + Lightweight Hooks | Keeps the application simple and performant for this project's scope. |
| **Drag and Drop** | **@dnd-kit/\*** | Modern, modular, and accessible library for Kanban drag-and-drop. |
| **Auth** | **Clerk** (Integrated Logic) | Provides secure, production-ready authentication workflows. |

---

## 📦 Setup & Installation

### Prerequisites
Ensure you have the following installed:
* **Node.js** (version 18+)
* **npm** or **yarn**

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone [YOUR_REPO_URL_HERE]
    cd talentflow
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn
    ```

3.  **Run the App Locally**
    The app will run using the integrated **MirageJS** mock server.
    ```bash
    npm run dev
    ```

---

## 🗺 Instructions & Routes

Once the application is running, explore the following key routes:

| Route | Description | Action |
| :--- | :--- | :--- |
| **`/`** | Landing Page | Explore the product and quick feature links. |
| **`/jobs`** | Find Jobs | Search, filter, and browse all public job postings. |
| **`/jobs/create`** | Post a Job | Create a new job role (Employer feature). |
| **`/jobs/:id`** | Job Details | View specific job content and available actions. |
| **`/candidates`** | Candidate Manager | Manage candidates in List or **Kanban** drag-and-drop views. |
| **`/assessments`** | Assessments Index | View and build role-specific assessments. |
| **`/assessments/:jobId`** | Assessment Link | Take a mock assessment for a specific job. |

---

## 🛠 Technical Decisions and Issues

* **Framework**: **React + Vite** for fast development, hot module replacement, and efficient builds.
* **Styling**: **TailwindCSS** for utility-first styling. **Radix UI primitives** and **shadcn-style components** for accessible, composable UI elements.
* **Mock Backend**: **MirageJS** stands in for a full API with endpoints under `/api`. This enables quick, serverless iteration and development.
* **State Management**: Utilizes simple **Local component state** and **lightweight hooks**.
* **Drag and Drop (DnD)**: Implemented using the modern and accessible library **`@dnd-kit/*`**.
* **Assessments Data**: Assessment data is stored within the **MirageJS database**, keyed by `jobId`. Submitting an assessment creates a mock response entry in the database.

---

---

## 🖼 Screenshots

* **Landing Page**

* **Jobs Board**

* **Candidates (Kanban View)**

* **Assessment Builder**
