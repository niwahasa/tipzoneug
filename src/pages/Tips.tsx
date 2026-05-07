import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Target,
  Lock,
  Clock,
  ArrowRight,
  Filter,
  MessageCircle,
  ChevronDown,
  Crown as CrownIcon,
  Medal,
  Award,
  Flame
} from "lucide-react";
import { cn, formatOdds, formatTime, getStatusColor, generateWhatsAppMessage, truncateText } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "confidence", label: "Most Confident" },
  { value: "odds", label: "Highest Odds" },
] as const;

const LEAGUES = ["EPL", "UPL", "La Liga", "UCL", "Serie A", "Bundesliga", "AFCON"];

export default function Tips() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"latest" | "confidence" | "odds">("latest");
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: tips, isLoading } = trpc.tip.list.useQuery({
    sortBy,
    league: selectedLeague || undefined,
    limit: 50,
  });

  const tierIcon = (tier: string) => {
    switch (tier) {
      case "GOLD": return <CrownIcon className="w-3 h-3 text-yellow-400" />;
      case "SILVER": return <Medal className="w-3 h-3 text-gray-300" />;
      case "BRONZE": return <Award className="w-3 h-3 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Today's Tips</h1>
        <p className="text-sm text-white/50 mt-1">Verified predictions from top tipsters</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 bg-tz-forest border border-tz-olive/30 rounded-sm text-sm text-white/70 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-3 h-3 transition-transform", showFilters && "rotate-180")} />
          </button>

          {/* Sort Tabs */}
          <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors",
                  sortBy === opt.value
                    ? "bg-tz-amber text-tz-forest"
                    : "bg-tz-forest text-white/60 hover:text-white border border-tz-olive/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">League</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLeague("")}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-sm border transition-colors",
                  !selectedLeague
                    ? "bg-tz-amber text-tz-forest border-tz-amber"
                    : "bg-transparent text-white/60 border-tz-olive/30 hover:border-tz-amber/50"
                )}
              >
                All
              </button>
              {LEAGUES.map((league) => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-sm border transition-colors",
                    selectedLeague === league
                      ? "bg-tz-amber text-tz-forest border-tz-amber"
                      : "bg-transparent text-white/60 border-tz-olive/30 hover:border-tz-amber/50"
                  )}
                >
                  {league}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5 animate-pulse">
              <div className="h-4 bg-tz-olive/30 rounded w-1/3 mb-3" />
              <div className="h-6 bg-tz-olive/20 rounded w-2/3 mb-2" />
              <div className="h-4 bg-tz-olive/20 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tips?.map((tip) => (
            <div
              key={tip.id}
              className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden hover:border-tz-amber/20 transition-all"
            >
              <div className="p-4 md:p-5">
                {/* Tipster Info */}
                <div className="flex items-center justify-between mb-3">
                  <Link
                    to={`/tipsters/${tip.tipster?.username ?? tip.tipsterId}`}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 bg-tz-olive rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(tip.tipster?.username ?? "T")[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-tz-amber transition-colors">
                        {tip.tipster?.username ?? "Anonymous"}
                      </p>
                      {tip.tipster?.tipsterProfile && (
                        <div className="flex items-center gap-1">
                          {tierIcon(tip.tipster.tipsterProfile.tier)}
                          <span className="text-[10px] text-white/50">
                            {tip.tipster.tipsterProfile.winRate}% WR &middot; {tip.tipster.tipsterProfile.currentStreak} streak
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {tip.confidence && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-tz-olive/30 rounded-sm">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-white/70">{tip.confidence}%</span>
                      </div>
                    )}
                    <span className={cn("text-xs px-2 py-0.5 rounded-sm border", getStatusColor(tip.status))}>
                      {tip.status}
                    </span>
                  </div>
                </div>

                {/* Match Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-white text-lg truncate">{tip.matchName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/50">{tip.league}</span>
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(tip.matchDatetime)} EAT
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/50">Pick</p>
                    <p className="font-heading font-bold text-tz-amber">{tip.pick}</p>
                    <p className="text-xs text-white/70">@{formatOdds(tip.odds)}</p>
                  </div>
                </div>

                {/* Form Dots */}
                {tip.tipster?.tipsterProfile && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40">Form:</span>
                    <div className="flex gap-1">
                      {["won", "won", "lost", "won", "won"].map((result, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            result === "won" ? "bg-green-500" : "bg-red-500"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis - VIP Gated */}
                {tip.analysis && (
                  <div className="mt-3 pt-3 border-t border-tz-olive/30">
                    {!user?.isVip && !tip.isFree ? (
                      <div className="relative">
                        <div className="blur-sm select-none">
                          <p className="text-sm text-white/60 leading-relaxed">
                            {truncateText(tip.analysis, 150)}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-tz-forest/30">
                          <Link
                            to="/pricing"
                            className="flex items-center gap-1.5 px-4 py-2 bg-tz-amber text-tz-forest text-xs font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            Unlock Full Analysis
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/60 leading-relaxed">{tip.analysis}</p>
                    )}
                  </div>
                )}

                {/* Stake Advice */}
                {tip.stakeAdvice && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40">Stake:</span>
                    <span className="text-xs text-tz-amber">{tip.stakeAdvice}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-tz-olive/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${generateWhatsAppMessage(tip)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-tz-whatsapp/20 text-tz-whatsapp text-xs font-medium rounded-sm hover:bg-tz-whatsapp/30 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Share
                    </a>
                    <Link
                      to={`/tips/${tip.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-white/50 text-xs hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Details
                    </Link>
                  </div>
                  <Link
                    to="/practice"
                    className="text-xs text-tz-amber hover:text-tz-amberLight transition-colors"
                  >
                    + Practice Bet
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {(!tips || tips.length === 0) && (
            <div className="text-center py-16 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Target className="w-12 h-12 text-tz-olive mx-auto mb-3" />
              <p className="text-white/50 mb-2">No tips found</p>
              <p className="text-sm text-white/30">Check back later or adjust your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
