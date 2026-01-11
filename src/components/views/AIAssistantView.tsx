import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Send, Sparkles, User, Bot, MapPin, Building, Target, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { icon: Target, label: "Campaign Strategy", prompt: "Create a marketing campaign strategy for my business" },
  { icon: TrendingUp, label: "Growth Tips", prompt: "What are the top 5 strategies to grow my business this quarter?" },
  { icon: Lightbulb, label: "Content Ideas", prompt: "Generate 10 content ideas for my social media this week" },
  { icon: Building, label: "Competitor Analysis", prompt: "How can I analyze and outperform my competitors?" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AIAssistantView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businessContext, setBusinessContext] = useState({ name: "", location: "", industry: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "business_consultant",
          prompt: content,
          businessContext: {
            ...businessContext,
            previousMessages: messages.slice(-6),
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error("Failed to get response");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-lg lg:text-xl font-semibold">AI Business Consultant</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">Get expert advice on campaigns, growth, and management</p>
          </div>
        </div>
      </motion.div>

      {/* Business Context */}
      <motion.div variants={item}>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Business name"
                  value={businessContext.name}
                  onChange={(e) => setBusinessContext({ ...businessContext, name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Location"
                  value={businessContext.location}
                  onChange={(e) => setBusinessContext({ ...businessContext, location: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Industry"
                  value={businessContext.industry}
                  onChange={(e) => setBusinessContext({ ...businessContext, industry: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <motion.div variants={item}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  variant="glass"
                  className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg"
                  onClick={() => sendMessage(action.prompt)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Chat Area */}
      <motion.div variants={item}>
        <Card variant="glow" className="flex flex-col h-[400px] lg:h-[500px]">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
                <h3 className="font-heading text-lg font-medium">Start a Conversation</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Ask about campaign strategies, business growth, competitor analysis, or any business management question.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 flex-shrink-0">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about campaigns, growth strategies, business management..."
                className="flex-1 h-10 lg:h-11 rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                disabled={isLoading}
              />
              <Button type="submit" variant="glow" size="icon" disabled={!input.trim() || isLoading} className="h-10 w-10 lg:h-11 lg:w-11">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}