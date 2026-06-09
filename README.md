# Nexus: Investor & Entrepreneur Collaboration Platform

Nexus is a full-stack collaboration platform designed to connect visionary entrepreneurs with strategic investors.

## Key Features
- **Secure Authentication:** JWT-based login with role-based access control.
- **Profile Management:** Dynamic profiles for Investors and Entrepreneurs with professional data.
- **Meeting Scheduling:** Conflict-aware scheduling system for collaboration.
- **Real-time Video Calling:** Integrated peer-to-peer video communication via WebRTC and Socket.io.
- **Document Chamber:** Secure file storage with metadata tracking and e-signature support.
- **Payment Simulation:** Wallet and transaction management with atomic operations.
- **Real-time Messaging:** Database-persistent chat system.

## Technology Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io, WebRTC
- **File Storage:** Cloudinary
- **Security:** bcrypt, helmet, express-rate-limit

## Getting Started
1. Clone the repository.
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd nexus-frontend && npm install`
4. Configure your `.env` file based on `backend/.env.example`.
5. Run both servers using `npm run dev`.
