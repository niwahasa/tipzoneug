import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { 
  Trophy, 
  BookOpen, 
  User, 
  Home, 
  Target, 
  Bell,
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
  Zap
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: notifData } = trpc.notification.myNotifications.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 30000 }
  );

  const isAdmin = user?.role === "admin";
  const isTipster = user?.role === "tipster";

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/tips", label: "Tips", icon: Target },
    { path: "/tipsters", label: "Tipsters", icon: Trophy },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-tz-surface text-foreground font-body">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-tz-forest/95 backdrop-blur-md border-b border-tz-olive/30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-tz-amber to-tz-amberLight rounded-sm flex items-center justify-center">
              <Target className="w-5 h-5 text-tz-forest" />
            </div>
            <span className="font-heading font-bold text-lg text-white">
              Tip<span className="text-tz-amber">Zone</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "text-tz-amber bg-tz-amber/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isTipster && (
              <Link
                to="/dashboard"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/dashboard")
                    ? "text-tz-amber bg-tz-amber/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                  isActive("/admin")
                    ? "text-tz-amber bg-tz-amber/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-white/70 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifData && notifData.unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-tz-amber text-tz-forest text-[10px] font-bold rounded-full flex items-center justify-center">
                      {notifData.unreadCount > 9 ? "9+" : notifData.unreadCount}
                    </span>
                  )}
                </Link>

                {/* VIP Badge */}
                {user?.isVip && (
                  <Link to="/subscription" className="hidden sm:flex items-center gap-1 px-2 py-1 bg-tz-amber/20 border border-tz-amber/30 rounded-sm">
                    <Crown className="w-3.5 h-3.5 text-tz-amber" />
                    <span className="text-xs font-medium text-tz-amber">VIP</span>
                  </Link>
                )}

                {/* Logout - Desktop */}
                <button
                  onClick={logout}
                  className="hidden md:flex p-2 text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-white/70 hover:text-white"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-tz-amber text-tz-forest text-sm font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-tz-forest border-t border-tz-olive/30">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "text-tz-amber bg-tz-amber/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isTipster && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive("/dashboard")
                      ? "text-tz-amber bg-tz-amber/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive("/admin")
                      ? "text-tz-amber bg-tz-amber/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-3.5rem-4rem)] pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-tz-forest/95 backdrop-blur-md border-t border-tz-olive/30">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                isActive(link.path)
                  ? "text-tz-amber"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer - Desktop only */}
      <footer className="hidden md:block bg-tz-forest border-t border-tz-olive/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-tz-amber rounded-sm flex items-center justify-center">
                  <Target className="w-4 h-4 text-tz-forest" />
                </div>
                <span className="font-heading font-bold text-white">
                  Tip<span className="text-tz-amber">Zone</span>
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Uganda's community-driven sports betting tips platform. Follow verified tipsters, learn responsible betting, and make informed decisions.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-white mb-3">Platform</h4>
              <div className="space-y-2">
                <Link to="/tips" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Today's Tips</Link>
                <Link to="/tipsters" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Tipster Leaderboard</Link>
                <Link to="/pricing" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">VIP Plans</Link>
                <Link to="/practice" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Practice Mode</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-white mb-3">Learn</h4>
              <div className="space-y-2">
                <Link to="/learn" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Education Hub</Link>
                <Link to="/learn?category=beginner" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Beginner Guide</Link>
                <Link to="/learn?category=strategy" className="block text-xs text-white/50 hover:text-tz-amber transition-colors">Strategies</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-white mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-xs text-white/50">Terms of Service</span>
                <span className="block text-xs text-white/50">Privacy Policy</span>
                <span className="block text-xs text-white/50">Responsible Betting</span>
              </div>
            </div>
          </div>
          <div className="border-t border-tz-olive/30 pt-4">
            <p className="text-[11px] text-white/40 text-center">
              Only stake what you can afford to lose. TipZone UG does not guarantee winnings.
            </p>
            <p className="text-[11px] text-white/30 text-center mt-1">
              &copy; {new Date().getFullYear()} TipZone UG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
