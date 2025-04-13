
import React, { createContext, useContext, useState, useEffect } from "react";
import { Playlist, Video, initialPlaylists } from "@/data/initialVideos";

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentVideoIndex: number;
  addPlaylist: (name: string) => void;
  addVideoToPlaylist: (playlistId: string, videoUrl: string, videoTitle: string) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  setCurrentPlaylist: (playlistId: string) => void;
  setCurrentVideoIndex: (index: number) => void;
  getPlaylistById: (id: string) => Playlist | undefined;
  extractVideoId: (url: string) => string;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [currentPlaylist, setCurrentPlaylistState] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  // Add a new playlist
  const addPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      videos: []
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  // Add a video to a playlist
  const addVideoToPlaylist = (playlistId: string, videoUrl: string, videoTitle: string) => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      url: embedUrl,
      title: videoTitle || "Untitled Video",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    setPlaylists(playlists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, videos: [...playlist.videos, newVideo] }
        : playlist
    ));
  };

  // Remove a video from a playlist
  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(playlists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, videos: playlist.videos.filter(video => video.id !== videoId) }
        : playlist
    ));
  };

  // Set current playlist by ID
  const setCurrentPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId) || null;
    setCurrentPlaylistState(playlist);
    setCurrentVideoIndex(0);
  };

  // Get playlist by ID
  const getPlaylistById = (id: string) => {
    return playlists.find(playlist => playlist.id === id);
  };

  // Initialize with first playlist if available
  useEffect(() => {
    if (playlists.length > 0 && !currentPlaylist) {
      setCurrentPlaylistState(playlists[0]);
    }
  }, [playlists, currentPlaylist]);

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
    extractVideoId
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};
