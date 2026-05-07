import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Crown,
  Check,
  ArrowRight,
  Smartphone,
  Lock
} from "lucide-react";
import { cn, formatUGX } from "@/lib/utils";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: pricing } = trpc.subscription.pricing.useQuery();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "airtel_money">("mtn_momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      key: "monthly" as const,
      label: "Monthly",
      price: pricing?.monthly ?? 15000,
      period: "/month",
      popular: false,
    },
    {
      key: "quarterly" as const,
      label: "Quarterly",
      price: pricing?.quarterly ?? 35000,
      period: "/3 months",
      popular: true,
      savings: "Save 22%",
    },
    {
      key: "annual" as const,
      label: "Annual",
      price: pricing?.annual ?? 100000,
      period: "/year",
      popular: false,
      savings: "Save 44%",
    },
  ];

  const features = [
    "Full access to all tip analysis",
    "Confidence scores for every tip",
    "Accumulator combinations",
    "Early tip notifications (30min)",
    "Tipster direct chat (Q&A)",
    "Daily betslip PDF download",
    "VIP badge on profile",
    "Ad-free experience",
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    alert("In production, this would initiate a Flutterwave Mobile Money payment. Check your phone for a USSD prompt to confirm payment.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-tz-amber/10 border border-tz-amber/20 rounded-sm mb-4">
          <Crown className="w-3.5 h-3.5 text-tz-amber" />
          <span className="text-xs font-medium text-tz-amber">VIP Membership</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
          Upgrade to <span className="text-gradient">VIP</span>
        </h1>
        <p className="text-white/50 max-w-md mx-auto">
          Get full access to detailed analysis, confidence scores, and exclusive features from all tipsters.
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {plans.map((plan) => (
          <button
            key={plan.key}
            onClick={() => setSelectedPlan(plan.key)}
            className={cn(
              "relative p-5 border rounded-sm text-left transition-all",
              selectedPlan === plan.key
                ? "border-tz-amber bg-tz-amber/5"
                : "border-tz-olive/30 bg-tz-forest hover:border-tz-olive/50"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-tz-amber text-tz-forest text-[10px] font-bold uppercase tracking-wider rounded-sm">
                Most Popular
              </div>
            )}
            {plan.savings && (
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-medium rounded-sm">
                {plan.savings}
              </div>
            )}
            <p className="text-sm text-white/50 mb-2">{plan.label}</p>
            <p className="font-heading text-3xl font-bold text-white">
              {formatUGX(plan.price)}
              <span className="text-sm font-normal text-white/40">{plan.period}</span>
            </p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Features */}
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">What's Included</h3>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-tz-amber/20 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-tz-amber" />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Payment Details</h3>

          {isAuthenticated ? (
            <>
              {/* Selected Plan Summary */}
              <div className="bg-tz-surface border border-tz-olive/30 rounded-sm p-4 mb-4">
                <p className="text-xs text-white/50 mb-1">Selected Plan</p>
                <p className="font-heading text-xl font-bold text-white">
                  {plans.find(p => p.key === selectedPlan)?.label}
                </p>
                <p className="text-tz-amber font-medium">
                  {formatUGX(plans.find(p => p.key === selectedPlan)?.price ?? 0)}
                </p>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <p className="text-xs text-white/50 mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("mtn_momo")}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 border rounded-sm transition-colors",
                      paymentMethod === "mtn_momo"
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-tz-olive/30 hover:border-tz-olive/50"
                    )}
                  >
                    <Smartphone className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-white">MTN MoMo</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("airtel_money")}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 border rounded-sm transition-colors",
                      paymentMethod === "airtel_money"
                        ? "border-red-400 bg-red-400/10"
                        : "border-tz-olive/30 hover:border-tz-olive/50"
                    )}
                  >
                    <Smartphone className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-medium text-white">Airtel Money</span>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="text-xs text-white/50 mb-2 block">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">+256</span>
                  <input
                    type="tel"
                    placeholder="7XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-14 pr-4 py-2.5 bg-tz-surface border border-tz-olive/30 rounded-sm text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tz-amber/50"
                    maxLength={9}
                  />
                </div>
                <p className="text-[10px] text-white/30 mt-1">
                  You'll receive a USSD prompt to confirm payment
                </p>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={!phoneNumber || phoneNumber.length < 9 || isProcessing}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-sm transition-colors",
                  !phoneNumber || phoneNumber.length < 9 || isProcessing
                    ? "bg-tz-olive/30 text-white/30 cursor-not-allowed"
                    : "bg-tz-amber text-tz-forest hover:bg-tz-amberLight"
                )}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-tz-forest/30 border-t-tz-forest rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatUGX(plans.find(p => p.key === selectedPlan)?.price ?? 0)}
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-tz-olive mx-auto mb-3" />
              <p className="text-white/50 mb-4">Sign in to subscribe to VIP</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-tz-amber text-tz-forest font-semibold rounded-sm hover:bg-tz-amberLight transition-colors"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tipster Subscriptions Info */}
      <div className="mt-10 bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
        <h3 className="font-heading text-lg font-semibold text-white mb-3">Individual Tipster Subscriptions</h3>
        <p className="text-sm text-white/50 mb-4">
          You can also subscribe to individual tipsters for their exclusive tips and analysis. Prices vary by tipster (UGX 5,000 - 30,000/month). Visit any tipster's profile to see their subscription options.
        </p>
        <Link
          to="/tipsters"
          className="inline-flex items-center gap-1.5 text-sm text-tz-amber hover:text-tz-amberLight transition-colors"
        >
          Browse Tipsters
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
