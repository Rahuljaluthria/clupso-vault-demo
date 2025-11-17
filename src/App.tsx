import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerify from "./pages/OTPVerify";
import TotpSetup from "./pages/TotpSetup";
import Vault from "./pages/Vault";
import Activity from "./pages/Activity";
import TrustedDevices from "./pages/TrustedDevices";
import BugBounty from "./pages/BugBounty";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OTPVerify />} />
            <Route path="/totp-setup" element={<TotpSetup />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/trusted-devices" element={<TrustedDevices />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/bug-bounty" element={<BugBounty />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
