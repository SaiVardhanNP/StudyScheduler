# 📚 StudyScheduler - Plan, Focus, Succeed

A productivity app to **schedule study blocks, get reminders, and track progress**.  
Built with **Next.js**, **Supabase**, **MongoDB**, and **Tailwind CSS** for a seamless, modern experience.  

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white) 
![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61dafb) 
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) 
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white) 
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

---

## 🚀 Features

- ⏰ **Smart Reminders**: Email alerts 10 minutes before a study block starts.
- 🗓️ **Block Scheduling**: Create study sessions with subjects, priorities, and timings.
- 📊 **Progress Tracking**: Track completed and upcoming sessions easily.
- 🌙 **Modern UI**: Built with Tailwind CSS + Lucide Icons for a sleek experience.
- 🔐 **Authentication**: Supabase-powered login/signup with secure sessions.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15, React 18
- **Database:** MongoDB (Mongoose ODM)
- **Auth & Storage:** Supabase
- **Styling:** Tailwind CSS + ShadCN UI + Lucide Icons
- **Email Notifications:** Nodemailer (Gmail)
- **Language:** TypeScript

---

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- A MongoDB Atlas connection string
- Supabase project with service role + anon key
- Gmail App Password (for email reminders)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/SaiVardhanNP/StudyScheduler.git
cd StudyScheduler
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Setup environment variables**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MONGODB_URL=your-mongodb-url
EMAIL_USER=your-gmail@example.com
EMAIL_PASS=your-gmail-app-password
CRON_SECRET=your-cron-secret
```

4. **Run the development server**
```bash
npm run dev
```
Now open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧩 Folder Structure

```
StudyScheduler/
├── app/                # Next.js App Router
│   ├── (auth)/         # Signup / Signin pages
│   ├── dashboard/      # Dashboard UI
│   └── api/            # API Routes (blocks, cron, etc.)
├── components/         # Reusable components (modals, UI)
├── lib/                # Supabase & MongoDB configs
├── models/             # Mongoose Schemas
├── public/             # Static assets (logo, icons)
├── styles/             # Global styles
├── package.json
└── README.md
```

---

## ⚡ Deployment

- **Vercel** → Deploy frontend + API Routes  
- **Cron Jobs** →  
  - Free plan: daily jobs only  
  - For 5-minute reminders → use **Railway / Cron-job.org / GitHub Actions**

Your cron will hit:
```
https://your-app.vercel.app/api/cron-reminders
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

👨‍💻 Built with ❤️ by **[SaiVardhanNP](https://github.com/SaiVardhanNP)**
