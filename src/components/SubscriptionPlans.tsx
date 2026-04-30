import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  CheckIcon,
  ZapIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  HelpCircleIcon,
  ArrowRight,
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
      toast.success(`Successfully subscribed to ${planId} monthly`);
    } catch (error) {
      toast.error("Subscription update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: " Free",
      price: 0,
      description: "For individual researchers",
      credits: "5 Credits",
      results: "100 Results",
      features: ["100 total search results", "Max 30 results per query"],
      icon: ZapIcon,
    },
    {
      id: "starter ",
      name: "Starter ",
      price: 29,
      description: "For active lead generation",
      credits: "300 Credits",
      results: "1,000 Results",
      popular: true,
      features: [
        "300 reveal credits /mo",
        "1,000 total search results",
        "Max 30 results per query",
        "Priority Support",
        "Search History Archive",
      ],
      icon: StarIcon,
    },
    {
      id: "business",
      name: "Business",
      price: 99,
      description: "For high-scale outreach",
      credits: "1,000 Credits",
      results: "10,000 Results",
      features: [
        "1,000 reveal credits /mo",
        "10,000 total search results",
        "Max 50 results per query",
        "Priority Support",
        "Search History Archive",
        "Bulk Export Tools",
      ],
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-6 antialiased">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 bg-black/[0.03] px-3 py-1 rounded-full border border-black/[0.05]">
            <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
              Recurring Monthly Billing
            </span>
          </div>
          <h2 className="text-4xl font-black text-[#1d1d1f] tracking-tighter mb-4">
            Scale your intelligence.
          </h2>
          <p className="text-[15px] text-black/50 font-medium max-w-lg mx-auto leading-relaxed">
            Choose a recurring monthly plan to unlock more reveal credits and
            expanded search result limits.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const isCurrentPlan = user?.subscriptionPlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col bg-white rounded-[2rem] border transition-all duration-300 ${
                  plan.popular
                    ? "border-black shadow-[0_20px_40px_rgba(0,0,0,0.08)] scale-[1.02] z-10 p-8"
                    : "border-black/[0.05] shadow-sm hover:border-black/20 p-7"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`p-2.5 rounded-xl ${plan.popular ? "bg-black text-white" : "bg-black/5 text-black"}`}
                  >
                    <plan.icon size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-widest text-black/30 leading-none mb-1">
                      Monthly
                    </p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-black text-black tracking-tighter">
                        ${plan.price}
                      </span>
                      <span className="text-[13px] font-bold text-black/40">
                        /mo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-black text-black tracking-tight mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-[13px] text-black/40 font-medium">
                    {plan.description}
                  </p>
                </div>

                {/* Quota Highlights */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-black/[0.02] border border-black/[0.03] rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-black/30 mb-1">
                      Credits
                    </p>
                    <p className="text-sm font-black text-black">
                      {plan.credits}
                    </p>
                  </div>
                  <div className="bg-black/[0.02] border border-black/[0.03] rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-black/30 mb-1">
                      Results
                    </p>
                    <p className="text-sm font-black text-black">
                      {plan.results}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px] font-medium text-black/60"
                    >
                      <CheckIcon
                        size={14}
                        className="mt-0.5 text-black shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpdateSubscription(plan.id)}
                  disabled={isProcessing || isCurrentPlan}
                  className={`
    relative w-full py-4 rounded-xl font-black text-[13px] uppercase tracking-widest
    flex items-center justify-center gap-3 transition-all duration-300
    ${
      isCurrentPlan
        ? "bg-gray-100 text-gray-400 cursor-default border border-gray-200"
        : `
        /* The Base: Deep Red */
        bg-red-600 
        /* The Font: High Contrast White */
        text-white 
        /* The Border: Defined & Darker for depth */
        border-b-4 border-red-800 border-x border-t border-red-700
        /* The Shadow: Soft glow to make it "pop" */
        shadow-[0_10px_20px_rgba(185,28,28,0.2)]
        /* The Hover: Brighter glow and slight lift */
        hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-[0_15px_25px_rgba(185,28,28,0.3)]
        /* The Active/Click: Physical "Press" effect */
        active:translate-y-0.5 active:border-b-0 active:shadow-inner
      `
    }
  `}
                >
                  <span className="drop-shadow-md">
                    {isCurrentPlan ? "Current Plan" : `Activate ${plan.name}`}
                  </span>
                  {!isCurrentPlan && (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer FAQ - High Density */}
        <div className="mt-24 border-t border-black/5 pt-12">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <HelpCircleIcon size={18} className="text-black/20" />
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-black/40">
              Frequently Asked Questions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
            {[
              {
                q: "What are reveal credits?",
                a: "Credits allow you to unlock specific contact data (email/phone) from a person profile. One credit equals one successful reveal.",
              },
              {
                q: "Is the billing recurring?",
                a: "Yes, all plans recur monthly. You can cancel at any time through your dashboard to stop the next billing cycle.",
              },
              {
                q: "What happens to unused credits?",
                a: "Credits reset at the start of every billing cycle. They do not roll over to the following month.",
              },
              {
                q: "Can I switch plans mid-month?",
                a: "Yes. Upgrades are processed immediately with prorated credits. Downgrades take effect at the end of the current cycle.",
              },
            ].map((faq, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-[14px] font-bold text-black tracking-tight">
                  {faq.q}
                </h4>
                <p className="text-[13px] text-black/40 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
