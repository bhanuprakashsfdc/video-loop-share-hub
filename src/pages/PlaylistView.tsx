
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlaylist } from "@/context/PlaylistContext";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";

const PlaylistView = () => {
  const { id } = useParams<{ id: string }>();
  const { setCurrentPlaylist, getPlaylistById } = usePlaylist();

  useEffect(() => {
    if (id) {
      setCurrentPlaylist(id);
    }
  }, [id, setCurrentPlaylist]);

  const playlist = id ? getPlaylistById(id) : undefined;

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Playlist Not Found</h2>
            <p className="text-muted-foreground">The requested playlist doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4">
            <VideoPlayer />
          </div>
          <VideoList />
        </div>
      </main>
    </div>
  );
};

export default PlaylistView;
