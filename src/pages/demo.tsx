import { useRouter } from "next/router";

export default function VideoPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black px-4">
      {/* Video Container */}
      <div className="flex-grow flex justify-center items-center max-w-full max-h-[85vh] w-full">
        <video
          className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
          src="/images/demovideo.mp4" // Replace with your video path
          controls
          autoPlay
          muted
          loop
        />
      </div>

      {/* Back Button */}
      <div className="w-full flex justify-center py-6">
        <button
          onClick={() => router.push("/")} // Go to homepage
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
