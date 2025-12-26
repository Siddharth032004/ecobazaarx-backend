import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService, authService, orderService, rewardsService, Coupon, UserBadge } from "@/services/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, Package, User, Trophy, Award, Gift, Copy, Medal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { getLevelFromPoints, getNextLevelInfo, LEVEL_THRESHOLDS } from "@/utils/levels";
import { couponService } from "@/services/couponService";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCarbonSaved, setTotalCarbonSaved] = useState(0);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Derived state for display
  const currentPoints = rewards?.totalCarbonPoints || (totalCarbonSaved * 10);
  const availablePoints = rewards?.availableCarbonPoints !== undefined ? rewards.availableCarbonPoints : currentPoints;

  const { nextLevelPoints } = getNextLevelInfo(currentPoints);

  // Calculate progress bar
  let progress = 0;
  if (nextLevelPoints !== null) {
    // Find current level min threshold
    const currentLevelName = getLevelFromPoints(currentPoints);
    const currentThreshold = LEVEL_THRESHOLDS.find(l => l.name === currentLevelName)?.min || 0;
    const totalRange = nextLevelPoints - currentThreshold;
    const earnedInRange = currentPoints - currentThreshold;
    progress = Math.min(100, Math.max(0, (earnedInRange / totalRange) * 100));
  } else {
    progress = 100;
  }

  useEffect(() => {
    checkUser();
  }, [location.key]);

  const checkUser = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
      setFullName(userData.fullName || "");
      setTotalCarbonSaved(userData.totalCarbonSaved || 0);

      // Fetch other data independently to prevent page crash if one fails
      if (userData.id) {
        fetchRewards(userData.id);
      }
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Session expired or invalid. Please log in.");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async (userId: string | number) => {
    let data: any = {};
    try {
      data = await rewardsService.getSummary(userId);
    } catch (error: any) {
      console.error("Failed to load rewards summary", error);
    }

    // Fetch manual coupons
    let manualCoupons: any[] = [];
    try {
      const idNum = typeof userId === 'string' ? parseInt(userId) : userId;
      const coupons = await couponService.getUserCoupons(idNum);
      manualCoupons = coupons
        .filter((c: any) => (c.status === "UNUSED" || c.status === "ACTIVE") && !['ECO5', 'ECO10', 'ECO15'].includes(c.code))
        .map((c: any) => ({
          code: c.code,
          name: (c.discountValue || 10) + "% OFF",
          unlocked: true,
          threshold: 0,
          pointsNeeded: 0
        }));
    } catch (err: any) {
      console.warn("Failed to load manual coupons", err);
    }

    // Merge and set state with whatever we have
    setRewards({
      ...data,
      rewards: [...(data.rewards || []), ...manualCoupons],
      activeRewards: [...(data.activeRewards || []), ...manualCoupons]
    });
  };

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders(0, 1000);
      setOrders(data.content || []);
    } catch (error) {
      console.error("Failed to fetch orders");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await userService.updateProfile({ fullName });
      toast.success("Profile updated successfully");
      checkUser();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = () => {
    authService.logout();
    navigate("/auth");
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="h-8" />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile} size="sm" className="w-full">
                  Update
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-eco" />
                Carbon Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-eco">{totalCarbonSaved.toFixed(1)}</p>
                <p className="text-muted-foreground">kg CO₂ saved</p>
              </div>
            </CardContent>
          </Card>

          {/* CARBON POINTS CARD */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Carbon Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-bold text-emerald-700">
                    {availablePoints.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Available Balance</p>

                  <span className="mt-2 text-xs font-bold uppercase tracking-wider text-green-800 bg-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    {getLevelFromPoints(currentPoints)}
                  </span>
                </div>

                <div className="w-full space-y-1">
                  {nextLevelPoints === null ? (
                    <p className="text-xs font-medium text-emerald-800">
                      You’ve reached the highest level: {getLevelFromPoints(currentPoints)} 🌍
                    </p>
                  ) : (
                    <>
                      <Progress value={progress} className="h-2 bg-emerald-200" indicatorClassName="bg-emerald-500" />
                      <p className="text-xs text-muted-foreground">
                        Next Level at {nextLevelPoints} pts
                      </p>
                    </>
                  )}
                </div>

                <p className="text-[10px] text-emerald-800/60 leading-tight pt-2 border-t border-emerald-200/50">
                  You earn 10 Carbon Points for every 1 kg CO₂ saved.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Redeem Points Section */}
          <Card className="md:col-span-1 bg-white hover:shadow-lg transition-all duration-300 border-none shadow-md overflow-hidden group relative">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Gift className="w-24 h-24 text-purple-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Gift className="h-5 w-5 text-purple-600" />
                Redeem Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 dark:bg-purple-900/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-purple-800">10% OFF Coupon</span>
                    <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">500 Pts</span>
                  </div>
                  <p className="text-xs text-purple-600 mb-3">Get 10% off your next order (Min order ₹200).</p>
                  <button
                    onClick={async () => {
                      if (!user?.id) return;
                      setIsClaiming(true);
                      try {
                        const response = await couponService.claimCoupon(user.id, 500, 10, 200);
                        toast.success(response.message || "Coupon claimed successfully!");

                        // Update points immediately from server response
                        if (response.updatedPoints !== undefined) {
                          setRewards(prev => ({
                            ...prev,
                            // Update AVAILABLE points (Balance), not Lifetime points
                            availableCarbonPoints: response.updatedPoints
                          }));
                        }

                        // Refresh full data to get new coupon in list
                        fetchRewards(user.id);
                      } catch (err: any) {
                        // Backend now returns specific messages for 400/409
                        toast.error(err.message || "Failed to claim coupon");
                      } finally {
                        setIsClaiming(false);
                      }
                    }}
                    disabled={(availablePoints < 500) || isClaiming}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${availablePoints >= 500 && !isClaiming
                      ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {isClaiming ? "Claiming..." : (currentPoints >= 500 ? "Claim Reward" : "Need more points")}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold">{orders.length}</p>
                <p className="text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CARBON REWARDS SECTION */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Rewards & Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewards?.activeRewards?.length === 0 && rewards?.rewards?.every((r: any) => !r.unlocked) && (
                  <div className="text-center py-4 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium">No unlocked rewards yet</p>
                    <p className="text-xs text-muted-foreground">Keep saving CO₂ to unlock discounts!</p>
                  </div>
                )}



                {/* Dynamic Rewards List from Backend */}
                {rewards?.rewards?.map((reward: any) => (
                  <div
                    key={reward.code}
                    className={`border rounded-lg p-3 flex justify-between items-center group relative overflow-hidden ${reward.unlocked
                      ? "border-green-200 bg-green-50/50"
                      : "border-gray-200 bg-gray-50 opacity-80"
                      }`}
                  >
                    {reward.unlocked && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg"></div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-bold ${reward.unlocked ? "text-green-900" : "text-gray-600"}`}>
                          {reward.code}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${reward.unlocked
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {reward.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reward.unlocked
                          ? "Unlocked! Ready to use."
                          : `Locked - Need ${reward.pointsNeeded} more pts`}
                      </p>
                    </div>
                    {reward.unlocked ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(reward.code);
                          toast.success("Coupon code copied!");
                        }}
                        title="Copy Code"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <Gift className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {rewards?.usedRewards?.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Past Rewards</p>
                  <div className="space-y-2 opacity-60">
                    {rewards?.usedRewards?.map((coupon: any) => (
                      <div key={coupon.id} className="flex justify-between items-center text-xs">
                        <span className="font-mono">{coupon.code}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{coupon.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </p>
                          {order.couponCode && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                              Used: {order.couponCode} (-₹{order.discountAmount?.toFixed(0)})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-eco">{order.totalCarbonSaved?.toFixed(1) || '0.0'} kg CO₂ saved</p>
                        </div>
                      </div>
                      <p className="text-xs">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="capitalize">{order.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
