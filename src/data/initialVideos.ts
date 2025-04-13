
export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
}

// Initial video playlists
export const initialPlaylists: Playlist[] = [
  {
    id: "playlist-1",
    name: "Music Videos",
    videos: [
      {
        id: "video-1",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        title: "Rick Astley - Never Gonna Give You Up",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
      },
      {
        id: "video-2",
        url: "https://www.youtube.com/embed/fJ9rUzIMcZQ",
        title: "Queen - Bohemian Rhapsody",
        thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"
      }
    ]
  },
  {
    id: "playlist-2",
    name: "Tech Tutorials",
    videos: [
      {
        id: "video-3",
        url: "https://www.youtube.com/embed/eIrMbAQSU34",
        title: "JavaScript Crash Course",
        thumbnail: "https://img.youtube.com/vi/eIrMbAQSU34/hqdefault.jpg"
      }
    ]
  }
];
