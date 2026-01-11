import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Users,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  UserPlus,
  Search,
  Filter,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SocialInteraction {
  id: string;
  platform: string;
  interaction_type: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  message_content: string | null;
  sentiment: string | null;
  ai_extracted_data: any;
  converted_to_lead: boolean;
  interaction_date: string;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: MessageSquare,
  linkedin: Users,
};

const platformColors: Record<string, string> = {
  instagram: "text-pink-500",
  facebook: "text-blue-500",
  twitter: "text-sky-400",
  tiktok: "text-foreground",
  linkedin: "text-blue-600",
};

const sentimentColors: Record<string, string> = {
  positive: "text-success bg-success/10",
  neutral: "text-muted-foreground bg-muted/50",
  negative: "text-destructive bg-destructive/10",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function InteractionsView() {
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [extractingLead, setExtractingLead] = useState<string | null>(null);

  useEffect(() => {
    fetchInteractions();
    // Simulate demo data for new users
    simulateDemoInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_interactions")
        .select("*")
        .eq("user_id", user.id)
        .order("interaction_date", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setInteractions(data);
      }
    } catch (error: any) {
      console.error("Failed to load interactions");
    } finally {
      setLoading(false);
    }
  };

  const simulateDemoInteractions = () => {
    // Demo data for showcase
    const demoData: SocialInteraction[] = [
      {
        id: "demo-1",
        platform: "instagram",
        interaction_type: "dm",
        contact_name: "Sarah Johnson",
        contact_phone: "+1 (555) 123-4567",
        contact_email: "sarah.j@email.com",
        message_content: "Hi! I'm interested in your product. Can you tell me more about pricing?",
        sentiment: "positive",
        ai_extracted_data: { intent: "purchase_inquiry", urgency: "high" },
        converted_to_lead: false,
        interaction_date: new Date().toISOString(),
      },
      {
        id: "demo-2",
        platform: "facebook",
        interaction_type: "comment",
        contact_name: "Mike Chen",
        contact_phone: null,
        contact_email: "mike.chen@business.com",
        message_content: "This is exactly what we've been looking for! How do we get started?",
        sentiment: "positive",
        ai_extracted_data: { intent: "getting_started", urgency: "medium" },
        converted_to_lead: false,
        interaction_date: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "demo-3",
        platform: "tiktok",
        interaction_type: "comment",
        contact_name: "Emma Williams",
        contact_phone: "+1 (555) 987-6543",
        contact_email: null,
        message_content: "Love this! Do you ship internationally?",
        sentiment: "positive",
        ai_extracted_data: { intent: "shipping_inquiry", urgency: "low" },
        converted_to_lead: true,
        interaction_date: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "demo-4",
        platform: "twitter",
        interaction_type: "mention",
        contact_name: "Tech Reviews",
        contact_phone: null,
        contact_email: "reviews@techsite.com",
        message_content: "Just discovered @YourBrand - impressive features! Would love to do a review.",
        sentiment: "positive",
        ai_extracted_data: { intent: "partnership", urgency: "medium" },
        converted_to_lead: false,
        interaction_date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-5",
        platform: "linkedin",
        interaction_type: "inquiry",
        contact_name: "David Brown",
        contact_phone: "+1 (555) 456-7890",
        contact_email: "d.brown@enterprise.com",
        message_content: "Our team is evaluating solutions like yours. Can we schedule a demo?",
        sentiment: "positive",
        ai_extracted_data: { intent: "demo_request", urgency: "high" },
        converted_to_lead: false,
        interaction_date: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setInteractions(prev => prev.length === 0 ? demoData : prev);
    setLoading(false);
  };

  const extractAndConvertToLead = async (interaction: SocialInteraction) => {
    setExtractingLead(interaction.id);
    try {
      // Call AI to extract contact info
      const { data: aiData, error: aiError } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "extract_lead",
          messageData: {
            content: interaction.message_content,
            platform: interaction.platform,
            contactName: interaction.contact_name,
          },
        },
      });

      if (aiError) throw aiError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create lead from interaction
      const { error: leadError } = await supabase.from("leads").insert({
        user_id: user.id,
        name: interaction.contact_name || "Unknown Contact",
        email: interaction.contact_email || `${interaction.platform}-lead@placeholder.com`,
        phone: interaction.contact_phone,
        source: interaction.platform,
        notes: `From ${interaction.interaction_type}: ${interaction.message_content}`,
        status: "new",
      });

      if (leadError) throw leadError;

      // Mark interaction as converted
      if (!interaction.id.startsWith("demo-")) {
        await supabase
          .from("social_interactions")
          .update({ converted_to_lead: true })
          .eq("id", interaction.id);
      }

      setInteractions(interactions.map(i =>
        i.id === interaction.id ? { ...i, converted_to_lead: true } : i
      ));

      toast.success("Lead created successfully!");
    } catch (error: any) {
      toast.error("Failed to create lead");
    } finally {
      setExtractingLead(null);
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch =
      interaction.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.message_content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterPlatform || interaction.platform === filterPlatform;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: interactions.length,
    pending: interactions.filter(i => !i.converted_to_lead).length,
    converted: interactions.filter(i => i.converted_to_lead).length,
    positive: interactions.filter(i => i.sentiment === "positive").length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Interactions", value: stats.total, icon: MessageSquare, color: "text-primary" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-warning" },
          { label: "Converted to Leads", value: stats.converted, icon: UserPlus, color: "text-success" },
          { label: "Positive Sentiment", value: stats.positive, icon: TrendingUp, color: "text-info" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card variant="glass">
                <CardContent className="p-4 lg:p-5">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="mt-2 text-xl lg:text-2xl font-bold font-heading">{stat.value}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <motion.div variants={item}>
        <Card variant="glow" className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">AI Auto-Lead Tracking</p>
              <p className="text-xs text-muted-foreground mt-1">
                Our AI automatically monitors DMs, comments, and inquiries from your connected social channels (TikTok, Facebook, Instagram, etc.) to extract contact information and identify potential leads.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search interactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["all", "instagram", "facebook", "tiktok", "twitter", "linkedin"].map((platform) => (
            <Button
              key={platform}
              variant={filterPlatform === platform || (platform === "all" && !filterPlatform) ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPlatform(platform === "all" ? null : platform)}
              className="capitalize whitespace-nowrap"
            >
              {platform}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Interactions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredInteractions.length === 0 ? (
        <Card variant="glass" className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">No interactions yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Connect your social accounts to start tracking DMs and comments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInteractions.map((interaction) => {
            const PlatformIcon = platformIcons[interaction.platform] || MessageSquare;
            return (
              <motion.div key={interaction.id} variants={item}>
                <Card variant="glass" className="group">
                  <CardContent className="p-4 lg:p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full bg-secondary flex items-center justify-center ${platformColors[interaction.platform]}`}>
                          <PlatformIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-medium">{interaction.contact_name || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground capitalize">• {interaction.interaction_type}</span>
                          {interaction.sentiment && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sentimentColors[interaction.sentiment]}`}>
                              {interaction.sentiment}
                            </span>
                          )}
                          {interaction.converted_to_lead && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Lead Created
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{interaction.message_content}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          {interaction.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {interaction.contact_phone}
                            </span>
                          )}
                          {interaction.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {interaction.contact_email}
                            </span>
                          )}
                          <span>{format(new Date(interaction.interaction_date), "MMM d, h:mm a")}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center gap-2">
                        {!interaction.converted_to_lead && (
                          <Button
                            variant="glow"
                            size="sm"
                            onClick={() => extractAndConvertToLead(interaction)}
                            disabled={extractingLead === interaction.id}
                            className="gap-1 whitespace-nowrap"
                          >
                            <UserPlus className="h-4 w-4" />
                            {extractingLead === interaction.id ? "Creating..." : "Create Lead"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}