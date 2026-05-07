import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Trophy,
  Search,
  Crown,
  Medal,
  Award,
  ArrowRight,
  Filter
} from "lucide-react";
import { cn, getTierColor } from "@/lib/utils";

const TIERS = ["ALL", "GOLD", "SILVER", "BRONZE"] as const;

export default function Tipsters() {
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  const { data: tipsters, isLoading } = trpc.tipster.list.useQuery({
    tier: selectedTier !== "ALL" ? selectedTier as "GOLD" | "SILVER" | "BRONZE" : undefined,
    limit: 50,
  });

  const filteredTipsters = tipsters?.filter(t => {
    const name = t.user?.fullName ?? t.user?.username ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const tierIcon = (tier: string, size: number = 4) => {
    const className = `w-${size} h-${size}`;
    switch (tier) {
      case "GOLD": return <Crown className={`${className} text-yellow-400`} />;
      case "SILVER": return <Medal className={`${className} text-gray-300`} />;
      case "BRONZE": return <Award className={`${className} text-amber-600`} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Tipster Leaderboard</h1>
        <p className="text-sm text-white/50 mt-1">Ranked by verified win rate (min 30 tips)</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search tipsters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-tz-forest border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <div className="flex gap-1">
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors",
                  selectedTier === tier
                    ? "bg-tz-amber text-tz-forest border-tz-amber"
                    : "bg-tz-forest text-white/60 border-tz-olive/30 hover:border-tz-amber/50"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4 animate-pulse">
              <div className="h-4 bg-tz-olive/30 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTipsters?.map((tipster, index) => {
            const isTop3 = index < 3;
            return (
              <Link
                key={tipster.id}
                to={`/tipsters/${tipster.user?.username ?? tipster.id}`}
                className={cn(
                  "group flex items-center gap-4 p-4 bg-tz-forest border rounded-sm transition-all hover:border-tz-amber/30",
                  isTop3 ? "border-tz-amber/20" : "border-tz-olive/30"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm shrink-0",
                  index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                  index === 1 ? "bg-gray-300/20 text-gray-300" :
                  index === 2 ? "bg-amber-600/20 text-amber-600" :
                  "bg-tz-olive/30 text-white/50"
                )}>
                  {index + 1}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-tz-olive rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">
                      {(tipster.user?.username ?? "T")[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-tz-amber transition-colors">
                      {tipster.user?.fullName ?? tipster.user?.username ?? "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        {tierIcon(tipster.tier, 3)}
                        <span className={cn("text-[10px] font-medium", getTierColor(tipster.tier))}>
                          {tipster.tier}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30">|</span>
                      <span className="text-[10px] text-white/50">
                        {tipster.sports ? JSON.parse(JSON.stringify(tipster.sports)).join(", ") : "Football"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-center">
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{tipster.winRate}%</p>
                    <p className="text-[10px] text-white/40">Win Rate</p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{tipster.currentStreak}</p>
                    <p className="text-[10px] text-white/40">Streak</p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{tipster.totalTips}</p>
                    <p className="text-[10px] text-white/40">Tips</p>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="sm:hidden text-right">
                  <p className="font-heading text-lg font-bold text-white">{tipster.winRate}%</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-tz-amber transition-colors shrink-0" />
              </Link>
            );
          })}

          {(!filteredTipsters || filteredTipsters.length === 0) && (
            <div className="text-center py-16 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Trophy className="w-12 h-12 text-tz-olive mx-auto mb-3" />
              <p className="text-white/50">No tipsters found</p>
              <p className="text-sm text-white/30 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
