import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService, productService, categoryService, brandService, sellerService, Product } from "@/services/api";
import { Pencil, Trash2, Plus, Package, ShoppingBag, TrendingUp, Leaf, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  // Seller Dashboard State
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // Admin State
  const [adminStats, setAdminStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      if (payload.role !== 'ADMIN' && payload.role !== 'SELLER') {
        toast.error("Unauthorized access");
        navigate("/");
      }
    } catch (e) {
      navigate("/auth");
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;

      if (role === 'SELLER') {
        const [productsRes, stats, orders] = await Promise.all([
          sellerService.getProducts(),
          sellerService.getStats(),
          sellerService.getOrders()
        ]);
        setProducts(productsRes || []);
        setSellerStats(stats);
        setSellerOrders(orders || []);
      } else if (role === 'ADMIN') {
        const [productsRes, insights, analytics, usersRes] = await Promise.all([
          productService.getAll(),
          adminService.getInsights(),
          adminService.getAnalytics(),
          adminService.getAllUsers()
        ]);
        setProducts(productsRes || []);
        setAdminStats(insights);
        setAnalyticsData(analytics || []);
        setUsers(usersRes || []);
      }

      const [categoriesRes, brandsRes] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll(),
      ]);

      setCategories(categoriesRes || []);
      setBrands(brandsRes || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (formData: any) => {
    try {
      // category_id now holds the name string directly from the static list
      const selectedCategoryName = formData.category_id;
      const selectedBrand = brands.find((b: any) => String(b.id) === String(formData.brand_id));

      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp || formData.price),
        stockQuantity: parseInt(formData.stock),
        carbonFootprintPerUnit: parseFloat(formData.carbon_footprint),
        categoryName: selectedCategoryName || "Others",
        brand: selectedBrand ? selectedBrand.name : "",
        sku: formData.sku,
        images: formData.images ? formData.images.split(",").map((url: string) => url.trim()) : [],
      };

      if (editingProduct?.id) {
        await productService.update(editingProduct.id, productData);
        toast.success("Product updated!");
      } else {
        await productService.create(productData);
        toast.success("Product created!");
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productService.delete(id);
      toast.success("Product deleted!");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      await adminService.updateUserStatus(user.id, !user.enabled);
      toast.success(`User ${user.enabled ? 'blocked' : 'unblocked'}`);
      fetchData(); // refresh
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleViewOrder = async (orderId: number | string) => {
    if (userRole === 'SELLER') {
      try {
        const details = await sellerService.getOrderDetails(orderId);
        setSelectedOrder(details);
        setIsOrderDialogOpen(true);
      } catch (error) {
        toast.error("Failed to load order details");
      }
    }
  };

  // Imports for Recharts need to be at top, assuming they are available.
  // We will need to dynamic import or just rely on package being installed.
  // const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = await import('recharts'); 
  // Since we can't do async import inside component easily without React.lazy, 
  // we assume standard imports are added at top of file. 

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">{userRole === 'SELLER' ? 'Seller Dashboard' : 'Admin Dashboard'}</h1>
            <p className="text-muted-foreground">Manage your eco-friendly business</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary-light"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                categories={categories}
                brands={brands}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* ADMIN DASHBOARD */}
        {userRole === 'ADMIN' && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{adminStats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats?.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">{adminStats?.totalSellers || 0} Sellers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                    <Leaf className="h-4 w-4 text-eco" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-eco">{adminStats?.totalCo2Saved?.toFixed(1) || 0} kg</div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                      {/* Placeholder for Chart - Recharts import handled at top */}
                      <RechartsBarChart data={analyticsData} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">Total Products</p>
                          <p className="text-sm text-muted-foreground">
                            {adminStats?.totalProducts || 0} active products listing
                          </p>
                        </div>
                        <div className="ml-auto font-medium">Active</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : user.role === 'SELLER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span></TableCell>
                          <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.enabled ? 'Active' : 'Blocked'}</span></TableCell>
                          <TableCell className="text-right">
                            {user.role !== 'ADMIN' && (
                              <Button size="sm" variant={user.enabled ? "destructive" : "default"} onClick={() => handleToggleUserStatus(user)}>
                                {user.enabled ? "Block" : "Unblock"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>CO₂ Saved</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.stockQuantity}</TableCell>
                          <TableCell>{product.carbonSavedPerItem?.toFixed(1) || '0.0'}kg</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <h3 className="font-bold text-destructive mb-2">System Reset</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This action will <strong>permanently delete</strong> all Users (except Admins), Orders, Carts, and Reviews.
                      Products and Categories will remain. This is intended for starting fresh.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (confirm("WARNING: This will wipe all customer data. Are you absolutely sure?")) {
                          if (confirm("Double Check: This cannot be undone. Proceed?")) {
                            try {
                              await adminService.resetSystem();
                              toast.success("System reset successful. All customer data wiped.");
                              fetchData();
                            } catch (e: any) {
                              toast.error("Reset failed: " + (e.response?.data?.message || e.message));
                            }
                          }
                        }
                      }}
                    >
                      Reset System Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* SELLER DASHBOARD (Existing) */}
        {userRole === 'SELLER' && sellerStats && (
          // ... (Previous Seller Dashboard Code - keep layout) ...
          // Simplify for this replacement tool: I will reconstruct the Seller part below logic
          // Actually, better to just put the seller logic in a separate block like before
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalProducts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalStock}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalOrders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{sellerStats.totalRevenue?.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                  <Leaf className="h-4 w-4 text-eco" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-eco">{sellerStats.totalCo2Saved?.toFixed(1)} kg</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>CO₂ Saved per item</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>₹{product.price}</TableCell>
                              <TableCell>{product.stockQuantity}</TableCell>
                              <TableCell>{product.carbonSavedPerItem?.toFixed(1) || '0.0'}kg</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sellerOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No orders yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>CO₂ Saved</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sellerOrders.map((order) => (
                              <TableRow key={order.orderId} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewOrder(order.orderId)}>
                                <TableCell>#{order.orderId}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.itemsCount}</TableCell>
                                <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
                                <TableCell className="text-eco">{order.totalCo2Saved?.toFixed(1)} kg</TableCell>
                                <TableCell><span className="capitalize">{order.status}</span></TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewOrder(order.orderId); }}>View</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder?.orderId}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Items from your store</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">CO₂ Saved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">₹{item.pricePerUnit}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.subtotal?.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-eco">{item.co2Saved?.toFixed(2)} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-8 pt-4 border-t">
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Total CO₂ Saved</p>
                    <p className="text-xl font-bold text-eco">{selectedOrder.totalCo2Saved?.toFixed(2)} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                    <p className="text-xl font-bold">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

// Internal Component for Recharts to handle lazy loading cleanly (or static)

function RechartsBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
        <Tooltip />
        <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const ProductForm = ({ product, categories, brands, onSave, onCancel }: { product: Product | null, categories: any[], brands: any[], onSave: (data: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState(
    product ? {
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      mrp: product.mrp ? String(product.mrp) : "",
      stock: product.stockQuantity ? String(product.stockQuantity) : "",
      carbon_footprint: product.carbonFootprintPerUnit ? String(product.carbonFootprintPerUnit) : "",
      // Use categoryName directly as ID since we switched to static list
      category_id: product.categoryName || "",
      brand_id: product.brand ? String(brands.find((b: any) => b.name === product.brand)?.id || "") : "",
      sku: product.sku || "",
      images: product.images ? product.images.join(", ") : "",
    } : {
      name: "",
      description: "",
      price: "",
      mrp: "",
      stock: "",
      carbon_footprint: "",
      category_id: "", // Will hold the category string name now
      brand_id: "",
      sku: "",
      images: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="mrp">MRP</Label>
          <Input
            id="mrp"
            type="number"
            step="0.01"
            value={formData.mrp}
            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="carbon">Carbon Footprint (kg CO₂ per item) *</Label>
          <div className="space-y-1">
            <Input
              id="carbon"
              type="number"
              step="0.1"
              value={formData.carbon_footprint}
              onChange={(e) => setFormData({ ...formData, carbon_footprint: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={String(formData.category_id)} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Eco-Friendly Groceries",
                "Personal Care (Eco-Friendly)",
                "Eco Kitchenware",
                "Green Electronics",
                "Eco-Home & Living",
                "Sustainable Fashion",
                "Others"
              ].map((catName) => (
                <SelectItem key={catName} value={catName}>
                  {catName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand">Brand *</Label>
          <Select value={String(formData.brand_id)} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand: any) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="images">Images (comma-separated URLs)</Label>
        <Textarea
          id="images"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          placeholder="https://image1.jpg, https://image2.jpg"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary-light">
          {product ? "Update" : "Create"} Product
        </Button>
      </div>
    </form>
  );
};

export default Admin;
