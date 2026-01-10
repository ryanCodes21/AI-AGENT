import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  quantity: number;
  min_stock: number;
  price: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  image_url: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function InventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    min_stock: 10,
    price: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (quantity: number, minStock: number): InventoryItem["status"] => {
    if (quantity === 0) return "out_of_stock";
    if (quantity <= minStock) return "low_stock";
    return "in_stock";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const status = getStatus(formData.quantity, formData.min_stock);

      const { error } = await supabase.from("inventory").insert({
        user_id: user.id,
        name: formData.name,
        sku: formData.sku,
        category: formData.category || null,
        quantity: formData.quantity,
        min_stock: formData.min_stock,
        price: formData.price,
        status,
      });

      if (error) throw error;
      toast.success("Product added!");
      setShowModal(false);
      setFormData({ name: "", sku: "", category: "", quantity: 0, min_stock: 10, price: 0 });
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateQuantity = async (item: InventoryItem, change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    const status = getStatus(newQuantity, item.min_stock);

    try {
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: newQuantity, status })
        .eq("id", item.id);

      if (error) throw error;
      setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: newQuantity, status } : i));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
      setInventory(inventory.filter(i => i.id !== id));
      toast.success("Product deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => i.status === "low_stock").length,
    outOfStock: inventory.filter(i => i.status === "out_of_stock").length,
    totalValue: inventory.reduce((acc, i) => acc + (i.quantity * i.price), 0),
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products", value: stats.totalItems, icon: Package, color: "primary" },
          { label: "Low Stock", value: stats.lowStock, icon: TrendingDown, color: "warning" },
          { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangle, color: "destructive" },
          { label: "Inventory Value", value: `$${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: "success" },
        ].map((stat) => {
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
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <Button variant="glow" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </motion.div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredInventory.length === 0 ? (
        <Card variant="glass" className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium">No products yet</h3>
            <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteItem(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</span>
                    <span className="text-lg font-bold">${product.price}</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock Level</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product, -1)}
                          className="h-6 w-6 rounded bg-secondary hover:bg-secondary/80 text-sm"
                        >
                          -
                        </button>
                        <span className="font-medium">{product.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product, 1)}
                          className="h-6 w-6 rounded bg-secondary hover:bg-secondary/80 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <Progress
                      value={Math.min((product.quantity / product.min_stock) * 50, 100)}
                      className="mt-2 h-2"
                    />
                  </div>

                  <div className="mt-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.status === "in_stock"
                          ? "bg-success/10 text-success"
                          : product.status === "low_stock"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {product.status === "in_stock" ? "In Stock" : product.status === "low_stock" ? "Low Stock" : "Out of Stock"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <Card variant="glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add New Product</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">SKU *</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Min Stock</label>
                      <input
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 10 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-secondary/50 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="glow" className="flex-1">
                      Add Product
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
