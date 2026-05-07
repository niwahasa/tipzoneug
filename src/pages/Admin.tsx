import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  Users,
  Target,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  LayoutDashboard,
  UserCheck,
  BarChart3,
  Settings,
  Bell
} from "lucide-react";
import { cn, formatUGX, formatDateTime, getStatusColor } from "@/lib/utils";
import { Link } from "react-router";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "users" | "tips" | "payouts" | "broadcast">("overview");

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: applications } = trpc.admin.applications.useQuery({ status: "pending" }, { enabled: activeTab === "applications" });
  const { data: allUsers } = trpc.admin.users.useQuery(undefined, { enabled: activeTab === "users" });
  const { data: allTips } = trpc.admin.allTips.useQuery(undefined, { enabled: activeTab === "tips" });
  const { data: payouts } = trpc.admin.payouts.useQuery(undefined, { enabled: activeTab === "payouts" });

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "applications" as const, label: "Applications", icon: UserCheck },
    { key: "users" as const, label: "Users", icon: Users },
    { key: "tips" as const, label: "Tips", icon: Target },
    { key: "payouts" as const, label: "Payouts", icon: DollarSign },
    { key: "broadcast" as const, label: "Broadcast", icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-tz-amber" />
          <h1 className="font-heading text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
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
            {tab.key === "applications" && stats?.pendingApplications ? (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                {stats.pendingApplications}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab stats={stats} />}
      {activeTab === "applications" && <ApplicationsTab applications={applications} />}
      {activeTab === "users" && <UsersTab users={allUsers} />}
      {activeTab === "tips" && <TipsTab tips={allTips} />}
      {activeTab === "payouts" && <PayoutsTab payouts={payouts} />}
      {activeTab === "broadcast" && <BroadcastTab />}
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Total Tipsters", value: stats.totalTipsters, icon: Target, color: "text-tz-amber" },
    { label: "Total Tips", value: stats.totalTips, icon: BarChart3, color: "text-green-400" },
    { label: "Pending Applications", value: stats.pendingApplications, icon: AlertCircle, color: "text-orange-400" },
    { label: "Total Revenue", value: formatUGX(stats.totalRevenue), icon: DollarSign, color: "text-purple-400" },
    { label: "Transactions", value: stats.totalTransactions, icon: Settings, color: "text-cyan-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
          <card.icon className={cn("w-5 h-5 mb-2", card.color)} />
          <p className="font-heading text-2xl font-bold text-white">{card.value}</p>
          <p className="text-xs text-white/40">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTab({ applications }: { applications: any[] | undefined }) {
  const utils = trpc.useUtils();
  const reviewMutation = trpc.admin.reviewApplication.useMutation({
    onSuccess: () => {
      utils.admin.applications.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  return (
    <div className="space-y-3">
      {applications?.map((app) => (
        <div key={app.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-heading font-semibold text-white">{app.fullName}</h4>
              <p className="text-xs text-white/50">{app.phoneNumber}</p>
            </div>
            <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-sm">
              {app.status}
            </span>
          </div>

          {app.sports && (
            <div className="flex flex-wrap gap-1 mb-3">
              {JSON.parse(JSON.stringify(app.sports)).map((sport: string) => (
                <span key={sport} className="px-2 py-0.5 bg-tz-olive/30 text-white/60 text-xs rounded-sm">
                  {sport}
                </span>
              ))}
            </div>
          )}

          <div className="mb-3">
            <p className="text-xs text-white/40 mb-1">Experience</p>
            <p className="text-sm text-white/60">{app.experienceDescription}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-white/40 mb-1">Sample Tips</p>
            <p className="text-sm text-white/60">{app.sampleTips}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => reviewMutation.mutate({ applicationId: app.id, status: "approved" })}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 text-sm font-medium rounded-sm hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => reviewMutation.mutate({ applicationId: app.id, status: "rejected", adminNotes: "Does not meet requirements" })}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-sm hover:bg-red-500/30 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      ))}

      {(!applications || applications.length === 0) && (
        <div className="text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-white/50">No pending applications</p>
        </div>
      )}
    </div>
  );
}

function UsersTab({ users }: { users: any[] | undefined }) {
  return (
    <div className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-tz-olive/30">
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">User</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Role</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">VIP</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-b border-tz-olive/20">
              <td className="px-4 py-3">
                <p className="text-sm text-white">{u.username ?? u.name ?? "Anonymous"}</p>
                <p className="text-xs text-white/40">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-sm",
                  u.role === "admin" ? "bg-purple-500/20 text-purple-400" :
                  u.role === "tipster" ? "bg-tz-amber/20 text-tz-amber" :
                  "bg-tz-olive/30 text-white/60"
                )}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.isVip ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-white/20" />
                )}
              </td>
              <td className="px-4 py-3 text-xs text-white/40">
                {formatDateTime(u.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!users || users.length === 0) && (
        <p className="text-center py-8 text-white/40">No users found</p>
      )}
    </div>
  );
}

function TipsTab({ tips }: { tips: any[] | undefined }) {
  const utils = trpc.useUtils();
  const updateResult = trpc.tip.updateResult.useMutation({
    onSuccess: () => {
      utils.admin.allTips.invalidate();
      utils.tip.list.invalidate();
    },
  });

  return (
    <div className="space-y-3">
      {tips?.map((tip) => (
        <div key={tip.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-heading font-semibold text-white">{tip.matchName}</h4>
              <p className="text-xs text-white/50">{tip.league} &middot; {tip.tipster?.username}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-heading font-bold text-tz-amber">{tip.pick}</p>
              <span className={cn("text-xs px-2 py-0.5 rounded-sm border", getStatusColor(tip.status))}>
                {tip.status}
              </span>
            </div>
          </div>
          
          {tip.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateResult.mutate({ tipId: tip.id, status: "won" })}
                className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-sm hover:bg-green-500/30 transition-colors"
              >
                Mark Won
              </button>
              <button
                onClick={() => updateResult.mutate({ tipId: tip.id, status: "lost" })}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-sm hover:bg-red-500/30 transition-colors"
              >
                Mark Lost
              </button>
              <button
                onClick={() => updateResult.mutate({ tipId: tip.id, status: "void" })}
                className="px-3 py-1.5 bg-gray-500/20 text-gray-400 text-xs rounded-sm hover:bg-gray-500/30 transition-colors"
              >
                Void
              </button>
            </div>
          )}
        </div>
      ))}
      {(!tips || tips.length === 0) && (
        <p className="text-center py-8 text-white/40">No tips found</p>
      )}
    </div>
  );
}

