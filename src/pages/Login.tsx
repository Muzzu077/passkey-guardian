import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint, Mail, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startAuthentication } from "@simplewebauthn/browser";
import { api, endpoints } from "@/api";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/use-auth";

const Login = () => {
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!window.PublicKeyCredential) {
      setError("Your browser doesn't support passkeys. Please use a modern browser.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get challenge
      const resp = await api.post(endpoints.loginChallenge, { username: email });
      const options = resp.data;

      // 2. Authenticate with browser
      const authResp = await startAuthentication({ optionsJSON: options });

      // 3. Verify
      const verificationResp = await api.post(endpoints.loginVerify, {
        username: email,
        response: authResp,
      });

      if (verificationResp.data.verified) {
        await checkAuth();
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated with your passkey.",
        });
        navigate("/dashboard");
      } else {
        setError("Authentication failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with your passkey — fast and secure"
    >
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* Email input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Sign in button */}
        <Button
          type="submit"
          className="w-full py-6 text-lg glow-primary bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 mr-2" />
              Sign in with Passkey
            </>
          )}
        </Button>

        {/* Footer links */}
        <div className="text-center pt-4 border-t border-border/50 text-sm space-y-2">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              create one
            </Link>
          </p>
          <Link
            to="/recovery"
            className="block text-muted-foreground hover:text-destructive transition-colors text-xs"
          >
            Lost your passkey? Use a recovery code
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
