import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { wishlistService, cartService, Product } from "@/services/api";
import { Trash2, Heart, ShoppingCart, Leaf } from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  product: Product;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchWishlist();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/auth");
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setItems(data || []);
    } catch (error: any) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await wishlistService.removeFromWishlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error("Failed to remove item");
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await cartService.addToCart(productId, 1);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-secondary">My Wishlist</h1>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-square animate-pulse bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Your wishlist is empty</h3>
            <p className="mt-2 text-muted-foreground">Save items you love for later</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <Link to={`/product/${item.product.slug}`}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Leaf className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded-full bg-eco-green px-2 py-1 text-xs font-semibold text-white">
                      <Leaf className="mr-1 inline h-3 w-3" />
                      {item.product.carbonFootprintPerUnit}kg CO₂
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link to={`/product/${item.product.slug}`}>
                    <h3 className="line-clamp-2 font-semibold text-foreground hover:text-primary">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{item.product.price}</span>
                    {item.product.mrp && item.product.mrp > item.product.price && (
                      <span className="text-sm text-muted-foreground line-through">₹{item.product.mrp}</span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary-light"
                      onClick={() => addToCart(item.product.id)}
                      disabled={!item.product.stockQuantity || item.product.stockQuantity === 0}
                    >
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
