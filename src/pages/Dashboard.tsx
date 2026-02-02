import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ReAuthModal } from "@/components/ReAuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, endpoints } from "@/api";
import {
  Shield, Laptop, Activity, Settings, LogOut, Clock,
  KeyRound, Plus, Loader2, ShieldAlert, Pencil, AlertTriangle, Info, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

const Dashboard = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // State for metrics and data
  const [devices, setDevices] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  // Re-Auth State
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [reAuthActionName, setReAuthActionName] = useState("");

  // Recovery Codes State
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Rename Device Modal State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameDeviceId, setRenameDeviceId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Security status for overview display
  const securityStatus = {
    level: securityAlerts.length > 0 ? "attention" : "excellent",
    lastLogin: new Date().toLocaleString(),
  };

  // Mock recent activity for when no audit logs exist
  const recentActivity = [
    { action: "Successful login", device: "Chrome on Windows", time: "Just now" },
    { action: "Passkey registered", device: "This device", time: "2 hours ago" },
    { action: "Security check passed", device: "System", time: "1 day ago" },
  ];

  const fetchData = async () => {
    setLoadingLogs(true);
    try {
      const logsResp = await api.get(endpoints.auditLogs);
      setAuditLogs(logsResp.data);

      const devicesResp = await api.get(endpoints.userDevices);
      setDevices(devicesResp.data);

      // Fetch security alerts
      const alertsResp = await api.get(endpoints.securityAlerts);
      setSecurityAlerts(alertsResp.data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerReAuth = (actionName: string, action: () => void) => {
    setReAuthActionName(actionName);
    setPendingAction(() => action);
    setReAuthOpen(true);
  };

  const handleRevokeDevice = (id: string) => {
    triggerReAuth("revoke device", async () => {
      try {
        await api.delete(`${endpoints.userDevices}/${id}`);
        fetchData();
        toast({ title: "Device revoked", variant: "destructive" });
      } catch (err: any) {
        console.error("Failed to revoke", err);
        toast({ title: err.response?.data?.error || "Failed to revoke", variant: "destructive" });
      }
    });
  };

  const handleGenerateRecoveryCodes = () => {
    triggerReAuth("generate recovery codes", async () => {
      try {
        const res = await api.post('/user/recovery-codes');
        setRecoveryCodes(res.data.codes);
        toast({ title: "New codes generated", description: "Save them immediately!" });
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to generate codes", variant: "destructive" });
      }
    });
  };

  const handleRenameDevice = async () => {
    if (!renameValue.trim()) return;
    setRenaming(true);
    try {
      await api.patch(`${endpoints.userDevices}/${renameDeviceId}`, { friendly_name: renameValue });
      toast({ title: "Device renamed" });
      setRenameModalOpen(false);
      setRenameValue("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to rename", variant: "destructive" });
    } finally {
      setRenaming(false);
    }
  };

  const openRenameModal = (deviceId: string, currentName: string) => {
    setRenameDeviceId(deviceId);
    setRenameValue(currentName || "");
    setRenameModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const sidebarItems = [
    { id: "overview", icon: Shield, label: "Security Overview" },
    { id: "devices", icon: Laptop, label: "Devices" },
    { id: "activity", icon: Activity, label: "Activity" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <ReAuthModal
        isOpen={reAuthOpen}
        onClose={() => { setReAuthOpen(false); setPendingAction(null); }}
        onSuccess={() => { if (pendingAction) pendingAction(); }}
        actionName={reAuthActionName}
      />

      {/* ... Sidebar ... */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="font-semibold text-sidebar-foreground">PassKey Auth</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.aside>

      <main className="flex-1 p-8 overflow-auto">
        {/* ... Header ... */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your authentication security
          </p>
        </div>

        {activeTab === 'overview' && (
          /* ... Overview Content (Keep existing) ... */
          <>
            {/* Security Status Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* ... Keep existing Mock Cards & Security Status ... */}
              {/* Security Level */}
              <motion.div
                whileHover={{ y: -2 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Security Level</span>
                  <div className="p-2 rounded-lg bg-success/10">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground capitalize">
                    {securityStatus.level}
                  </span>
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                </div>
              </motion.div>

              {/* Devices */}
              <motion.div
                whileHover={{ y: -2 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Registered Devices</span>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Laptop className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {devices.length}
                </span>
              </motion.div>

              {/* Last Login */}
              <motion.div
                whileHover={{ y: -2 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Last Login</span>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {securityStatus.lastLogin}
                </span>
              </motion.div>
            </div>

            {/* Activity Feed reusing real auditLogs if available or mock recentActivity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Button variant="link" onClick={() => setActiveTab('activity')}>View all</Button>
              </div>
              <div className="space-y-4">
                {/* Combine Real Logs or Mock */}
                {(auditLogs.length > 0 ? auditLogs.slice(0, 5) : recentActivity).map((log: any, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{log.action || log}</span>
                      <p className="text-xs text-muted-foreground">
                        {log.details ? JSON.stringify(log.details) : log.device} • {log.created_at ? new Date(log.created_at).toLocaleTimeString() : log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'devices' && (
          // ... Keep Devices Tab existing logic but updated revoke handler ...
          <div className="glass rounded-xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Registered Devices</h2>
              <Button onClick={() => navigate('/register')} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Device
              </Button>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.credential_id || device.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {device.transports && device.transports.includes('internal') ? <Laptop className="w-5 h-5 text-primary" /> : <Shield className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {device.friendly_name || device.name || "Passkey"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last used: {device.last_used ? new Date(device.last_used).toLocaleString() : "Never"}
                        </span>
                        <span className="flex items-center gap-1">
                          <KeyRound className="w-3 h-3" />
                          Created: {device.created_at ? new Date(device.created_at).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleRevokeDevice(device.credential_id || device.id)}>
                    Revoke
                  </Button>
                </div>
              ))}
              {devices.length === 0 && <p className="text-muted-foreground text-center">No devices found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="glass rounded-xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Security Activity Log</h2>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loadingLogs}>
                {loadingLogs ? <Loader2 className="animate-spin w-4 h-4" /> : "Refresh"}
              </Button>
            </div>
            <div className="space-y-2">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 border-b border-border/10">
                  <div className="flex justify-between">
                    <span className="font-medium text-primary">{log.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    IP: {log.ip_address} | {JSON.stringify(log.details)}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recovery Codes</h2>
                  <p className="text-sm text-muted-foreground">
                    Generate backup codes to access your account if you lose your devices.
                  </p>
                </div>
              </div>

              {!recoveryCodes.length ? (
                <Button onClick={handleGenerateRecoveryCodes} className="w-full sm:w-auto">
                  Generate New Codes
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Save these codes! They won't be shown again.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-background/50 rounded-lg border border-border">
                    {recoveryCodes.map((code, i) => (
                      <div key={i} className="font-mono text-lg text-center p-2 bg-background rounded border">{code}</div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setRecoveryCodes([])}>Done, I've saved them</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
