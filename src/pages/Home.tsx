import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { 
  Target, 
  Trophy, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Crown,
  Medal,
  Award,
  Lock,
  MessageCircle,
  Shield,
  Clock,
  Star
} from "lucide-react";
import { cn, formatOdds, formatTime, getTierColor, getStatusColor, generateWhatsAppMessage, truncateText } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { data: leaderboard } = trpc.tipster.leaderboard.useQuery({ limit: 3 });
  const { data: recentTips } = trpc.tip.list.useQuery({ sortBy: "latest", limit: 3 });
  const { data: allTips } = trpc.tip.list.useQuery({ limit: 100 });
  const { data: allTipsters } = trpc.tipster.list.useQuery({ limit: 100 });

  // Calculate platform stats
  const platformStats = {
    todayTips: allTips?.filter(t => {
      const tipDate = new Date(t.createdAt);
      const now = new Date();
      return tipDate.toDateString() === now.toDateString();
    }).length ?? 0,
    winRate: allTips && allTips.length > 0 
      ? (allTips.filter(t => t.status === "won").length / allTips.filter(t => t.status === "won" || t.status === "lost").length * 100).toFixed(1)
      : "0",
    activeTipsters: allTipsters?.length ?? 0,
  };

  const tierIcon = (tier: string) => {
    switch (tier) {
      case "GOLD": return <Crown className="w-4 h-4 text-yellow-400" />;
      case "SILVER": return <Medal className="w-4 h-4 text-gray-300" />;
      case "BRONZE": return <Award className="w-4 h-4 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-pitch-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-tz-forest border-b border-tz-olive/30">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,23,0.08) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-tz-amber/10 border border-tz-amber/20 rounded-sm mb-6">
              <Shield className="w-3.5 h-3.5 text-tz-amber" />
              <span className="text-xs font-medium text-tz-amber">Verified Tips &middot; Trusted Community</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Uganda's <span className="text-gradient">Betting</span> Community
            </h1>
            <p className="text-base md:text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
              Follow verified tipsters with proven track records. Get daily predictions, practice with virtual credits, and make informed betting decisions.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  to="/tips"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Browse Tips
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
                >
                  Join Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/tipsters"
                className="inline-flex items-center gap-2 px-6 py-3 border border-tz-olive text-white/80 font-medium rounded-sm hover:bg-tz-olive/30 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-tz-surface border-b border-tz-olive/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Target className="w-4 h-4 text-tz-amber" />
                <span className="text-xs text-white/50 uppercase tracking-wider">Today's Tips</span>
              </div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-white">{platformStats.todayTips}</p>
            </div>
            <div className="text-center md:text-left border-x border-tz-olive/30 px-4">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/50 uppercase tracking-wider">30d Win Rate</span>
              </div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-white">{platformStats.winRate}%</p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Users className="w-4 h-4 text-tz-amber" />
                <span className="text-xs text-white/50 uppercase tracking-wider">Active Tipsters</span>
              </div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-white">{platformStats.activeTipsters}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Top Tipsters</h2>
            <p className="text-sm text-white/50 mt-1">Ranked by verified win rate</p>
          </div>
          <Link
            to="/tipsters"
            className="text-sm text-tz-amber hover:text-tz-amberLight transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {leaderboard?.map((tipster, index) => (
            <Link
              key={tipster.id}
              to={`/tipsters/${tipster.user?.username ?? tipster.id}`}
              className="group bg-tz-forest border border-tz-olive/30 rounded-sm p-5 hover:border-tz-amber/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-heading",
                    index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                    index === 1 ? "bg-gray-300/20 text-gray-300" :
                    "bg-amber-600/20 text-amber-600"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white group-hover:text-tz-amber transition-colors">
                      {tipster.user?.fullName ?? tipster.user?.username ?? "Tipster"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {tierIcon(tipster.tier)}
                      <span className={cn("text-xs font-medium", getTierColor(tipster.tier))}>
                        {tipster.tier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-heading text-xl font-bold text-white">{tipster.winRate}%</p>
                  <p className="text-[10px] text-white/50 uppercase">Win Rate</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-white">{tipster.totalTips}</p>
                  <p className="text-[10px] text-white/50 uppercase">Tips</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-white">{tipster.currentStreak}</p>
                  <p className="text-[10px] text-white/50 uppercase">Streak</p>
                </div>
              </div>
            </Link>
          ))}
          {(!leaderboard || leaderboard.length === 0) && (
            <div className="md:col-span-3 text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Trophy className="w-12 h-12 text-tz-olive mx-auto mb-3" />
              <p className="text-white/50">No tipsters yet. Be the first to apply!</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Tips */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-tz-olive/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Latest Tips</h2>
            <p className="text-sm text-white/50 mt-1">Today's predictions from top tipsters</p>
          </div>
          <Link
            to="/tips"
            className="text-sm text-tz-amber hover:text-tz-amberLight transition-colors flex items-center gap-1"
          >
            View All Tips
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentTips?.map((tip) => (
            <div
              key={tip.id}
              className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden"
            >
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-tz-olive rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(tip.tipster?.username ?? "T")[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tip.tipster?.username ?? "Anonymous"}
                      </p>
                      {tip.tipster?.tipsterProfile && (
                        <div className="flex items-center gap-1">
                          {tierIcon(tip.tipster.tipsterProfile.tier)}
                          <span className="text-[10px] text-white/50">{tip.tipster.tipsterProfile.winRate}% WR</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-sm border", getStatusColor(tip.status))}>
                    {tip.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-white text-lg">{tip.matchName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/50">{tip.league}</span>
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(tip.matchDatetime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50">Pick</p>
                    <p className="font-heading font-bold text-tz-amber">{tip.pick}</p>
                    <p className="text-xs text-white/70">@{formatOdds(tip.odds)}</p>
                  </div>
                </div>

                {/* Analysis - Blurred for non-VIP */}
                {tip.analysis && (
                  <div className="mt-3 pt-3 border-t border-tz-olive/30 relative">
                    {!user?.isVip && !tip.isFree ? (
                      <div className="relative">
                        <div className="blur-sm select-none">
                          <p className="text-sm text-white/60">{truncateText(tip.analysis, 100)}</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Link
                            to="/pricing"
                            className="flex items-center gap-1.5 px-4 py-2 bg-tz-amber/90 text-tz-forest text-xs font-semibold rounded-sm hover:bg-tz-amber transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            Subscribe to Unlock Analysis
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">{truncateText(tip.analysis, 120)}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-tz-olive/30 flex items-center gap-2">
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
              </div>
            </div>
          ))}
          {(!recentTips || recentTips.length === 0) && (
            <div className="text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Target className="w-12 h-12 text-tz-olive mx-auto mb-3" />
              <p className="text-white/50">No tips posted yet today.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-tz-forest border-y border-tz-olive/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-white">How It Works</h2>
            <p className="text-white/50 mt-2">Three simple steps to smarter betting</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tz-amber/10 border border-tz-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-tz-amber" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">1. Follow</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Browse verified tipsters ranked by proven win rate. Follow them for free to see their daily picks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-tz-amber/10 border border-tz-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-7 h-7 text-tz-amber" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">2. Subscribe</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Upgrade to VIP for detailed analysis, confidence scores, and accumulator combinations via MTN MoMo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-tz-amber/10 border border-tz-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-tz-amber" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">3. Win</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Use expert insights to make informed decisions. Practice with virtual credits before betting real money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl font-bold text-white">What Members Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "David K.", text: "Been following the GOLD tier tipsters for 3 months. My win rate has improved from 40% to 62%. Worth every shilling!", role: "VIP Member" },
            { name: "Sarah N.", text: "The practice mode helped me learn without losing money. Now I understand bankroll management and value betting.", role: "Free Member" },
            { name: "Michael O.", text: "As a tipster, I've built a solid following and earn consistent payouts to my MTN MoMo. Great platform for Uganda!", role: "Tipster" },
          ].map((testimonial, i) => (
            <div key={i} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 text-tz-amber fill-tz-amber" />
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">"{testimonial.text}"</p>
              <div>
                <p className="text-sm font-medium text-white">{testimonial.name}</p>
                <p className="text-xs text-tz-amber">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-tz-forest border-t border-tz-olive/30 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Join Uganda's betting community today. Follow tipsters for free or upgrade to VIP for full analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={isAuthenticated ? "/tips" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
            >
              {isAuthenticated ? "Browse Tips" : "Join Free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 border border-tz-olive text-white/80 font-medium rounded-sm hover:bg-tz-olive/30 transition-colors"
            >
              <Crown className="w-4 h-4" />
              VIP Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Responsible Betting Footer Note */}
      <section className="bg-tz-surface border-t border-tz-olive/20 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[11px] text-white/40">
            Only stake what you can afford to lose. TipZone UG does not guarantee winnings. Betting involves risk. Please gamble responsibly.
          </p>
        </div>
      </section>
    </div>
  );
}
