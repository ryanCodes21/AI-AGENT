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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
