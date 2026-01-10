import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Clock,
  Target,
  Hash,
  Play,
  Pause,
  Settings,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  type: "content_generation" | "auto_scheduling" | "lead_scoring" | "hashtag_generation";
  enabled: boolean;
  config: any;
  last_run: string | null;
  run_count: number;
}

const automationTypes = [
  {
    type: "content_generation",
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Automatically generate engaging post content based on topics and trends",
    color: "primary",
  },
  {
    type: "auto_scheduling",
    icon: Clock,
    title: "Smart Scheduling",
    description: "AI suggests optimal posting times based on engagement patterns",
    color: "info",
  },
  {
    type: "lead_scoring",
    icon: Target,
    title: "Lead Scoring",
    description: "Automatically score and prioritize leads based on conversion potential",
    color: "success",
  },
  {
    type: "hashtag_generation",
    icon: Hash,
    title: "Hashtag Optimization",
    description: "Generate trending and relevant hashtags for maximum reach",
    color: "accent",
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
      setAutomations(data || []);
    } catch (error: any) {
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const automationInfo = automationTypes.find(a => a.type === type);
      const { data, error } = await supabase
        .from("ai_automations")
        .insert({
          user_id: user.id,
          name: automationInfo?.title || "New Automation",
          type: type as any,
          enabled: true,
          config: {},
        })
        .select()
        .single();

      if (error) throw error;
      setAutomations([...automations, data]);
      toast.success("Automation created!");
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
    setRunningAI(automation.id);
    try {
      let aiType = "";
      switch (automation.type) {
        case "content_generation":
          aiType = "content";
          break;
        case "hashtag_generation":
          aiType = "hashtags";
          break;
        case "auto_scheduling":
          aiType = "schedule";
          break;
        case "lead_scoring":
          aiType = "lead_score";
          break;
      }

      const response = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: aiType,
          prompt: `Run ${automation.name} automation`,
          postData: { topic: "general business", platform: "all", tone: "professional" },
        },
      });

      if (response.error) throw response.error;

      // Update run count
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

      toast.success("Automation ran successfully!", {
        description: response.data?.content?.substring(0, 100) + "...",
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
      toast.success("Automation deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const existingTypes = automations.map(a => a.type);

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
            Automate your workflow with AI-powered tools
          </p>
        </div>
      </motion.div>

      {/* Available Automations */}
      <motion.div variants={item}>
        <h3 className="mb-4 font-heading text-lg font-medium">Available Automations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {automationTypes.map((autoType) => {
            const Icon = autoType.icon;
            const exists = existingTypes.includes(autoType.type as any);
            
            return (
              <Card
                key={autoType.type}
                variant={exists ? "glow" : "glass"}
                className="group cursor-pointer transition-all hover:border-primary/30"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 bg-${autoType.color}/10`}>
                      <Icon className={`h-6 w-6 text-${autoType.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{autoType.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {autoType.description}
                      </p>
                      {!exists && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 gap-1"
                          onClick={() => createAutomation(autoType.type)}
                        >
                          <Plus className="h-3 w-3" />
                          Enable
                        </Button>
                      )}
                      {exists && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Active
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

      {/* Active Automations */}
      {automations.length > 0 && (
        <motion.div variants={item}>
          <h3 className="mb-4 font-heading text-lg font-medium">Your Automations</h3>
          <div className="space-y-4">
            {automations.map((automation) => {
              const autoType = automationTypes.find(t => t.type === automation.type);
              const Icon = autoType?.icon || Sparkles;
              const isRunning = runningAI === automation.id;

              return (
                <Card key={automation.id} variant="glass" className="group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{automation.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Runs: {automation.run_count}</span>
                            {automation.last_run && (
                              <span>
                                Last: {new Date(automation.last_run).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runAutomation(automation)}
                          disabled={isRunning || !automation.enabled}
                          className="gap-1"
                        >
                          {isRunning ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              Run Now
                            </>
                          )}
                        </Button>
                        <Switch
                          checked={automation.enabled}
                          onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                        />
                      </div>
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
          <Card variant="glass" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading text-lg font-medium">No automations yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enable an automation above to get started
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
