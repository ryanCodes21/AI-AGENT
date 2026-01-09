import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  MoreVertical,
  ArrowUpRight,
  Star,
  StarOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string;
  value: number;
  starred: boolean;
  lastContact: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp Industries",
    phone: "+1 555-0123",
    status: "qualified",
    source: "LinkedIn",
    value: 15000,
    starred: true,
    lastContact: "2 hours ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@startup.io",
    company: "Startup.io",
    phone: "+1 555-0456",
    status: "new",
    source: "Website",
    value: 8500,
    starred: false,
    lastContact: "1 day ago",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@creative.co",
    company: "Creative Co",
    phone: "+1 555-0789",
    status: "contacted",
    source: "Instagram",
    value: 12000,
    starred: true,
    lastContact: "3 hours ago",
  },
  {
    id: "4",
    name: "Robert Wilson",
    email: "r.wilson@enterprise.com",
    company: "Enterprise Solutions",
    phone: "+1 555-0321",
    status: "converted",
    source: "Referral",
    value: 45000,
    starred: false,
    lastContact: "1 week ago",
  },
  {
    id: "5",
    name: "Amanda Brown",
    email: "amanda@retail.shop",
    company: "Retail Shop",
    phone: "+1 555-0654",
    status: "lost",
    source: "Twitter",
    value: 5000,
    starred: false,
    lastContact: "2 weeks ago",
  },
];

const statusColors = {
  new: "bg-info/10 text-info",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-primary/10 text-primary",
  converted: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LeadsView() {
  const [leads, setLeads] = useState(mockLeads);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setLeads(leads.map((lead) => (lead.id === id ? { ...lead, starred: !lead.starred } : lead)));
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    totalValue: leads.reduce((acc, l) => acc + l.value, 0),
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users },
          { label: "New Leads", value: stats.new, icon: Plus },
          { label: "Qualified", value: stats.qualified, icon: Star },
          { label: "Pipeline Value", value: `$${stats.totalValue.toLocaleString()}`, icon: ArrowUpRight },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card variant="glass">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold font-heading">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
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
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="glow" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={item}>
        <Card variant="glass">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lead
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Last Contact
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="group transition-colors hover:bg-secondary/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleStar(lead.id)} className="text-muted-foreground hover:text-warning">
                            {lead.starred ? (
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                            <span className="text-sm font-medium text-primary-foreground">
                              {lead.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{lead.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[lead.status]}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">${lead.value.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{lead.source}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{lead.lastContact}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon-sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
