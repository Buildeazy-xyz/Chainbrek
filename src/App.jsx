import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Typed from "typed.js";
import "animate.css";
import { Shield, Users, Trophy, Ban } from "lucide-react";

// Import pages
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";

// Landing Page Component
function LandingPage() {
  useEffect(() => {
    const typed = new Typed("#typed", {
      strings: [
        "Chainbrek helps you stop gambling, protect your family, and grow your future with the power of AI.",
        "Join millions of people 🚀 around the world 🌎 who are resisting gambling and building wealth with the help of  Chainbrek!",
      ],
      typeSpeed: 60,
      backSpeed: 50,
      loop: false,
    });

    return () => typed.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <img
            src="/logo.png"
            alt="Chainbrek Logo"
            className="h-24 md:h-32 mx-auto mb-6"
          />

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Break Free. Build Wealth.
          </h1>

          {/* Typed text */}
          <p
            id="typed"
            className="text-lg md:text-xl text-yellow-200 font-semibold h-8"
          ></p>

          <div className="mt-16 flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-red-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="bg-red-800 text-white px-6 py-3 rounded-lg shadow hover:bg-red-900"
            >
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">
            Why Choose Chainbrek?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl shadow hover:shadow-lg animate__animated animate__fadeInUp">
              <Ban className="mx-auto text-red-600 mb-4" size={40} />
              <h3 className="font-bold text-lg mb-2">Gambling Resistance</h3>
              <p className="text-gray-600">
                Chainbrek helps you to break Gambling addiction, transform betting losses into savings,
                and helps you achieve real wealth
               </p>
            </div>
            <div className="p-6 rounded-xl shadow hover:shadow-lg animate__animated animate__fadeInUp animate__delay-1s">
              <Shield className="mx-auto text-green-600 mb-4" size={40} />
              <h3 className="font-bold text-lg mb-2">Wealth Protection</h3>
              <p className="text-gray-600">
                Chainbrek projects your savings and owode multiplies
                them, turning every weekly step into lating wealth security 
               </p>
            </div>
            <div className="p-6 rounded-xl shadow hover:shadow-lg animate__animated animate__fadeInUp animate__delay-2s">
              <Users className="mx-auto text-blue-600 mb-4" size={40} />
              <h3 className="font-bold text-lg mb-2">Family Support</h3>
              <p className="text-gray-600">
                Keep your family engaged with progress updates and shared goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center animate__animated animate__zoomIn">
          <Trophy className="mx-auto mb-4" size={50} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Challenge
          </h2>
          <p className="text-lg text-yellow-100 mb-6">
            Compete in weekly wealth challenges and turn recovery into growth.
          </p>
          <Link
            to="/register"
            className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-lg shadow hover:bg-gray-100"
          >
            Start Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} FADAKA TECHNOLOGIES LIMITED. All rights reserved.
      </footer>
    </div>
  );
}

// App Component with Routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
