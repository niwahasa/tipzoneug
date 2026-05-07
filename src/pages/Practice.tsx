import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Coins,
  RotateCcw
} from "lucide-react";
import { cn, formatUGX, formatOdds } from "@/lib/utils";

export default function Practice() {
  const { isAuthenticated } = useAuth();
  const { data: practiceData } = trpc.practice.myBets.useQuery(undefined, { enabled: isAuthenticated });
  const { data: leaderboard } = trpc.practice.leaderboard.useQuery(undefined, { enabled: isAuthenticated });
  const { data: allTips } = trpc.tip.list.useQuery({ sortBy: "latest", limit: 20 });
  const utils = trpc.useUtils();

  const placeBet = trpc.practice.placeBet.useMutation({
    onSuccess: () => {
      utils.practice.myBets.invalidate();
    },
  });

  const resetBalance = trpc.practice.resetBalance.useMutation({
    onSuccess: () => {
      utils.practice.myBets.invalidate();
    },
  });

  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [stake, setStake] = useState("1000");

  const handlePlaceBet = () => {
    if (selectedTip && stake) {
      placeBet.mutate({ tipId: selectedTip, stake: Number(stake) });
      setSelectedTip(null);
      setStake("1000");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Coins className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50 mb-4">Sign in to access Practice Mode</p>
        <Link to="/login" className="px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Practice Mode</h1>
        <p className="text-sm text-white/50 mt-1">Bet with virtual credits - no real money risk</p>
      </div>

      {/* Balance Card */}
      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50 mb-1">Virtual Balance</p>
            <p className="font-heading text-4xl font-bold text-tz-amber">
              {formatUGX(practiceData?.credits ?? 100000)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-12 h-12 text-tz-amber/20" />
          </div>
        </div>
        <button
          onClick={() => resetBalance.mutate()}
          className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Balance (once/week)
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Tips to Bet On */}
        <div>
          <h3 className="font-heading font-semibold text-white mb-4">Available Tips</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
            {allTips?.filter(t => t.status === "pending").map((tip) => (
              <button
                key={tip.id}
                onClick={() => setSelectedTip(tip.id)}
                className={cn(
                  "w-full text-left p-3 border rounded-sm transition-all",
                  selectedTip === tip.id
                    ? "border-tz-amber bg-tz-amber/5"
                    : "border-tz-olive/30 bg-tz-forest hover:border-tz-olive/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{tip.matchName}</p>
                    <p className="text-xs text-white/50">{tip.league}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-tz-amber">{tip.pick}</p>
                    <p className="text-xs text-white/70">@{formatOdds(tip.odds)}</p>
                  </div>
                </div>
              </button>
            ))}
            {(!allTips || allTips.filter(t => t.status === "pending").length === 0) && (
              <p className="text-center py-8 text-white/40">No pending tips available</p>
            )}
          </div>
        </div>

        {/* Place Bet + My Bets */}
        <div>
          {/* Place Bet Form */}
          {selectedTip && (
            <div className="bg-tz-forest border border-tz-amber/30 rounded-sm p-4 mb-4">
              <h4 className="font-heading font-semibold text-white mb-3">Place Practice Bet</h4>
              <div className="mb-3">
                <label className="text-xs text-white/50 mb-1 block">Stake (UGX)</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full px-3 py-2 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white focus:outline-none focus:border-tz-amber/50"
                  min="1000"
                  step="1000"
                />
              </div>
              <button
                onClick={handlePlaceBet}
                disabled={placeBet.isPending || !stake || Number(stake) < 1000}
                className="w-full py-2 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors disabled:opacity-50"
              >
                {placeBet.isPending ? "Placing..." : "Place Bet"}
              </button>
            </div>
          )}

          {/* My Practice Bets */}
          <h3 className="font-heading font-semibold text-white mb-4">My Bets</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {practiceData?.bets?.map((bet) => (
              <div key={bet.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{bet.tip?.matchName}</p>
                    <p className="text-xs text-white/50">Stake: {formatUGX(bet.stake)}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-sm border",
                      bet.status === "won" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      bet.status === "lost" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}>
                      {bet.status}
                    </span>
                    {bet.status === "won" && (
                      <p className="text-xs text-green-400 mt-1">+{formatUGX(bet.potentialReturn ?? 0)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!practiceData?.bets || practiceData.bets.length === 0) && (
              <p className="text-center py-6 text-white/40">No practice bets yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="mt-10">
          <h3 className="font-heading font-semibold text-white mb-4">Practice Leaderboard</h3>
          <div className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-tz-olive/30">
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Rank</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">User</th>
                  <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Credits</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((entry) => (
                  <tr key={entry.rank} className="border-b border-tz-olive/20">
                    <td className="px-4 py-3">
                      <span className={cn(
                        "font-heading font-bold",
                        entry.rank === 1 ? "text-yellow-400" :
                        entry.rank === 2 ? "text-gray-300" :
                        entry.rank === 3 ? "text-amber-600" :
                        "text-white/50"
                      )}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{entry.username}</td>
                    <td className="px-4 py-3 text-right font-heading font-bold text-tz-amber">
                      {formatUGX(entry.credits)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
