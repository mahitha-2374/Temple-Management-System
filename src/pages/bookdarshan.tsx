import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  type: string;
  numberOfPeople: number;
}

const BookDarshan: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    type: 'Regular',
    numberOfPeople: 1,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.date || !formData.time) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/book-darshan', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success) {
        setMessage('Darshan booking successful! You will receive a confirmation email.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          date: '',
          time: '',
          type: 'Regular',
          numberOfPeople: 1,
        });
      } else {
        setError(response.data?.message || 'Something went wrong.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const apiError = axiosError.response?.data?.message || 'Error submitting form. Please try again later.';
      setError(apiError);
      console.error('Booking Error:', axiosError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 py-12">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
          Book a Darshan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                required
                onChange={handleChange}
                placeholder="Your Full Name"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                required
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                required
                onChange={handleChange}
                placeholder="Your Phone Number"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                required
                onChange={handleChange}
                placeholder="Your Address"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                id="numberOfPeople"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                required
                min="1"
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Darshan Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg shadow-sm focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-200 hover:border-orange-400"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg shadow-md hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Booking...' : 'Book Now'}
          </button>

          {message && (
            <p className="mt-4 text-center text-green-600 font-medium animate-fade-in">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-center text-red-600 font-medium animate-fade-in">
              {error}
            </p>
          )}
        </form>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookDarshan;