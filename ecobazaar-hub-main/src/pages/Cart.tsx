import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cartService, Product } from "@/services/api";
import { Trash2, ShoppingBag, Leaf } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
  availableStock?: number;
  carbonFootprintPerUnit?: number;
  carbonSavedPerItem?: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCart();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/auth");
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      // Map CartDto to CartItem interface if necessary, or update interface to match DTO
      // Assuming CartDto has items list
      setCartItems(data.items || []);
    } catch (error: any) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      const data = await cartService.updateItem(itemId, newQuantity);
      setCartItems(data.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(true);
    try {
      const data = await cartService.removeItem(itemId);
      setCartItems(data.items || []);
      toast.success("Item removed");
    } catch (error: any) {
      toast.error("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const totalCarbonSaved = cartItems.reduce(
    (sum, item) => sum + (item.carbonSavedPerItem || 0) * item.quantity,
    0
  );

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-secondary">Shopping Cart</h1>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-24 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-muted-foreground">Start shopping to add items to your cart</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Leaf className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{item.productName}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <Leaf className="mr-1 inline h-3 w-3 text-eco-green" />
                            {item.carbonSavedPerItem?.toFixed(1) || 0}kg CO₂ saved per item
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id.toString(), item.quantity - 1)}
                              disabled={updating || item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id.toString(), parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              disabled={updating}
                              min="1"
                              max={item.availableStock || 100}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id.toString(), item.quantity + 1)}
                              disabled={updating || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-primary">
                              ₹{(item.productPrice * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeItem(item.id.toString())}
                              disabled={updating}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Order Summary</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-eco-green-light p-4">
                    <div className="flex items-center gap-2 text-eco-green-dark">
                      <Leaf className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Environmental Impact</p>
                        <p className="text-sm">You'll save {totalCarbonSaved.toFixed(2)}kg of CO₂!</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary-light" onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                  </Button>

                  {subtotal < 500 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
