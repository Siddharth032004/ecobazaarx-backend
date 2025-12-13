import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { productService, Product } from "@/services/api";
import { Leaf, ShoppingBag, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import PopularCategories from "@/components/PopularCategories";
import juteBagImg from "@/assets/hero/jute-bag.jpg";
import womenImg from "@/assets/hero/women.jpg";
import leafImg from "@/assets/hero/leaf.png";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch newest 6 products to show as featured
      const response = await productService.getPaginated(0, 6);
      setFeaturedProducts(response.content || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* New 3-Card Animated Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <ScrollParallax>
          <div className="grid h-auto w-full gap-6 md:grid-cols-1 lg:h-[600px] lg:grid-cols-3">
            {/* Main Left Card - Big Hero */}
            <div className="group relative w-full overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.01] lg:col-span-2 animate-in slide-in-from-left duration-700 fade-in">
              <img
                src={juteBagImg}
                alt="Sustainable Shopping"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Dark Overlay - Horizontal Gradient to keep bag visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 p-8 md:p-12 z-10">
                <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-forwards">
                  Shop Sustainably,<br />
                  <span className="text-eco-green-light">Save the Planet</span>
                </h1>
                <p className="mb-6 max-w-xl text-lg text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
                  Discover eco-friendly products and track your carbon impact with every purchase.
                </p>

                {/* Stats Row */}
                <div className="mb-8 flex flex-wrap gap-8 text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-forwards">
                  <div>
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-xs text-gray-300">Eco Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">15K+</p>
                    <p className="text-xs text-gray-300">Happy Customers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-eco-green-light">500kg</p>
                    <p className="text-xs text-gray-300">CO₂ Saved</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-forwards">
                  <Button size="lg" asChild className="bg-primary hover:bg-primary-light border-none">
                    <Link to="/products">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Start Eco Shopping
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/50 text-white bg-black/20 backdrop-blur-md hover:bg-black/40 hover:text-white" asChild>
                    <Link to="/admin">
                      View Carbon Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Stacked Cards */}
            <div className="flex w-full flex-col gap-6 lg:col-span-1">
              {/* Top Right Card */}
              <div className="group relative flex-1 overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.02] animate-in slide-in-from-right duration-700 delay-200 fade-in">
                <img
                  src={womenImg}
                  alt="Low Carbon Groceries"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <h2 className="text-2xl font-bold text-white mb-1">Low-Carbon Groceries</h2>
                  <p className="text-sm text-gray-200 mb-4">Fresh, seasonal produce with transparent CO₂ scores.</p>
                  <Link to="/products?category=groceries" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-105">
                    Browse Groceries &rarr;
                  </Link>
                </div>
              </div>

              {/* Bottom Right Card */}
              <div className="group relative flex-1 overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 hover:scale-[1.02] animate-in slide-in-from-right duration-700 delay-400 fade-in">
                {/* Using a solid background for the leaf PNG to make it look clean */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900 to-green-900" />
                <img
                  src={leafImg}
                  alt="Track Carbon Impact"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-40 mix-blend-overlay rotate-12 transition-transform duration-700 group-hover:rotate-0"
                />
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center items-start z-10 w-full">
                  <Leaf className="h-10 w-10 text-eco-green-light mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Track Your Carbon Savings</h2>
                  <p className="text-sm text-gray-200 mb-4">See how much CO₂ you’ve saved on every order in real time.</p>
                  <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-105">
                    View Impact &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollParallax>
      </section>

      {/* Features */}
      <section className="relative z-20 border-b bg-background py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-eco-green-light">
                <Leaf className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <h3 className="font-semibold">100% Eco-Friendly</h3>
                <p className="text-sm text-muted-foreground">Sustainable products only</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Carbon Tracking</h3>
                <p className="text-sm text-muted-foreground">See your impact</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-eco-green-light">
                <Award className="h-6 w-6 text-eco-green" />
              </div>
              <div>
                <h3 className="font-semibold">Certified Products</h3>
                <p className="text-sm text-muted-foreground">Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <PopularCategories />

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-secondary">Featured Eco-Products</h2>
              <p className="text-muted-foreground">Handpicked sustainable choices for you</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <Leaf className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No featured products yet</h3>
              <p className="mt-2 text-muted-foreground">Check back soon for amazing eco-friendly products!</p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link to={`/product/${product.slug}`} key={product.id}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Leaf className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-white">
                          {product.discountPercent}% OFF
                        </div>
                      )}
                      {product.carbonSavedPerItem !== undefined && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-eco-green px-2 py-1 text-xs font-semibold text-white">
                          <Leaf className="mr-1 inline h-3 w-3" />
                          {product.carbonSavedPerItem.toFixed(1)}kg CO₂ saved
                        </div>
                      )}
                      {(!product.stockQuantity || product.stockQuantity === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-full bg-destructive px-4 py-2 font-semibold text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 font-semibold text-foreground">{product.name}</h3>
                      {product.sellerStoreName && (
                        <p className="mt-1 text-sm text-muted-foreground">{product.sellerStoreName}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      {product.rating && product.rating > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-eco-green to-eco-green-dark py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Join the Eco Revolution</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Sign up today and start making a difference with every purchase. Track your carbon savings and contribute to a greener future.
          </p>
          <Button size="lg" className="mt-8 bg-white text-eco-green hover:bg-white/90" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Ecobazzar. All rights reserved.</p>
          <p className="mt-2 text-sm opacity-75">Shop sustainably, live responsibly.</p>
        </div>
      </footer>
    </div >
  );
};

const ScrollParallax = ({ children }: { children: React.ReactNode }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax Logic:
  // - TranslateY: Moves down at 30% scroll speed (parallax effect)
  // - Scale: Slightly shrinks (95% at 500px scroll)
  // - Opacity: Fades out (0 at 700px scroll)
  const translateY = scrollY * 0.3;
  const scale = Math.max(0.9, 1 - scrollY * 0.0002);
  const opacity = Math.max(0, 1 - scrollY * 0.0015);

  return (
    <div
      style={{
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity: opacity,
      }}
      className="will-change-transform will-change-opacity origin-top"
    >
      {children}
    </div>
  );
};

export default Home;
