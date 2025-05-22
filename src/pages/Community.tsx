import { Users, Calendar, Gift } from "lucide-react";
import { useState } from "react";

export function Community() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    membershipType: "basic",
  });
  const [formStatus, setFormStatus] = useState("");
  const [activeDetail, setActiveDetail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus("Membership application submitted successfully!");
        setFormData({ fullName: "", email: "", phone: "", membershipType: "basic" });
        setTimeout(() => setFormStatus(""), 3000);
      } else {
        setFormStatus("Failed to submit application. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting membership:", err);
      setFormStatus("Failed to submit application. Please try again.");
    }
  };

  const toggleDetails = (type: string) => {
    setActiveDetail(prev => (prev === type ? "" : type));
  };

  const membershipDetails = {
    basic: {
      price: "₹4,000/year",
      visits: "Once every 6 months",
      members: "Up to 3 members",
    },
    premium: {
      price: "₹7,000/year",
      visits: "Once every 3 months",
      members: "Up to 5 members",
    },
    patron: {
      price: "₹10,000/year",
      visits: "Monthly darshan",
      members: "Up to 7 members",
    },
  };

  const renderDetail = (type: string) =>
    activeDetail === type && (
      <div className="mt-4 bg-orange-50 p-4 rounded-xl text-sm text-gray-700 border border-orange-200 shadow-inner transition-all duration-300">
        <p><strong>Price:</strong> {membershipDetails[type].price}</p>
        <p><strong>Visit Frequency:</strong> {membershipDetails[type].visits}</p>
        <p><strong>Allowed Members:</strong> {membershipDetails[type].members}</p>
      </div>
    );

  return (
    <main className="bg-gradient-to-b from-orange-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">
            Join Our Spiritual Community
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            Become a part of Ramalayam Temple's vibrant community. Choose a membership plan and enjoy exclusive spiritual benefits.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Membership Benefits */}
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-900">Membership Benefits</h2>
            {/* Basic */}
            <div
              className="bg-white rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => toggleDetails("basic")}
            >
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Membership</h3>
                  <p className="mt-2 text-gray-600">
                    Access to weekly satsangs, community events, and volunteer opportunities.
                  </p>
                </div>
              </div>
              {renderDetail("basic")}
            </div>
            {/* Premium */}
            <div
              className="bg-white rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => toggleDetails("premium")}
            >
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Premium Membership</h3>
                  <p className="mt-2 text-gray-600">
                    Includes Basic benefits plus priority darshan bookings and exclusive festival invites.
                  </p>
                </div>
              </div>
              {renderDetail("premium")}
            </div>
            {/* Patron */}
            <div
              className="bg-white rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => toggleDetails("patron")}
            >
              <div className="flex items-center gap-4">
                <Gift className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Patron Membership</h3>
                  <p className="mt-2 text-gray-600">
                    All Premium benefits plus special recognition in temple publications and VIP events.
                  </p>
                </div>
              </div>
              {renderDetail("patron")}
            </div>
          </div>

          {/* Membership Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Apply for Membership</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">
                  Membership Type
                </label>
                <select
                  name="membershipType"
                  id="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  <option value="basic">Basic Membership</option>
                  <option value="premium">Premium Membership</option>
                  <option value="patron">Patron Membership</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-300"
                >
                  Apply Now
                </button>
              </div>
              {formStatus && (
                <p className={`text-center ${formStatus.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {formStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
