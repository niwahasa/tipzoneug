import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Target, ArrowLeft, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Account created successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    registerMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tz-surface">
        <Loader2 className="w-8 h-8 text-tz-amber animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pitch-pattern bg-tz-surface px-4 py-12">
      <div className="w-full max-w-md">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-tz-amber to-tz-amberLight rounded-2xl items-center justify-center mb-6 shadow-lg shadow-tz-amber/20 transform hover:scale-105 transition-transform">
            <Target className="w-12 h-12 text-tz-forest" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2 tracking-tight">
            Join <span className="text-tz-amber">TipZone</span>
          </h1>
          <p className="text-white/50">Start your journey to professional betting</p>
        </div>

        <div className="bg-tz-forest/80 backdrop-blur-xl border border-tz-olive/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="Repeat your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-4 mt-4 bg-tz-amber text-tz-forest font-bold rounded-xl hover:bg-tz-amberLight active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-tz-amber/10 flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {[
              "Daily professional betting tips",
              "Virtual practice credits (100,000 UGX)",
              "Follow your favorite tipsters",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-[11px] text-white/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-tz-amber" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-white/50 mt-10">
          Already have an account?{" "}
          <Link to="/login" className="text-tz-amber font-bold hover:text-tz-amberLight transition-colors">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
}
