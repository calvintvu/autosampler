import { Card } from "@/components/ui/card";
import AudioWaveform from "./audio-waveform";

export default function SampleTracks({ tracks }) {
  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;
  return (
    <div className="space-y-6">
      {tracks.map((track, index) => (
        <Card key={index} className="p-4">
          <h2 className="text-lg font-medium mb-2">
            Generated Sample {index + 1}
          </h2>
          {tracks.length > 0 && (
            <AudioWaveform
              audioUrl={`${apiEndpointURL}/api/get_audio/${track}`}
              height={90}
            />
          )}
        </Card>
      ))}
    </div>
  );
}
