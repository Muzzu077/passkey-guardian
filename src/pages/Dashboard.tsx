import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Laptop, 
  Activity, 
  Settings, 
  LogOut,
  ChevronRight,
  Plus,
  Clock,
  MapPin
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - will be replaced with real data from backend
  const securityStatus = {
    level: "high",
    lastLogin: "2 minutes ago",
    devicesCount: 2,
    riskLevel: "low",
  };

  const devices = [
    {
      id: "1",
      name: "MacBook Pro",
      lastUsed: "Just now",
      location: "New York, US",
      isCurrent: true,
    },
    {
      id: "2",
      name: "iPhone 15",
      lastUsed: "Yesterday",
      location: "New York, US",
      isCurrent: false,
    },
  ];

  const recentActivity = [
    { action: "Signed in", device: "MacBook Pro", time: "2 min ago" },
    { action: "Signed in", device: "iPhone 15", time: "Yesterday" },
    { action: "Added new device", device: "iPhone 15", time: "2 days ago" },
  ];

  const handleLogout = () => {
    // TODO: Implement logout
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
      {/* Sidebar */}
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your authentication security
            </p>
          </div>

          {/* Security Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                {securityStatus.devicesCount}
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

          {/* Two column layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Devices Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Your Devices</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Device
                </Button>
              </div>

              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Laptop className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {device.name}
                          </span>
                          {device.isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {device.lastUsed}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {device.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Link
                  to="#"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{activity.action}</span>
                      <p className="text-xs text-muted-foreground">
                        {activity.device} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 glass rounded-xl p-6 border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Device
              </Button>
              <Button variant="outline" className="gap-2">
                <Activity className="w-4 h-4" />
                View Login History
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Security Settings
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
