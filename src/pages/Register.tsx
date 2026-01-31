import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint, Mail, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreatePasskey = async (e: React.FormEvent) => {
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

    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      setError("Your browser doesn't support passkeys. Please use a modern browser.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual WebAuthn registration flow
      // This will be connected to the backend edge functions
      
      toast({
        title: "Passkey Created!",
        description: "Your account has been secured with a passkey.",
      });

      // Navigate to dashboard after successful registration
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create passkey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Register with a secure passkey — no password needed"
    >
      <form onSubmit={handleCreatePasskey} className="space-y-6">
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

        {/* Create passkey button */}
        <Button
          type="submit"
          className="w-full py-6 text-lg glow-primary bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Passkey...
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 mr-2" />
              Create Passkey
            </>
          )}
        </Button>

        {/* Info box */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-2">
            How it works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Your device creates a unique cryptographic key pair</li>
            <li>• Private key stays securely on your device</li>
            <li>• Use biometrics or PIN to authenticate</li>
          </ul>
        </div>

        {/* Sign in link */}
        <div className="text-center pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in with Passkey
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
