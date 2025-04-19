import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Video } from "@/data/initialVideos";

interface Playlist {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  videos: Video[];
}

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentVideoIndex: number;
  addPlaylist: (name: string) => Promise<void>;
  addVideoToPlaylist: (playlistId: string, videoUrl: string, videoTitle: string) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  setCurrentPlaylist: (playlistId: string) => void;
  setCurrentVideoIndex: (index: number) => void;
  getPlaylistById: (id: string) => Playlist | undefined;
  togglePlaylistVisibility: (playlistId: string) => Promise<void>;
  extractVideoId: (url: string) => string;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylistState] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_videos (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching playlists",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const formattedPlaylists = data.map(playlist => ({
      ...playlist,
      videos: playlist.playlist_videos || []
    }));

    setPlaylists(formattedPlaylists);
  };

  const addPlaylist = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('playlists')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating playlist",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const newPlaylist = { ...data, videos: [] };
    setPlaylists([newPlaylist, ...playlists]);
    toast({
      title: "Playlist created",
      description: `${name} has been created successfully.`
    });
  };

  const togglePlaylistVisibility = async (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const { error } = await supabase
      .from('playlists')
      .update({ is_public: !playlist.is_public })
      .eq('id', playlistId);

    if (error) {
      toast({
        title: "Error updating playlist visibility",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPlaylists(playlists.map(p => 
      p.id === playlistId ? { ...p, is_public: !p.is_public } : p
    ));

    toast({
      title: "Visibility updated",
      description: `Playlist is now ${!playlist.is_public ? 'public' : 'private'}.`
    });
  };

  const addVideoToPlaylist = async (playlistId: string, videoUrl: string, videoTitle: string) => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    const { data: positionData } = await supabase
      .from('playlist_videos')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);
    
    const newPosition = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;
    
    const { data, error } = await supabase
      .from('playlist_videos')
      .insert([{ 
        playlist_id: playlistId,
        title: videoTitle || "Untitled Video",
        url: embedUrl,
        thumbnail: thumbnailUrl,
        position: newPosition
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding video",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const newVideo: Video = {
      id: data.id,
      url: embedUrl,
      title: videoTitle || "Untitled Video",
      thumbnail: thumbnailUrl
    };

    setPlaylists(playlists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, videos: [...playlist.videos, newVideo] }
        : playlist
    ));

    if (currentPlaylist && currentPlaylist.id === playlistId) {
      setCurrentPlaylistState({
        ...currentPlaylist,
        videos: [...currentPlaylist.videos, newVideo]
      });
    }

    toast({
      title: "Video added",
      description: "Video has been added to the playlist"
    });
  };

  const removeVideoFromPlaylist = async (playlistId: string, videoId: string) => {
    const { error } = await supabase
      .from('playlist_videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      toast({
        title: "Error removing video",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPlaylists(playlists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, videos: playlist.videos.filter(video => video.id !== videoId) }
        : playlist
    ));

    if (currentPlaylist && currentPlaylist.id === playlistId) {
      setCurrentPlaylistState({
        ...currentPlaylist,
        videos: currentPlaylist.videos.filter(video => video.id !== videoId)
      });
    }

    toast({
      title: "Video removed",
      description: "Video has been removed from the playlist"
    });
  };

  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const setCurrentPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId) || null;
    setCurrentPlaylistState(playlist);
    setCurrentVideoIndex(0);
  };

  const getPlaylistById = (id: string) => {
    return playlists.find(playlist => playlist.id === id);
  };

  const value = {
    playlists,
    currentPlaylist,
    currentVideoIndex,
    addPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    setCurrentPlaylist,
    setCurrentVideoIndex,
    getPlaylistById,
    togglePlaylistVisibility,
    extractVideoId
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
