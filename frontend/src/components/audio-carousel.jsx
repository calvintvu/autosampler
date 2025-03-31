import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AudioWaveform from "./audio-waveform";

export default function AudioCarousel({ tracks }) {
  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (tracks.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>No audio tracks available</p>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {tracks.map((track, index) => (
            <div
              key={index}
              className="flex-[0_0_90%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 pl-4"
            >
              <Card className="p-4 h-full">
                <h3 className="font-medium mb-2 truncate">{`Sample ${
                  index + 1
                }`}</h3>
                <AudioWaveform
                  audioUrl={`${apiEndpointURL}/api/get_audio/${track}`}
                  height={60}
                />
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background shadow-md z-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-background shadow-md z-10"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
