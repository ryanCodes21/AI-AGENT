import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Clock,
  Image,
  Video,
  FileText,
  Instagram,
  Twitter,
  Linkedin,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledTime: string;
  status: "scheduled" | "draft" | "published";
  type: "image" | "video" | "text";
}

const mockPosts: ScheduledPost[] = [
  {
    id: "1",
    title: "Product Launch Announcement",
    content: "Excited to announce our new product line! Check out the link in bio for more details. #newproduct #launch",
    platforms: ["instagram", "twitter", "linkedin"],
    scheduledTime: "Today, 3:00 PM",
    status: "scheduled",
    type: "image",
  },
  {
    id: "2",
    title: "Behind the Scenes",
    content: "A sneak peek into our creative process. What do you think?",
    platforms: ["instagram"],
    scheduledTime: "Tomorrow, 10:00 AM",
    status: "scheduled",
    type: "video",
  },
  {
    id: "3",
    title: "Weekly Tips Thread",
    content: "🧵 Thread: 10 tips to boost your social media engagement this week...",
    platforms: ["twitter"],
    scheduledTime: "Tomorrow, 2:00 PM",
    status: "draft",
    type: "text",
  },
  {
    id: "4",
    title: "Industry Insights",
    content: "Our latest analysis on market trends shows interesting patterns...",
    platforms: ["linkedin"],
    scheduledTime: "Wed, 9:00 AM",
    status: "scheduled",
    type: "text",
  },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "twitter":
      return <Twitter className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    default:
      return null;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "text":
      return <FileText className="h-4 w-4" />;
    default:
      return null;
  }
};

export function SchedulerView() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header Actions */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Content Calendar</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage your social media posts</p>
        </div>
        <Button variant="glow" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </motion.div>

      {/* Week View */}
      <motion.div variants={item}>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {calendarDays.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex min-w-[80px] flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-xs font-medium">{weekDays[date.getDay()]}</span>
                    <span className={`text-2xl font-bold ${isToday && !isSelected ? "text-primary" : ""}`}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-primary"}`}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scheduled Posts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {mockPosts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <Card variant="glass" className="group transition-all hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      {getTypeIcon(post.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.scheduledTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {post.content}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.platforms.map((platform) => (
                      <div
                        key={platform}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {getPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === "scheduled"
                        ? "bg-primary/10 text-primary"
                        : post.status === "draft"
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
