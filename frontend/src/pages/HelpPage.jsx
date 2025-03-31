"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  Youtube,
} from "lucide-react";

const faqs = [
  {
    question: "How do I upload an audio file?",
    answer:
      "You can drag and drop your file into the upload area or clicking the upload button to browse your files. Only audio formats including MP3, WAV, and OGG are supported.",
  },
  {
    question: "What is the maximum file size for uploads?",
    answer:
      "The maximum file size for audio uploads is 5MB. If you need to work with larger files, you may need to compress them or trim them to a shorter length before uploading.",
  },
  {
    question: "How do I process my audio files?",
    answer:
      "After uploading an audio file, you can adjust the variation using the slider, then click the 'Generate Samples' button. This will apply your settings and add the generated audio to your library.",
  },
  {
    question: "Can I download the processed audio files?",
    answer:
      "Yes, you can download any audio file by clicking the download button next to the play button in the waveform display. This works for both your uploaded files and the sample tracks.",
  },
  {
    question: "How do I manage my audio library?",
    answer:
      "You can view all generated samples in your library by navigating to the Library page.",
  },
];

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const handleEmailDraft = () => {
    const recipient = "calvintvu@berkely.edu";
    const subject = encodeURIComponent("Autosampler");
    window.location.href = `mailto:${recipient}?subject=${subject}`;
  };

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500">
          Find answers to common questions or contact support.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Help Categories */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <HelpCircle className="mx-auto mb-2 text-indigo-600" size={24} />
          <h3 className="font-medium">FAQs</h3>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <FileText className="mx-auto mb-2 text-indigo-600" size={24} />
          <h3 className="font-medium">Documentation</h3>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <Youtube className="mx-auto mb-2 text-indigo-600" size={24} />
          <h3 className="font-medium">Tutorials</h3>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <MessageSquare className="mx-auto mb-2 text-indigo-600" size={24} />
          <h3 className="font-medium">Community</h3>
        </Card>
      </div> */}

      {/* FAQs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="font-medium">{faq.question}</h3>
                {expandedFaq === index ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </div>
              {expandedFaq === index && (
                <div className="p-4 pt-0 border-t pt-10">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">
              No results found
            </h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Still need help?</h2>
            <p className="text-gray-500">Feel free to send an email.</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleEmailDraft}
          >
            <Mail size={18} />
            Contact
          </Button>
        </div>
      </Card>
    </main>
  );
}
