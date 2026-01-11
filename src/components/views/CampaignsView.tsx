import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  Play,
  Pause,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  platforms: string[] | null;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  end_date: string | null;
  target_audience: string | null;
  ai_generated: boolean;
  ai_performance_score: number | null;
  ai_insights: string | null;
  metrics: any;
  created_at: string;
}

const campaignTypes = [
  { value: "awareness", label: "Brand Awareness", color: "text-info" },
  { value: "engagement", label: "Engagement", color: "text-primary" },
  { value: "conversion", label: "Conversion", color: "text-success" },
  { value: "retention", label: "Retention", color: "text-accent" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "text-muted-foreground bg-muted/50", icon: Calendar },
  active: { label: "Active", color: "text-success bg-success/10", icon: Play },
  paused: { label: "Paused", color: "text-warning bg-warning/10", icon: Pause },
  completed: { label: "Completed", color: "text-primary bg-primary/10", icon: CheckCircle },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "awareness",
    platforms: [] as string[],
    budget: 0,
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    target_audience: "",
  });

  useEffect(() => {
    fetchCampaigns();
    simulateDemoCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setCampaigns(data);
      }
    } catch (error: any) {
      console.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const simulateDemoCampaigns = () => {
    const demoData: Campaign[] = [
      {
        id: "demo-1",
        name: "Summer Sale 2026",
        description: "Promote seasonal discounts across all channels",
        type: "conversion",
        status: "active",
        platforms: ["instagram", "facebook", "tiktok"],
        budget: 5000,
        spent: 2340,
        start_date: "2026-01-01",
        end_date: "2026-01-31",
        target_audience: "18-35, Urban, Fashion-conscious",
        ai_generated: false,
        ai_performance_score: 78,
        ai_insights: "Campaign performing above average. Consider increasing budget on TikTok where engagement is highest.",
        metrics: { impressions: 125000, clicks: 4500, conversions: 230 },
        created_at: new Date().toISOString(),
      },
      {
        id: "demo-2",
        name: "Brand Launch Campaign",
        description: "Introduce new product line to market",
        type: "awareness",
        status: "active",
        platforms: ["instagram", "linkedin"],
        budget: 10000,
        spent: 7800,
        start_date: "2025-12-15",
        end_date: "2026-02-15",
        target_audience: "Business professionals, 25-45",
        ai_generated: true,
        ai_performance_score: 85,
        ai_insights: "Strong performance on LinkedIn. Professional audience responding well to value proposition.",
        metrics: { impressions: 450000, clicks: 12000, conversions: 580 },
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-3",
        name: "Loyalty Program Launch",
        description: "Engage existing customers with rewards",
        type: "retention",
        status: "draft",
        platforms: ["facebook", "twitter"],
        budget: 3000,
        spent: 0,
        start_date: null,
        end_date: null,
        target_audience: "Existing customers",
        ai_generated: false,
        ai_performance_score: null,
        ai_insights: null,
        metrics: {},
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setCampaigns(prev => prev.length === 0 ? demoData : prev);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const { error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        platforms: formData.platforms,
        budget: formData.budget || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        target_audience: formData.target_audience || null,
        status: "draft",
      });

      if (error) throw error;
      toast.success("Campaign created!");
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        type: "awareness",
        platforms: [],
        budget: 0,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        target_audience: "",
      });
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const generateAICampaign = async () => {
    setGeneratingCampaign(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "generate_campaign",
          businessData: {
            industry: "E-commerce",
            goals: ["increase sales", "brand awareness"],
          },
        },
      });

      if (error) throw error;
      
      toast.success("AI Campaign generated! Review and customize below.");
      setFormData({
        name: "AI-Generated Campaign",
        description: data.content || "AI-optimized campaign for maximum engagement",
        type: "conversion",
        platforms: ["instagram", "facebook", "tiktok"],
        budget: 5000,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        target_audience: "Your target demographic",
      });
      setShowModal(true);
    } catch (error: any) {
      toast.error("Failed to generate campaign");
    } finally {
      setGeneratingCampaign(false);
    }
  };

  const updateStatus = async (campaign: Campaign, newStatus: string) => {
    try {
      if (!campaign.id.startsWith("demo-")) {
        const { error } = await supabase
          .from("campaigns")
          .update({ status: newStatus })
          .eq("id", campaign.id);
        if (error) throw error;
      }
      setCampaigns(campaigns.map(c =>
        c.id === campaign.id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Campaign ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Campaigns", value: stats.total, icon: Megaphone, color: "text-primary" },
          { label: "Active", value: stats.active, icon: Play, color: "text-success" },
          { label: "Total Budget", value: `$${stats.totalBudget.toLocaleString()}`, icon: Target, color: "text-accent" },
          { label: "Total Spent", value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-info" },
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

      {/* Search and Actions */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={generateAICampaign}
            disabled={generatingCampaign}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{generatingCampaign ? "Generating..." : "AI Generate"}</span>
          </Button>
          <Button variant="glow" className="gap-2" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Campaign</span>
          </Button>
        </div>
      </motion.div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card variant="glass" className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first campaign or let AI generate one</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={generateAICampaign}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button variant="glow" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const statusInfo = statusConfig[campaign.status] || statusConfig.draft;
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div key={campaign.id} variants={item}>
                <Card variant="glass" className="group">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-heading font-semibold truncate">{campaign.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                          {campaign.ai_generated && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {campaign.platforms?.map(platform => (
                            <span key={platform} className="text-xs px-2 py-1 rounded bg-secondary capitalize">
                              {platform}
                            </span>
                          ))}
                        </div>
                        {campaign.ai_insights && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
                            <div className="flex items-center gap-2 text-xs text-primary mb-1">
                              <Sparkles className="h-3 w-3" />
                              AI Insights
                            </div>
                            <p className="text-sm text-muted-foreground">{campaign.ai_insights}</p>
                          </div>
                        )}
                        {/* Metrics */}
                        {campaign.metrics && Object.keys(campaign.metrics).length > 0 && (
                          <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-secondary/50">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Eye className="h-3 w-3" />
                                <span className="text-xs">Impressions</span>
                              </div>
                              <p className="font-semibold">{(campaign.metrics.impressions || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <MousePointer className="h-3 w-3" />
                                <span className="text-xs">Clicks</span>
                              </div>
                              <p className="font-semibold">{(campaign.metrics.clicks || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-xs">Conversions</span>
                              </div>
                              <p className="font-semibold">{(campaign.metrics.conversions || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex lg:flex-col items-center lg:items-end gap-3">
                        {campaign.budget && (
                          <div className="text-right">
                            <p className="text-lg font-bold">${(campaign.spent || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">of ${campaign.budget.toLocaleString()}</p>
                            <div className="w-24 h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(((campaign.spent || 0) / campaign.budget) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {campaign.ai_performance_score && (
                          <div className={`text-lg font-bold ${campaign.ai_performance_score >= 70 ? "text-success" : campaign.ai_performance_score >= 40 ? "text-warning" : "text-destructive"}`}>
                            {campaign.ai_performance_score}/100
                          </div>
                        )}
                        <div className="flex gap-2">
                          {campaign.status === "active" ? (
                            <Button variant="outline" size="sm" onClick={() => updateStatus(campaign, "paused")}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : campaign.status !== "completed" && (
                            <Button variant="glow" size="sm" onClick={() => updateStatus(campaign, "active")}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <Card variant="glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create Campaign</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 min-h-20 w-full rounded-lg border border-border bg-secondary/50 p-4 text-sm outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      >
                        {campaignTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Budget ($)</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platforms</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["instagram", "facebook", "tiktok", "twitter", "linkedin"].map(platform => (
                        <Button
                          key={platform}
                          type="button"
                          variant={formData.platforms.includes(platform) ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePlatform(platform)}
                          className="capitalize"
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <input
                      type="text"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      placeholder="e.g., 18-35, Urban professionals"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="glow" className="flex-1">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}