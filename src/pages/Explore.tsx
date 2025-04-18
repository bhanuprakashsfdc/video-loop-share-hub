
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PlaylistCard from "@/components/PlaylistCard";

interface PublicPlaylist {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  playlist_videos: any[];
}

const Explore = () => {
  const [publicPlaylists, setPublicPlaylists] = useState<PublicPlaylist[]>([]);

  useEffect(() => {
    fetchPublicPlaylists();
  }, []);

  const fetchPublicPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_videos (*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPublicPlaylists(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Public Playlists</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              name={playlist.name}
              videoCount={playlist.playlist_videos.length}
              isPublic={playlist.is_public}
              userId={playlist.user_id}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Explore;
