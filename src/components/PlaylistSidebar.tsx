
import { usePlaylist } from "@/context/PlaylistContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PlaylistSidebar = () => {
  const { playlists, currentPlaylist, setCurrentPlaylist, addVideoToPlaylist } = usePlaylist();
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [addingToPlaylistId, setAddingToPlaylistId] = useState("");
  const { toast } = useToast();

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      addVideoToPlaylist(addingToPlaylistId, newVideoUrl, newVideoTitle);
      setNewVideoUrl("");
      setNewVideoTitle("");
      toast({
        title: "Video Added",
        description: "Your video has been added to the playlist."
      });
    }
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0 border-r p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Playlists</h2>
      </div>
      
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className={`cursor-pointer transition-colors ${currentPlaylist?.id === playlist.id ? 'border-primary' : ''}`}
            onClick={() => setCurrentPlaylist(playlist.id)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{playlist.name}</CardTitle>
              <CardDescription>{playlist.videos.length} videos</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {playlist.videos.length > 0 
                    ? `Latest: ${playlist.videos[playlist.videos.length - 1].title.substring(0, 20)}${playlist.videos[playlist.videos.length - 1].title.length > 20 ? '...' : ''}`
                    : 'No videos yet'}
                </span>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingToPlaylistId(playlist.id);
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Add Video to {playlist.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="video-url">YouTube Video URL</Label>
                        <Input 
                          id="video-url" 
                          placeholder="https://www.youtube.com/watch?v=..." 
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="video-title">Video Title (Optional)</Label>
                        <Input 
                          id="video-title" 
                          placeholder="Enter video title" 
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddVideo}>Add Video</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSidebar;
