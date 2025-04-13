
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy } from "lucide-react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  playlistId: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ playlistId }) => {
  const { getPlaylistById } = usePlaylist();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const playlist = getPlaylistById(playlistId);
  const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The share link has been copied to your clipboard."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!playlist) return null;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{playlist.name}"</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input
            readOnly
            value={shareUrl}
            className="flex-1"
          />
          <Button size="icon" onClick={handleCopy}>
            {copied ? (
              <span className="text-green-500 text-xs">Copied!</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Anyone with this link can view this playlist.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
