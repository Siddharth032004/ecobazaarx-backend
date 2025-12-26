import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, cartService, rewardsService } from "@/services/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

import { TreeCelebrationOverlay } from "@/components/TreeCelebrationOverlay";

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastOrderCo2, setLastOrderCo2] = useState(0);

  // Address form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // Store full coupon object
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [country, setCountry] = useState("India"); // Default country

  const calculateCarbonDetails = () => {
    // Return null if address incomplete, but maybe we still want to show 'Base' saved?
    // Requirement: "If address is incomplete: Show: 'Enter shipping address to calculate final CO2 saved'"
    // So distinct null state for Final is needed.

    // Calculate Base first (always available)
    const baseTotal = cartItems.reduce((sum, item) => sum + ((item.carbonSavedPerItem || 0) * item.quantity), 0);

    if (!city || !state) {
      return { base: baseTotal, transport: 0, final: null };
    }

    let transportTotal = 0;
    let finalTotal = 0;

    cartItems.forEach(item => {
      const pCity = item.productCity ? item.productCity.toLowerCase().trim() : "";
      const pState = item.productState ? item.productState.toLowerCase().trim() : "";
      const bCity = city.toLowerCase().trim();
      const bState = state.toLowerCase().trim();

      let unitTransport = 1.2; // Default Diff State

      if (pState && bState && pState === bState) {
        if (pCity && bCity && pCity === bCity) {
          unitTransport = 0.2;
        } else {
          unitTransport = 0.6;
        }
      }

      const quantity = item.quantity || 1;
      transportTotal += (unitTransport * quantity);

      const baseUnit = item.carbonSavedPerItem || 0;
      const finalUnit = Math.max(0, baseUnit - unitTransport);
      finalTotal += (finalUnit * quantity);
    });

    return { base: baseTotal, transport: transportTotal, final: finalTotal };
  };

  // Calculate totals
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

  const carbonDetails = calculateCarbonDetails();

  const calculateShippingCost = () => {
    if (!city || !state) return null;

    let totalShipping = 0;

    // We calculate shipping per item source rule
    // Although "Transport Emission" was calculated per item quantity logic slightly differently (unit based),
    // Shipping usually applies per shipment. 
    // Simplified Rule Interpretation: 
    // Iterate items, compare locations, sum up the fees.

    cartItems.forEach(item => {
      const pCity = item.productCity ? item.productCity.toLowerCase().trim() : "";
      const pState = item.productState ? item.productState.toLowerCase().trim() : "";
      const bCity = city.toLowerCase().trim();
      const bState = state.toLowerCase().trim();

      let itemFee = 80; // Default Diff State

      if (pState && bState && pState === bState) {
        if (pCity && bCity && pCity === bCity) {
          itemFee = 20;
        } else {
          itemFee = 50;
        }
      }

      // Fee is per item or per "shipment"? 
      // User prompt says "Delivery Fee Rules...". 
      // If I buy 10 items, do I pay 10x? Usually no.
      // But let's assume "per distinct item type" given the list iteration structure or simply sum it up as requested by strict interpretation of "rules" applied to the transaction.
      // However, to avoid massive fees (e.g. 10 quantity * 80 = 800), let's apply it per distinct product line (as cartItems are distinct products).
      // Even better: The prompt ignores quantity. "Comparing with seller City/State". 
      // Let's add it once per line item (handling different sellers).
      totalShipping += itemFee;
    });

    return totalShipping;
  };

  const shippingCost = calculateShippingCost();

  // Total uses shippingCost if available, else 0 for calculation but UI shows "Enter address"
  const total = Math.max(0, subtotal - discountAmount + (shippingCost || 0));

  // Points based on Final (if available) or Base (estimate)? 
  // "You will earn approximately... matches final" implies we should use final if avail.
  // If final is null (waiting address), what to show? Maybe Base is too optimistic?
  // Let's show "approx" based on Base but maybe less? 
  // Actually, standard is usually based on final purchase.
  // Let's use Base if final is null, but maybe clearer to user?
  // Previous logic was 0 if incomplete. Let's stick to 0 or maybe just show Base?
  // Prompt: "Enter shipping address to calculate..." implies we don't show final yet.
  const pointsToEarn = carbonDetails.final !== null ? Math.round(carbonDetails.final * 10) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    setDiscountAmount(0);
    setAppliedCoupon(null);

    try {
      if (!user?.id) throw new Error("Please log in to apply coupons");

      // Use the new CouponService for validation/preview
      // User expects validation against Total (including shipping), not just subtotal
      const amountToValidate = subtotal + shippingCost;
      const result = await rewardsService.validateCoupon(couponCode, amountToValidate);

      if (result.isValid) {
        setDiscountAmount(result.discountAmount);
        setAppliedCoupon({
          code: result.couponCode,
          type: result.discountType, // Assuming type is returned
          value: result.discountValue // Assuming value is returned
        });
        toast.success("Coupon applied!");
      } else {
        throw new Error(result.message || "Invalid coupon");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to apply coupon";
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
      fetchCart();
    } catch (error) {
      navigate("/auth");
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setCartItems(data.items || []);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };





  const handlePlaceOrder = async () => {
    if (!user) return;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const shippingAddress = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country
    };

    try {
      await cartService.checkout(shippingAddress, appliedCoupon?.code);

      // Capture the carbon saved for this order before clearing state/navigation
      setLastOrderCo2(carbonDetails.final || 0);

      // Show celebration overlay instead of immediate navigation
      setShowCelebration(true);

      // We don't verify "Order success" explicitly from response as axios throws on error
    } catch (error: any) {
      console.error("Checkout failed:", error);
      let msg = "Failed to place order";
      const data = error.response?.data;

      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.message || data.error || JSON.stringify(data);
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    navigate("/profile"); // Navigate after celebration
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If celebration is active, we can show it over the current page
  // even if cart implies empty after success (if backend cleared it). 
  // However, usually detailed cart state is local.
  // Ideally, if order succeeds, cart is empty. 
  // We should handle the "Cart is empty" check by only showing it if !showCelebration.

  if (cartItems.length === 0 && !showCelebration) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button onClick={() => navigate("/products")} className="mt-4">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Calculations already done above

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Celebration Overlay */}
      <TreeCelebrationOverlay
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
        co2Saved={lastOrderCo2}
        totalCo2Saved={user?.totalCarbonSaved ? user.totalCarbonSaved + lastOrderCo2 : undefined} // Estimate new total
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.productName} x {item.quantity}</span>
                      <span>₹{(item.productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={!shippingCost ? "text-orange-600 text-xs italic" : ""}>
                      {shippingCost === null ? "Enter address to calculate" : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {/* Coupon Section */}
                  <div className="pt-2 border-t mt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isApplyingCoupon || !!appliedCoupon}
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex justify-between items-center bg-green-50 p-2 rounded mt-2 border border-green-200">
                        <span className="text-sm text-green-700 font-medium">Coupon {appliedCoupon.code} applied!</span>
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setDiscountAmount(0);
                            setCouponCode("");
                          }}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 mt-2 font-medium">
                        <span>
                          Coupon Discount
                          {appliedCoupon?.type === 'PERCENT' ? ` (${appliedCoupon.value}% OFF)` : ''}
                        </span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground">
                    You will earn approximately <strong className="text-emerald-600">{pointsToEarn} Carbon Points</strong>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-eco/10 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-eco" />
                    <span className="font-semibold text-eco-dark">Eco Impact</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Product CO₂ Saved</span>
                      <span>{carbonDetails.base.toFixed(1)} kg</span>
                    </div>
                    {carbonDetails.final !== null ? (
                      <>
                        <div className="flex justify-between text-orange-600 text-sm">
                          <span>Delivery CO₂ Added</span>
                          <span>-{carbonDetails.transport.toFixed(1)} kg</span>
                        </div>

                        <div className="border-t border-eco/20"></div>

                        <div className="flex justify-between items-center font-bold text-eco bg-white/50 p-2 rounded -mx-2">
                          <span>FINAL CO₂ Saved</span>
                          <span className="text-lg">{carbonDetails.final.toFixed(1)} kg</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-orange-600 italic pt-2 border-t border-eco/20">
                        Enter shipping address to calculate final CO₂ saved.
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
