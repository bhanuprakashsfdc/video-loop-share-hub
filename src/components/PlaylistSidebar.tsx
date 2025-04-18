
import { usePlaylist } from "@/context/PlaylistContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PlaylistCard from "./PlaylistCard";

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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video to Playlist</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="playlist">Select Playlist</Label>
                <select 
                  id="playlist" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={addingToPlaylistId}
                  onChange={(e) => setAddingToPlaylistId(e.target.value)}
                >
                  <option value="">Select a playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoUrl">YouTube Video URL</Label>
                <Input 
                  id="videoUrl" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoTitle">Video Title (Optional)</Label>
                <Input 
                  id="videoTitle" 
                  placeholder="Enter video title" 
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddVideo}
              disabled={!addingToPlaylistId || !newVideoUrl.trim()}
            >
              Add Video
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            id={playlist.id}
            name={playlist.name}
            videoCount={playlist.videos.length}
            isPublic={playlist.is_public}
            userId={playlist.user_id}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaylistSidebar;
