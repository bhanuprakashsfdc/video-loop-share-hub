
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const pricingPlans = [
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
    priceId: "price_individual"
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
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold mt-4">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.priceId)}
                >
                  {user ? "Subscribe Now" : "Sign In to Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
