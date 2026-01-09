import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Lightbulb,
  Copy,
  RefreshCw,
  Image,
  FileText,
  Hash,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const suggestionPrompts = [
  { icon: FileText, label: "Generate Caption", description: "Create engaging post captions" },
  { icon: Hash, label: "Hashtag Ideas", description: "Get relevant hashtags" },
  { icon: Image, label: "Content Ideas", description: "Visual content suggestions" },
  { icon: Lightbulb, label: "Campaign Strategy", description: "Marketing campaign ideas" },
];

const recentSuggestions = [
  {
    type: "Caption",
    content: "✨ Introducing our newest collection! Crafted with passion, designed for you. Link in bio! #NewArrivals #Fashion",
    platform: "Instagram",
  },
  {
    type: "Thread",
    content: "🧵 5 Tips to boost your productivity this week:\n\n1. Start with your hardest task\n2. Take regular breaks...",
    platform: "Twitter",
  },
  {
    type: "Hashtags",
    content: "#SocialMediaMarketing #DigitalMarketing #ContentCreator #MarketingTips #GrowthHacking #SMM",
    platform: "All",
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

export function AIAssistantView() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">AI Content Assistant</h2>
            <p className="text-sm text-muted-foreground">Generate engaging content with AI</p>
          </div>
        </div>
      </motion.div>

      {/* Input Area */}
      <motion.div variants={item}>
        <Card variant="glow">
          <CardContent className="p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what content you want to create..."
              className="min-h-32 w-full resize-none rounded-lg border border-border bg-secondary/50 p-4 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                {["Instagram", "Twitter", "LinkedIn", "TikTok"].map((platform) => (
                  <Button key={platform} variant="outline" size="sm">
                    {platform}
                  </Button>
                ))}
              </div>
              <Button
                variant="glow"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h3 className="mb-4 font-heading text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestionPrompts.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Card
                key={index}
                variant="glass"
                className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                onClick={() => setPrompt(`Generate ${suggestion.label.toLowerCase()} for...`)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{suggestion.label}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Suggestions */}
      <motion.div variants={item}>
        <h3 className="mb-4 font-heading text-lg font-semibold">Recent Generations</h3>
        <div className="space-y-4">
          {recentSuggestions.map((suggestion, index) => (
            <Card key={index} variant="glass" className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{suggestion.platform}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {suggestion.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
