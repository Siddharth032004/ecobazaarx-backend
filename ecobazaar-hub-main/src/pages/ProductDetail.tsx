import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { productService, cartService, wishlistService, reviewService, Product } from "@/services/api";
import { Heart, ShoppingCart, Leaf, Star, Truck, Shield, Package } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  profiles: { full_name: string };
}

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [session, setSession] = useState<any>(null);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setSession(true); // Simple session check
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchProduct();
      fetchReviews();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      if (!slug) return;
      const data = await productService.getBySlug(slug);
      setProduct(data);

      // Fetch reviews
      try {
        const reviewsData = await reviewService.getByProduct(data.id);
        setReviews(reviewsData);
      } catch (e) {
        console.error("Failed to load reviews");
      }
    } catch (error: any) {
      toast.error("Failed to load product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    // Handled in fetchProduct
  };

  const addToCart = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      await cartService.addToCart(product!.id, quantity);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error("Failed to add to cart");
    }
  };

  const addToWishlist = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      await wishlistService.addToWishlist(product!.id);
      toast.success("Added to wishlist!");
    } catch (error: any) {
      toast.error("Failed to add to wishlist");
    }
  };

  const submitReview = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!newReview.title || !newReview.comment) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await reviewService.addReview({
        productId: product!.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success("Review submitted!");
      setNewReview({ rating: 5, title: "", comment: "" });

      // Refresh reviews
      const reviewsData = await reviewService.getByProduct(product!.id);
      setReviews(reviewsData);
    } catch (error: any) {
      toast.error("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.images[selectedImage] || ""}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary">{product.name}</h1>
              {product.sellerStoreName && <p className="mt-2 text-muted-foreground">by {product.sellerStoreName}</p>}
              {product.categoryName && (
                <p className="text-sm text-muted-foreground">{product.categoryName}</p>
              )}
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating?.toFixed(1) || 0}</span>
                <span className="text-muted-foreground">({0} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.mrp}</span>
                  <span className="rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-white">
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Carbon Savings */}
            <Card className="border-eco-green bg-eco-green-light">
              <CardContent className="flex items-center gap-3 p-4">
                <Leaf className="h-8 w-8 text-eco-green" />
                <div>
                  <p className="font-semibold text-eco-green-dark">
                    Save {product.carbonSavedPerItem?.toFixed(1) || 0}kg of CO₂ with this purchase!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This product helps reduce carbon emissions significantly
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Comparison Badge */}
            {product.co2ComparisonType === 'LOWER' && (
              <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                <Leaf className="h-4 w-4" />
                <span>
                  This item has <strong>{product.co2ComparisonPercentage}% lower</strong> carbon footprint than typical {product.categoryName}.
                </span>
              </div>
            )}
            {product.co2ComparisonType === 'SIMILAR' && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                <Leaf className="h-4 w-4" />
                <span>
                  This item has a <strong>similar CO₂ footprint</strong> to typical {product.categoryName}.
                </span>
              </div>
            )}
            {/* Logic implies we only show for LOWER or SIMILAR as preferred. */}

            {/* Description */}
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-muted-foreground">No description available</p>
            </div>

            {/* Stock & SKU */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">SKU: </span>
                <span className="font-medium">N/A</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stock: </span>
                <span className={`font-medium ${product.stockQuantity && product.stockQuantity > 0 ? "text-eco-green" : "text-destructive"}`}>
                  {product.stockQuantity && product.stockQuantity > 0 ? `${product.stockQuantity} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                    disabled={quantity >= (product.stockQuantity || 0)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary-light"
                  onClick={addToCart}
                  disabled={!product.stockQuantity || product.stockQuantity === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" onClick={addToWishlist}>
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Reviews Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-secondary">Customer Reviews</h2>

          {/* Write Review */}
          {session && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Write a Review</h3>
                <div>
                  <label className="mb-2 block text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                        <Star
                          className={`h-6 w-6 ${star <= newReview.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    className="w-full rounded-md border px-3 py-2"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Summarize your experience"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Review</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your thoughts about this product"
                    rows={4}
                  />
                </div>
                <Button onClick={submitReview} className="bg-primary hover:bg-primary-light">
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.title}</span>
                        </div>
                        <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{review.profiles?.full_name || "Anonymous"}</span>
                          <span>•</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
