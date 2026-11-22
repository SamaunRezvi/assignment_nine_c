# FixMate

FixMate is an on-demand device and home appliance repair service booking platform. Customers send repair requests to verified technicians, track every job through a clear status pipeline, and pay only after the work is completed.

## Purpose

Finding a trustworthy repair technician is hard, and paying before any work is done is risky. FixMate fixes both sides of that problem: every booking has a visible status from request to completion, and payment only happens once the job is marked done.

## Live URL

https://fixmate-nu-five.vercel.app

## Test Accounts

All seeded accounts use the password `Password123`.

- Admin: admin@fixmate.test
- Technician: rafiq.technician@fixmate.test
- Technician: nadia.technician@fixmate.test
- Customer: tanvir.customer@fixmate.test
- Customer: sumaiya.customer@fixmate.test

## Key Features

- Role-based dashboards for customers, technicians and admins
- BetterAuth authentication with email and password, plus JWT-protected API routes
- Server-side search, filter, sort and pagination on the services listing
- Strict server-enforced job status pipeline (requested, accepted, in-progress, completed, rejected, cancelled)
- Stripe Checkout for pay-after-service payments with success and cancel pages
- ImgBB image uploads for service listings and profile photos
- Admin tools for user role management, service approval and platform-wide monitoring
- Responsive design across public pages and dashboards, with toasts, empty states and confirmation modals throughout

## Tech Stack

- Next.js (App Router), TypeScript
- Tailwind CSS, shadcn/ui
- BetterAuth (client)
- Stripe Checkout
- ImgBB API

## npm Packages Used

next, react, react-dom, tailwindcss, better-auth, date-fns, lucide-react, sonner, and the shadcn/ui component set (radix primitives, class-variance-authority, clsx, tailwind-merge)

## Environment Variables

See `.env.example`: server URL, client URL, and ImgBB API key.
