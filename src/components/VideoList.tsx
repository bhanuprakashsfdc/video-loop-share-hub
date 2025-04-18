
import { usePlaylist } from "@/context/PlaylistContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareDialog from "./ShareDialog";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const VideoList = () => {
  const { currentPlaylist, currentVideoIndex, setCurrentVideoIndex, removeVideoFromPlaylist, addVideoToPlaylist } = usePlaylist();
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const { toast } = useToast();

  const handleAddVideo = () => {
    if (newVideoUrl.trim() && currentPlaylist) {
      addVideoToPlaylist(currentPlaylist.id, newVideoUrl, newVideoTitle);
      setNewVideoUrl("");
      setNewVideoTitle("");
      toast({
        title: "Video Added",
        description: "Your video has been added to the playlist."
      });
    }
  };

  if (!currentPlaylist) {
    return (
      <div className="w-full p-4">
        <p className="text-center text-muted-foreground">Select a playlist to view videos</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{currentPlaylist.name}</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video to {currentPlaylist.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                disabled={!newVideoUrl.trim()}
              >
                Add Video
              </Button>
            </DialogContent>
          </Dialog>
          {currentPlaylist && (
            <ShareDialog playlistId={currentPlaylist.id} />
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-2">
          {currentPlaylist.videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed rounded-lg">
              <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-2">
                No videos in this playlist yet
              </p>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Add videos by clicking the "Add Video" button above
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Your First Video</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Video to {currentPlaylist.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
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
                    disabled={!newVideoUrl.trim()}
                  >
                    Add Video
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            currentPlaylist.videos.map((video, index) => (
              <Card 
                key={video.id} 
                className={`cursor-pointer transition-colors ${index === currentVideoIndex ? 'border-primary bg-accent/50' : ''}`}
                onClick={() => setCurrentVideoIndex(index)}
              >
                <CardContent className="p-2 flex items-center space-x-2">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-24 h-16 object-cover rounded"
                    />
                    {index === currentVideoIndex && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideoFromPlaylist(currentPlaylist.id, video.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VideoList;
