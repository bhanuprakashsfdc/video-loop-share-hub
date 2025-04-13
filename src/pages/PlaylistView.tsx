
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { PlaylistProvider, usePlaylist } from "@/context/PlaylistContext";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";

const PlaylistViewContent = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { setCurrentPlaylist, getPlaylistById } = usePlaylist();

  useEffect(() => {
    if (playlistId) {
      setCurrentPlaylist(playlistId);
    }
  }, [playlistId, setCurrentPlaylist]);

  const playlist = playlistId ? getPlaylistById(playlistId) : undefined;

  if (!playlist) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Playlist Not Found</h2>
          <p className="text-muted-foreground">The requested playlist doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4">
        <VideoPlayer />
      </div>
      <VideoList />
    </div>
  );
};

const PlaylistView = () => {
  return (
    <PlaylistProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex">
          <PlaylistViewContent />
        </main>
      </div>
    </PlaylistProvider>
  );
};

export default PlaylistView;
