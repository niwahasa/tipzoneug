import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Users,
  DollarSign,
  ArrowLeft,
  Target,
  Trophy,
  Clock,
  Smartphone
} from "lucide-react";
import { cn, formatUGX, formatOdds, getStatusColor } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "post-tip" | "my-tips" | "earnings">("overview");

  const { data: profile } = trpc.tipster.byId.useQuery(
    { id: Number(user?.id) },
    { enabled: !!user?.id }
  );

  const { data: myTips } = trpc.tip.byTipster.useQuery(
    { tipsterId: Number(user?.id), limit: 50 },
    { enabled: !!user?.id && activeTab === "my-tips" }
  );

  const { data: stats } = trpc.tipster.stats.useQuery(
    { tipsterId: Number(user?.id) },
    { enabled: !!user?.id }
  );

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "post-tip" as const, label: "Post Tip", icon: PlusCircle },
    { key: "my-tips" as const, label: "My Tips", icon: List },
    { key: "earnings" as const, label: "Earnings", icon: DollarSign },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white">Tipster Dashboard</h1>
        </div>
        {profile?.tier && (
          <div className={cn("px-3 py-1 border rounded-sm", 
            profile.tier === "GOLD" ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400" :
            profile.tier === "SILVER" ? "bg-gray-300/10 border-gray-300/30 text-gray-300" :
            "bg-amber-600/10 border-amber-600/30 text-amber-600"
          )}>
            <span className="text-xs font-medium">{profile.tier} TIER</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-6 border-b border-tz-olive/30 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-sm whitespace-nowrap transition-colors",
              activeTab === tab.key
                ? "bg-tz-amber text-tz-forest"
                : "text-white/60 hover:text-white hover:bg-tz-olive/20"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab profile={profile} stats={stats} />}
      {activeTab === "post-tip" && <PostTipTab />}
      {activeTab === "my-tips" && <MyTipsTab tips={myTips} />}
      {activeTab === "earnings" && <EarningsTab profile={profile} />}
    </div>
  );
}

