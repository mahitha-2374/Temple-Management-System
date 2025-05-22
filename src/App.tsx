import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Donations } from './pages/Donations';
import { Accommodation } from './pages/Accommodation';
import { Login } from './pages/login';
import { Signup } from './pages/signup';
import TemplePoojas from './pages/templepoojas';
import BookDarshan from './pages/bookdarshan'; 
import AdminPage from "./admin/admin";
import { Gallery } from "./pages/Gallery";

import AdminLogin from "./components/AdminLogin";
import AdminSignup from "./components/AdminSignup";
import { Community } from './pages/Community'; // ✅ Import Community page

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templepoojas" element={<TemplePoojas />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/bookdarshan" element={<BookDarshan />} /> 
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/community" element={<Community />} /> {/* ✅ Community route added */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
