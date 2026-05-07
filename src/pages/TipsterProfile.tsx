import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Trophy,
  Target,
  Users,
  TrendingUp,
  Crown,
  Medal,
  Award,
  UserPlus,
  UserMinus,
  Crown as CrownIcon,
  Lock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { cn, formatOdds, formatTime, formatDate, getStatusColor, getTierColor, getTierBg, generateWhatsAppMessage } from "@/lib/utils";

export default function TipsterProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"tips" | "stats">("tips");

  const { data: profile, isLoading } = trpc.tipster.byUsername.useQuery(
    { username: username ?? "" },
    { enabled: !!username }
  );

  const { data: tipsterStats } = trpc.tipster.stats.useQuery(
    { tipsterId: Number(profile?.id) },
    { enabled: !!profile }
  );

  const { data: tipsterTips } = trpc.tip.byTipster.useQuery(
    { tipsterId: Number(profile?.id), limit: 20 },
    { enabled: !!profile }
  );

  const { data: isFollowing } = trpc.tipster.isFollowing.useQuery(
    { tipsterId: Number(profile?.id) },
    { enabled: isAuthenticated && !!profile }
  );

  const utils = trpc.useUtils();
  const followMutation = trpc.tipster.follow.useMutation({
    onSuccess: () => utils.tipster.isFollowing.invalidate(),
  });
  const unfollowMutation = trpc.tipster.unfollow.useMutation({
    onSuccess: () => utils.tipster.isFollowing.invalidate(),
  });

  const tierIcon = (tier: string, size: number = 5) => {
    switch (tier) {
      case "GOLD": return <CrownIcon className={`w-${size} h-${size} text-yellow-400`} />;
      case "SILVER": return <Medal className={`w-${size} h-${size} text-gray-300`} />;
      case "BRONZE": return <Award className={`w-${size} h-${size} text-amber-600`} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-tz-forest border border-tz-olive/30 rounded-sm" />
          <div className="h-64 bg-tz-forest border border-tz-olive/30 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Trophy className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50">Tipster not found</p>
        <Link to="/tipsters" className="text-tz-amber text-sm mt-2 inline-block">
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Back Link */}
      <Link to="/tipsters" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </Link>

      {/* Profile Header */}
      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-tz-olive to-tz-oliveLight rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white font-heading">
              {(profile.user?.username ?? "T")[0]?.toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-heading text-2xl font-bold text-white">
                {profile.user?.fullName ?? profile.user?.username ?? "Anonymous"}
              </h1>
              <div className={cn("flex items-center gap-1 px-2 py-0.5 border rounded-sm", getTierBg(profile.tier))}>
                {tierIcon(profile.tier, 3)}
                <span className={cn("text-xs font-medium", getTierColor(profile.tier))}>{profile.tier}</span>
              </div>
              {profile.isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-sm">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Verified</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-white/60 mb-4">{profile.bio}</p>
            )}

            {profile.sports && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {JSON.parse(JSON.stringify(profile.sports)).map((sport: string) => (
                  <span key={sport} className="px-2 py-0.5 bg-tz-olive/30 text-white/60 text-xs rounded-sm">
                    {sport}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => isFollowing 
                    ? unfollowMutation.mutate({ tipsterId: Number(profile.id) })
                    : followMutation.mutate({ tipsterId: Number(profile.id) })
                  }
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-sm transition-colors",
                    isFollowing
                      ? "bg-tz-olive/30 text-white/70 hover:bg-tz-olive/50 border border-tz-olive/30"
                      : "bg-tz-amber text-tz-forest hover:bg-tz-amberLight"
                  )}
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
              <Link
                to="/pricing"
                className="flex items-center gap-1.5 px-4 py-2 bg-tz-amber/20 border border-tz-amber/30 text-tz-amber text-sm font-medium rounded-sm hover:bg-tz-amber/30 transition-colors"
              >
                <CrownIcon className="w-4 h-4" />
                Subscribe UGX {profile.subscriptionPrice?.toLocaleString()}/mo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Win Rate", value: `${profile.winRate}%`, icon: TrendingUp },
          { label: "Total Tips", value: profile.totalTips, icon: Target },
          { label: "Streak", value: profile.currentStreak, icon: Flame },
          { label: "Followers", value: profile.followerCount, icon: Users },
          { label: "Subscribers", value: profile.subscriberCount, icon: Crown },
        ].map((stat) => (
          <div key={stat.label} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4 text-center">
            <stat.icon className="w-4 h-4 text-tz-amber mx-auto mb-1" />
            <p className="font-heading text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-tz-olive/30">
        {(["tips", "stats"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === tab
                ? "text-tz-amber border-tz-amber"
                : "text-white/50 border-transparent hover:text-white/70"
            )}
          >
            {tab === "tips" ? "Recent Tips" : "Statistics"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "tips" ? (
        <div className="space-y-3">
          {tipsterTips?.map((tip) => (
            <div key={tip.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-white">{tip.matchName}</h3>
                    <span className="text-xs text-white/50">{tip.league}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(tip.matchDatetime)}
                    </span>
                    <span>{formatDate(tip.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-bold text-tz-amber">{tip.pick}</p>
                  <p className="text-xs text-white/70">@{formatOdds(tip.odds)}</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-sm border mt-1 inline-block", getStatusColor(tip.status))}>
                    {tip.status}
                  </span>
                </div>
              </div>

              {tip.analysis && (
                <div className="mt-3 pt-3 border-t border-tz-olive/30">
                  {!user?.isVip && !tip.isFree ? (
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs">Analysis locked - Subscribe to view</span>
                    </div>
                  ) : (
                    <p className="text-sm text-white/60">{tip.analysis}</p>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-tz-olive/30">
                <a
                  href={`https://wa.me/?text=${generateWhatsAppMessage(tip)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tz-whatsapp/20 text-tz-whatsapp text-xs font-medium rounded-sm hover:bg-tz-whatsapp/30 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  Share on WhatsApp
                </a>
              </div>
            </div>
          ))}

          {(!tipsterTips || tipsterTips.length === 0) && (
            <div className="text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Target className="w-10 h-10 text-tz-olive mx-auto mb-2" />
              <p className="text-white/50">No tips posted yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Form */}
          {tipsterStats && (
            <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
              <h3 className="font-heading font-semibold text-white mb-4">Recent Form (Last 10)</h3>
              <div className="flex gap-2">
                {tipsterStats.recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-sm flex items-center justify-center",
                      result === "won" ? "bg-green-500/20 text-green-400" :
                      result === "lost" ? "bg-red-500/20 text-red-400" :
                      "bg-gray-500/20 text-gray-400"
                    )}
                  >
                    {result === "won" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                ))}
                {tipsterStats.recentForm.length === 0 && (
                  <p className="text-sm text-white/40">No resolved tips yet</p>
                )}
              </div>
            </div>
          )}

          {/* Detailed Stats */}
          {tipsterStats && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
                <h3 className="font-heading font-semibold text-white mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Total Tips</span>
                    <span className="text-sm font-medium text-white">{tipsterStats.totalTips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Won</span>
                    <span className="text-sm font-medium text-green-400">{tipsterStats.wonTips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Lost</span>
                    <span className="text-sm font-medium text-red-400">{tipsterStats.lostTips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Win Rate</span>
                    <span className="text-sm font-medium text-tz-amber">{tipsterStats.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Average Odds</span>
                    <span className="text-sm font-medium text-white">{tipsterStats.averageOdds}</span>
                  </div>
                </div>
              </div>

              <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
                <h3 className="font-heading font-semibold text-white mb-4">Current Streak</h3>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-tz-amber/10 border border-tz-amber/20 rounded-full flex items-center justify-center">
                    <Flame className="w-8 h-8 text-tz-amber" />
                  </div>
                  <div>
                    <p className="font-heading text-3xl font-bold text-white">{tipsterStats.currentStreak}</p>
                    <p className="text-sm text-white/50">wins in a row</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
