import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Save,
  Building,
  MapPin,
  Target,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BusinessProfile {
  business_name: string;
  industry: string | null;
  location: string | null;
  target_audience: string | null;
  business_goals: string[] | null;
}

const settingSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Profile Information", description: "Update your name, email, and photo" },
      { label: "Password & Security", description: "Manage your password and 2FA" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email Notifications", description: "Receive updates via email", toggle: true },
      { label: "Push Notifications", description: "Get notified on your device", toggle: true },
    ],
  },
  {
    title: "Integrations",
    icon: Globe,
    items: [
      { label: "Connected Accounts", description: "Manage your social media connections" },
      { label: "API Access", description: "Generate and manage API keys" },
    ],
  },
  {
    title: "Billing",
    icon: CreditCard,
    items: [
      { label: "Subscription", description: "Current plan: Pro ($49/month)" },
      { label: "Payment Methods", description: "Manage your payment options" },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SettingsView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    business_name: "",
    industry: "",
    location: "",
    target_audience: "",
    business_goals: [],
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setBusinessProfile({
          business_name: data.business_name || "",
          industry: data.industry || "",
          location: data.location || "",
          target_audience: data.target_audience || "",
          business_goals: data.business_goals || [],
        });
      }
    } catch (error) {
      // Profile might not exist yet
    }
  };

  const saveBusinessProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const { error } = await supabase
        .from("business_profile")
        .upsert({
          user_id: user.id,
          business_name: businessProfile.business_name,
          industry: businessProfile.industry || null,
          location: businessProfile.location || null,
          target_audience: businessProfile.target_audience || null,
          business_goals: businessProfile.business_goals,
        }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Business profile saved!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="font-heading text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      {/* Business Profile */}
      <motion.div variants={item}>
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-5 w-5 text-primary" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Business Name *</label>
                <input
                  type="text"
                  value={businessProfile.business_name}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, business_name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <input
                  type="text"
                  value={businessProfile.industry || ""}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, industry: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                  placeholder="e.g., E-commerce, Technology"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={businessProfile.location || ""}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <input
                  type="text"
                  value={businessProfile.target_audience || ""}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, target_audience: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                  placeholder="e.g., Young professionals, 25-35"
                />
              </div>
            </div>
            <Button variant="glow" onClick={saveBusinessProfile} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => {
        const Icon = section.icon;
        return (
          <motion.div key={section.title} variants={item}>
            <Card variant="glass">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {section.items.map((settingItem, itemIndex) => (
                  <div
                    key={settingItem.label}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="font-medium">{settingItem.label}</p>
                      <p className="text-sm text-muted-foreground">{settingItem.description}</p>
                    </div>
                    {settingItem.toggle ? (
                      <Switch defaultChecked />
                    ) : (
                      <Button variant="ghost" size="icon-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Logout */}
      <motion.div variants={item}>
        <Card variant="glass">
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Section */}
      <motion.div variants={item}>
        <Card variant="glow">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Need Help?</p>
                <p className="text-sm text-muted-foreground">Our support team is here to assist you</p>
              </div>
            </div>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
