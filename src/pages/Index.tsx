import { useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Navigation";
import { DashboardView } from "@/components/views/DashboardView";
import { SchedulerView } from "@/components/views/SchedulerView";
import { LeadsView } from "@/components/views/LeadsView";
import { InventoryView } from "@/components/views/InventoryView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { AIAssistantView } from "@/components/views/AIAssistantView";
import { SettingsView } from "@/components/views/SettingsView";

const tabTitles: Record<string, string> = {
  dashboard: "Dashboard",
  scheduler: "Post Scheduler",
  leads: "Lead Tracking",
  inventory: "Inventory Management",
  analytics: "Analytics",
  ai: "AI Assistant",
  settings: "Settings",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "scheduler":
        return <SchedulerView />;
      case "leads":
        return <LeadsView />;
      case "inventory":
        return <InventoryView />;
      case "analytics":
        return <AnalyticsView />;
      case "ai":
        return <AIAssistantView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pl-64 transition-all duration-300">
        <TopBar title={tabTitles[activeTab]} />
        
        <div className="p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
