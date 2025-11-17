import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Zap, Building2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal use',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: '10 passwords storage', included: true },
      { text: '5 files (images, docs, audio)', included: true },
      { text: 'AES-256 encryption', included: true },
      { text: '2FA with TOTP', included: true },
      { text: 'Device fingerprinting', included: true },
      { text: 'Email support', included: false },
      { text: 'Priority support', included: false },
    ]
  },
  {
    name: 'Basic',
    price: 5000,
    period: 'year',
    description: 'Great for power users',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-primary to-purple-600',
    popular: true,
    features: [
      { text: '50 passwords storage', included: true },
      { text: '15 images', included: true },
      { text: '15 audio files', included: true },
      { text: '15 documents', included: true },
      { text: 'AES-256 encryption', included: true },
      { text: '2FA with TOTP', included: true },
      { text: 'Device fingerprinting', included: true },
      { text: 'Email support', included: true },
    ]
  },
  {
    name: 'Pro',
    price: 35000,
    period: 'year',
    description: 'For professional needs',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-600',
    features: [
      { text: 'Unlimited passwords', included: true },
      { text: '50 images included (₹200/image after)', included: true },
      { text: '40 audio files included (₹250/audio after)', included: true },
      { text: 'Unlimited documents', included: true },
      { text: 'AES-256 encryption', included: true },
      { text: '2FA with TOTP', included: true },
      { text: 'Device fingerprinting', included: true },
      { text: 'Priority support', included: true },
    ]
  }
];

const Subscription = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') {
      toast.info('You are already on the Free plan!');
    } else {
      toast.success(`${planName} plan selected! Payment integration coming soon.`);
    }
  };

  const handleB2BContact = () => {
    toast.info('Opening email client for B2B inquiries...');
    window.location.href = 'mailto:business@clupso.com?subject=B2B Plan Inquiry';
  };

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
            onClick={() => navigate('/vault')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Button>
          
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-glow mb-2">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-lg">
              Select the perfect plan for your security needs
            </p>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`gradient-card border-border h-full ${plan.popular ? 'border-primary/50 shadow-glow' : ''}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 text-white`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                        <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? 'gradient-primary shadow-glow' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.name === 'Free' ? 'Current Plan' : `Get ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* B2B Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="gradient-card border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Business to Business (B2B)</h3>
                    <p className="text-muted-foreground">
                      Custom enterprise solutions with dedicated support, team management, and advanced security features
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleB2BContact}
                  className="gradient-primary shadow-glow whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact for Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>All plans include end-to-end AES-256 encryption and secure device management</p>
          <p className="mt-2">Prices are in Indian Rupees (₹). Payment integration coming soon.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
