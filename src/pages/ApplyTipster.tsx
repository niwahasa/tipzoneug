import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Target,
  Users,
  TrendingUp
} from "lucide-react";

export default function ApplyTipster() {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    sports: [] as string[],
    experienceDescription: "",
    sampleTips: "",
    facebook: "",
    twitter: "",
    whatsappGroup: "",
  });

  const applyMutation = trpc.tipster.submitApplication.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      sports: formData.sports,
      experienceDescription: formData.experienceDescription,
      sampleTips: formData.sampleTips,
      socialLinks: {
        facebook: formData.facebook || undefined,
        twitter: formData.twitter || undefined,
        whatsappGroup: formData.whatsappGroup || undefined,
      },
    });
  };

  const toggleSport = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const sports = ["Football", "Basketball", "Tennis", "Rugby", "Cricket"];

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Trophy className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50 mb-4">Sign in to apply as a tipster</p>
        <Link to="/login" className="px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-tz-forest border border-green-500/30 rounded-sm p-8">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-white/50 mb-6">
            Your application is under review. You'll be notified once approved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Become a Tipster</h1>
        <p className="text-sm text-white/50 mt-1">Share your expertise and earn from subscribers</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Target, label: "Post Tips", desc: "Daily predictions" },
          { icon: Users, label: "Build Following", desc: "Grow your audience" },
          { icon: TrendingUp, label: "Earn 65%", desc: "Of subscription revenue" },
        ].map((item) => (
          <div key={item.label} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-3 text-center">
            <item.icon className="w-5 h-5 text-tz-amber mx-auto mb-1" />
            <p className="text-xs font-medium text-white">{item.label}</p>
            <p className="text-[10px] text-white/40">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6 space-y-4">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
            required
          />
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Phone Number *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">+256</span>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
              className="w-full pl-14 pr-4 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              placeholder="7XX XXX XXX"
              maxLength={9}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-2 block">Sports *</label>
          <div className="flex flex-wrap gap-2">
            {sports.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                  formData.sports.includes(sport)
                    ? "bg-tz-amber text-tz-forest border-tz-amber"
                    : "bg-tz-surface text-white/60 border-tz-olive/30 hover:border-tz-amber/50"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Experience Description *</label>
          <textarea
            rows={4}
            value={formData.experienceDescription}
            onChange={(e) => setFormData({ ...formData, experienceDescription: e.target.value })}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50 resize-none"
            placeholder="Describe your betting experience, track record, and approach..."
            required
          />
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Sample Tips *</label>
          <textarea
            rows={4}
            value={formData.sampleTips}
            onChange={(e) => setFormData({ ...formData, sampleTips: e.target.value })}
            className="w-full px-3 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50 resize-none"
            placeholder="Provide 3-5 sample tips with reasoning to demonstrate your analysis skills..."
            required
          />
        </div>

        <div className="pt-2 border-t border-tz-olive/30">
          <p className="text-xs text-white/40 mb-2">Social Links (optional)</p>
          <div className="space-y-2">
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full px-3 py-2 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              placeholder="Facebook profile URL"
            />
            <input
              type="url"
              value={formData.whatsappGroup}
              onChange={(e) => setFormData({ ...formData, whatsappGroup: e.target.value })}
              className="w-full px-3 py-2 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
              placeholder="WhatsApp Group invite link"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={applyMutation.isPending || formData.sports.length === 0}
          className="w-full py-3 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors disabled:opacity-50"
        >
          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
