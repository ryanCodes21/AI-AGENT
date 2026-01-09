import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  trend: "up" | "down" | "stable";
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Hoodie - Black",
    sku: "HOD-BLK-001",
    category: "Apparel",
    quantity: 145,
    minStock: 50,
    price: 79.99,
    status: "in-stock",
    trend: "up",
  },
  {
    id: "2",
    name: "Wireless Earbuds Pro",
    sku: "EAR-PRO-002",
    category: "Electronics",
    quantity: 23,
    minStock: 30,
    price: 149.99,
    status: "low-stock",
    trend: "down",
  },
  {
    id: "3",
    name: "Organic Face Serum",
    sku: "SER-ORG-003",
    category: "Beauty",
    quantity: 0,
    minStock: 25,
    price: 45.99,
    status: "out-of-stock",
    trend: "down",
  },
  {
    id: "4",
    name: "Eco Water Bottle",
    sku: "BTL-ECO-004",
    category: "Lifestyle",
    quantity: 89,
    minStock: 40,
    price: 34.99,
    status: "in-stock",
    trend: "stable",
  },
  {
    id: "5",
    name: "Smart Fitness Watch",
    sku: "WTC-FIT-005",
    category: "Electronics",
    quantity: 12,
    minStock: 20,
    price: 299.99,
    status: "low-stock",
    trend: "up",
  },
];

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

export function InventoryView() {
  const [inventory] = useState(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter((i) => i.status === "low-stock").length,
    outOfStock: inventory.filter((i) => i.status === "out-of-stock").length,
    totalValue: inventory.reduce((acc, i) => acc + i.quantity * i.price, 0),
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
          { label: "Total Products", value: stats.totalItems, icon: Package, color: "primary" },
          { label: "Low Stock", value: stats.lowStock, icon: TrendingDown, color: "warning" },
          { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangle, color: "destructive" },
          { label: "Inventory Value", value: `$${stats.totalValue.toLocaleString()}`, icon: BarChart3, color: "success" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card variant="glass">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`rounded-lg p-3 bg-${stat.color}/10`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
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
            placeholder="Search inventory..."
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
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Inventory Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredInventory.map((product) => (
          <motion.div key={product.id} variants={item}>
            <Card variant="glass" className="group transition-all hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                  <span className="text-lg font-bold">${product.price}</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className={`flex items-center gap-1 ${
                      product.trend === "up" ? "text-success" : product.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {product.trend === "up" ? <TrendingUp className="h-3 w-3" /> : product.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                      {product.quantity} units
                    </span>
                  </div>
                  <Progress
                    value={Math.min((product.quantity / product.minStock) * 50, 100)}
                    className="mt-2 h-2"
                  />
                </div>

                <div className="mt-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.status === "in-stock"
                        ? "bg-success/10 text-success"
                        : product.status === "low-stock"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {product.status === "in-stock" ? "In Stock" : product.status === "low-stock" ? "Low Stock" : "Out of Stock"}
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
