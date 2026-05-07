import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Target, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Logged in successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Invalid email or password");
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
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
          to="/" 
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-tz-amber to-tz-amberLight rounded-2xl items-center justify-center mb-6 shadow-lg shadow-tz-amber/20 transform hover:scale-105 transition-transform">
            <Target className="w-12 h-12 text-tz-forest" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome <span className="text-tz-amber">Back</span>
          </h1>
          <p className="text-white/50">Enter your credentials to access TipZone</p>
        </div>

        <div className="bg-tz-forest/80 backdrop-blur-xl border border-tz-olive/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" title="Forgot Password" className="text-xs text-tz-amber/60 hover:text-tz-amber transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-tz-amber transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-tz-surface/50 border border-tz-olive/30 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-tz-amber/50 focus:ring-1 focus:ring-tz-amber/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-4 bg-tz-amber text-tz-forest font-bold rounded-xl hover:bg-tz-amberLight active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-tz-amber/10 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-tz-forest px-4 text-white/20 font-medium">Or security notice</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-white/30 leading-relaxed">
            By signing in, you agree to our <br/>
            <Link to="/terms" className="underline hover:text-white transition-colors">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm text-white/50 mt-10">
          New to TipZone?{" "}
          <Link to="/register" className="text-tz-amber font-bold hover:text-tz-amberLight transition-colors">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
