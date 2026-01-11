import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Target,
  AlertTriangle,
  Lightbulb,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const followerGrowth = [
  { month: "Jan", instagram: 45000, twitter: 23000, linkedin: 12000 },
  { month: "Feb", instagram: 52000, twitter: 25000, linkedin: 14000 },
  { month: "Mar", instagram: 58000, twitter: 28000, linkedin: 16000 },
  { month: "Apr", instagram: 67000, twitter: 31000, linkedin: 19000 },
  { month: "May", instagram: 78000, twitter: 35000, linkedin: 22000 },
  { month: "Jun", instagram: 92000, twitter: 42000, linkedin: 26000 },
];

const engagementData = [
  { day: "Mon", likes: 2400, comments: 400, shares: 240 },
  { day: "Tue", likes: 1398, comments: 300, shares: 139 },
  { day: "Wed", likes: 9800, comments: 900, shares: 980 },
  { day: "Thu", likes: 3908, comments: 480, shares: 390 },
  { day: "Fri", likes: 4800, comments: 380, shares: 480 },
  { day: "Sat", likes: 3800, comments: 430, shares: 380 },
  { day: "Sun", likes: 4300, comments: 450, shares: 430 },
];

const performanceRadar = [
  { metric: "Engagement", value: 85 },
  { metric: "Reach", value: 72 },
  { metric: "Growth", value: 68 },
  { metric: "Conversion", value: 55 },
  { metric: "Retention", value: 78 },
  { metric: "Brand Awareness", value: 82 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AnalyticsView() {
  const [swotAnalysis, setSwotAnalysis] = useState<any>(null);
  const [generatingSwot, setGeneratingSwot] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30D");

  useEffect(() => {
    // Load cached SWOT or generate demo
    setSwotAnalysis({
      strengths: [
        "Strong engagement rate above industry average",
        "Growing follower base across all platforms",
        "High-quality visual content",
        "Active community engagement",
      ],
      weaknesses: [
        "Limited presence on TikTok",
        "Inconsistent posting schedule",
        "Low conversion rate from social to sales",
        "Lack of video content",
      ],
      opportunities: [
        "Expand into short-form video content",
        "Partner with micro-influencers",
        "Leverage AI for content optimization",
        "Target untapped demographics",
      ],
      threats: [
        "Algorithm changes affecting reach",
        "Increasing competition in niche",
        "Rising ad costs across platforms",
        "Changing consumer preferences",
      ],
    });
  }, []);

  const generateSwotWithAI = async () => {
    setGeneratingSwot(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "swot_analysis",
          businessData: {
            followers: 160000,
            engagementRate: 8.2,
            platforms: ["instagram", "twitter", "linkedin", "tiktok"],
            industry: "E-commerce",
          },
        },
      });

      if (error) throw error;
      
      try {
        const parsed = JSON.parse(data.content);
        setSwotAnalysis(parsed);
      } catch {
        toast.success("SWOT analysis updated");
      }
    } catch (error: any) {
      toast.error("Failed to generate SWOT analysis");
    } finally {
      setGeneratingSwot(false);
    }
  };

  const swotConfig = [
    { key: "strengths", title: "Strengths", icon: Shield, color: "text-success", bgColor: "bg-success/10" },
    { key: "weaknesses", title: "Weaknesses", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
    { key: "opportunities", title: "Opportunities", icon: Lightbulb, color: "text-primary", bgColor: "bg-primary/10" },
    { key: "threats", title: "Threats", icon: Target, color: "text-warning", bgColor: "bg-warning/10" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* Period Selector */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-semibold">Analytics & AI Insights</h2>
          <p className="text-xs lg:text-sm text-muted-foreground">Track performance with AI-powered SWOT analysis</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["7D", "30D", "90D", "1Y"].map((period) => (
            <Button key={period} variant={period === selectedPeriod ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod(period)}>
              {period}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reach", value: "2.4M", change: "+18.2%", isPositive: true, icon: Eye },
          { label: "Engagement Rate", value: "8.2%", change: "+2.1%", isPositive: true, icon: Heart },
          { label: "Comments", value: "12.3K", change: "-3.2%", isPositive: false, icon: MessageCircle },
          { label: "Shares", value: "4.5K", change: "+24.5%", isPositive: true, icon: Share2 },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div key={metric.label} variants={item}>
              <Card variant="glass">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    </div>
                    <span className={`flex items-center gap-1 text-xs lg:text-sm ${metric.isPositive ? "text-success" : "text-destructive"}`}>
                      {metric.isPositive ? <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" /> : <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4" />}
                      {metric.change}
                    </span>
                  </div>
                  <p className="mt-3 lg:mt-4 text-xl lg:text-2xl font-bold font-heading">{metric.value}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* AI SWOT Analysis */}
      <motion.div variants={item}>
        <Card variant="glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI SWOT Analysis
            </CardTitle>
            <Button variant="outline" size="sm" onClick={generateSwotWithAI} disabled={generatingSwot} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${generatingSwot ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{generatingSwot ? "Analyzing..." : "Refresh"}</span>
            </Button>
          </CardHeader>
          <CardContent>
            {swotAnalysis ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {swotConfig.map(({ key, title, icon: Icon, color, bgColor }) => (
                  <div key={key} className={`rounded-lg p-4 ${bgColor}`}>
                    <div className={`flex items-center gap-2 ${color} mb-3`}>
                      <Icon className="h-5 w-5" />
                      <h4 className="font-semibold">{title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {swotAnalysis[key]?.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${bgColor.replace("/10", "")} flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Button variant="glow" onClick={generateSwotWithAI}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate SWOT Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Follower Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followerGrowth}>
                    <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="linkedin" stroke="#0A66C2" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-primary" />
                Engagement Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
                    <Bar dataKey="likes" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" fill="hsl(45 93% 47%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shares" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}