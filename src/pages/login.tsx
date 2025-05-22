import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        email,
        password,
      });
      const { token } = res.data;
      console.log('Login successful, token:', token); // Debugging
      localStorage.setItem("userToken", token);
      navigate('/'); // Navigate to homepage
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', errorMessage); // Debugging
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/forgot-password', {
        email: resetEmail,
      });
      setOtpSent(true);
      setError(res.data.message);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/reset-password', {
        email: resetEmail,
        otp,
        newPassword,
      });
      setError(res.data.message);
      setForgotPassword(false);
      setOtpSent(false);
      setResetEmail('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/508628776/photo/sunset-over-kandariya-mahadeva-temple.jpg?s=612x612&w=0&k=20&c=YOpVZmLiY4ccl_aoWRJhfqLpNEDgjyOGuTAKbobCO-U=')",
      }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}
        {!forgotPassword ? (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
            <form className="mt-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-md"
              >
                Login
              </button>
            </form>
            <p className="mt-4 text-sm text-center text-gray-600">
              <button
                onClick={() => setForgotPassword(true)}
                className="text-orange-600 font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </p>
            <p className="mt-2 text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Reset Password
            </h2>
            {!otpSent ? (
              <form className="mt-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-md"
                >
                  Send OTP
                </button>
                <p className="mt-4 text-sm text-center text-gray-600">
                  <button
                    onClick={() => setForgotPassword(false)}
                    className="text-orange-600 font-medium hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              </form>
            ) : (
              <form className="mt-6" onSubmit={handleResetPassword}>
                <div>
                  <label className="block text-gray-700">OTP</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-md"
                >
                  Reset Password
                </button>
                <p className="mt-4 text-sm text-center text-gray-600">
                  <button
                    onClick={() => setForgotPassword(false)}
                    className="text-orange-600 font-medium hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}