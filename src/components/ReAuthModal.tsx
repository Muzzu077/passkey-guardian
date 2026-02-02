import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Fingerprint } from "lucide-react";
import { startAuthentication } from '@simplewebauthn/browser';
import { api, endpoints } from '@/api';
import { useAuth } from '@/hooks/use-auth';
import { toast } from "sonner";

interface ReAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    actionName: string;
}

export const ReAuthModal = ({ isOpen, onClose, onSuccess, actionName }: ReAuthModalProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleReData = async () => {
        if (!user?.username) return;
        setLoading(true);

        try {
            // 1. Get Challenge
            const optionsResp = await api.post(endpoints.loginChallenge, { username: user.username });
            const options = optionsResp.data;

            // 2. Browser Prompt
            const authResp = await startAuthentication({ optionsJSON: options });

            // 3. Verify
            const verifyResp = await api.post(endpoints.loginVerify, {
                username: user.username,
                response: authResp,
            });

            if (verifyResp.data.verified) {
                toast.success("Identity verified successfully");
                onSuccess();
                onClose();
            } else {
                toast.error("Verification failed");
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || err.message;
            toast.error(`Verification failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Verify Identity</DialogTitle>
                    <DialogDescription>
                        Please confirm it's you before converting to {actionName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20">
                        <Fingerprint className="w-8 h-8 text-primary" />
                    </div>

                    <Button
                        onClick={handleReData}
                        disabled={loading}
                        className="w-full h-12 text-base font-medium relative overflow-hidden group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Use Passkey"
                        )}
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Checking against {user?.username}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
