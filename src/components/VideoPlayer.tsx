
import React, { useEffect, useRef } from "react";
import { usePlaylist } from "@/context/PlaylistContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";

const VideoPlayer: React.FC = () => {
  const { currentPlaylist, currentVideoIndex, setCurrentVideoIndex } = usePlaylist();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNextVideo = () => {
    if (currentPlaylist && currentVideoIndex < currentPlaylist.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  useEffect(() => {
    // When video changes, focus on the iframe for better keyboard control
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, [currentVideoIndex]);

  if (!currentPlaylist || currentPlaylist.videos.length === 0) {
    return (
      <Card className="w-full mb-4 aspect-video flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No videos in current playlist</p>
      </Card>
    );
  }

  const currentVideo = currentPlaylist.videos[currentVideoIndex];

  return (
    <div className="w-full mb-4 space-y-2">
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              ref={iframeRef}
              src={`${currentVideo.url}?autoplay=1&rel=0`}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{currentVideo.title}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousVideo} 
            disabled={currentVideoIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextVideo} 
            disabled={!currentPlaylist || currentVideoIndex === currentPlaylist.videos.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