function PayoutsTab({ payouts }: { payouts: any[] | undefined }) {
  const utils = trpc.useUtils();
  const processPayout = trpc.admin.processPayout.useMutation({
    onSuccess: () => {
      utils.admin.payouts.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  return (
    <div className="space-y-3">
      {payouts?.map((tipster) => (
        <div key={tipster.id} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tz-olive rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {(tipster.user?.username ?? "T")[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{tipster.user?.username ?? "Anonymous"}</p>
                <p className="text-xs text-white/50">
                  Prefers: {tipster.payoutPreference === "mtn" ? "MTN MoMo" : "Airtel Money"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-heading text-lg font-bold text-tz-amber">{formatUGX(tipster.pendingPayout)}</p>
                <p className="text-xs text-white/40">Pending</p>
              </div>
              <button
                onClick={() => processPayout.mutate({ tipsterId: tipster.id, amount: tipster.pendingPayout })}
                className="px-4 py-2 bg-tz-amber text-tz-forest text-sm font-medium rounded-sm hover:bg-tz-amberLight transition-colors"
              >
                Pay Out
              </button>
            </div>
          </div>
        </div>
      ))}
      {(!payouts || payouts.length === 0) && (
        <div className="text-center py-12 bg-tz-forest border border-tz-olive/30 rounded-sm">
          <DollarSign className="w-10 h-10 text-tz-olive mx-auto mb-2" />
          <p className="text-white/50">No pending payouts</p>
        </div>
      )}
    </div>
  );
}

function BroadcastTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"announcement" | "new_tip">("announcement");

  const broadcast = trpc.admin.broadcastNotification.useMutation({
    onSuccess: (data) => {
      alert(`Notification broadcast to ${data.sentTo} users!`);
      setTitle("");
      setBody("");
    },
  });

  return (
    <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
      <h3 className="font-heading font-semibold text-white mb-4">Broadcast Notification</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
            placeholder="Notification title..."
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Message</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50 resize-none"
            placeholder="Notification message..."
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "announcement" | "new_tip")}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white focus:outline-none focus:border-tz-amber/50"
          >
            <option value="announcement" className="bg-tz-forest">Announcement</option>
            <option value="new_tip" className="bg-tz-forest">New Tip</option>
          </select>
        </div>
        <button
          onClick={() => broadcast.mutate({ title, body, type })}
          disabled={!title || !body || broadcast.isPending}
          className="w-full py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors disabled:opacity-50"
        >
          {broadcast.isPending ? "Broadcasting..." : "Send to All Users"}
        </button>
      </div>
    </div>
  );
}
