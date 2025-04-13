
import { Button } from "@/components/ui/button";
import { PlusCircle, Share2, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlaylist } from "@/context/PlaylistContext";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { addPlaylist } = usePlaylist();
  const { toast } = useToast();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-red-600" />
          <span className="text-xl font-bold">VideoLoopShare</span>
        </Link>
        
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
