
import { usePlaylist } from "@/context/PlaylistContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareDialog from "./ShareDialog";

const VideoList = () => {
  const { currentPlaylist, currentVideoIndex, setCurrentVideoIndex, removeVideoFromPlaylist } = usePlaylist();

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
        {currentPlaylist && (
          <ShareDialog playlistId={currentPlaylist.id} />
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-2">
          {currentPlaylist.videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No videos in this playlist. Add some by clicking the + icon.
            </p>
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
