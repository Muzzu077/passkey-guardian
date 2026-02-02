import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Recovery = () => {
    const { checkAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !code) {
            setError("Please enter your email and recovery code");
            return;
        }

        setIsLoading(true);

        try {
            const resp = await api.post('/auth/recover', {
                username: email,
                code: code.toUpperCase().replace(/\s/g, '')
            });

            if (resp.data.success) {
                await checkAuth();
                toast({
                    title: "Welcome back!",
                    description: "Successfully recovered your account. Consider adding a new device.",
                });
                navigate("/dashboard");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Recovery failed. Please check your code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Account Recovery"
            subtitle="Use a backup code to access your account"
        >
            <form onSubmit={handleRecovery} className="space-y-6">
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

                {/* Recovery Code input */}
                <div className="space-y-2">
                    <Label htmlFor="code" className="text-foreground">
                        Recovery Code
                    </Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            id="code"
                            type="text"
                            placeholder="XXXXXXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary font-mono tracking-widest"
                            disabled={isLoading}
                            maxLength={8}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter one of your 8-character backup codes
                    </p>
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

                {/* Submit button */}
                <Button
                    type="submit"
                    className="w-full py-6 text-lg glow-primary bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Recovering...
                        </>
                    ) : (
                        <>
                            <KeyRound className="w-5 h-5 mr-2" />
                            Use Recovery Code
                        </>
                    )}
                </Button>

                {/* Back to login */}
                <div className="text-center pt-4 border-t border-border/50">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to passkey login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Recovery;
