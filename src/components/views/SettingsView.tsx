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
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  XCircle,
  Link,
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

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string | null;
  connected: boolean;
}

const socialPlatforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-sky-400" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
];

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
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    business_name: "",
    industry: "",
    location: "",
    target_audience: "",
    business_goals: [],
  });

  useEffect(() => {
    fetchBusinessProfile();
    fetchSocialAccounts();
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

  const fetchSocialAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id);

      setSocialAccounts(data || []);
    } catch (error) {
      // Accounts might not exist yet
    }
  };

  const connectSocialAccount = async (platform: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      // Check if already connected
      const existing = socialAccounts.find(a => a.platform === platform);
      if (existing?.connected) {
        // Disconnect
        await supabase
          .from("social_accounts")
          .update({ connected: false, account_name: null })
          .eq("id", existing.id);
        setSocialAccounts(socialAccounts.map(a => 
          a.id === existing.id ? { ...a, connected: false, account_name: null } : a
        ));
        toast.success(`${platform} disconnected`);
      } else {
        // Simulate connection (in real app, this would be OAuth)
        const { data, error } = await supabase
          .from("social_accounts")
          .upsert({
            user_id: user.id,
            platform,
            connected: true,
            account_name: `@your_${platform}_account`,
          }, { onConflict: "user_id,platform" })
          .select()
          .single();

        if (error) throw error;
        
        if (existing) {
          setSocialAccounts(socialAccounts.map(a => 
            a.platform === platform ? { ...a, connected: true, account_name: `@your_${platform}_account` } : a
          ));
        } else if (data) {
          setSocialAccounts([...socialAccounts, data]);
        }
        
        toast.success(`${platform} connected successfully!`, {
          description: "You can now schedule posts for this platform",
        });
      }
    } catch (error: any) {
      toast.error(error.message);
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

      {/* Social Accounts */}
      <motion.div variants={item}>
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="h-5 w-5 text-primary" />
              Connected Social Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your social media accounts to enable direct posting and analytics tracking.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const account = socialAccounts.find(a => a.platform === platform.id);
                const isConnected = account?.connected;
                
                return (
                  <div
                    key={platform.id}
                    className={`flex items-center justify-between rounded-lg p-4 transition-colors ${
                      isConnected ? "bg-success/10 border border-success/20" : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${isConnected ? "bg-success/10" : "bg-muted"}`}>
                        <Icon className={`h-5 w-5 ${isConnected ? "text-success" : platform.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        {isConnected && account?.account_name && (
                          <p className="text-xs text-muted-foreground">{account.account_name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isConnected ? "outline" : "glow"}
                      size="sm"
                      onClick={() => connectSocialAccount(platform.id)}
                      className={isConnected ? "gap-1" : ""}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          Connected
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Note: For Instagram, you'll copy content and post manually. Direct Instagram API posting requires a Meta Business account.
            </p>
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
