import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Lock, KeyRound, Activity } from 'lucide-react';
import heroImage from '@/assets/hero-security.jpg';
import LiquidEther from '@/components/LiquidEther';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* LiquidEther Background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther 
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
            autoDemo={true}
            autoSpeed={0.3}
            autoIntensity={1.5}
            mouseForce={30}
            cursorSize={150}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/90 pointer-events-none"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-4 text-glow">
                CLUPSO
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Your Secure Cloud Password Vault
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-xl mb-12 text-foreground/80 max-w-2xl mx-auto"
            >
              Military-grade AES-256 encryption. Two-factor authentication. 
              Complete control over your digital life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="gradient-primary shadow-glow hover:shadow-intense transition-all duration-300">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Enterprise-Grade Security
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'AES-256 Encryption',
                description: 'Military-grade encryption protects your passwords',
              },
              {
                icon: KeyRound,
                title: '2FA Security',
                description: 'Time-based OTP verification for enhanced protection',
              },
              {
                icon: Lock,
                title: 'Secure Vault',
                description: 'Organized directories for all your credentials',
              },
              {
                icon: Activity,
                title: 'Activity Tracking',
                description: 'Complete audit log of all vault activities',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="gradient-card p-6 rounded-lg border border-border hover:shadow-glow transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="gradient-card p-12 rounded-2xl border border-primary/20 shadow-glow"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Your Digital Life?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands who trust CLUPSO with their most sensitive credentials
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary shadow-intense hover:scale-105 transition-all duration-300">
                Create Your Vault
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
