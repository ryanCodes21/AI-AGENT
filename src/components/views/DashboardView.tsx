import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  MessageSquare,
  Eye,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const statsCards = [
  {
    title: "Total Followers",
    value: "124.5K",
    change: "+12.3%",
    isPositive: true,
    icon: Users,
    color: "primary",
  },
  {
    title: "Engagement Rate",
    value: "8.2%",
    change: "+2.1%",
    isPositive: true,
    icon: Heart,
    color: "accent",
  },
  {
    title: "Revenue",
    value: "$48,250",
    change: "+18.2%",
    isPositive: true,
    icon: DollarSign,
    color: "success",
  },
  {
    title: "Active Leads",
    value: "342",
    change: "-3.1%",
    isPositive: false,
    icon: TrendingUp,
    color: "info",
  },
];

const engagementData = [
  { name: "Mon", value: 4000, posts: 2 },
  { name: "Tue", value: 3000, posts: 3 },
  { name: "Wed", value: 5000, posts: 1 },
  { name: "Thu", value: 4500, posts: 4 },
  { name: "Fri", value: 6000, posts: 2 },
  { name: "Sat", value: 8000, posts: 3 },
  { name: "Sun", value: 7500, posts: 2 },
];

const platformData = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "Twitter", value: 25, color: "#1DA1F2" },
  { name: "LinkedIn", value: 20, color: "#0A66C2" },
  { name: "TikTok", value: 10, color: "#00F2EA" },
];

const recentActivity = [
  { platform: "Instagram", type: "Post Published", time: "2 min ago", engagement: "1.2K likes" },
  { platform: "Twitter", type: "Mention", time: "15 min ago", engagement: "230 retweets" },
  { platform: "LinkedIn", type: "Article Shared", time: "1 hr ago", engagement: "89 reactions" },
  { platform: "TikTok", type: "Video Trending", time: "3 hrs ago", engagement: "45K views" },
];

const upcomingPosts = [
  { title: "Product Launch Announcement", platform: "All Platforms", time: "Today, 3:00 PM" },
  { title: "Behind the Scenes", platform: "Instagram, TikTok", time: "Tomorrow, 10:00 AM" },
  { title: "Weekly Tips Thread", platform: "Twitter", time: "Tomorrow, 2:00 PM" },
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

export function DashboardView() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={item}>
              <Card variant="glow" className="group cursor-pointer hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold font-heading">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {stat.isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        )}
                        <span
                          className={
                            stat.isPositive ? "text-sm text-success" : "text-sm text-destructive"
                          }
                        >
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last week</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Engagement Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174 72% 56%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(174 72% 56%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(222 30% 18%)",
                        borderRadius: "8px",
                        color: "hsl(210 40% 98%)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(174 72% 56%)"
                      strokeWidth={2}
                      fill="url(#engagementGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div variants={item}>
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(222 30% 18%)",
                        borderRadius: "8px",
                        color: "hsl(210 40% 98%)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {platformData.map((platform) => (
                  <div key={platform.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-xs text-muted-foreground">{platform.name}</span>
                    <span className="ml-auto text-xs font-medium">{platform.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.platform} • {activity.time}
                      </p>
                    </div>
                    <span className="text-sm text-primary">{activity.engagement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Posts */}
        <motion.div variants={item}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPosts.map((post, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.platform}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
