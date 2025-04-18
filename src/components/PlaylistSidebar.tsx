
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
