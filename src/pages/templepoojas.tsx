import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

interface Pooja {
  _id: string;
  name: string;
  date: string;
  time: string;
  thingsNeeded?: string;
  image?: string; // Image URL from backend or fallback
}

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`shadow-lg rounded-2xl p-6 bg-gradient-to-r from-orange-100 to-orange-200 ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-3 font-semibold text-lg text-orange-800">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-orange-900">{children}</h2>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="text-gray-700">{children}</div>
);

const Button = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`mt-4 px-5 py-2 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition ${className}`}
  >
    {children}
  </button>
);

const Modal = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const TemplePoojas = () => {
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPooja, setSelectedPooja] = useState<Pooja | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fallback image URLs
  const fallbackImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWSWCwUv8rgjvh9Q05B34VRCe3yPPloUmtlA&s",
    "https://www.tirthpurohit.org/wp-content/uploads/2017/10/ganapathy-homam-set-2837-items-29-500x500.png",
    "https://i.pinimg.com/236x/73/a4/eb/73a4eb10bb9fbbe9efd7532fc0175469.jpg",
    "https://events.bhaktimarga.org/cdn/shop/files/abhishekam_header.jpg?v=1709114364",
    "https://images.timesnownews.com/thumb/msid-111751639,thumbsize-186216,width-400,height-225,resizemode-75/111751639.jpg?quality=20",
  ];

  const defaultImage = "https://via.placeholder.com/400x200?text=No+Image+Available";

  useEffect(() => {
    fetch("http://localhost:3000/api/poojas")
      .then((res) => res.json())
      .then((data: Pooja[]) => {
        // Assign fallback images if backend doesn't provide them
        const poojasWithImages = data.map((pooja, index) => ({
          ...pooja,
          image: pooja.image || fallbackImages[index % fallbackImages.length],
        }));
        setPoojas(poojasWithImages);
      })
      .catch((err) => console.error("Failed to fetch poojas:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleViewDetails = (id: string) => {
    fetch(`http://localhost:3000/api/poojas/${id}`)
      .then((res) => res.json())
      .then((data: Pooja) => {
        // Ensure image is included, use fallback if needed
        const poojaWithImage = {
          ...data,
          image: data.image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
        };
        setSelectedPooja(poojaWithImage);
        setShowModal(true);
      })
      .catch((err) => console.error("Error fetching pooja details:", err));
  };

  return (
    <div className="p-8 bg-orange-50 min-h-screen">
      <div className="flex items-center mb-6">
        <BookOpen className="h-8 w-8 text-orange-700 mr-2" />
        <h1 className="text-3xl font-extrabold text-orange-900">
          Upcoming Poojas & Abhishekam Timings
        </h1>
      </div>

      {loading ? (
        <p>Loading poojas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poojas.map((pooja) => (
            <Card key={pooja._id} className="bg-white shadow-xl">
              <img
                src={pooja.image || defaultImage}
                alt={pooja.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = defaultImage; // Fallback on error
                }}
              />
              <CardHeader>
                <CardTitle>{pooja.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  📅 Date: <span className="font-semibold">{pooja.date}</span>
                </p>
                <p className="text-lg">
                  ⏰ Time: <span className="font-semibold">{pooja.time}</span>
                </p>
                <Button onClick={() => handleViewDetails(pooja._id)}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal to show selected pooja details */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {selectedPooja && (
          <>
            <img
              src={selectedPooja.image || defaultImage}
              alt={selectedPooja.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.currentTarget.src = defaultImage; // Fallback on error
              }}
            />
            <h2 className="text-xl font-bold text-orange-800 mb-2">{selectedPooja.name}</h2>
            <p className="mb-1"><strong>📅 Date:</strong> {selectedPooja.date}</p>
            <p className="mb-1"><strong>⏰ Time:</strong> {selectedPooja.time}</p>
            <p className="mt-2"><strong>🪔 Things Needed:</strong><br />{selectedPooja.thingsNeeded || "Not specified"}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TemplePoojas;