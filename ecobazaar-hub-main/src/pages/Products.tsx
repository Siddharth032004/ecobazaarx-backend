import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { productService, Product } from "@/services/api";
import { Leaf, Filter } from "lucide-react";
import { toast } from "sonner";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, priceRange, selectedBrands, inStockOnly, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const searchQuery = searchParams.get("search");
      let content = [];

      if (searchQuery) {
        const data = await productService.search(searchQuery, page);
        content = data.content || [];
        setTotalPages(data.totalPages || 0);
      } else {
        // Use backend filtering for price
        const data = await productService.filter(undefined, priceRange[0], priceRange[1], page);
        content = data.content || [];
        setTotalPages(data.totalPages || 0);
      }

      // Client-side filtering for stock (until backend supports it)
      if (inStockOnly) {
        content = content.filter((p: Product) => (p.stockQuantity || 0) > 0);
      }

      // Note: Brand filtering is temporarily disabled as we don't have brands in the new schema yet
      // if (selectedBrands.length > 0) { ... }

      setProducts(content);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" />
                Filters
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000000}
                  step={100}
                  className="mb-2"
                />
              </div>

              {/* Stock Filter */}
              <div className="mb-6 flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                />
                <label htmlFor="in-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  In Stock Only
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-secondary">
                {searchParams.get("search") ? `Search results for "${searchParams.get("search")}"` : "All Products"}
              </h1>
              <p className="text-muted-foreground">{products.length} products found</p>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square animate-pulse bg-muted" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <Leaf className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No products found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
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
                        {product.carbonSavedPerItem !== undefined && product.carbonSavedPerItem > 0 && (
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


            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                Previous
              </Button>
              <span className="flex items-center">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Products;
