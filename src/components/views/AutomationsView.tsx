import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Clock,
  Target,
  Hash,
  Play,
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2,
  MessageSquare,
  TrendingUp,
  Calendar,
  Bot,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  type: "content_generation" | "auto_scheduling" | "lead_scoring" | "hashtag_generation" | "auto_reply";
  enabled: boolean;
  config: Record<string, any> | null;
  last_run: string | null;
  run_count: number;
}

interface AutomationResult {
  id: string;
  content: string;
  timestamp: Date;
  type: string;
}

const automationTypes = [
  {
    type: "content_generation",
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Generate post content for any topic and platform",
    configFields: ["topic", "platform", "tone"],
  },
  {
    type: "hashtag_generation",
    icon: Hash,
    title: "Hashtag Optimization",
    description: "Generate trending hashtags for maximum reach",
    configFields: ["topic", "count"],
  },
  {
    type: "auto_scheduling",
    icon: Clock,
    title: "Smart Scheduling",
    description: "Get AI-recommended posting times",
    configFields: ["platform", "timezone"],
  },
  {
    type: "lead_scoring",
    icon: Target,
    title: "Lead Scoring",
    description: "Score and prioritize leads automatically",
    configFields: ["industry"],
  },
  {
    type: "auto_reply",
    icon: MessageSquare,
    title: "Auto-Reply Assistant",
    description: "Generate professional responses to DMs/comments",
    configFields: ["tone", "context"],
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

export function AutomationsView() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAI, setRunningAI] = useState<string | null>(null);
  const [results, setResults] = useState<AutomationResult[]>([]);
  const [showResults, setShowResults] = useState<string | null>(null);
  const [configDialog, setConfigDialog] = useState<{open: boolean; type: string | null}>({open: false, type: null});
  const [configValues, setConfigValues] = useState<Record<string, string>>({
    topic: "",
    platform: "instagram",
    tone: "professional",
    count: "10",
    timezone: "UTC",
    industry: "general",
    context: "",
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ai_automations")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setAutomations((data || []).map(d => ({
        ...d,
        config: (d.config as Record<string, any>) || {},
      })) as Automation[]);
    } catch (error: any) {
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = (type: string) => {
    setConfigValues({
      topic: "",
      platform: "instagram",
      tone: "professional",
      count: "10",
      timezone: "UTC",
      industry: "general",
      context: "",
    });
    setConfigDialog({ open: true, type });
  };

  const createAutomation = async () => {
    if (!configDialog.type) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const automationInfo = automationTypes.find(a => a.type === configDialog.type);
      const { data, error } = await supabase
        .from("ai_automations")
        .insert({
          user_id: user.id,
          name: automationInfo?.title || "New Automation",
          type: configDialog.type as any,
          enabled: true,
          config: configValues,
        })
        .select()
        .single();

      if (error) throw error;
      setAutomations([...automations, {
        ...data,
        config: (data.config as Record<string, any>) || {},
      } as Automation]);
      setConfigDialog({ open: false, type: null });
      toast.success("Automation created and ready to run!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAutomation = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("ai_automations")
        .update({ enabled })
        .eq("id", id);

      if (error) throw error;
      setAutomations(automations.map(a => a.id === id ? { ...a, enabled } : a));
      toast.success(enabled ? "Automation enabled" : "Automation paused");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const runAutomation = async (automation: Automation) => {
    if (!automation.enabled) {
      toast.error("Enable this automation first");
      return;
    }
    
    setRunningAI(automation.id);
    try {
      const config = automation.config || {};
      let requestBody: Record<string, any> = { type: "" };
      
      switch (automation.type) {
        case "content_generation":
          requestBody = {
            type: "content",
            postData: {
              topic: config.topic || "business growth tips",
              platform: config.platform || "instagram",
              tone: config.tone || "professional",
            },
          };
          break;
          
        case "hashtag_generation":
          requestBody = {
            type: "hashtags",
            prompt: `Generate ${config.count || 10} trending hashtags for: ${config.topic || "social media marketing"}`,
          };
          break;
          
        case "auto_scheduling":
          requestBody = {
            type: "content",
            prompt: `Suggest the best 5 posting times for ${config.platform || "instagram"} to maximize engagement. Consider timezone: ${config.timezone || "UTC"}. Format as a numbered list with day and time.`,
          };
          break;
          
        case "lead_scoring":
          requestBody = {
            type: "lead_score",
            leadData: {
              name: "Sample Lead Analysis",
              company: config.industry || "General",
              source: "automation",
              value: 5000,
            },
          };
          break;
          
        case "auto_reply":
          requestBody = {
            type: "content",
            prompt: `Generate a ${config.tone || "professional"} reply template for customer inquiries about: ${config.context || "product information"}. Make it friendly and helpful.`,
          };
          break;
      }

      const response = await supabase.functions.invoke("ai-assistant", {
        body: requestBody,
      });

      if (response.error) throw response.error;

      // Update run stats
      await supabase
        .from("ai_automations")
        .update({ 
          run_count: automation.run_count + 1,
          last_run: new Date().toISOString(),
        })
        .eq("id", automation.id);

      setAutomations(automations.map(a => 
        a.id === automation.id 
          ? { ...a, run_count: a.run_count + 1, last_run: new Date().toISOString() }
          : a
      ));

      // Store result
      const newResult: AutomationResult = {
        id: automation.id,
        content: response.data?.content || "No result",
        timestamp: new Date(),
        type: automation.type,
      };
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
      setShowResults(automation.id);

      toast.success("Automation completed!", {
        description: "View the results below",
      });
    } catch (error: any) {
      toast.error("Automation failed", { description: error.message });
    } finally {
      setRunningAI(null);
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_automations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAutomations(automations.filter(a => a.id !== id));
      setResults(results.filter(r => r.id !== id));
      toast.success("Automation deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const existingTypes = automations.map(a => a.type);
  const latestResult = (automationId: string) => results.find(r => r.id === automationId);

  const renderConfigFields = () => {
    const typeInfo = automationTypes.find(t => t.type === configDialog.type);
    if (!typeInfo) return null;

    return typeInfo.configFields.map(field => {
      switch (field) {
        case "topic":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="topic">Topic / Subject</Label>
              <Input
                id="topic"
                placeholder="e.g., fitness tips, product launch, seasonal sale"
                value={configValues.topic}
                onChange={e => setConfigValues(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
          );
        case "platform":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={configValues.platform}
                onValueChange={val => setConfigValues(prev => ({ ...prev, platform: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        case "tone":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="tone">Tone / Style</Label>
              <Select
                value={configValues.tone}
                onValueChange={val => setConfigValues(prev => ({ ...prev, tone: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        case "count":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="count">Number of Hashtags</Label>
              <Select
                value={configValues.count}
                onValueChange={val => setConfigValues(prev => ({ ...prev, count: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 hashtags</SelectItem>
                  <SelectItem value="10">10 hashtags</SelectItem>
                  <SelectItem value="15">15 hashtags</SelectItem>
                  <SelectItem value="20">20 hashtags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        case "timezone":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="timezone">Your Timezone</Label>
              <Select
                value={configValues.timezone}
                onValueChange={val => setConfigValues(prev => ({ ...prev, timezone: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                  <SelectItem value="CET">Central European (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        case "industry":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={configValues.industry}
                onValueChange={val => setConfigValues(prev => ({ ...prev, industry: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="saas">SaaS/Tech</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        case "context":
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor="context">Reply Context</Label>
              <Textarea
                id="context"
                placeholder="What kind of messages will you be replying to? e.g., product inquiries, pricing questions, booking requests"
                value={configValues.context}
                onChange={e => setConfigValues(prev => ({ ...prev, context: e.target.value }))}
                rows={3}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            AI Automations
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure and run AI-powered automations for your business
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Bot className="h-3 w-3" />
          {automations.filter(a => a.enabled).length} Active
        </Badge>
      </motion.div>

      {/* Available Automations */}
      <motion.div variants={item}>
        <h3 className="mb-4 font-heading text-lg font-medium">Add Automations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automationTypes.map((autoType) => {
            const Icon = autoType.icon;
            const exists = existingTypes.includes(autoType.type as any);
            
            return (
              <Card
                key={autoType.type}
                className={`group transition-all hover:border-primary/30 ${exists ? "border-primary/20 bg-primary/5" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg p-2 bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{autoType.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {autoType.description}
                      </p>
                      {!exists ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 gap-1 w-full"
                          onClick={() => openConfigDialog(autoType.type)}
                        >
                          <Plus className="h-3 w-3" />
                          Configure & Add
                        </Button>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          Added
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Config Dialog */}
      <Dialog open={configDialog.open} onOpenChange={(open) => setConfigDialog({ open, type: open ? configDialog.type : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configDialog.type && (() => {
                const info = automationTypes.find(t => t.type === configDialog.type);
                const Icon = info?.icon || Sparkles;
                return (
                  <>
                    <Icon className="h-5 w-5 text-primary" />
                    Configure {info?.title}
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renderConfigFields()}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfigDialog({ open: false, type: null })}>
              Cancel
            </Button>
            <Button onClick={createAutomation}>
              <Plus className="h-4 w-4 mr-1" />
              Create Automation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Automations */}
      {automations.length > 0 && (
        <motion.div variants={item}>
          <h3 className="mb-4 font-heading text-lg font-medium">Your Automations</h3>
          <div className="space-y-4">
            {automations.map((automation) => {
              const autoType = automationTypes.find(t => t.type === automation.type);
              const Icon = autoType?.icon || Sparkles;
              const isRunning = runningAI === automation.id;
              const result = latestResult(automation.id);

              return (
                <Card key={automation.id} className={`group ${!automation.enabled ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{automation.name}</h4>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {automation.run_count} runs
                              </span>
                              {automation.last_run && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(automation.last_run).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={automation.enabled}
                            onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteAutomation(automation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Config Summary */}
                      {automation.config && Object.keys(automation.config).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(automation.config).map(([key, value]) => (
                            value && (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value).substring(0, 20)}
                              </Badge>
                            )
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => runAutomation(automation)}
                          disabled={isRunning || !automation.enabled}
                          className="gap-1"
                        >
                          {isRunning ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Running AI...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              Run Now
                            </>
                          )}
                        </Button>
                        {result && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setShowResults(showResults === automation.id ? null : automation.id)}
                          >
                            <Eye className="h-3 w-3" />
                            {showResults === automation.id ? "Hide" : "View"} Result
                          </Button>
                        )}
                      </div>

                      {/* Result Display */}
                      {showResults === automation.id && result && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="rounded-lg bg-muted/50 p-4 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              Generated {result.timestamp.toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(result.content);
                                toast.success("Copied to clipboard!");
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap text-foreground">
                            {result.content}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {automations.length === 0 && !loading && (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading text-lg font-medium">No automations yet</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                Add your first automation above to start using AI to automate your business tasks
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
