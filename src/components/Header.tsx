
import { Button } from "@/components/ui/button";
import { PlusCircle, Share2, Video, LogIn, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlaylist } from "@/context/PlaylistContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  } | null>(null);
  const { addPlaylist } = usePlaylist();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile and subscription info when user is logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setUserProfile(profileData);
        }

        // Check subscription status
        try {
          const { data: subscriptionData } = await supabase.functions.invoke('check-subscription');
          setSubscriptionInfo(subscriptionData);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName);
      setNewPlaylistName("");
      toast({
        title: "Playlist Created",
        description: `Your playlist "${newPlaylistName}" has been created successfully.`
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-red-600" />
          <span className="text-xl font-bold">VideoLoopShare</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/pricing">
            <Button variant="ghost">Pricing</Button>
          </Link>
          <Link to="/explore">
            <Button variant="ghost">Explore</Button>
          </Link>
          {user ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>New Playlist</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Playlist Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter playlist name" 
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" size="icon" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username || user.email} />
                      <AvatarFallback>
                        {(userProfile?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {subscriptionInfo?.subscribed && (
                      <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{userProfile?.username || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {subscriptionInfo?.subscribed && (
                      <div className="mt-2 rounded-md bg-green-50 text-green-700 px-2 py-1 text-xs font-medium">
                        {subscriptionInfo.subscription_tier || 'Premium'} Plan
                        {subscriptionInfo.subscription_end && (
                          <span className="block text-xs">
                            Renews: {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/pricing" className="cursor-pointer">
                      {subscriptionInfo?.subscribed ? 'Manage Subscription' : 'Upgrade Plan'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" onClick={() => navigate("/auth")}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
