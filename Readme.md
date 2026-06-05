# Invitely - AI-Powered WhatsApp Invitation Management SaaS

Invitely is a modern, multi-tenant SaaS platform designed to automate the extraction, management, and tracking of social invitations via WhatsApp. Specifically tailored for Indian social events, it combines advanced AI with a seamless dashboard experience to simplify event coordination.

## 🚀 Key Features

### 🤖 AI & WhatsApp Automation
- **AI Card Extraction**: Forward any invitation card (Image/PDF) to the WhatsApp bot. Using Google Gemini 1.5 Flash, it automatically extracts names, dates, times, venues, and contact details.
- **Native RSVP Tracking**: Guests can RSVP directly within WhatsApp. The bot tracks responses (Accepted/Declined/Pending) and updates the dashboard in real-time.
- **Bilingual Bot**: Fully understands and responds in both **English and Hindi**. Supports natural language queries like *"आज क्या है?"* or *"Upcoming events this week"*.
- **Automated Reminders**: Intelligent scheduling of reminders (1 hour before events) and daily briefings (6:00 AM IST) powered by BullMQ and Redis.

### 🏢 Multi-Tenant Dashboard (Admin)
- **Event Dashboard**: Visualize all extracted events, RSVP statuses, and delivery metrics.
- **Template Builder**: Create and manage WhatsApp message templates for invitations and reminders.
- **User Management**: Manage guest lists, link phone numbers, and track individual guest interactions.
- **Bilingual Interface**: Toggle the entire dashboard between English and Hindi with a single click.

### 👤 Guest & User Portal
- **Public Registration**: A dedicated landing page for guests to register their phone numbers and join an organization's invitation list.
- **User Dashboard**: Simplified, role-based dashboard for guests to view their own invitations and manage notification preferences.

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB (Mongoose)
- Redis (BullMQ for task queuing)
- Google Gemini AI (AI Extraction)
- Twilio API (WhatsApp Integration)
- Cloudinary (Media Storage)

**Frontend:**
- React (Vite)
- Tailwind CSS & Shadcn UI
- Lucide React (Icons)
- React Hot Toast (Notifications)
- Framer Motion (Animations)

## 📂 Project Structure

```text
├── backend/            # Express server, AI logic, and Schedulers
│   ├── controllers/    # API & Webhook handlers
│   ├── helpers/        # AI extraction, PDF gen, & BullMQ workers
│   ├── models/         # Mongoose schemas (Organization, User, Event)
│   ├── routes/         # API & Webhook endpoints
│   └── scripts/        # Seeding and utility scripts
├── whatsapp-bot/       # React (Vite) Frontend Dashboard
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── Pages/      # Dashboard, Events, Registration, etc.
│   │   └── lib/        # Auth and Translation contexts
└── README.md
```

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis instance (Local or Managed)
- Twilio Account (with WhatsApp Sandbox or API enabled)
- Google Gemini API Key

### Installation

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd Whatsapp-Invitation-Management-Bot
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create .env based on backend/.env.example
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../whatsapp-bot
   npm install
   # Create .env with VITE_API_URL=http://localhost:3000
   npm run dev
   ```

## 🤖 Bot Commands
- **Forward Media**: Send/Forward any invitation image to save it.
- **"Today" / "आज"**: Get a list of today's events.
- **"Upcoming" / "आगामी"**: View all future scheduled events.
- **"Search [Event]"**: Search for specific events by keyword.

## 📝 License
This project is licensed under the ISC License.
