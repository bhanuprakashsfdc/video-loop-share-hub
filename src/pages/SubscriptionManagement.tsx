
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, PauseCircle, ArrowLeftCircle, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type SubscriptionInfo = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  current_period_start?: string | null;
  pause_until?: string | null;
};

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Function to fetch subscription info
  const fetchSubscriptionInfo = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  // Check for success URL params when coming from checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSuccess = searchParams.get('success') === 'true';
    
    if (isSuccess && user) {
      toast({
        title: "Subscription Updated",
        description: "Your subscription changes have been processed successfully.",
      });
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, user, toast]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchSubscriptionInfo();
    
    // Set up periodic refresh (every 10 seconds)
    const refreshInterval = setInterval(() => {
      if (user) fetchSubscriptionInfo();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  const handleManageSubscription = async () => {
    try {
      setProcessingAction(true);
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handlePauseSubscription = async () => {
    try {
      setProcessingAction(true);
      const { data, error } = await supabase.functions.invoke("pause-subscription", {
        body: { pauseDuration: 30 } // Pause for 30 days
      });
      
      if (error) throw error;
      
      toast({
        title: "Subscription Paused",
        description: "Your subscription has been paused. You can resume anytime.",
      });
      
      // Refresh subscription info
      await fetchSubscriptionInfo();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDowngrade = async () => {
    try {
      setProcessingAction(true);
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { action: "downgrade" }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process downgrade request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-4">Loading subscription information...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                <ArrowLeftCircle className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Manage Your Subscription</h1>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => fetchSubscriptionInfo()} 
              disabled={refreshing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {subscriptionInfo?.subscribed ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Active Subscription
                  </CardTitle>
                  <CardDescription>
                    Your current plan and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
                      <p className="font-medium text-lg">{subscriptionInfo.subscription_tier || "Premium"} Plan</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Renewal Date</h3>
                      <p className="font-medium">
                        {subscriptionInfo.subscription_end 
                          ? new Date(subscriptionInfo.subscription_end).toLocaleDateString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <h3 className="font-medium text-blue-800">Benefits of Your Current Plan</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" /> Unlimited playlists
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" /> Advanced customization options
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" /> Premium support
                      </li>
                      {subscriptionInfo.subscription_tier === "Enterprise" && (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" /> Custom branding
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" /> API access
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                  <Button onClick={handleManageSubscription} disabled={processingAction}>
                    {processingAction ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Manage Subscription
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Pause Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Pause Your Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your subscription will be paused for 30 days. During this time, you won't be charged, but you'll have limited access. You can resume your subscription at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePauseSubscription}>Pause Subscription</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need to Make Changes?</CardTitle>
                  <CardDescription>We have flexible options to meet your needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Downgrade Your Plan</h3>
                        <p className="text-sm text-muted-foreground">Switch to a more affordable option</p>
                      </div>
                      <Button variant="outline" onClick={handleDowngrade} className="mt-3 sm:mt-0">
                        View Options
                      </Button>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div>
                            <h3 className="font-medium">Cancel Subscription</h3>
                            <p className="text-sm text-muted-foreground">We're sad to see you go</p>
                          </div>
                          <Button variant="ghost" className="mt-3 sm:mt-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                            Cancel
                          </Button>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Before You Cancel</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-4">
                            <p>We're sorry to see you considering cancellation. With your current plan, you'll lose access to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Unlimited playlists creation</li>
                              <li>Advanced customization features</li>
                              <li>Priority customer support</li>
                            </ul>
                            <p className="font-medium">Have you considered these alternatives?</p>
                            <div className="space-y-2">
                              <div className="p-3 border rounded bg-gray-50">
                                <span className="font-medium">Pause your subscription</span> - Take a break without losing your settings
                              </div>
                              <div className="p-3 border rounded bg-gray-50">
                                <span className="font-medium">Downgrade your plan</span> - Switch to a more affordable option
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep My Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleManageSubscription} className="bg-red-500 hover:bg-red-600">
                            Continue to Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You currently don't have an active subscription plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Upgrade your experience with a premium subscription.</p>
                <Button onClick={() => navigate("/pricing")}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagement;
