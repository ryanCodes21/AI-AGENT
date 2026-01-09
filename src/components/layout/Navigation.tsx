import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  BarChart3,
  Sparkles,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "scheduler", label: "Post Scheduler", icon: Calendar },
  { id: "leads", label: "Lead Tracking", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-semibold">SocialAI</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User section */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info">
              <span className="text-sm font-semibold text-primary-foreground">JD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">John Doe</p>
              <p className="truncate text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
