import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, TopBar, MobileNav } from "@/components/layout/Navigation";
import { DashboardView } from "@/components/views/DashboardView";
import { SchedulerView } from "@/components/views/SchedulerView";
import { LeadsView } from "@/components/views/LeadsView";
import { InventoryView } from "@/components/views/InventoryView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { AIAssistantView } from "@/components/views/AIAssistantView";
import { AutomationsView } from "@/components/views/AutomationsView";
import { SettingsView } from "@/components/views/SettingsView";
import { RecordsView } from "@/components/views/RecordsView";
import { InteractionsView } from "@/components/views/InteractionsView";
import { CampaignsView } from "@/components/views/CampaignsView";
import { supabase } from "@/integrations/supabase/client";

const tabTitles: Record<string, string> = {
  dashboard: "Dashboard",
  scheduler: "Post Scheduler",
  leads: "Lead Tracking",
  interactions: "Social Inbox",
  campaigns: "Campaigns",
  records: "Business Records",
  inventory: "Inventory Management",
  analytics: "Analytics & SWOT",
  ai: "AI Business Consultant",
  automations: "AI Automations",
  settings: "Settings",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const renderView = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "scheduler": return <SchedulerView />;
      case "leads": return <LeadsView />;
      case "interactions": return <InteractionsView />;
      case "campaigns": return <CampaignsView />;
      case "records": return <RecordsView />;
      case "inventory": return <InventoryView />;
      case "analytics": return <AnalyticsView />;
      case "ai": return <AIAssistantView />;
      case "automations": return <AutomationsView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="lg:pl-64 transition-all duration-300">
        <TopBar title={tabTitles[activeTab]} />
        <div className="p-4 lg:p-6">{renderView()}</div>
      </main>
    </div>
  );
};

export default Index;