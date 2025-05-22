import { Calendar, Gift, Users, Clock, Music, Mail, Phone, MapPin, IndianRupee, MessageSquare, Instagram, Facebook, Twitter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [donationData, setDonationData] = useState({
    totalDonated: 0,
    totalUsed: 0,
    remainingBalance: 0,
    donationUsage: [],
  });
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // New state for auth check
  const [showEventCalendar, setShowEventCalendar] = useState(false);
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState({ name: "", email: "", message: "" });
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // Verify user login
  const verifyUser = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Please log in to access this page.");
      setAuthLoading(false);
      setTimeout(() => navigate("/login"), 2000);
      return false;
    }
    try {
      const response = await fetch("http://localhost:3000/api/verify-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("User verification failed");
      }
      setAuthLoading(false);
      return true;
    } catch (err) {
      console.error("❌ User verification error:", err);
      localStorage.removeItem("userToken");
      setError("Session expired. Please log in again.");
      setAuthLoading(false);
      setTimeout(() => navigate("/login"), 2000);
      return false;
    }
  };

  // Fetch donation data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const isAuthenticated = await verifyUser();
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        const [donationsRes, usageRes] = await Promise.all([
          fetch("http://localhost:3000/api/donations", {
            headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
          }),
          fetch("http://localhost:3000/api/donation-usage", {
            headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
          }),
        ]);

        if (!donationsRes.ok || !usageRes.ok) throw new Error("Failed to fetch donation data");

        const donations = await donationsRes.json();
        const donationUsage = await usageRes.json();

        const totalDonated = donations.reduce((sum: number, donation: any) => sum + donation.amount, 0);
        const totalUsed = donationUsage.reduce((sum: number, usage: any) => sum + usage.amountSpent, 0);
        const remainingBalance = totalDonated - totalUsed;

        setDonationData({ totalDonated, totalUsed, remainingBalance, donationUsage });
      } catch (err) {
        console.error("Failed to fetch donation data:", err);
        setError("Failed to load donation data.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, []);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events.");
      }
    };

    fetchEvents();
  }, []);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio("/assets/gayatri-mantra-raga-1.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleEventCalendar = () => {
    setShowEventCalendar(!showEventCalendar);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        setFeedbackStatus("Feedback submitted successfully!");
        setFeedback({ name: "", email: "", message: "" });
        setTimeout(() => setFeedbackStatus(""), 3000);
      } else {
        setFeedbackStatus("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setFeedbackStatus("Failed to submit feedback. Please try again.");
    }
  };

  // Show loading spinner while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-orange-50 to-white">
      {error && (
        <p className="text-red-600 text-center py-4 animate-pulse">{error}</p>
      )}
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://wallpapercave.com/wp/wp9198776.jpg"
            alt="Ramalayam Temple"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl py-32 px-6 sm:py-48 lg:px-8 text-center animate-fade-in">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ramalayam Temple
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-200 leading-relaxed">
            Embrace divine serenity and spiritual bliss. Book your darshan, contribute to sacred causes, and join our vibrant community events.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a
              href="/bookdarshan"
              className="rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105"
            >
              Book Darshan
            </a>
            <a
              href="/donations"
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-orange-600 shadow-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105"
            >
              Make a Donation
            </a>
            <a
              href="/admin"
              className="rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              Admin Panel
            </a>
            <a
              href="/gallery"
              className="rounded-xl bg-orange-100 px-6 py-3 text-base font-semibold text-orange-700 shadow-lg hover:bg-orange-200 transition-all duration-300 transform hover:scale-105"
            >
              Photo Gallery
            </a>
            <button
              onClick={toggleAudio}
              className="rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Music className="h-5 w-5" />
              {isPlaying ? "Pause Bhajan" : "Play Bhajan"}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">
              Our Sacred Offerings
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Discover the spiritual services that connect you closer to divinity.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Clock className="h-8 w-8 text-orange-600" />,
                title: "Online Darshan Booking",
                description: "Reserve your sacred darshan slot effortlessly and avoid waiting in long queues.",
                link: "/bookdarshan",
              },
              {
                icon: <Gift className="h-8 w-8 text-orange-600" />,
                title: "Online Donations",
                description: "Support temple initiatives with secure donations and receive instant acknowledgments.",
                link: "/donations",
              },
              {
                icon: <Calendar className="h-8 w-8 text-orange-600" />,
                title: "Event Calendar",
                description: "Stay informed about upcoming festivals, poojas, and special temple events.",
                onClick: toggleEventCalendar,
              },
              {
                icon: <Users className="h-8 w-8 text-orange-600" />,
                title: "Community Membership",
                description: "Join our spiritual community for exclusive benefits and divine experiences.",
                link: "/community",
              },
            ].map((feature, index) => (
              <a
                key={index}
                href={feature.link}
                onClick={feature.onClick}
                className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 rounded-full bg-orange-100 p-3">
                  {feature.icon}
                </div>
                <h3 className="mt-12 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Event Calendar Modal */}
      {showEventCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-orange-600">Temple Event Calendar</h2>
              <button
                onClick={toggleEventCalendar}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {events.length === 0 ? (
                <p className="text-center text-gray-600">No events available.</p>
              ) : (
                events.map((event: any, index) => (
                  <div key={index} className="border-l-4 border-orange-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="mt-2 text-gray-600">{event.description}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={toggleEventCalendar}
                className="rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white hover:bg-orange-700 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Summary Section */}
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900">Donation Impact</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Your contributions help sustain and enhance our temple's sacred mission.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <IndianRupee className="h-10 w-10 text-green-600 mx-auto" />
              <p className="mt-4 text-sm font-medium text-gray-600">Total Donated</p>
              <p className="text-3xl font-bold text-green-700">
                ₹{loading ? "Loading..." : donationData.totalDonated.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <IndianRupee className="h-10 w-10 text-red-600 mx-auto" />
              <p className="mt-4 text-sm font-medium text-gray-600">Total Used</p>
              <p className="text-3xl font-bold text-red-700">
                ₹{loading ? "Loading..." : donationData.totalUsed.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <IndianRupee className="h-10 w-10 text-blue-600 mx-auto" />
              <p className="mt-4 text-sm font-medium text-gray-600">Remaining Balance</p>
              <p className="text-3xl font-bold text-blue-700">
                ₹{loading ? "Loading..." : donationData.remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-900 text-center">How Your Donations Are Used</h3>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p className="text-center text-gray-600 col-span-full">Loading donation usage...</p>
              ) : donationData.donationUsage.length === 0 ? (
                <p className="text-center text-gray-600 col-span-full">No donation usage records available.</p>
              ) : (
                donationData.donationUsage.slice(0, 3).map((usage: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <p className="text-lg font-semibold text-orange-600">{usage.purpose}</p>
                    <p className="mt-2 text-gray-600">₹{usage.amountSpent.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-gray-500">{usage.description}</p>
                    <p className="mt-2 text-sm text-gray-400">Date: {usage.date}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/donations"
                className="inline-flex items-center rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-300"
              >
                Contribute Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Community Information Section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900">Our Spiritual Community</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Join a vibrant community dedicated to spiritual growth and service.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-orange-600">Weekly Satsangs</h3>
              <p className="mt-2 text-gray-600">
                Participate in our weekly gatherings for bhajans, discourses, and meditation every Sunday at 6 PM.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-orange-600">Volunteer Opportunities</h3>
              <p className="mt-2 text-gray-600">
                Contribute your time and skills to temple activities, from event planning to community outreach.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-orange-600">Youth Programs</h3>
              <p className="mt-2 text-gray-600">
                Engage young minds with our cultural and spiritual classes held every Saturday for children and teens.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <a
              href="/community"
              className="inline-flex items-center rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-300"
            >
              Join Our Community
            </a>
          </div>
        </div>
      </div>

      {/* Latest Updates Section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900">Latest Temple Updates</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Stay connected with the latest happenings at Ramalayam Temple.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Special Pooja",
                description: "Join us for a special pooja on 15th April. Register now!",
                date: "15th April 2025",
              },
              {
                title: "Temple Renovation",
                description: "Support our ongoing temple renovation project with your donations.",
                date: "Ongoing",
              },
              {
                title: "Ram Navami Festival",
                description: "Celebrate Ram Navami with grand festivities on 20th April.",
                date: "20th April 2025",
              },
            ].map((update, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-orange-600">{update.title}</h3>
                <p className="mt-2 text-gray-600">{update.description}</p>
                <p className="mt-4 text-sm text-gray-400">{update.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Contact Us Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">
              Connect With Us
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              We're here to guide you on your spiritual journey. Reach out to us for inquiries, blessings, or to share your thoughts.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Our Location</p>
                  <p className="mt-2 text-gray-600">Ramalayam Temple, Tirupati, Andhra Pradesh, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Phone Support</p>
                  <p className="mt-2 text-gray-600">+91 98765 43210 (Available 9 AM - 6 PM)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Email Us</p>
                  <p className="mt-2 text-gray-600">contact@ramalayamtemple.org</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageSquare className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Live Chat</p>
                  <p className="mt-2 text-gray-600">Chat with our team during temple hours</p>
                  <a
                    href="#"
                    className="mt-2 inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Start Chat
                  </a>
                </div>
              </div>
              <div className="flex gap-6 justify-center">
                <a href="https://instagram.com" target="_blank" className="text-orange-600 hover:text-orange-700">
                  <Instagram className="h-8 w-8" />
                </a>
                <a href="https://facebook.com" target="_blank" className="text-orange-600 hover:text-orange-700">
                  <Facebook className="h-8 w-8" />
                </a>
                <a href="https://twitter.com" target="_blank" className="text-orange-600 hover:text-orange-700">
                  <Twitter className="h-8 w-8" />
                </a>
              </div>
            </div>
            {/* Feedback Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Share Your Feedback</h3>
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={feedback.name}
                    onChange={handleFeedbackChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={feedback.email}
                    onChange={handleFeedbackChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={feedback.message}
                    onChange={handleFeedbackChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-300"
                  >
                    Submit Feedback
                  </button>
                </div>
                {feedbackStatus && (
                  <p className={`text-center ${feedbackStatus.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {feedbackStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-orange-700 to-yellow-600 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-white">
          <p className="text-lg">© 2025 Ramalayam Temple. All Rights Reserved.</p>
          <div className="mt-6 flex justify-center gap-8">
            <a href="https://instagram.com" target="_blank" className="hover:text-orange-200 transition-colors duration-300">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" className="hover:text-orange-200 transition-colors duration-300">
              YouTube
            </a>
            <a href="https://facebook.com" target="_blank" className="hover:text-orange-200 transition-colors duration-300">
              Facebook
            </a>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </main>
  );
}
