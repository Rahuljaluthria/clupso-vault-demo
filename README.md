# CLUPSO Vault - Password Management System

A secure, full-stack password vault application with end-to-end encryption, 2FA, and device fingerprinting.

## 🏗️ Monorepo Structure

```
clupso-vault/
├── backend/                # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Authentication middleware
│   │   ├── models/        # MongoDB models (User, Credential, Directory, ActivityLog)
│   │   ├── routes/        # API routes (auth, vault)
│   │   ├── scripts/       # Utility scripts
│   │   └── utils/         # Helper functions (email, activity logger)
│   ├── package.json
│   └── tsconfig.json
├── src/                    # React + TypeScript Frontend
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (encryption, MongoDB client)
│   ├── pages/             # Application pages
│   └── main.tsx
├── public/                # Static assets
├── package.json           # Root package.json with monorepo scripts
└── README.md
```

## ✨ Features

### Security
- 🔐 **AES-256 Encryption** - Client-side encryption for all credentials
- 🔑 **2FA with TOTP** - Google Authenticator integration
- 🖥️ **Device Fingerprinting** - Trusted device management (5-day validity)
- 📧 **Email Verification** - OTP-based email verification
- 🔒 **Password Requirements** - Strong password enforcement
  - Minimum 7 characters
  - At least 3 special characters
  - Cannot contain email username
- 📊 **Activity Logging** - Track all user actions with IP, browser, OS

### Password Management
- 📁 **Directory Organization** - Organize credentials in folders
- 🔍 **Search & Filter** - Quick credential lookup
- 👁️ **Password Visibility Toggle** - View passwords securely
- 📋 **Copy to Clipboard** - One-click password copying
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

### Additional Features
- 🐛 **Bug Bounty Program** - Public security bounty page
- 📱 **Responsive Design** - Works on all devices
- 🌊 **Liquid Ether Animation** - Interactive background effects
- 🔔 **Real-time Notifications** - Toast notifications for actions

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Rahuljaluthria/clupso-vault-demo.git
cd clupso-vault-demo
```

2. **Install all dependencies (frontend + backend)**
```bash
npm run install:all
```

Or install separately:
```bash
# Frontend dependencies
npm install

# Backend dependencies
npm run install:backend
```

3. **Configure environment variables**

Create `backend/.env` file:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Email Service (MailerSend)
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_SENDER=your_verified_sender_email

# Server
PORT=3000
```

Create `.env` file in root (for frontend):
```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

**Development Mode - Run both frontend and backend:**
```bash
npm run dev:all
```

**Or run separately:**
```bash
# Frontend only (http://localhost:5173)
npm run dev

# Backend only (http://localhost:3000)
npm run dev:backend
```

**Production Build:**
```bash
npm run build:all
```

## 📦 Available Scripts

### Root Level Scripts
- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run build:backend` - Build backend for production
- `npm run build:all` - Build both frontend and backend
- `npm run install:backend` - Install backend dependencies
- `npm run install:all` - Install all dependencies
- `npm run lint` - Run ESLint on frontend code

### Backend Scripts (from `/backend` directory)
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Router** - Routing
- **CryptoJS** - Client-side encryption
- **FingerprintJS** - Device fingerprinting

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Speakeasy** - TOTP generation
- **MailerSend** - Email service
- **Nodemon** - Development server

## 🔐 Security Implementation

### Password Encryption Flow
1. User enters password in frontend
2. AES-256 encryption using user's master key (derived from login)
3. Encrypted password stored in MongoDB
4. Decryption only happens client-side when viewing

### Authentication Flow
1. User registers with email + password
2. Email OTP verification sent
3. User sets up TOTP (Google Authenticator)
4. Device fingerprint captured and stored
5. JWT token issued (7-minute expiry)
6. Trusted devices valid for 5 days

### Activity Logging
All user actions tracked with:
- IP Address (from x-forwarded-for or x-real-ip headers)
- Browser information
- Operating System
- Device ID
- Success/failure status
- Timestamp

## 🌐 Deployment

### Frontend (Render/Vercel/Netlify)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables in platform dashboard

### Backend (Render/Railway/Heroku)
1. Root directory: `backend`
2. Build command: `npm run build`
3. Start command: `npm start`
4. Set environment variables in platform dashboard

### Monorepo Deployment
You can deploy as separate services or use the monorepo structure with different build configurations.

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/setup-totp` - Setup 2FA
- `POST /api/auth/verify-totp` - Verify TOTP code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/approve-device` - Approve trusted device
- `DELETE /api/auth/revoke-device/:deviceId` - Revoke device
- `GET /api/auth/trusted-devices` - Get user's trusted devices

### Vault Endpoints
- `GET /api/vault/directories` - Get all directories
- `POST /api/vault/directories` - Create directory
- `PUT /api/vault/directories/:id` - Update directory
- `DELETE /api/vault/directories/:id` - Delete directory
- `GET /api/vault/credentials` - Get all credentials
- `POST /api/vault/credentials` - Create credential
- `PUT /api/vault/credentials/:id` - Update credential
- `DELETE /api/vault/credentials/:id` - Delete credential
- `GET /api/vault/activity-log` - Get activity log

## 🐛 Bug Bounty Program

We value security! Visit `/bug-bounty` to see our active security bounties.

**Scope:**
- Authentication & Authorization
- Encryption & Cryptography
- API Security
- Session Management
- Device Fingerprinting
- XSS, CSRF, SQL Injection

**Rewards:** $1,000 - $20,000 per valid vulnerability

## 📄 License

This project is private and proprietary.

## 👤 Author

**Rahul Jaluthria**
- GitHub: [@Rahuljaluthria](https://github.com/Rahuljaluthria)

## 🤝 Contributing

This is a private project. Contributions are not accepted at this time.

## 📞 Support

For security issues, contact: security@clupso.com

---

Built with ❤️ using React, Node.js, and MongoDB
