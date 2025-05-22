import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Import xlsx library for Excel generation

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: any) => {
      console.error("ErrorBoundary caught:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="text-red-600 text-center p-8">
        Something went wrong. Please refresh the page or contact support.
      </div>
    );
  }

  return <>{children}</>;
};

interface Pooja {
  _id: string;
  name: string;
  date: string;
  time: string;
  thingsNeeded?: string;
  image?: string;
}

interface Accommodation {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  roomType: string;
  bookedAt: string;
}

interface Donation {
  _id: string;
  donationType: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  cardNumber?: string;
  expiryDate?: string;
  upiId?: string;
}

interface DonationUsage {
  _id: string;
  purpose: string;
  amountSpent: number;
  date: string;
  description: string;
  createdAt: string;
}

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  lastLogin?: string;
}

interface Darshan {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  type: string;
  numberOfPeople: number;
  status: string;
  bookedAt: string;
  confirmedAt?: string;
}

// Main Admin Component
const Admin = () => {
  const [activeSection, setActiveSection] = useState("poojas");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    thingsNeeded: "",
    image: "",
  });
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationUsage, setDonationUsage] = useState<DonationUsage[]>([]);
  const [darshanBookings, setDarshanBookings] = useState<Darshan[]>([]);
  const [usageFormData, setUsageFormData] = useState({
    purpose: "",
    amountSpent: "",
    date: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fallbackImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcTWSWCwUv8rgjvh9Q05B34VRCe3yPPloUmtlA&s",
    "https://www.tirthpurohit.org/wp-content/uploads/2017/10/ganapathy-homam-set-2837-items-29-500x500.png",
    "https://i.pinimg.com/236x/73/a4/eb/73a4eb10bb9fbbe9efd7532fc0175469.jpg",
    "https://events.bhaktimarga.org/cdn/shop/files/abhishekam_header.jpg?v=1709114364",
    "https://images.timesnownews.com/thumb/msid-111751639,thumbsize-186216,width-400,height-225,resizemode-75/111751639.jpg?quality=20",
  ];

  const defaultImage = "https://via.placeholder.com/400x200?text=No+Image+Available";

  const DARSHAN_COSTS = {
    special: 5000,
    vip: 2000,
    regular: 500,
  };

  const DAILY_SLOT_CAPACITY = 100;

  const verifyAdmin = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/verify-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Admin verification failed");
    } catch (err) {
      console.error("❌ Admin verification error:", err);
      localStorage.removeItem("adminToken");
      setError("Session expired. Please log in again.");
      setTimeout(() => navigate("/admin-login"), 2000);
    }
  };

  const fetchPoojas = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/poojas");
      if (!response.ok) throw new Error("Failed to fetch poojas");
      const data: Pooja[] = await response.json();
      const poojasWithImages = data.map((pooja, index) => ({
        ...pooja,
        image: pooja.image || fallbackImages[index % fallbackImages.length],
      }));
      setPoojas(poojasWithImages);
    } catch (err) {
      console.error("❌ Poojas fetch error:", err);
      setError("Failed to load poojas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/accommodations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      const data: Accommodation[] = await response.json();
      setAccommodations(data);
    } catch (err) {
      console.error("❌ Accommodations fetch error:", err);
      setError("Failed to load accommodations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/donations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch donations");
      const data: Donation[] = await response.json();
      setDonations(data);
    } catch (err) {
      console.error("❌ Donations fetch error:", err);
      setError("Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationUsage = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/donation-usage", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch donation usage");
      const data: DonationUsage[] = await response.json();
      setDonationUsage(data);
    } catch (err) {
      console.error("❌ Donation usage fetch error:", err);
      setError("Failed to load donation usage records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/admins", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch admins");
      const data: AdminUser[] = await response.json();
      setAdmins(data);
    } catch (err) {
      console.error("❌ Admins fetch error:", err);
      setError("Failed to load admins.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDarshanBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No admin token found");
      const response = await fetch("http://localhost:3000/api/darshan", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const data: Darshan[] = await response.json();
      console.log("✅ Fetched darshan bookings:", data);
      setDarshanBookings(data || []);
    } catch (err) {
      console.error("❌ Darshan bookings fetch error:", err);
      setError(`Failed to load darshan bookings: ${err.message}`);
      setDarshanBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDarshanBooking = async (
    id: string,
    email: string,
    name: string,
    date: string,
    time: string,
    type: string
  ) => {
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No admin token found");

      const confirmResponse = await fetch(`http://localhost:3000/api/confirm-darshan/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const confirmResult = await confirmResponse.json();
      if (!confirmResponse.ok) {
        throw new Error(confirmResult.message || "Failed to confirm booking");
      }

      setMessage(`Booking confirmed for ${name}. Confirmation email sent.`);
      await fetchDarshanBookings();
    } catch (err) {
      console.error("❌ Confirm darshan error:", err);
      setError(err.message || "Failed to confirm booking");
    }
  };

  useEffect(() => {
    verifyAdmin();
    setMessage("");
    setError("");
    if (activeSection === "poojas") fetchPoojas();
    else if (activeSection === "accommodation") fetchAccommodations();
    else if (activeSection === "donations") {
      fetchDonations();
      fetchDonationUsage();
    } else if (activeSection === "admins") fetchAdmins();
    else if (activeSection === "darshan") fetchDarshanBookings();
  }, [activeSection]);

  const handlePoojaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsageChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUsageFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePoojaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!formData.name || !formData.date || !formData.time) {
      setError("Name, date, and time are required.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      setError("Date must be in YYYY-MM-DD format.");
      return;
    }
    if (formData.image && !isValidUrl(formData.image)) {
      setError("Invalid image URL.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/poojas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setFormData({ name: "", date: "", time: "", thingsNeeded: "", image: "" });
        fetchPoojas();
      } else {
        setError(result.message || "Failed to add pooja.");
      }
    } catch (err) {
      console.error("❌ Pooja submit error:", err);
      setError("Network error. Please try again.");
    }
  };

  const handleUsageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!usageFormData.purpose || !usageFormData.amountSpent || !usageFormData.date) {
      setError("Purpose, amount spent, and date are required.");
      return;
    }
    const amountSpent = parseFloat(usageFormData.amountSpent);
    if (isNaN(amountSpent) || amountSpent <= 0) {
      setError("Amount spent must be a positive number.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(usageFormData.date)) {
      setError("Date must be in YYYY-MM-DD format.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/donation-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ ...usageFormData, amountSpent }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setUsageFormData({ purpose: "", amountSpent: "", date: "", description: "" });
        fetchDonationUsage();
      } else {
        setError(result.message || "Failed to record donation usage.");
      }
    } catch (err) {
      console.error("❌ Donation usage submit error:", err);
      setError("Network error. Please try again.");
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalUsed = donationUsage.reduce((sum, usage) => sum + usage.amountSpent, 0);
  const remainingBalance = totalDonated - totalUsed;

  const getDonationTypeName = (type: string) => {
    switch (type) {
      case "annadanam":
        return "Annadanam";
      case "renovation":
        return "Temple Renovation";
      case "pooja":
        return "Special Pooja";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const calculateDarshanCost = (type: string, numberOfPeople: number) => {
    const normalizedType = type?.toLowerCase() || "";
    switch (normalizedType) {
      case "special":
        return DARSHAN_COSTS.special;
      case "vip":
        return DARSHAN_COSTS.vip;
      case "regular":
        return DARSHAN_COSTS.regular * (numberOfPeople || 1);
      default:
        return 0;
    }
  };

  const getAvailableSlots = (date: string) => {
    if (!date) return DAILY_SLOT_CAPACITY;
    const bookingsOnDate = darshanBookings.filter(
      (booking) => booking.date === date && booking.status === "confirmed"
    );
    const totalPeople = bookingsOnDate.reduce(
      (sum, booking) => sum + (booking.numberOfPeople || 0),
      0
    );
    return Math.max(0, DAILY_SLOT_CAPACITY - totalPeople);
  };

  const getBookedDates = () => {
    const bookedRanges: { start: string; end: string }[] = [];
    accommodations.forEach((booking) => {
      bookedRanges.push({
        start: booking.checkInDate,
        end: booking.checkOutDate,
      });
    });
    return bookedRanges;
  };

  // Function to download donation usage as Excel
  const downloadUsageAsExcel = () => {
    const data = donationUsage.map((usage) => ({
      Purpose: usage.purpose,
      "Amount Spent (₹)": usage.amountSpent.toFixed(2),
      Date: usage.date,
      Description: usage.description || "N/A",
      "Recorded At": formatDate(usage.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Donation Usage");
    
    // Auto-size columns for better readability
    const colWidths = [
      { wch: 30 }, // Purpose
      { wch: 15 }, // Amount Spent
      { wch: 15 }, // Date
      { wch: 50 }, // Description
      { wch: 25 }, // Recorded At
    ];
    worksheet["!cols"] = colWidths;

    // Generate and download the Excel file
    XLSX.writeFile(workbook, `Donation_Usage_Records_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "poojas":
        return (
          <div className="p-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-8">
              Manage Poojas
            </h1>
            <form
              onSubmit={handlePoojaSubmit}
              className="bg-white p-8 rounded-2xl shadow-xl mb-8 transform hover:scale-105 transition-transform duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Pooja</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Pooja Name"
                  value={formData.name}
                  onChange={handlePoojaChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handlePoojaChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  name="time"
                  placeholder="Time (e.g., 6:00 AM)"
                  value={formData.time}
                  onChange={handlePoojaChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
              <textarea
                name="thingsNeeded"
                placeholder="Things Needed (e.g., Coconut, Durva, Modak)"
                value={formData.thingsNeeded}
                onChange={handlePoojaChange}
                className="border-2 border-orange-200 p-3 rounded-lg mt-6 w-full focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
              />
              <input
                type="url"
                name="image"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={handlePoojaChange}
                className="border-2 border-orange-200 p-3 rounded-lg mt-4 w-full focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
              />
              <button
                type="submit"
                class Legislative Assistant="mt-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:ring-4 focus:ring-orange-300 transition-all duration-200"
              >
                Add Pooja
              </button>
              {message && (
                <p className="text-green-600 mt-4 animate-pulse">{message}</p>
              )}
              {error && <p className="text-red-600 mt-4 animate-pulse">{error}</p>}
            </form>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Poojas</h2>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && poojas.length === 0 && (
                <p className="text-gray-500">No poojas available</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poojas.map((pooja) => (
                  <div
                    key={pooja._id}
                    className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <img
                      src={pooja.image || defaultImage}
                      alt={pooja.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.src = defaultImage;
                      }}
                    />
                    <h3 className="text-lg font-bold text-orange-700">{pooja.name}</h3>
                    <p className="text-gray-600">
                      {pooja.date}, {pooja.time}
                    </p>
                    {pooja.thingsNeeded && (
                      <p className="text-sm text-gray-500 mt-2">
                        Things Needed: {pooja.thingsNeeded}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "donations":
        return (
          <div className="p-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-8">
              Manage Donations
            </h1>
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Donation Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md">
                  <p className="text-sm text-gray-600">Total Donated</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₹{totalDonated.toFixed(2)}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-md">
                  <p className="text-sm text-gray-600">Total Used</p>
                  <p className="text-2xl font-bold text-red-800">
                    ₹{totalUsed.toFixed(2)}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
                  <p className="text-sm text-gray-600">Remaining Balance</p>
                  <p className="text-2xl font-bold text-blue-800">
                    ₹{remainingBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <form
              onSubmit={handleUsageSubmit}
              className="bg-white p-8 rounded-2xl shadow-xl mb-8 transform hover:scale-105 transition-transform duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Record Donation Usage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="text"
                  name="purpose"
                  placeholder="Purpose (e.g., Temple Renovation)"
                  value={usageFormData.purpose}
                  onChange={handleUsageChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  required
                />
                <input
                  type="number"
                  name="amountSpent"
                  placeholder="Amount Spent (₹)"
                  value={usageFormData.amountSpent}
                  onChange={handleUsageChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  min="0.01"
                  step="0.01"
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={usageFormData.date}
                  onChange={handleUsageChange}
                  className="border-2 border-orange-200 p-3 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
              <textarea
                name="description"
                placeholder="Description (e.g., Materials purchased for roof repair)"
                value={usageFormData.description}
                onChange={handleUsageChange}
                className="border-2 border-orange-200 p-3 rounded-lg mt-6 w-full focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="mt-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:ring-4 focus:ring-orange-300 transition-all duration-200"
              >
                Record Usage
              </button>
              {message && (
                <p className="text-green-600 mt-4 animate-pulse">{message}</p>
              )}
              {error && <p className="text-red-600 mt-4 animate-pulse">{error}</p>}
            </form>
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Donation Usage Records
                </h2>
                {donationUsage.length > 0 && (
                  <button
                    onClick={downloadUsageAsExcel}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200"
                  >
                    Download Usage Records
                  </button>
                )}
              </div>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && donationUsage.length === 0 && (
                <p className="text-gray-500">No donation usage records available.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donationUsage.map((usage) => (
                  <div
                    key={usage._id}
                    className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-orange-700">
                          Purpose: {usage.purpose}
                        </p>
                        <p>Amount Spent: ₹{usage.amountSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p>Date: {usage.date}</p>
                        <p>Recorded At: {formatDate(usage.createdAt)}</p>
                        {usage.description && (
                          <p className="text-sm text-gray-500">
                            Description: {usage.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                All Donations
              </h2>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && donations.length === 0 && (
                <p className="text-gray-500">No donations available.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations.map((donation) => (
                  <div
                    key={donation._id}
                    className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-orange-700">
                          Type: {getDonationTypeName(donation.donationType)}
                        </p>
                        <p>Amount: ₹{donation.amount.toFixed(2)}</p>
                        <p>
                          Method:{" "}
                          {donation.paymentMethod === "card"
                            ? "Credit/Debit Card"
                            : donation.paymentMethod === "upi"
                            ? "UPI"
                            : "Net Banking"}
                        </p>
                      </div>
                      <div>
                        {donation.cardNumber && (
                          <p>Card Ending: {donation.cardNumber}</p>
                        )}
                        {donation.upiId && <p>UPI ID: {donation.upiId}</p>}
                        <p>Donated At: {formatDate(donation.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "accommodation":
        return (
          <div className="p-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-8">
              Manage Accommodation
            </h1>
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Room Bookings
              </h2>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && accommodations.length === 0 && (
                <p className="text-gray-500">No bookings yet.</p>
              )}
              {!loading && accommodations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getBookedDates().map((range, index) => (
                    <div
                      key={index}
                      className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <p className="font-semibold text-orange-700">
                        Booked From: {range.start}
                      </p>
                      <p className="text-gray-600">To: {range.end}</p>
                      <p className="text-red-600">Status: Booked</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                All Bookings
              </h2>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && accommodations.length === 0 && (
                <p className="text-gray-500">No accommodation bookings available.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accommodations.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-orange-700">
                          Name: {booking.fullName}
                        </p>
                        <p>Email: {booking.email}</p>
                        <p>Phone: {booking.phone}</p>
                      </div>
                      <div>
                        <p>Room Type: {booking.roomType}</p>
                        <p>Check-in Date: {booking.checkInDate}</p>
                        <p>Check-out Date: {booking.checkOutDate}</p>
                        <p>Guests: {booking.numberOfPeople}</p>
                        <p>Booked At: {formatDate(booking.bookedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "admins":
        return (
          <div className="p-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-8">
              Admin Users
            </h1>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                All Admins
              </h2>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!loading && admins.length === 0 && (
                <p className="text-gray-500">No admins available.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <p className="font-semibold text-orange-700">
                      Name: {admin.fullName}
                    </p>
                    <p>Email: {admin.email}</p>
                    {admin.lastLogin && (
                      <p>Last Login: {formatDate(admin.lastLogin)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

        case "darshan":
          return (
            <ErrorBoundary>
              <div className="p-8 animate-fade-in">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-8">
                  Manage Darshan Bookings
                </h1>
                <div className="bg-white p-8 rounded-2xl shadow-xl mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Available Darshan Slots
                  </h2>
                  {loading && (
                    <div className="flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {!loading && darshanBookings.length === 0 && (
                    <p className="text-gray-500">No bookings yet to show availability.</p>
                  )}
                  {!loading && darshanBookings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...new Set(darshanBookings.map((booking) => booking.date))].map(
                        (date) => {
                          const availableSlots = getAvailableSlots(date);
                          return (
                            <div
                              key={date}
                              className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transition-all duration-300"
                            >
                              <p className="font-semibold text-orange-700">Date: {date || "N/A"}</p>
                              <p>
                                Available Slots:{" "}
                                <span
                                  className={
                                    availableSlots > 0 ? "text-green-600" : "text-red-600"
                                  }
                                >
                                  {availableSlots > 0 ? availableSlots : "Fully Booked"}
                                </span>
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    All Darshan Bookings
                  </h2>
                  {loading && (
                    <div className="flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-600 text-center mb-4 animate-pulse">{error}</p>
                  )}
                  {!loading && !error && darshanBookings.length === 0 && (
                    <p className="text-gray-500 text-center">
                      No darshan bookings available. Try booking one first.
                    </p>
                  )}
                  {!loading && !error && darshanBookings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {darshanBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 border border-orange-100 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-orange-700">
                                Name: {booking.name || "N/A"}
                              </p>
                              <p>Email: {booking.email || "N/A"}</p>
                              <p>Phone: {booking.phone || "N/A"}</p>
                              <p>Address: {booking.address || "N/A"}</p>
                            </div>
                            <div>
                              <p>Date: {booking.date || "N/A"}</p>
                              <p>Time: {booking.time || "N/A"}</p>
                              <p>
                                Type:{" "}
                                {(booking.type &&
                                  booking.type.charAt(0).toUpperCase() +
                                    booking.type.slice(1)) ||
                                  "N/A"}
                              </p>
                              <p>Guests: {booking.numberOfPeople || 0}</p>
                              <p>
                                Cost: ₹
                                {calculateDarshanCost(
                                  booking.type,
                                  booking.numberOfPeople
                                ).toFixed(2)}
                                {booking.type?.toLowerCase() === "regular"
                                  ? " (₹500 per person)"
                                  : ""}
                              </p>
                              <p>
                                Status:{" "}
                                <span
                                  className={
                                    booking.status === "confirmed"
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }
                                >
                                  {(booking.status &&
                                    booking.status.charAt(0).toUpperCase() +
                                      booking.status.slice(1)) ||
                                    "Unknown"}
                                </span>
                              </p>
                              <p>Booked At: {formatDate(booking.bookedAt)}</p>
                              {booking.confirmedAt && (
                                <p>Confirmed At: {formatDate(booking.confirmedAt)}</p>
                              )}
                            </div>
                          </div>
                          {booking.status === "pending" && (
                            <button
                              onClick={() =>
                                confirmDarshanBooking(
                                  booking._id,
                                  booking.email || "",
                                  booking.name || "",
                                  booking.date || "",
                                  booking.time || "",
                                  booking.type || ""
                                )
                              }
                              className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200"
                              disabled={
                                getAvailableSlots(booking.date) <
                                (booking.numberOfPeople || 0)
                              }
                            >
                              {getAvailableSlots(booking.date) <
                              (booking.numberOfPeople || 0)
                                ? "No Slots Available"
                                : "Confirm Booking"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ErrorBoundary>
          );

      default:
        return (
          <div className="p-8 text-gray-600 text-center">
            Invalid section selected.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100">
      <nav className="bg-gradient-to-r from-orange-700 to-yellow-600 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <div className="flex space-x-4">
          {["poojas", "donations", "accommodation", "darshan", "admins"].map(
            (section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeSection === section
                    ? "bg-orange-900 shadow-inner"
                    : "bg-orange-600 hover:bg-orange-500"
                }`}
              >
                {section.charAt(0).toUpperCase() +
                  section.slice(1).replace("poojas", "Poojas")}
              </button>
            )
          )}
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              setMessage("Logged out successfully.");
              setTimeout(() => navigate("/admin-login"), 1000);
            }}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8">
        {message && (
          <p className="text-green-600 text-center mb-4 animate-pulse">{message}</p>
        )}
        {error && !activeSection && (
          <p className="text-red-600 text-center mb-4 animate-pulse">{error}</p>
        )}
        <ErrorBoundary>{renderSection()}</ErrorBoundary>
      </main>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Admin;