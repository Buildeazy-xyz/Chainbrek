import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "animate.css";
import { Loader2 } from "lucide-react";
import { authAPI, tokenManager } from "./apiService";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phoneNumber: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();

  // Country code mapping
  const getCountryCode = (country) => {
    const countryCodes = {
      "Afghanistan": "+93",
      "Albania": "+355",
      "Algeria": "+213",
      "Argentina": "+54",
      "Australia": "+61",
      "Austria": "+43",
      "Bangladesh": "+880",
      "Belgium": "+32",
      "Brazil": "+55",
      "Bulgaria": "+359",
      "Canada": "+1",
      "Chile": "+56",
      "China": "+86",
      "Colombia": "+57",
      "Croatia": "+385",
      "Czech Republic": "+420",
      "Denmark": "+45",
      "Egypt": "+20",
      "Finland": "+358",
      "France": "+33",
      "Germany": "+49",
      "Greece": "+30",
      "Hungary": "+36",
      "Iceland": "+354",
      "India": "+91",
      "Indonesia": "+62",
      "Ireland": "+353",
      "Israel": "+972",
      "Italy": "+39",
      "Japan": "+81",
      "Jordan": "+962",
      "Kenya": "+254",
      "South Korea": "+82",
      "Lebanon": "+961",
      "Malaysia": "+60",
      "Mexico": "+52",
      "Morocco": "+212",
      "Netherlands": "+31",
      "New Zealand": "+64",
      "Nigeria": "+234",
      "Norway": "+47",
      "Pakistan": "+92",
      "Peru": "+51",
      "Philippines": "+63",
      "Poland": "+48",
      "Portugal": "+351",
      "Romania": "+40",
      "Russia": "+7",
      "Saudi Arabia": "+966",
      "Singapore": "+65",
      "South Africa": "+27",
      "Spain": "+34",
      "Sweden": "+46",
      "Switzerland": "+41",
      "Thailand": "+66",
      "Turkey": "+90",
      "Ukraine": "+380",
      "United Arab Emirates": "+971",
      "United Kingdom": "+44",
      "United States": "+1",
      "Vietnam": "+84",
    };
    return countryCodes[country] || "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Check password requirements in real-time
    if (name === "password") {
      checkPasswordRequirements(newValue);
    }
  };

  const checkPasswordRequirements = (password) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Validations
      if (!formData.firstName || !formData.lastName) {
        setError("⚠️ Please enter your full name.");
        setLoading(false);
        return;
      }
      if (!formData.email.includes("@")) {
        setError("⚠️ Please enter a valid email address.");
        setLoading(false);
        return;
      }
      // Strong password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError("⚠️ Password must be strong: at least 8 characters, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).");
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("⚠️ Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!formData.country) {
        setError("⚠️ Please select your country.");
        setLoading(false);
        return;
      }
      if (!formData.phoneNumber || formData.phoneNumber.length < 7) {
        setError("⚠️ Please enter a valid phone number.");
        setLoading(false);
        return;
      }
      if (!formData.acceptTerms) {
        setError("⚠️ You must accept the Terms & Conditions.");
        setLoading(false);
        return;
      }

      // Prepare user data for backend
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phoneNumber: `${getCountryCode(formData.country)}${formData.phoneNumber}`
      };

      // Call backend API
      const response = await authAPI.register(userData);

      // Store token and user data
      tokenManager.setToken(response.token);
      localStorage.setItem("user", JSON.stringify({
        name: userData.name,
        email: userData.email,
        country: userData.country,
        phoneNumber: userData.phoneNumber
      }));

      alert("🎉 Registration Successful! Please login to continue.");
      navigate("/login");

    } catch (error) {
      setError(`⚠️ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 animate__animated animate__fadeInUp">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Chainbrek Logo"
            className="h-16 mx-auto animate__animated animate__bounceIn"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-sm">
            Start your recovery journey with us 🚀
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm animate__animated animate__shakeX">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {getCountryCode(formData.country) || "+XXX"}
            </div>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full pl-16 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            <option value="">Select your country</option>
            <option value="Afghanistan">Afghanistan</option>
            <option value="Albania">Albania</option>
            <option value="Algeria">Algeria</option>
            <option value="Argentina">Argentina</option>
            <option value="Australia">Australia</option>
            <option value="Austria">Austria</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Belgium">Belgium</option>
            <option value="Brazil">Brazil</option>
            <option value="Bulgaria">Bulgaria</option>
            <option value="Canada">Canada</option>
            <option value="Chile">Chile</option>
            <option value="China">China</option>
            <option value="Colombia">Colombia</option>
            <option value="Croatia">Croatia</option>
            <option value="Czech Republic">Czech Republic</option>
            <option value="Denmark">Denmark</option>
            <option value="Egypt">Egypt</option>
            <option value="Finland">Finland</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Greece">Greece</option>
            <option value="Hungary">Hungary</option>
            <option value="Iceland">Iceland</option>
            <option value="India">India</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Ireland">Ireland</option>
            <option value="Israel">Israel</option>
            <option value="Italy">Italy</option>
            <option value="Japan">Japan</option>
            <option value="Jordan">Jordan</option>
            <option value="Kenya">Kenya</option>
            <option value="South Korea">South Korea</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Mexico">Mexico</option>
            <option value="Morocco">Morocco</option>
            <option value="Netherlands">Netherlands</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Norway">Norway</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Peru">Peru</option>
            <option value="Philippines">Philippines</option>
            <option value="Poland">Poland</option>
            <option value="Portugal">Portugal</option>
            <option value="Romania">Romania</option>
            <option value="Russia">Russia</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Singapore">Singapore</option>
            <option value="South Africa">South Africa</option>
            <option value="Spain">Spain</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Thailand">Thailand</option>
            <option value="Turkey">Turkey</option>
            <option value="Ukraine">Ukraine</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Vietnam">Vietnam</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Strong password (8+ chars, uppercase, lowercase, number, special)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />

          {/* Password Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Password must contain:</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  passwordRequirements.length ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {passwordRequirements.length && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className={passwordRequirements.length ? 'text-green-700' : 'text-gray-600'}>
                  At least 8 characters
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  passwordRequirements.uppercase ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {passwordRequirements.uppercase && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className={passwordRequirements.uppercase ? 'text-green-700' : 'text-gray-600'}>
                  One uppercase letter (A-Z)
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  passwordRequirements.lowercase ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {passwordRequirements.lowercase && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className={passwordRequirements.lowercase ? 'text-green-700' : 'text-gray-600'}>
                  One lowercase letter (a-z)
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  passwordRequirements.number ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {passwordRequirements.number && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className={passwordRequirements.number ? 'text-green-700' : 'text-gray-600'}>
                  One number (0-9)
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  passwordRequirements.special ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {passwordRequirements.special && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className={passwordRequirements.special ? 'text-green-700' : 'text-gray-600'}>
                  One special character (@$!%*?&)
                </span>
              </div>
            </div>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />

          <label className="flex items-center space-x-2 text-gray-600 text-sm">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span>
              I agree to the{" "}
              <a href="#" className="text-red-600 hover:underline">
                Terms & Conditions
              </a>
            </span>
          </label>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition transform hover:scale-105 animate__animated animate__pulse animate__infinite"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
