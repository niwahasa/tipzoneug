import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Target,
  ArrowLeft,
  Clock,
  Lock,
  MessageCircle,
  Crown,
  Flame
} from "lucide-react";
import { cn, formatOdds, formatDateTime, getStatusColor, generateWhatsAppMessage } from "@/lib/utils";

export default function TipDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: tip, isLoading } = trpc.tip.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tz-forest border border-tz-olive/30 rounded w-1/3" />
          <div className="h-64 bg-tz-forest border border-tz-olive/30 rounded" />
        </div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Target className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50">Tip not found</p>
        <Link to="/tips" className="text-tz-amber text-sm mt-2 inline-block">
          Back to Tips
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      <Link to="/tips" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Tips
      </Link>

      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden">
        <div className="p-6">
          {/* Tipster */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-tz-olive rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {(tip.tipster?.username ?? "T")[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <Link 
                to={`/tipsters/${tip.tipster?.username ?? tip.tipsterId}`}
                className="text-sm font-medium text-white hover:text-tz-amber transition-colors"
              >
                {tip.tipster?.username ?? "Anonymous"}
              </Link>
              {tip.tipster?.tipsterProfile && (
                <p className="text-xs text-white/50">
                  {tip.tipster.tipsterProfile.winRate}% WR &middot; {tip.tipster.tipsterProfile.tier} Tier
                </p>
              )}
            </div>
          </div>

          {/* Match */}
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{tip.matchName}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-white/50">{tip.league}</span>
            <span className="text-sm text-white/50 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDateTime(tip.matchDatetime)} EAT
            </span>
          </div>

          {/* Pick & Odds */}
          <div className="bg-tz-surface border border-tz-olive/30 rounded-sm p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Our Pick</p>
                <p className="font-heading text-2xl font-bold text-tz-amber">{tip.pick}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 mb-1">Odds</p>
                <p className="font-heading text-2xl font-bold text-white">@{formatOdds(tip.odds)}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <span className={cn("text-sm px-3 py-1 rounded-sm border", getStatusColor(tip.status))}>
              {tip.status === "pending" ? "Awaiting Result" : tip.status}
            </span>
            {tip.confidence && (
              <span className="flex items-center gap-1 text-sm text-white/50">
                <Flame className="w-4 h-4 text-orange-400" />
                {tip.confidence}% confidence
              </span>
            )}
          </div>

          {/* Analysis */}
          {tip.analysis && (
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-white mb-3">Analysis</h3>
              {!user?.isVip && !tip.isFree ? (
                <div className="bg-tz-surface border border-tz-olive/30 rounded-sm p-6 text-center">
                  <Lock className="w-10 h-10 text-tz-olive mx-auto mb-3" />
                  <p className="text-white/50 mb-1">Full analysis is VIP-only</p>
                  <p className="text-sm text-white/30 mb-4">Subscribe to unlock detailed insights</p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Get VIP Access
                  </Link>
                </div>
              ) : (
                <div className="bg-tz-surface border border-tz-olive/30 rounded-sm p-5">
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{tip.analysis}</p>
                </div>
              )}
            </div>
          )}

          {/* Stake Advice */}
          {tip.stakeAdvice && (
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-white mb-2">Stake Advice</h3>
              <p className="text-sm text-tz-amber">{tip.stakeAdvice}</p>
            </div>
          )}

          {/* Tip Type */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-white mb-2">Tip Type</h3>
            <span className="text-sm text-white/60 capitalize">{tip.tipType}</span>
          </div>

          {/* Share */}
          <div className="pt-6 border-t border-tz-olive/30">
            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage(tip)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tz-whatsapp/20 text-tz-whatsapp font-medium rounded-sm hover:bg-tz-whatsapp/30 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
