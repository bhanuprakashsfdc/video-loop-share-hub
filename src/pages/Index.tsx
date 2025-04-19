
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import PlaylistSidebar from "@/components/PlaylistSidebar";
import VideoList from "@/components/VideoList";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row">
        <PlaylistSidebar />
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

export default Index;
