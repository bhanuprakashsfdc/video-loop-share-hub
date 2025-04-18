
import { Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlaylist } from "@/context/PlaylistContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PlaylistCardProps {
  id: string;
  name: string;
  videoCount: number;
  isPublic: boolean;
  userId: string;
}

const PlaylistCard = ({ id, name, videoCount, isPublic, userId }: PlaylistCardProps) => {
  const navigate = useNavigate();
  const { togglePlaylistVisibility } = usePlaylist();
  const { user } = useAuth();

  const isOwner = user?.id === userId;

  return (
    <Card 
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/playlist/${id}`)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                togglePlaylistVisibility(id);
              }}
            >
              {isPublic ? (
                <Unlock className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </span>
          <span className="text-sm text-muted-foreground">
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaylistCard;
