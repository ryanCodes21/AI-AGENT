import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Clock,
  Image,
  Video,
  FileText,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle,
  Share2,
  Instagram,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduled_time: string;
  status: "draft" | "scheduled" | "published" | "failed";
  hashtags: string[] | null;
  ai_generated: boolean;
}

const platformShareUrls: Record<string, (content: string) => string> = {
  facebook: (content) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(content)}`,
  twitter: (content) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`,
  linkedin: (content) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(content)}`,
  whatsapp: (content) => `https://wa.me/?text=${encodeURIComponent(content)}`,
  tiktok: () => `https://www.tiktok.com/upload`,
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, string> = {
    facebook: "📘",
    twitter: "🐦",
    linkedin: "💼",
    instagram: "📸",
    tiktok: "🎵",
    whatsapp: "💬",
  };
  return <span className="text-lg">{icons[platform] || "📱"}</span>;
};

export function SchedulerView() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    platforms: [] as string[],
    scheduled_time: "",
    status: "draft" as const,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "content",
          postData: {
            topic: formData.title || "engaging social media content",
            platform: formData.platforms[0] || "all platforms",
            tone: "professional yet friendly",
          },
        },
      });

      if (error) throw error;
      setFormData({ ...formData, content: data.content });
      toast.success("AI content generated!");
    } catch (error: any) {
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const { error } = await supabase.from("scheduled_posts").insert({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        scheduled_time: formData.scheduled_time || new Date().toISOString(),
        status: formData.status,
      });

      if (error) throw error;
      toast.success("Post created!");
      setShowModal(false);
      setFormData({ title: "", content: "", platforms: [], scheduled_time: "", status: "draft" });
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
      toast.success("Post deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sharePost = (post: ScheduledPost, platform: string) => {
    if (platform === "instagram") {
      copyToClipboard(post);
      toast.success("Content copied! Now open Instagram to post", {
        description: "Paste the content in your Instagram app",
        duration: 5000,
      });
      return;
    }
    const url = platformShareUrls[platform]?.(post.content);
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      toast.success(`Opening ${platform} share dialog`);
    }
  };

  const copyToClipboard = async (post: ScheduledPost) => {
    const fullContent = post.hashtags 
      ? `${post.content}\n\n${post.hashtags.join(" ")}`
      : post.content;
    await navigator.clipboard.writeText(fullContent);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Content copied to clipboard!");
  };

  const markAsPublished = async (post: ScheduledPost) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: "published" })
        .eq("id", post.id);
      if (error) throw error;
      setPosts(posts.map(p => p.id === post.id ? { ...p, status: "published" } : p));
      toast.success("Post marked as published!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
  const allPlatforms = ["facebook", "twitter", "linkedin", "instagram", "tiktok", "whatsapp"];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Content Calendar</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage your social media posts</p>
        </div>
        <Button variant="glow" className="gap-2" onClick={() => setShowModal(true)}>
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
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-xs font-medium">{weekDays[date.getDay()]}</span>
                    <span className={`text-2xl font-bold ${isToday && !isSelected ? "text-primary" : ""}`}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : posts.length === 0 ? (
        <motion.div variants={item}>
          <Card variant="glass" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading text-lg font-medium">No posts scheduled</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first post to get started</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <Card variant="glass" className="group transition-all hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(post.scheduled_time).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{post.content}</p>

                  {/* Quick Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(post)}
                      className="gap-1 text-xs"
                    >
                      {copiedId === post.id ? (
                        <CheckCircle className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copiedId === post.id ? "Copied!" : "Copy"}
                    </Button>
                    {post.status !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsPublished(post)}
                        className="gap-1 text-xs"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Mark Posted
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.platforms.map((platform) => (
                        <button
                          key={platform}
                          onClick={() => sharePost(post, platform)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                          title={platform === "instagram" ? "Copy & open Instagram" : `Share on ${platform}`}
                        >
                          <PlatformIcon platform={platform} />
                        </button>
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        post.status === "scheduled"
                          ? "bg-primary/10 text-primary"
                          : post.status === "draft"
                          ? "bg-warning/10 text-warning"
                          : post.status === "published"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
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
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card variant="glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create New Post</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      placeholder="Post title or topic"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Content</label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateAIContent}
                        disabled={generating}
                        className="gap-1 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generating ? "Generating..." : "AI Generate"}
                      </Button>
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="mt-1 min-h-24 w-full rounded-lg border border-border bg-secondary/50 p-4 text-sm outline-none focus:border-primary resize-none"
                      placeholder="Write your post content..."
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platforms</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allPlatforms.map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            const platforms = formData.platforms.includes(platform)
                              ? formData.platforms.filter((p) => p !== platform)
                              : [...formData.platforms, platform];
                            setFormData({ ...formData, platforms });
                          }}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                            formData.platforms.includes(platform)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <PlatformIcon platform={platform} />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schedule Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="glow" className="flex-1">
                      Create Post
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
