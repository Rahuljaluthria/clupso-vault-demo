# CLUPSO Vault - Secure Password Manager

A modern, secure password management application with advanced security features including device fingerprinting, multi-device trust management, and two-factor authentication.

## 🔐 Features

### Security
- **AES-256 Encryption** - All passwords encrypted before storage
- **Two-Factor Authentication (2FA)** - TOTP-based using Google Authenticator
- **Device Fingerprinting** - Unique identification for each browser/device
- **Multi-Device Trust** - Manage trusted devices with automatic 5-day expiry
- **Email-Based Approval** - New device logins require email verification
- **Session Timeout** - Automatic logout after 7 minutes of inactivity
- **Activity Logging** - Track all account actions

### User Features
- Secure credential storage
- Directory organization
- Password recovery with TOTP verification
- Trusted device management
- Real-time activity monitoring
- Beautiful, responsive UI

## 🚀 Live Demo

- **Frontend**: [https://clupso-vault-demo.onrender.com](https://clupso-vault-demo.onrender.com)
- **Backend API**: [https://clupso-backend.onrender.com](https://clupso-backend.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **FingerprintJS** - Device identification
- **React Router v6** - Navigation

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Speakeasy** - TOTP generation
- **MailerSend** - Email service

### Deployment
- **Render.com** - Hosting (Frontend & Backend)
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control & CI/CD

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- MailerSend API key (for emails)

### Frontend Setup

```sh
# Clone the repository
git clone https://github.com/Rahuljaluthria/clupso-vault-demo.git
cd clupso-vault-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```sh
# Clone the backend repository
git clone https://github.com/Rahuljaluthria/clupso-backend.git
cd clupso-backend

# Install dependencies
npm install

# Create .env file with required variables (see below)

# Build the project
npm run build

# Start development server
npm run dev

# Or start production server
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/clupso
JWT_SECRET=your_super_secret_jwt_key
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxx
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

### Frontend
API endpoint is configured in source code as:
```typescript
const API_URL = 'https://clupso-backend.onrender.com/api';
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/signin` | Login with device check |
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/setup-totp` | Enable 2FA |
| POST | `/api/auth/verify-totp` | Verify 2FA setup |

### Password Recovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password/verify-email` | Send reset code |
| POST | `/api/auth/forgot-password/verify-totp` | Verify TOTP |
| POST | `/api/auth/forgot-password/reset` | Reset password |

### Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/approve-device` | Approve device (email link) |
| GET | `/api/auth/trusted-devices` | List trusted devices |
| DELETE | `/api/auth/trusted-devices/:id` | Revoke device |

### Vault Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vault/credentials` | Add credential |
| GET | `/api/vault/credentials` | List credentials |
| PUT | `/api/vault/credentials/:id` | Update credential |
| DELETE | `/api/vault/credentials/:id` | Delete credential |
| POST | `/api/vault/directories` | Create directory |
| GET | `/api/vault/directories` | List directories |

## 🔒 Security Features Explained

### Device Fingerprinting
Each browser/device combination gets a unique fingerprint based on:
- Browser type and version
- Operating system
- Screen resolution, timezone, language
- Hardware specifications
- Canvas and WebGL fingerprinting

### Trust Management
- **First Device**: Automatically trusted on signup
- **New Devices**: Require email approval
- **Trust Duration**: 5 days per device
- **Auto-Expiry**: Devices automatically untrusted after expiration

### Email Approval Flow
1. User attempts login from new device
2. System sends approval email with secure link
3. User clicks link within 10 minutes
4. Device added to trusted list for 5 days
5. User can now login without re-approval

### Session Security
- JWT tokens expire after 7 minutes
- Activity tracking monitors user interaction
- Automatic logout on inactivity
- Secure token storage

## 🎨 Project Structure

```
clupso-vault-demo/          # Frontend
├── src/
│   ├── components/         # UI components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities (encryption, fingerprint)
│   ├── pages/             # Page components
│   └── integrations/      # Third-party integrations
├── public/                # Static assets
└── package.json

clupso-backend/            # Backend
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utilities (email service)
│   └── config/           # Configuration
└── package.json
```

## 📝 Database Schema

### User Model
```typescript
{
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  totpSecret: String,
  totpEnabled: Boolean,
  trustedDevices: [{
    deviceId: String,
    browser: String,
    os: String,
    addedAt: Date,
    trustedUntil: Date
  }],
  pendingDevice: {
    deviceId: String,
    token: String,
    browser: String,
    os: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Activity Log Model
```typescript
{
  userId: ObjectId,
  action: String,
  details: String,
  timestamp: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Rahul Jaluthria**
- GitHub: [@Rahuljaluthria](https://github.com/Rahuljaluthria)

## 🙏 Acknowledgments

- FingerprintJS for device identification
- MailerSend for email service
- shadcn/ui for beautiful components
- Render.com for free hosting

---

**Note**: This is a portfolio/learning project. For production use, ensure proper security audits and compliance with data protection regulations.
