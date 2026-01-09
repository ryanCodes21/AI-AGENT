import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

const topPosts = [
  { title: "Product Launch Video", engagement: "12.4K", growth: "+234%", type: "Video" },
  { title: "Behind the Scenes", engagement: "8.7K", growth: "+156%", type: "Image" },
  { title: "Customer Testimonial", engagement: "6.2K", growth: "+89%", type: "Carousel" },
  { title: "Tips & Tricks Thread", engagement: "5.8K", growth: "+67%", type: "Text" },
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

export function AnalyticsView() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Period Selector */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">Track your social media performance</p>
        </div>
        <div className="flex items-center gap-2">
          {["7D", "30D", "90D", "1Y"].map((period) => (
            <Button
              key={period}
              variant={period === "30D" ? "default" : "outline"}
              size="sm"
            >
              {period}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reach", value: "2.4M", change: "+18.2%", isPositive: true, icon: Eye },
          { label: "Engagement Rate", value: "8.2%", change: "+2.1%", isPositive: true, icon: Heart },
          { label: "Comments", value: "12.3K", change: "-3.2%", isPositive: false, icon: MessageCircle },
          { label: "Shares", value: "4.5K", change: "+24.5%", isPositive: true, icon: Share2 },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div key={metric.label} variants={item}>
              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${metric.isPositive ? "text-success" : "text-destructive"}`}>
                      {metric.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {metric.change}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold font-heading">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Follower Growth */}
        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Follower Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followerGrowth}>
                    <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(222 30% 18%)",
                        borderRadius: "8px",
                        color: "hsl(210 40% 98%)",
                      }}
                    />
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

        {/* Engagement Breakdown */}
        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Engagement Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(222 30% 18%)",
                        borderRadius: "8px",
                        color: "hsl(210 40% 98%)",
                      }}
                    />
                    <Bar dataKey="likes" fill="hsl(174 72% 56%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shares" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Posts */}
      <motion.div variants={item}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium">{post.engagement}</p>
                      <p className="text-xs text-muted-foreground">Total Engagement</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-success">
                      <TrendingUp className="h-4 w-4" />
                      {post.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
