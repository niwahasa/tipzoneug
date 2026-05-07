import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  Crown,
  ArrowLeft,
  Calendar,
  Clock
} from "lucide-react";
import { cn, formatUGX, formatDateTime } from "@/lib/utils";

export default function Subscription() {
  const { isAuthenticated, user } = useAuth();
  const { data: subscriptions } = trpc.subscription.mySubscriptions.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CreditCard className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50 mb-4">Sign in to view your subscriptions</p>
        <Link to="/login" className="px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="font-heading text-2xl font-bold text-white mb-6">My Subscriptions</h1>

      {/* VIP Status */}
      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-6 h-6 text-tz-amber" />
          <div>
            <h3 className="font-heading font-semibold text-white">VIP Status</h3>
            <p className="text-xs text-white/50">
              {user?.isVip ? "Active VIP Member" : "Not subscribed"}
            </p>
          </div>
        </div>
        {user?.isVip && user?.vipExpiresAt && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4 text-tz-amber" />
            Expires: {formatDateTime(user.vipExpiresAt)}
          </div>
        )}
        {!user?.isVip && (
          <Link
            to="/pricing"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-tz-amber text-tz-forest text-sm font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to VIP
          </Link>
        )}
      </div>

      {/* Active Subscriptions */}
      <h3 className="font-heading font-semibold text-white mb-3">Active Subscriptions</h3>
      <div className="space-y-3">
        {subscriptions?.map((sub) => (
          <div key={sub.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-white capitalize">
                  {sub.plan === "platform_vip" ? "Platform VIP" : `Tipster: ${sub.tipster?.username ?? "Unknown"}`}
                </p>
                <p className="text-xs text-white/50">{formatUGX(sub.amount)}</p>
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-sm border",
                sub.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {sub.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              <span>Started: {formatDateTime(sub.startedAt)}</span>
              <span>|</span>
              <span>Expires: {formatDateTime(sub.expiresAt)}</span>
            </div>
          </div>
        ))}

        {(!subscriptions || subscriptions.length === 0) && (
          <div className="text-center py-8 bg-tz-forest border border-tz-olive/30 rounded-sm">
            <CreditCard className="w-10 h-10 text-tz-olive mx-auto mb-2" />
            <p className="text-white/50">No active subscriptions</p>
            <Link to="/pricing" className="text-tz-amber text-sm mt-2 inline-block">
              Browse Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
