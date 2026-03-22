import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Check,
  Star,
  Zap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionPlans: React.FC = () => {
  const { user, updateSubscription } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateSubscription = async (planId: string) => {
    if (user?.subscriptionPlan?.id === planId) {
      toast.error("You are already on this plan");
      return;
    }

    setIsProcessing(true);
    try {
      await updateSubscription(planId);
      toast.success(`Successfully switched to ${planId} plan`);
    } catch (error) {
      toast.error("Failed to update subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Starter",
      price: 0,
      features: [
        "10 monthly searches",
        "Basic filters",
        "Export 5 contacts",
        "Email support",
      ],
      icon: Zap,
    },
    {
      id: "basic",
      name: "Professional",
      price: 19.99,
      features: [
        "100 monthly searches",
        "Advanced filters",
        "Export 50 contacts",
        "Priority support",
        "Search History",
      ],
      icon: Star,
      popular: true,
    },
    {
      id: "pro",
      name: "Business",
      price: 49.99,
      features: [
        "Unlimited searches",
        "Bulk data export",
        "Full search history",
        "API Access",
        "24/7 Support",
      ],
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple Pricing
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Scale your lead generation as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {plans.map((plan) => {
          const isCurrentPlan = user?.subscriptionPlan?.id === plan.id;

          return (
            <div
              key={plan.id}
              className={`psa-card p-8 flex flex-col relative ${plan.popular ? "border-2 border-indigo-500 ring-4 ring-indigo-50 scale-105 z-10" : ""}`}
            >
              {plan.popular && (
                <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 shadow-lg">
                  Recommended
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}
                >
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {plan.name}
                </h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">
                  ${plan.price}
                </span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpdateSubscription(plan.id)}
                disabled={isProcessing || isCurrentPlan}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? "bg-slate-100 text-slate-400 cursor-default"
                    : plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : `Select ${plan.name}`}
                {!isCurrentPlan && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section with new UI */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: "Can I upgrade anytime?",
              a: "Yes, changes take effect immediately and differences are prorated.",
            },
            {
              q: "Is there a free trial?",
              a: "All paid plans come with a 14-day trial. No credit card required.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200"
            >
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> {faq.q}
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
