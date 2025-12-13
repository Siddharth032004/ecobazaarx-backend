import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import logo from "@/assets/logo/logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    setSession(!!token);

    // Listen for storage changes to update header
    const handleStorageChange = () => {
      setSession(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setSession(false);
    navigate("/auth");
  };

  return (
    <header className="
  sticky top-0 z-50 w-full
 bg-gradient-to-l from-cyan-100 to-teal-50

  backdrop-blur-xl
  border-b border-cyan-100
">






      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <img src={logo} alt="Ecobazzar Logo" className="w-32 h-32 object-contain mt-2" />
            </div>
            <span className="hidden text-xl font-bold text-secondary sm:inline-block">
              Ecobazzar
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search eco-friendly products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/leaderboard">Leaderboard</Link>
            </Button>
            {session ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                {/* Dashboard Link */}
                {(() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    try {
                      const payload = JSON.parse(atob(token.split('.')[1]));
                      if (payload.role === 'ADMIN' || payload.role === 'SELLER') {
                        return (
                          <Button variant="ghost" asChild>
                            <Link to="/admin">Dashboard</Link>
                          </Button>
                        );
                      }
                    } catch (e) { }
                  }
                  return null;
                })()}
                <Button onClick={handleLogout} variant="outline" className="hidden sm:flex">
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary-light">
                <Link to="/auth">Login / Sign Up</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="flex pb-4 md:hidden">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
};
