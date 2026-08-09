<div align="center">

# 🅿️ ParkPulse

### Full-Stack Parking Management System

A modern parking operations platform built to modernize and streamline day-to-day parking — from **real-time slot tracking** and **automated billing** to **membership management** and **AI-assisted support**.

<br/>

![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java%2017-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT%20Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![H2](https://img.shields.io/badge/H2%20DB-013C59?style=for-the-badge&logo=h2database&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## ✨ Overview

ParkPulse is a full-stack parking management platform serving **two audiences**:

- **Members** get a self-service experience — a 6-step registration wizard, personal QR membership passes, vehicle registration, plan selection, and booking (reserving) a spot from the live slot map.
- **Operators & Administrators** get complete control — real-time occupancy across zones, ticketing & billing, staff administration with granular permissions, membership/plan management, reporting, analytics dashboards, and a context-aware AI assistant ("Parker").

The backend follows a **Controller → Service → Repository → Model** architecture with **dual persistence**: flat-file storage for rapid prototyping and JPA/MySQL for production. Prices are displayed in **Sri Lankan Rupees (LKR)**.

---

## ✨ Features

<table align="center">
  <tr>
    <td align="center" width="33%">
      <strong>🗺️ Live Parking Map</strong><br/>
      Color-coded slot grids (Available / Taken / Reserved / Maintenance), 6 zones, overflow alerts, real-time occupancy.
    </td>
    <td align="center" width="33%">
      <strong>🎟️ Automated Ticketing & Billing</strong><br/>
      Time-based fee computation per vehicle type at LKR rates, card + cash (with change) checkout, full history.
    </td>
    <td align="center" width="33%">
      <strong>🧑‍🤝‍🧑 Memberships & Plans</strong><br/>
      3 tiers (Basic / Professional / Premium), monthly & annual billing, multi-vehicle registration.
    </td>
  </tr>
  <tr>
    <td align="center" width="40%">
      <strong>📅 Reservations</strong><br/>
      Members reserve a slot from their registered vehicles; full life cycle: reserved → active → completed / cancelled.
    </td>
    <td align="center" width="33%">
      <strong>🔐 Granular Access Control</strong><br/>
      JWT (24h) auth with 5 role levels + 14 granular permissions and MFA / session / lockout settings.
    </td>
    <td align="center" width="33%">
      <strong>📊 Reports & Analytics</strong><br/>
      Occupancy, revenue, peak hours, weekly traffic and membership insights with recharts visualizations.
    </td>
  </tr>
  <tr>
    <td align="center" width="40%">
      <strong>💬 Parker AI Assistant</strong><br/>
      Context-aware chat answering with live slot, ticket and member data (role-scoped answers).
    </td>
    <td align="center" width="33%">
      <strong>📱 QR Membership Pass</strong><br/>
      Every member gets a scannable QR code (ZXing) used to verify membership at the gate.
    </td>
    <td align="center" width="33%">
      <strong>🌍 International Readiness</strong><br/>
      Multi-currency (LKR default), multi-timezone facility configuration, dark mode & auto-refresh.
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer           | Technology |
|-----------------|------------|
| **Backend**     | Spring Boot `3.2.2`, Java `17`, Spring Security + JWT `0.11.5`, Spring Data JPA, ModelMapper |
| **Frontend**    | React `18`, TypeScript, Vite `6`, Tailwind CSS `4`, shadcn/ui (Radix), recharts |
| **Database**    | H2 (file-based, default), MySQL (production profile) |
| **Persistence** | Layered dual-storage: JPA repositories + flat-file / in-memory fallbacks |
| **Libraries**   | iText 7 (report generation), ZXing (QR codes), Groq (AI chat) |

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+**
- **Node.js 18+** and npm

### 1. Start the Backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

> The backend runs on **`http://localhost:8080`** using an H2 file database (automatically seeded on first run).
> **H2 console:** `http://localhost:8080/h2-console`
>
> **Using MySQL instead?** Create the database (see `backend/src/main/resources/init-mysql.sql`), then enable the profile:
> ```bash
> mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
> ```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts at **`http://localhost:5173`**.

---

## 🔑 Default Accounts

| Role                    | Username            | Password     | Access                           |
|-------------------------|---------------------|--------------|----------------------------------|
| 👑 **Admin**            | `admin`             | `admin123`   | Full system access              |
| 👷 **Staff (15)**       | `staff1` … `staff15` | `staff123`   | Per assigned access level        |
| 👤 **Members (30)**     | `member1` … `member30` | `member123` | Member portal & self-service |

---

## 🗂️ Seed Data

On first boot the system seeds a realistic dataset (deterministic, `Random(42)`):

| Data                    | Details |
|-------------------------|-------------|
| 🅿️ **Zones**            | 6 zones · **45 slots** · LKR rates 150–250/hr (EV & Valet premium) |
| 💳 **Plans** | Basic රු1,500/mo · Professional රු3,000/mo · Premium රු5,000/mo |
| 👤 **Members** | 30 members, 1–3 registered vehicles each |
| 👷 **Staff** | 15 staff across all access levels |
| 📋 **Tickets** | ~60 tickets (45 finished / 15 ongoing) |
| 📅 **Reservations** | 25 with mixed statuses |
| 🚗 **Sessions** | ~150 hourly-occupancy sessions across 7 days |

The seeder is **idempotent** — on subsequent boots it only repairs slot states, backfills member vehicles, and refreshes rates/prices to current LKR values.

---

## 🛡️ Roles & Permissions

| Access Level | Capabilities |
|--------------|--------------|
| **admin** | Everything (`*`) |
| **manager** | Dashboard, analytics, reports, tickets, parking, staff & member management, all settings |
| **operator** | Dashboard, parking slots, tickets |
| **viewer** | Read-only dashboard |
| **member** | Self-service: reserve slots, manage profile/password, view subscription & QR |
| **custom** | Fine-grained custom permission checklists |

---

## 🔌 API Overview

| Base Path            | Purpose |
|----------------------|--------------------|
| `/api/auth`          | Login (admin / staff / member), verify & change password |
| `/api/parking`       | Slots, zones, sessions, peak hours, checkout |
| `/api/reservations`  | Reservation create / check-in / complete / cancel |
| `/api/tickets`       | Ticket records, filters, checkout |
| `/api/members`       | Member CRUD, suspend/activate, QR code |
| `/api/plans`         | Plan CRUD + savings calculation |
| `/api/staff`         | Staff CRUD, avatars, access levels |
| `/api/reports`       | Report generation, stats, download |
| `/api/settings`      | General, security, zones, access-control, history |
| `/api/chat`          | Parker AI assistant (JWT-authenticated) |
| `/api/payments`      | Card validation (Luhn) & username availability |

---

## 📝 Notes

- **AI Assistant:** Requires an optional `AI_API_KEY` (OpenAI-compatible). When unset, the chat responds with a helpful "not configured" message.
- **Rates:** All parking and plan pricing is in **Sri Lankan Rupees (LKR)** — historical tickets keep their recorded amounts.
- **Docs:** A detailed feature inventory lives in [`docs/SYSTEM_OVERVIEW.md`](docs/SYSTEM_OVERVIEW.md).

---

<div align="center">

**Built with 💙 for the WD16 team — ParkPulse**

</div>
