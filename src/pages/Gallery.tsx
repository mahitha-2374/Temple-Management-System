import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./Gallery.css"; // We'll add a bit of CSS magic for fade-in and layout

// Sample image URLs 
const imageUrls = [
  "/assets/img1.png",
  "/assets/img2.jfif",
  "/assets/img3.jpg",
  "/assets/img4.avif",
  "/assets/img5.jpg",
  "/assets/img6.webp",
  "/assets/img7.jpg",
  "/assets/img8.webp",
  "/assets/img9.jpg",
  "/assets/img10.jfif",
  "/assets/img11.jpg",
];

function shuffleArray(array: string[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function Gallery() {
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);

  useEffect(() => {
    setShuffledImages(shuffleArray(imageUrls));
  }, []);

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-100 to-pink-50 min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-orange-700 mb-4">Photo Gallery</h1>
        <p className="text-lg text-gray-600 mb-10">Sacred glimpses of the temple and divine deities</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shuffledImages.map((url, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg fade-in">
              <img
                src={url}
                alt={`Sacred ${index}`}
                className="w-full h-64 object-cover transform hover:scale-105 transition duration-500 ease-in-out rounded-lg"
              />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
