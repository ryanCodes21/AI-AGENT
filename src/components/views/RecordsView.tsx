import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Edit,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface BusinessRecord {
  id: string;
  record_type: string;
  title: string;
  description: string | null;
  amount: number | null;
  category: string | null;
  date: string;
  ai_summary: string | null;
  ai_insights: string | null;
  tags: string[] | null;
  created_at: string;
}

const recordTypes = [
  { value: "income", label: "Income", color: "text-success" },
  { value: "expense", label: "Expense", color: "text-destructive" },
  { value: "transaction", label: "Transaction", color: "text-info" },
  { value: "note", label: "Note", color: "text-muted-foreground" },
  { value: "meeting", label: "Meeting", color: "text-accent" },
  { value: "task", label: "Task", color: "text-primary" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function RecordsView() {
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [analyzingRecord, setAnalyzingRecord] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    record_type: "income",
    title: "",
    description: "",
    amount: 0,
    category: "",
    date: format(new Date(), "yyyy-MM-dd"),
    tags: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("business_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
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

      const { error } = await supabase.from("business_records").insert({
        user_id: user.id,
        record_type: formData.record_type,
        title: formData.title,
        description: formData.description || null,
        amount: formData.amount || null,
        category: formData.category || null,
        date: formData.date,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : null,
      });

      if (error) throw error;
      toast.success("Record added!");
      setShowModal(false);
      setFormData({
        record_type: "income",
        title: "",
        description: "",
        amount: 0,
        category: "",
        date: format(new Date(), "yyyy-MM-dd"),
        tags: "",
      });
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from("business_records").delete().eq("id", id);
      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
      toast.success("Record deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const analyzeWithAI = async (record: BusinessRecord) => {
    setAnalyzingRecord(record.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "record_analysis",
          recordData: {
            type: record.record_type,
            title: record.title,
            description: record.description,
            amount: record.amount,
            category: record.category,
          },
        },
      });

      if (error) throw error;

      await supabase
        .from("business_records")
        .update({ ai_insights: data.content })
        .eq("id", record.id);

      setRecords(records.map(r => 
        r.id === record.id ? { ...r, ai_insights: data.content } : r
      ));
      toast.success("AI analysis complete");
    } catch (error: any) {
      toast.error("Failed to analyze record");
    } finally {
      setAnalyzingRecord(null);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || record.record_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalIncome: records.filter(r => r.record_type === "income").reduce((sum, r) => sum + (r.amount || 0), 0),
    totalExpenses: records.filter(r => r.record_type === "expense").reduce((sum, r) => sum + (r.amount || 0), 0),
    totalRecords: records.length,
    thisMonth: records.filter(r => {
      const recordDate = new Date(r.date);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Income", value: `$${stats.totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
          { label: "Total Expenses", value: `$${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
          { label: "Net Balance", value: `$${(stats.totalIncome - stats.totalExpenses).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
          { label: "This Month", value: stats.thisMonth, icon: Calendar, color: "text-info" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card variant="glass">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
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
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            {recordTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Button variant="glow" className="gap-2" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Record</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </motion.div>

      {/* Records List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card variant="glass" className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">No records yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start tracking your business activities</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <motion.div key={record.id} variants={item}>
              <Card variant="glass" className="group">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-secondary ${recordTypes.find(t => t.value === record.record_type)?.color}`}>
                          {recordTypes.find(t => t.value === record.record_type)?.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{format(new Date(record.date), "MMM d, yyyy")}</span>
                      </div>
                      <h4 className="font-medium mt-2 truncate">{record.title}</h4>
                      {record.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{record.description}</p>
                      )}
                      {record.ai_insights && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 text-xs text-primary mb-1">
                            <Sparkles className="h-3 w-3" />
                            AI Insights
                          </div>
                          <p className="text-sm text-muted-foreground">{record.ai_insights}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2">
                      {record.amount !== null && (
                        <span className={`text-lg font-bold ${record.record_type === "income" ? "text-success" : record.record_type === "expense" ? "text-destructive" : "text-foreground"}`}>
                          {record.record_type === "income" ? "+" : record.record_type === "expense" ? "-" : ""}${Math.abs(record.amount).toLocaleString()}
                        </span>
                      )}
                      <div className="flex gap-1">
                        {!record.ai_insights && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => analyzeWithAI(record)}
                            disabled={analyzingRecord === record.id}
                            className="gap-1 text-xs"
                          >
                            <Sparkles className="h-3 w-3" />
                            {analyzingRecord === record.id ? "..." : "Analyze"}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteRecord(record.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Card variant="glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add Business Record</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Record Type *</label>
                    <select
                      value={formData.record_type}
                      onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                    >
                      {recordTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      <label className="text-sm font-medium">Amount ($)</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      placeholder="e.g., Marketing, Sales, Operations"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      placeholder="e.g., urgent, Q1, client-abc"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="glow" className="flex-1">
                      Add Record
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