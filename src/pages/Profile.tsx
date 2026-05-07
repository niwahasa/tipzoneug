import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  User,
  Crown,
  Target,
  LogOut,
  Shield,
  Zap,
  ArrowRight,
  Bell,
  CreditCard,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  trpc.subscription.mySubscriptions.useQuery(undefined, { enabled: isAuthenticated });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 bg-tz-olive/30 rounded-full animate-pulse mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <User className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50 mb-4">Sign in to view your profile</p>
        <Link to="/login" className="px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  const menuItems = [
    ...(user?.role === "tipster" ? [{ label: "Tipster Dashboard", icon: Zap, path: "/dashboard" }] : []),
    ...(user?.role === "admin" ? [{ label: "Admin Panel", icon: Shield, path: "/admin" }] : []),
    { label: "My Subscriptions", icon: CreditCard, path: "/subscription" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Practice Mode", icon: Target, path: "/practice" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Profile Card */}
      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-tz-olive to-tz-oliveLight rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white font-heading">
              {(user?.fullName ?? user?.username ?? "U")[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-xl font-bold text-white">{user?.fullName ?? "User"}</h1>
            <p className="text-sm text-white/50">@{user?.username ?? "username"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-sm capitalize",
                user?.role === "admin" ? "bg-purple-500/20 text-purple-400" :
                user?.role === "tipster" ? "bg-tz-amber/20 text-tz-amber" :
                "bg-tz-olive/30 text-white/60"
              )}>
                {user?.role}
              </span>
              {user?.isVip && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-tz-amber/20 text-tz-amber text-xs rounded-sm">
                  <Crown className="w-3 h-3" />
                  VIP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 p-4 bg-tz-forest border border-tz-olive/30 rounded-sm hover:border-tz-amber/30 transition-all group"
          >
            <item.icon className="w-5 h-5 text-tz-amber" />
            <span className="text-sm text-white group-hover:text-tz-amber transition-colors flex-1">{item.label}</span>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-tz-amber transition-colors" />
          </Link>
        ))}
      </div>

      {/* Apply to be Tipster */}
      {user?.role === "user" && (
        <Link
          to="/apply-tipster"
          className="flex items-center gap-3 p-4 bg-tz-amber/5 border border-tz-amber/20 rounded-sm hover:border-tz-amber/40 transition-all group mb-6"
        >
          <Trophy className="w-5 h-5 text-tz-amber" />
          <span className="text-sm text-tz-amber flex-1">Apply to Become a Tipster</span>
          <ArrowRight className="w-4 h-4 text-tz-amber/50 group-hover:text-tz-amber transition-colors" />
        </Link>
      )}

      {/* Sign Out */}
      <button
        onClick={logout}
        className="flex items-center gap-3 p-4 bg-tz-forest border border-tz-olive/30 rounded-sm hover:border-red-500/30 hover:bg-red-500/5 transition-all group w-full"
      >
        <LogOut className="w-5 h-5 text-red-400" />
        <span className="text-sm text-red-400 flex-1">Sign Out</span>
      </button>
    </div>
  );
}
