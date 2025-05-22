import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const AdminSignup = () => {
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    password: string;
  }>({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/admin-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/admin-login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://media.istockphoto.com/id/467437354/photo/the-1300-year-old-kailasanathar-hindu-temple-built-by-the-pallava-king-narasimhavarman-ii.jpg?s=612x612&w=0&k=20&c=XvIhagnI1uQZSDDyKxflSIJMQFtrREjDwAXAMwF9aqg=')`,
      }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-orange-900 mb-6">Admin Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Signup
          </button>
          {message && <p className="text-green-600 mt-3">{message}</p>}
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;