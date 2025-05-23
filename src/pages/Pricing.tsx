
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, HelpCircle, Info, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const pricingPlans = [
  {
    name: "Lifetime Free",
    price: "$0",
    description: "Free forever plan",
    features: [
      "Basic features",
      "Community support",
      "Limited storage",
      "Standard access"
    ],
    priceId: "price_lifetime",
    popular: false,
    isLifetime: true
  },
  {
    name: "Individual",
    price: "$12",
    description: "Perfect for personal use",
    features: [
      "Up to 10 playlists",
      "Basic customization",
      "Standard support",
      "Access to public playlists"
    ],
    priceId: "price_individual",
    popular: true
  },
  {
    name: "Business",
    price: "$20",
    description: "Ideal for small teams",
    features: [
      "Unlimited playlists",
      "Advanced customization",
      "Priority support",
      "Analytics dashboard",
      "Team collaboration"
    ],
    priceId: "price_business"
  },
  {
    name: "Enterprise",
    price: "$40",
    description: "For large organizations",
    features: [
      "Everything in Business",
      "Custom branding",
      "API access",
      "24/7 phone support",
      "SLA guarantee"
    ],
    priceId: "price_enterprise"
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a success redirect from Stripe checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSuccess = searchParams.get('success') === 'true';
    const sessionId = searchParams.get('session_id');
    
    if (isSuccess && sessionId && user) {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated.",
      });
      
      // Clear the URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to subscription management page
      navigate('/subscription');
    }
  }, [location, user, navigate, toast]);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.functions.invoke("check-subscription");
        if (error) throw error;
        
        if (data?.subscribed && data?.subscription_tier) {
          setCurrentPlan(data.subscription_tier);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setError("Failed to load subscription information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [user]);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setError(null);
      setProcessingPlanId(priceId);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error("Failed to start checkout process");
      }
      
      if (data?.url) {
        console.log("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError(error instanceof Error ? error.message : "Failed to start subscription process");
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Select the perfect plan for your needs
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentPlan && (
            <Alert className="mb-6 max-w-2xl mx-auto bg-green-50 border-green-200">
              <Info className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-800">Current Plan: {currentPlan}</AlertTitle>
              <AlertDescription className="text-green-700">
                You are currently subscribed to the {currentPlan} plan.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 max-w-2xl mx-auto">
            <h3 className="font-medium text-blue-800 flex items-center">
              <Info className="h-5 w-5 mr-2" /> 
              Transparent Billing
            </h3>
            <p className="mt-2 text-sm text-blue-700">
              All plans are billed monthly and can be canceled at any time. 
              You'll receive email reminders 7 days before renewal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col ${currentPlan === plan.name ? 'border-green-500 border-2' : ''} ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
            >
              <CardHeader>
                {currentPlan === plan.name && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full w-fit mb-2">
                    Your Current Plan
                  </div>
                )}
                {plan.popular && (
                  <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full w-fit mb-2">
                    Most Popular
                  </div>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold mt-4">
                  {plan.price}
                  {!plan.isLifetime && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loading || currentPlan === plan.name || processingPlanId !== null}
                  onClick={() => handleSubscribe(plan.priceId)}
                >
                  {processingPlanId === plan.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentPlan === plan.name ? (
                    'Current Plan'
                  ) : (
                    <>
                      {plan.isLifetime ? 'Get Free Access' : 'Subscribe Now'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4 text-left">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">How do I cancel my subscription?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You can easily cancel your subscription at any time from your account settings. 
                There are no hidden fees or long-term commitments.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Can I pause my subscription?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes! If you need a break, you can pause your subscription for up to 30 days without losing your data or settings.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">What happens to my data if I downgrade?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is always safe. If you downgrade, you'll keep access to core features, but premium features will be limited.
                We'll clearly explain what changes before you confirm.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Need help choosing a plan? <a href="#" className="underline">Contact support</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
