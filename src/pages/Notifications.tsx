import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Target,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Megaphone,
  CheckCheck,
  ArrowLeft
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.notification.myNotifications.useQuery(undefined, { enabled: isAuthenticated });

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.myNotifications.invalidate();
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "new_tip": return <Target className="w-4 h-4 text-tz-amber" />;
      case "result_update": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "subscription": return <CreditCard className="w-4 h-4 text-blue-400" />;
      case "payout": return <DollarSign className="w-4 h-4 text-purple-400" />;
      case "announcement": return <Megaphone className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-white/50" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Bell className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50 mb-4">Sign in to view notifications</p>
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Notifications</h1>
        {data && data.unreadCount > 0 && (
          <button
            onClick={() => markRead.mutate({})}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-tz-amber hover:bg-tz-amber/10 rounded-sm transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-4 animate-pulse">
              <div className="h-4 bg-tz-olive/30 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.notifications?.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead.mutate({ id: notif.id })}
              className={cn(
                "flex items-start gap-3 p-4 border rounded-sm transition-all cursor-pointer",
                notif.isRead
                  ? "bg-tz-forest border-tz-olive/30 opacity-60"
                  : "bg-tz-forest border-tz-olive/30 hover:border-tz-amber/30"
              )}
            >
              <div className="w-8 h-8 bg-tz-olive/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", notif.isRead ? "text-white/60" : "text-white font-medium")}>
                  {notif.title}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{notif.body}</p>
                <p className="text-[10px] text-white/30 mt-1">{formatDateTime(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-tz-amber rounded-full shrink-0 mt-2" />
              )}
            </div>
          ))}

          {(!data?.notifications || data.notifications.length === 0) && (
            <div className="text-center py-16 bg-tz-forest border border-tz-olive/30 rounded-sm">
              <Bell className="w-10 h-10 text-tz-olive mx-auto mb-2" />
              <p className="text-white/50">No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
