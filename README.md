ParkPulse — Full-Stack Parking Management System
ParkPulse is a full-stack parking management platform built to modernize and streamline day-to-day parking operations — from real-time slot tracking to staff administration and AI-assisted support.
Built on a Spring Boot 3.2.2 (Java 17) backend with Spring Security + JWT authentication, and a React 18 + TypeScript frontend styled with Tailwind CSS 4 and shadcn/ui, ParkPulse combines a modern, type-safe SPA experience with a robust, layered backend architecture (Controller → Service → Repository → Model). It supports dual persistence — flat-file storage for rapid development and JPA/MySQL for production — letting the system scale from prototype to deployment without a rewrite.
Key capabilities:

Real-time parking management — color-coded slot grids, live occupancy tracking, and overflow alerts across multiple zones and vehicle types
Granular access control — 5 role levels and 14 custom permissions for fine-tuned staff and admin access
Full membership lifecycle — self-service registration through a 6-step wizard, tiered billing plans, and status tracking
Automated ticketing and fee computation — with multi-payment support and full history
Reporting and analytics — dashboards with revenue and occupancy charts, plus PDF/CSV/Excel report generation via iText 7
Parker AI — a context-aware chatbot (powered by Groq's LLM API) that answers queries using live parking data

ParkPulse was built as a team project with an emphasis on clean architecture, international readiness (multi-currency and multi-timezone support), and a genuinely usable interface — aiming to feel less like a course assignment and more like a product.