function OverviewTab({ profile, stats }: { profile: any; stats: any }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tips", value: profile?.totalTips ?? 0, icon: Target },
          { label: "Win Rate", value: `${profile?.winRate ?? 0}%`, icon: Trophy },
          { label: "Followers", value: profile?.followerCount ?? 0, icon: Users },
          { label: "Earnings", value: formatUGX(profile?.totalEarnings ?? 0), icon: DollarSign },
        ].map((stat) => (
          <div key={stat.label} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
            <stat.icon className="w-5 h-5 text-tz-amber mb-2" />
            <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Performance */}
      {stats && (
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
          <h3 className="font-heading font-semibold text-white mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/40">Won</p>
              <p className="font-heading text-xl font-bold text-green-400">{stats.wonTips}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Lost</p>
              <p className="font-heading text-xl font-bold text-red-400">{stats.lostTips}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Win Rate</p>
              <p className="font-heading text-xl font-bold text-tz-amber">{stats.winRate}%</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Avg Odds</p>
              <p className="font-heading text-xl font-bold text-white">{stats.averageOdds}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostTipTab() {
  const utils = trpc.useUtils();
  const createTip = trpc.tip.create.useMutation({
    onSuccess: () => {
      utils.tip.list.invalidate();
      alert("Tip posted successfully!");
    },
  });

  const [formData, setFormData] = useState({
    matchName: "",
    league: "EPL",
    matchDatetime: "",
    pick: "",
    odds: "",
    stakeAdvice: "1% of bankroll",
    analysis: "",
    confidence: 70,
    isFree: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTip.mutate({
      ...formData,
      odds: formData.odds,
      matchDatetime: new Date(formData.matchDatetime).toISOString(),
    });
  };

  const leagues = ["EPL", "UPL", "La Liga", "UCL", "Serie A", "Bundesliga", "Ligue 1", "AFCON", "Other"];
  const stakeOptions = ["0.5% of bankroll", "1% of bankroll", "2% of bankroll", "3% of bankroll", "5% of bankroll"];

  return (
    <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
      <h3 className="font-heading text-lg font-semibold text-white mb-4">Post New Tip</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Match Name *</label>
            <input
              type="text"
              placeholder="e.g. Arsenal vs Chelsea"
              value={formData.matchName}
              onChange={(e) => setFormData({ ...formData, matchName: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">League *</label>
            <select
              value={formData.league}
              onChange={(e) => setFormData({ ...formData, league: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white focus:outline-none focus:border-tz-amber/50"
            >
              {leagues.map(l => <option key={l} value={l} className="bg-tz-forest">{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Kickoff Date & Time (EAT) *</label>
            <input
              type="datetime-local"
              value={formData.matchDatetime}
              onChange={(e) => setFormData({ ...formData, matchDatetime: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white focus:outline-none focus:border-tz-amber/50"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Pick *</label>
            <input
              type="text"
              placeholder="e.g. Arsenal Win, Over 2.5 Goals"
              value={formData.pick}
              onChange={(e) => setFormData({ ...formData, pick: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Odds *</label>
            <input
              type="number"
              step="0.01"
              min="1.01"
              placeholder="1.85"
              value={formData.odds}
              onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Stake Advice</label>
            <select
              value={formData.stakeAdvice}
              onChange={(e) => setFormData({ ...formData, stakeAdvice: e.target.value })}
              className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white focus:outline-none focus:border-tz-amber/50"
            >
              {stakeOptions.map(o => <option key={o} value={o} className="bg-tz-forest">{o}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Confidence Level: {formData.confidence}%</label>
          <input
            type="range"
            min="1"
            max="100"
            value={formData.confidence}
            onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
            className="w-full accent-tz-amber"
          />
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Analysis (VIP only)</label>
          <textarea
            rows={4}
            placeholder="Detailed analysis of why this pick has value..."
            value={formData.analysis}
            onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50 resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFree"
            checked={formData.isFree}
            onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
            className="accent-tz-amber"
          />
          <label htmlFor="isFree" className="text-sm text-white/60">Make this a free tip (visible to all users)</label>
        </div>

        <button
          type="submit"
          disabled={createTip.isPending}
          className="flex items-center justify-center gap-2 w-full py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors disabled:opacity-50"
        >
          {createTip.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-tz-forest/30 border-t-tz-forest rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Post Tip
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function MyTipsTab({ tips }: { tips: any[] | undefined }) {
  return (
    <div className="space-y-3">
      {tips?.map((tip) => (
        <div key={tip.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-heading font-semibold text-white">{tip.matchName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/50">{tip.league}</span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(tip.matchDatetime).toLocaleDateString("en-UG", { timeZone: "Africa/Kampala" })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-tz-amber">{tip.pick}</p>
              <p className="text-xs text-white/70">@{formatOdds(tip.odds)}</p>
              <span className={cn("text-xs px-2 py-0.5 rounded-sm border mt-1 inline-block", getStatusColor(tip.status))}>
                {tip.status}
              </span>
            </div>
          </div>
          {tip.analysis && (
            <p className="mt-2 text-sm text-white/50">{tip.analysis}</p>
          )}
        </div>
      ))}
      {(!tips || tips.length === 0) && (
        <div className="text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
          <List className="w-10 h-10 text-tz-olive mx-auto mb-2" />
          <p className="text-white/50">No tips posted yet</p>
        </div>
      )}
    </div>
  );
}

function EarningsTab({ profile }: { profile: any }) {
  const [payoutAmount, setPayoutAmount] = useState("");

  const handlePayout = () => {
    alert(`In production, this would initiate a Flutterwave Transfer of UGX ${payoutAmount} to your ${profile?.payoutPreference === "mtn" ? "MTN MoMo" : "Airtel Money"} number.`);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <p className="text-xs text-white/40 mb-1">Total Earnings</p>
          <p className="font-heading text-xl font-bold text-white">{formatUGX(profile?.totalEarnings ?? 0)}</p>
        </div>
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <p className="text-xs text-white/40 mb-1">Pending Payout</p>
          <p className="font-heading text-xl font-bold text-tz-amber">{formatUGX(profile?.pendingPayout ?? 0)}</p>
        </div>
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <p className="text-xs text-white/40 mb-1">Subscribers</p>
          <p className="font-heading text-xl font-bold text-white">{profile?.subscriberCount ?? 0}</p>
        </div>
      </div>

      {/* Payout Request */}
      <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
        <h3 className="font-heading font-semibold text-white mb-4">Request Payout</h3>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-4 h-4 text-tz-amber" />
          <span className="text-sm text-white/60">
            Payout to: {profile?.payoutPreference === "mtn" ? "MTN MoMo" : "Airtel Money"} 
            ({profile?.mtnMomoNumber ?? profile?.airtelMoneyNumber ?? "Not set"})
          </span>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Amount (UGX)"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
          />
          <button
            onClick={handlePayout}
            disabled={!payoutAmount || Number(payoutAmount) < 10000}
            className="px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors disabled:opacity-50"
          >
            Request
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-2">Minimum payout: UGX 10,000</p>
      </div>
    </div>
  );
}
