import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, DollarSign, AlertTriangle, Bug, Lock } from 'lucide-react';

interface Bounty {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reward: string;
  description: string;
  category: string;
}

const bugBounties: Bounty[] = [
  {
    id: '1',
    title: 'SQL Injection Vulnerability',
    severity: 'Critical',
    reward: '$5,000 - $10,000',
    description: 'Find and report SQL injection vulnerabilities in our authentication system or vault operations.',
    category: 'Database Security'
  },
  {
    id: '2',
    title: 'Cross-Site Scripting (XSS)',
    severity: 'High',
    reward: '$2,000 - $5,000',
    description: 'Discover XSS vulnerabilities that could compromise user sessions or stored credentials.',
    category: 'Web Security'
  },
  {
    id: '3',
    title: 'Authentication Bypass',
    severity: 'Critical',
    reward: '$8,000 - $15,000',
    description: 'Report methods to bypass 2FA, device fingerprinting, or email verification.',
    category: 'Authentication'
  },
  {
    id: '4',
    title: 'Encryption Weakness',
    severity: 'Critical',
    reward: '$10,000 - $20,000',
    description: 'Find vulnerabilities in our AES-256 encryption implementation or password storage.',
    category: 'Cryptography'
  },
  {
    id: '5',
    title: 'Session Management Flaws',
    severity: 'High',
    reward: '$3,000 - $6,000',
    description: 'Identify issues with JWT token handling, session timeout, or activity tracking.',
    category: 'Session Security'
  },
  {
    id: '6',
    title: 'API Security Issues',
    severity: 'High',
    reward: '$2,500 - $5,000',
    description: 'Report unauthorized API access, rate limiting bypass, or endpoint vulnerabilities.',
    category: 'API Security'
  },
  {
    id: '7',
    title: 'Device Trust Exploitation',
    severity: 'Medium',
    reward: '$1,500 - $3,000',
    description: 'Find ways to spoof device fingerprints or bypass device approval mechanisms.',
    category: 'Device Security'
  },
  {
    id: '8',
    title: 'Password Reset Vulnerabilities',
    severity: 'High',
    reward: '$2,000 - $4,500',
    description: 'Discover flaws in password reset flow, TOTP verification, or token generation.',
    category: 'Authentication'
  },
  {
    id: '9',
    title: 'Information Disclosure',
    severity: 'Medium',
    reward: '$1,000 - $2,500',
    description: 'Report leakage of sensitive information through headers, errors, or API responses.',
    category: 'Information Security'
  },
  {
    id: '10',
    title: 'CSRF Vulnerabilities',
    severity: 'Medium',
    reward: '$1,500 - $3,500',
    description: 'Find Cross-Site Request Forgery vulnerabilities in state-changing operations.',
    category: 'Web Security'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-600 hover:bg-red-700';
    case 'High':
      return 'bg-orange-600 hover:bg-orange-700';
    case 'Medium':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'Low':
      return 'bg-blue-600 hover:bg-blue-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
  }
};

const BugBounty = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Bug className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-glow">Bug Bounty Program</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Help us secure CLUPSO Vault and earn rewards
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Prize Pool Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card border-primary/40 mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Total Prize Pool</h3>
                    <p className="text-3xl font-bold text-primary">$50,000+</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-muted-foreground mb-2">Active Bounties</p>
                  <p className="text-2xl font-bold">{bugBounties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Program Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    In Scope
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Authentication & Authorization</li>
                    <li>• Encryption & Cryptography</li>
                    <li>• API Security</li>
                    <li>• Session Management</li>
                    <li>• Device Fingerprinting</li>
                    <li>• XSS, CSRF, SQL Injection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Rules
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• No DoS/DDoS attacks</li>
                    <li>• No social engineering</li>
                    <li>• No physical security testing</li>
                    <li>• Do not access user data</li>
                    <li>• Report privately, not publicly</li>
                    <li>• One bounty per vulnerability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bounty Listings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">Active Bounties</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {bugBounties.map((bounty, index) => (
              <motion.div
                key={bounty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="gradient-card border-border hover:border-primary/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg">{bounty.title}</CardTitle>
                      <Badge className={getSeverityColor(bounty.severity)}>
                        {bounty.severity}
                      </Badge>
                    </div>
                    <CardDescription>{bounty.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {bounty.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-500">{bounty.reward}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="gradient-card border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Found a Vulnerability?</h3>
                <p className="text-muted-foreground mb-4">
                  Report security issues to <span className="text-primary font-semibold">security@clupso.com</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  All reports will be reviewed within 48 hours. Valid submissions receive rewards within 7 business days.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BugBounty;
