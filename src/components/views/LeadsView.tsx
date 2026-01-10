import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Star,
  StarOff,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string | null;
  value: number;
  starred: boolean;
  ai_score: number | null;
  last_contact: string | null;
}

const statusColors = {
  new: "bg-info/10 text-info",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-primary/10 text-primary",
  converted: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [scoringLead, setScoringLead] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    source: "",
    value: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast.error("Failed to load leads");
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

      const { error } = await supabase.from("leads").insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        phone: formData.phone || null,
        source: formData.source || null,
        value: formData.value,
        status: "new",
        starred: false,
      });

      if (error) throw error;
      toast.success("Lead added!");
      setShowModal(false);
      setFormData({ name: "", email: "", company: "", phone: "", source: "", value: 0 });
      fetchLeads();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleStar = async (lead: Lead) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ starred: !lead.starred })
        .eq("id", lead.id);

      if (error) throw error;
      setLeads(leads.map(l => l.id === lead.id ? { ...l, starred: !l.starred } : l));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateStatus = async (lead: Lead, status: Lead["status"]) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status, last_contact: new Date().toISOString() })
        .eq("id", lead.id);

      if (error) throw error;
      setLeads(leads.map(l => l.id === lead.id ? { ...l, status } : l));
      toast.success(`Status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      setLeads(leads.filter(l => l.id !== id));
      toast.success("Lead deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const scoreLeadWithAI = async (lead: Lead) => {
    setScoringLead(lead.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "lead_score",
          leadData: {
            name: lead.name,
            company: lead.company || "Unknown",
            source: lead.source || "Direct",
            value: lead.value,
          },
        },
      });

      if (error) throw error;

      // Parse AI response
      let score = 50;
      try {
        const parsed = JSON.parse(data.content);
        score = parsed.score || 50;
      } catch {
        // If parsing fails, extract number from response
        const match = data.content.match(/\d+/);
        if (match) score = parseInt(match[0]);
      }

      await supabase.from("leads").update({ ai_score: score }).eq("id", lead.id);
      setLeads(leads.map(l => l.id === lead.id ? { ...l, ai_score: score } : l));
      toast.success(`Lead scored: ${score}/100`);
    } catch (error: any) {
      toast.error("Failed to score lead");
    } finally {
      setScoringLead(null);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    totalValue: leads.reduce((acc, l) => acc + (l.value || 0), 0),
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: stats.total },
          { label: "New Leads", value: stats.new },
          { label: "Qualified", value: stats.qualified },
          { label: "Pipeline Value", value: `$${stats.totalValue.toLocaleString()}` },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card variant="glass">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Actions */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <Button variant="glow" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </motion.div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card variant="glass" className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">No leads yet</h3>
            <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Lead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card variant="glass">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">Lead</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">AI Score</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="group transition-colors hover:bg-secondary/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleStar(lead)}>
                            {lead.starred ? (
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead, e.target.value as Lead["status"])}
                          className={`rounded-full px-3 py-1 text-xs font-medium bg-transparent border-none cursor-pointer ${statusColors[lead.status]}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-medium">${lead.value.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {lead.ai_score !== null ? (
                          <span className={`font-medium ${lead.ai_score >= 70 ? "text-success" : lead.ai_score >= 40 ? "text-warning" : "text-destructive"}`}>
                            {lead.ai_score}/100
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scoreLeadWithAI(lead)}
                            disabled={scoringLead === lead.id}
                            className="gap-1 text-xs"
                          >
                            <Sparkles className="h-3 w-3" />
                            {scoringLead === lead.id ? "Scoring..." : "Score"}
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteLead(lead.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <Card variant="glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add New Lead</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Source</label>
                      <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                        placeholder="e.g., LinkedIn, Website"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value ($)</label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="glow" className="flex-1">
                      Add Lead
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
