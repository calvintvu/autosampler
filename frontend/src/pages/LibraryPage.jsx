"use client";

import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Music, Trash2 } from "lucide-react";
import AudioWaveform from "../components/audio-waveform";
import { useLocation } from "react-router-dom";

export default function LibraryPage() {
  const [tracks, setTracks] = useState([]);
  //   const [searchQuery, setSearchQuery] = useState("");
  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;
  const location = useLocation();

  //   const filteredTracks = tracks.filter(
  //     (track) =>
  //       track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  //   const handleDelete = (id) => {
  //     setTracks(tracks.filter((track) => track.id !== id));
  //   };

  useEffect(() => {
    const onPageLoad = async () => {
      try {
        const response = await fetch(`${apiEndpointURL}/api/get_all_audio`, {
          method: "GET",
        });
        if (!response.ok) {
          console.log("error getting all");
          return;
        }
        const data = await response.json();

        const response2 = await fetch(`${apiEndpointURL}/api/get_all_audio2`, {
          method: "GET",
        });
        if (!response2.ok) {
          console.log("error getting all");
          return;
        }
        const data2 = await response2.json();

        setTracks(data.file_urls.concat(data2.file_urls));
      } catch {
        console.log("error getting all");
        return;
      }
    };

    // Immediately invoke the async function
    onPageLoad();
  }, [location]);

  return (
    <main className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6 py-4">Audio Library</h1>
        <p className="text-gray-500">View your sample collection.</p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          {/* <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          /> */}
        </div>
        {/* <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          Filter
        </Button> */}
      </div>

      {/* Library grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track, index) => (
          <Card key={track.id} className="overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{`Sample ${
                    index + 1
                  }`}</h3>
                  {/* <p className="text-gray-500">{track.artist}</p> */}
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => handleDelete(track.id)}
                >
                  <Trash2 size={18} />
                </Button> */}
              </div>
            </div>
            <div className="p-4">
              <AudioWaveform
                audioUrl={`${apiEndpointURL}/api/get_audio/${track}`}
                height={80}
              />
            </div>
          </Card>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            No samples found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or generate new samples
          </p>
        </div>
      )}
    </main>
  );
}
