import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, TrendingUp, Shield, Award, Users, Star, Brain, Activity,
  Calendar, Phone, Trophy, BarChart3, Home, User, Building2, Heart
} from "lucide-react";
import "animate.css";
import { onboardingAPI, tournamentAPI, tokenManager } from "./apiService";

const getCurrencySymbol = (country) => {
  const currencyMap = {
    "Afghanistan": "؋",
    "Albania": "L",
    "Algeria": "د.ج",
    "Argentina": "$",
    "Australia": "A$",
    "Austria": "€",
    "Bangladesh": "৳",
    "Belgium": "€",
    "Brazil": "R$",
    "Bulgaria": "лв",
    "Canada": "C$",
    "Chile": "$",
    "China": "¥",
    "Colombia": "$",
    "Croatia": "kn",
    "Czech Republic": "Kč",
    "Denmark": "kr",
    "Egypt": "£",
    "Finland": "€",
    "France": "€",
    "Germany": "€",
    "Greece": "€",
    "Hungary": "Ft",
    "Iceland": "kr",
    "India": "₹",
    "Indonesia": "Rp",
    "Ireland": "€",
    "Israel": "₪",
    "Italy": "€",
    "Japan": "¥",
    "Jordan": "د.ا",
    "Kenya": "KSh",
    "South Korea": "₩",
    "Lebanon": "ل.ل",
    "Malaysia": "RM",
    "Mexico": "$",
    "Morocco": "د.م.",
    "Netherlands": "€",
    "New Zealand": "NZ$",
    "Nigeria": "₦",
    "Norway": "kr",
    "Pakistan": "₨",
    "Peru": "S/",
    "Philippines": "₱",
    "Poland": "zł",
    "Portugal": "€",
    "Romania": "lei",
    "Russia": "₽",
    "Saudi Arabia": "﷼",
    "Singapore": "S$",
    "South Africa": "R",
    "Spain": "€",
    "Sweden": "kr",
    "Switzerland": "CHF",
    "Thailand": "฿",
    "Turkey": "₺",
    "Ukraine": "₴",
    "United Arab Emirates": "د.إ",
    "United Kingdom": "£",
    "United States": "$",
    "Vietnam": "₫",
  };
  return currencyMap[country] || "₦"; // default to Naira
};

const Dashboard = () => {
  // Prevent remounting by using stable key
  const componentKey = "dashboard-main-stable";
  const [currentView, setCurrentView] = useState("dashboard");
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [aiRiskScore, setAiRiskScore] = useState(23);
  const [interventionActive, setInterventionActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showWealthPath, setShowWealthPath] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userCountry = storedUser.country || "";
  const currencySymbol = getCurrencySymbol(userCountry);

  // Onboarding questions
  const questions = [
    {
      id: 'bettingType',
      question: "Which of these do you find yourself betting on most often?",
      type: 'multiple',
      options: [
        { value: 'sports', label: 'Sports betting' },
        { value: 'virtual', label: 'Virtual games' },
        { value: 'casino', label: 'Casino/lotto' },
        { value: 'pools', label: 'Pools/cards' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'spending',
      question: "On average, how much do you put into betting?",
      type: 'input',
      fields: [
        { id: 'daily', label: 'Daily amount', placeholder: '0' },
        { id: 'weekly', label: 'Weekly amount', placeholder: '0' }
      ]
    },
    {
      id: 'family',
      question: "What's your current family situation?",
      type: 'single',
      options: [
        { value: 'single', label: 'Single - No dependents' },
        { value: 'married_no_kids', label: 'Married - No children yet' },
        { value: 'married_with_kids', label: 'Married with children' },
        { value: 'single_parent', label: 'Single parent' },
        { value: 'extended_family', label: 'Supporting extended family' }
      ]
    },
    {
      id: 'age',
      question: "Which age range do you fall into?",
      type: 'single',
      options: [
        { value: '18-24', label: '18–24' },
        { value: '25-34', label: '25–34' },
        { value: '35-44', label: '35–44' },
        { value: '45-54', label: '45–54' },
        { value: '55+', label: '55+' }
      ]
    },
    {
      id: 'support',
      question: "What kind of support would be most helpful to you right now?",
      type: 'single',
      options: [
        { value: 'reduce', label: 'Learning how to reduce gambling gradually' },
        { value: 'alternatives', label: 'Finding safe alternatives for excitement' },
        { value: 'savings', label: 'Building savings I can see grow' },
        { value: 'partners', label: 'Connecting with support partners' }
      ]
    },
    {
      id: 'commitment',
      question: "Would you be open to cutting your betting in half and watching that amount grow into real savings every week?",
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes, show me how' },
        { value: 'maybe', label: 'Maybe, let\'s see the numbers' },
        { value: 'no', label: 'Not now' }
      ]
    }
  ];

  // Reset onboarding state when user changes
  useEffect(() => {
    setShowOnboarding(false);
    setCurrentQuestion(0);
    setOnboardingAnswers({});
    setOnboardingComplete(false);
    setShowWealthPath(false);
  }, [storedUser.email]);

  // Check onboarding status on component mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      const userEmail = storedUser.email;
      if (userEmail && tokenManager.isAuthenticated()) {
        try {
          const response = await onboardingAPI.getOnboarding(userEmail);
          if (response && response.answers) {
            setOnboardingAnswers(response.answers);
            setOnboardingComplete(response.complete);
            // Store in localStorage as backup
            localStorage.setItem(`onboardingData_${userEmail}`, JSON.stringify(response));
          } else {
            // Check localStorage backup
            const localData = localStorage.getItem(`onboardingData_${userEmail}`);
            if (localData) {
              const parsedData = JSON.parse(localData);
              setOnboardingAnswers(parsedData.answers);
              setOnboardingComplete(parsedData.complete);
            } else {
              setShowOnboarding(true);
            }
          }
        } catch (error) {
          // Try localStorage backup on API failure
          const localData = localStorage.getItem(`onboardingData_${userEmail}`);
          if (localData) {
            const parsedData = JSON.parse(localData);
            setOnboardingAnswers(parsedData.answers);
            setOnboardingComplete(parsedData.complete);
          } else {
            setShowOnboarding(true);
          }
        }
      }
    };

    loadOnboardingData();
  }, [storedUser.email]);

const [userData] = useState({
  name: localStorage.getItem("username") || storedUser.name || "User", // 👈 fallback
  level: "Wealth Builder Pro",
  streakDays: 127,
  aiRiskScore: 23,
    totalWealth: 15847.32,
    gamblingMoneySaved: 8400.0,
    investmentGrowth: 2847.32,
    riskScore: 23,
    family: {
      spouse: "Jordan Thompson",
      children: 2,
      familyGoal: "House Down Payment",
    },
  });

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // AI risk monitor (demo) - DISABLED to prevent scroll issues
  useEffect(() => {
    // Temporarily disable automatic updates to prevent scroll issues
    // setCurrentTime(new Date());
    // setAiRiskScore(prev => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * 10)));

    // Keep current values stable
    setCurrentTime(new Date());
    // Keep AI risk score stable at current value
  }, []); // Remove automatic interval to prevent re-renders

  // Prevent scroll reset on re-renders
  useEffect(() => {
    const handleScroll = () => {
      // Save scroll position to prevent reset
      sessionStorage.setItem('dashboardScrollPosition', window.scrollY.toString());
    };

    const restoreScroll = () => {
      const savedScroll = sessionStorage.getItem('dashboardScrollPosition');
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }
    };

    // Restore scroll position on mount
    restoreScroll();

    // Save scroll position on scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Onboarding functions
  const handleAnswer = useCallback((questionId, answer) => {
    const newAnswers = { ...onboardingAnswers, [questionId]: answer };
    setOnboardingAnswers(newAnswers);
  }, [onboardingAnswers]);

  const handleNextQuestion = useCallback(async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate potential savings (make calculations stable)
      const weeklyAmount = parseFloat(onboardingAnswers.spending?.weekly || 0);
      const halfAmount = Math.round(weeklyAmount / 2); // Round to prevent decimals
      const monthlySavings = Math.round(halfAmount * 4); // Round to prevent decimals
      const yearlySavings = Math.round(monthlySavings * 12); // Round to prevent decimals

      const onboardingData = {
        userId: storedUser.email,
        answers: onboardingAnswers,
        complete: true,
        potentialSavings: {
          weekly: halfAmount,
          monthly: monthlySavings,
          yearly: yearlySavings
        }
      };

      // Save to backend
      await onboardingAPI.saveOnboarding(onboardingData);

      // Also save to localStorage as backup
      const userEmail = storedUser.email;
      localStorage.setItem(`onboardingData_${userEmail}`, JSON.stringify(onboardingData));
      setOnboardingComplete(true);
      setShowOnboarding(false);
      setShowWealthPath(true);
    }
  }, [currentQuestion, questions.length, onboardingAnswers, storedUser.email]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  // Onboarding UI Component
  const OnboardingFlow = () => {
    // Prevent remounting by using stable key
    const componentKey = "onboarding-flow-stable";
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900/90 to-red-800/90 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h1 className="text-xl font-bold mb-1">Your Wealth Journey</h1>
            <p className="text-red-100 text-sm">Let's understand your goals</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="font-bold text-red-600">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-tight">
              {currentQ.question}
            </h2>

            {currentQ.type === 'multiple' && (
              <div className="space-y-4">
                {currentQ.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                    className={`w-full p-5 text-left rounded-xl border-2 ${
                      onboardingAnswers[currentQ.id] === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        onboardingAnswers[currentQ.id] === option.value
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {onboardingAnswers[currentQ.id] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'single' && (
              <div className="space-y-4">
                {currentQ.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                    className={`w-full p-5 text-left rounded-xl border-2 ${
                      onboardingAnswers[currentQ.id] === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        onboardingAnswers[currentQ.id] === option.value
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {onboardingAnswers[currentQ.id] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'input' && (
              <div className="space-y-6">
                {currentQ.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={onboardingAnswers[currentQ.id]?.[field.id] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                          handleAnswer(currentQ.id, {
                            ...onboardingAnswers[currentQ.id],
                            [field.id]: value
                          });
                        }}
                        className="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <span className="text-sm font-medium">{currencySymbol}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enter amount in {currencySymbol}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  currentQuestion === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                ← Previous
              </button>

              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Step {currentQuestion + 1}</div>
                <div className="flex space-x-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentQuestion
                          ? 'bg-red-500'
                          : idx < currentQuestion
                          ? 'bg-red-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={
                  !onboardingAnswers[currentQ.id] ||
                  (currentQ.type === 'input' && !Object.values(onboardingAnswers[currentQ.id] || {}).some(v => v && v.trim() !== ''))
                }
                className={`px-6 py-3 rounded-xl font-semibold ${
                  !onboardingAnswers[currentQ.id] ||
                  (currentQ.type === 'input' && !Object.values(onboardingAnswers[currentQ.id] || {}).some(v => v && v.trim() !== ''))
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {currentQuestion === questions.length - 1 ? '🎉 See Results' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Results Preview Component
  const ResultsPreview = () => {
    const [onboardingData, setOnboardingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Load data instantly from localStorage first
      const userEmail = storedUser.email;
      const localData = localStorage.getItem(`onboardingData_${userEmail}`);

      if (localData) {
        // Show cached data immediately
        const parsedData = JSON.parse(localData);
        setOnboardingData(parsedData);
        setIsLoading(false);
      } else {
        // Use fallback values if no cached data
        setOnboardingData({
          answers: {
            spending: { weekly: 10000, daily: 1000 }
          },
          potentialSavings: {
            weekly: 5000,
            monthly: 20000,
            yearly: 240000
          }
        });
        setIsLoading(false);
      }

      // DISABLED: Remove automatic API updates to prevent scroll issues
      // The data should remain stable once loaded
    }, []); // No automatic updates to prevent re-renders and scrolling

    // Prevent scroll reset in results
    useEffect(() => {
      const handleScroll = () => {
        sessionStorage.setItem('resultsScrollPosition', window.scrollY.toString());
      };

      const restoreScroll = () => {
        const savedScroll = sessionStorage.getItem('resultsScrollPosition');
        if (savedScroll && !isLoading) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll, 10));
          }, 100);
        }
      };

      // Restore scroll position after loading
      if (!isLoading) {
        restoreScroll();
      }

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, [isLoading]);

    const answers = onboardingData?.answers || {};
    const savings = onboardingData?.potentialSavings || {};

    // Calculate wealth statistics based on user's answers
    const weeklyBetting = parseFloat(answers.spending?.weekly || 10000);
    const monthlyBetting = weeklyBetting * 4;
    const yearlyBetting = weeklyBetting * 52;

    // Calculate potential wealth growth
    const weeklySavings = weeklyBetting / 2; // Half of betting amount
    const monthlySavings = weeklySavings * 4;
    const yearlySavings = weeklySavings * 52;

    // Calculate growth with 7.2% annual return
    const growthAmount = yearlySavings * 0.072; // 7.2% of yearly savings
    const totalWealth = yearlySavings + growthAmount;

    // Check if user has family (for conditional Family Goal display)
    const hasFamily = answers.family === 'married_no_kids' ||
                     answers.family === 'married_with_kids' ||
                     answers.family === 'single_parent' ||
                     answers.family === 'extended_family';

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Wealth Stats - Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 md:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs md:text-sm">Total Wealth</p>
                <p className="text-lg md:text-2xl font-bold">{currencySymbol}{totalWealth.toLocaleString()}</p>
                <p className="text-xs text-green-200">+12% this month</p>
              </div>
              <TrendingUp size={16} className="md:w-6 md:h-6 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 md:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs md:text-sm">Not Gambled</p>
                <p className="text-lg md:text-2xl font-bold">
                  {currencySymbol}{yearlySavings.toLocaleString()}
                </p>
                <p className="text-xs text-blue-200">Reinvested</p>
              </div>
              <Shield size={16} className="md:w-6 md:h-6 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 md:p-4 rounded-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs md:text-sm">Growth</p>
                <p className="text-lg md:text-2xl font-bold">+{currencySymbol}{growthAmount.toLocaleString()}</p>
                <p className="text-xs text-purple-200">7.2% return</p>
              </div>
              <BarChart3 size={16} className="md:w-6 md:h-6 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Your Savings Challenge - Middle Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-xl font-bold text-gray-800 flex items-center">
              <Trophy className="mr-2 text-yellow-600" size={20} />
              <span>Your Savings Challenge</span>
            </h3>
            <div className="text-xs md:text-sm text-gray-500">Ready to start</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
              <div className="text-center">
                <Trophy className="text-yellow-600 mx-auto mb-2" size={24} />
                <h4 className="font-bold text-yellow-800 text-sm md:text-base">Weekly Goal</h4>
                <p className="text-sm md:text-lg text-yellow-700 mb-2 font-bold">{currencySymbol}{savings.weekly?.toLocaleString() || weeklySavings.toLocaleString()}</p>
                <div className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Save this much</div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border">
              <div className="text-center">
                <Star className="text-gray-600 mx-auto mb-2" size={24} />
                <h4 className="font-bold text-gray-800 text-sm md:text-base">Your Progress</h4>
                <p className="text-sm md:text-lg text-gray-700 mb-2 font-bold">{currencySymbol}{savings.monthly?.toLocaleString() || monthlySavings.toLocaleString()}</p>
                <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Monthly target</div>
              </div>
            </div>

            <div className="bg-green-50 p-3 md:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <h4 className="font-bold text-green-800 mb-2 text-sm md:text-base">Yearly Impact</h4>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span>Total savings:</span>
                  <span className="font-medium">{currencySymbol}{savings.yearly?.toLocaleString() || yearlySavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment growth:</span>
                  <span className="font-medium text-green-600">+{currencySymbol}{growthAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus reward:</span>
                  <span className="font-medium text-green-600">+{currencySymbol}{(growthAmount * 0.1).toLocaleString()}</span>
                </div>
              </div>

              {/* Owode CTA */}
              <div className="mt-4 pt-3 border-t border-green-200">
                <p className="text-xs text-green-700 mb-2">Ready to achieve this big dreams?</p>
                <a
                  href="https://owodealajo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white text-xs px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🚀 Visit Owodealajo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Wealth Path Result Page Component
  const WealthPathPage = () => {
    // Prevent remounting by using stable key
    const componentKey = "wealth-path-page-stable";
    const [onboardingData, setOnboardingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Load data instantly from localStorage first
      const userEmail = storedUser.email;
      const localData = localStorage.getItem(`onboardingData_${userEmail}`);

      if (localData) {
        // Show cached data immediately
        const parsedData = JSON.parse(localData);
        setOnboardingData(parsedData);
        setIsLoading(false);
      } else {
        // Use fallback values if no cached data
        setOnboardingData({
          answers: {
            spending: { weekly: 10000, daily: 1000 },
            commitment: 'yes'
          },
          potentialSavings: {
            weekly: 5000,
            monthly: 20000,
            yearly: 240000
          }
        });
        setIsLoading(false);
      }

      // DISABLED: Remove ALL automatic API updates to prevent scroll issues
      // The data should remain COMPLETELY STABLE once loaded
      // No background updates, no re-renders, no fluctuations
    }, []); // No automatic updates to prevent ANY re-renders and scrolling

    const answers = onboardingData?.answers || {};
    const savings = onboardingData?.potentialSavings || {};

    const weeklyAmount = parseFloat(answers.spending?.weekly || 0);
    const halfAmount = weeklyAmount / 2;
    const monthlySavings = halfAmount * 4;
    const yearlySavings = monthlySavings * 12;

    // Calculate growth with 8% annual return (compounded monthly)
    const monthlyRate = 0.08 / 12;
    let futureValue = 0;
    for (let month = 1; month <= 12; month++) {
      futureValue += monthlySavings * Math.pow(1 + monthlyRate, 12 - month);
    }

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Wealth Path</h1>
            <p className="text-green-100">See how small changes can grow into real wealth</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current vs Future Visualization */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Growth Journey</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Spending */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-800 mb-2">Current Path</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Weekly betting:</span>
                      <span className="font-medium">{currencySymbol}{weeklyAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly betting:</span>
                      <span className="font-medium">{currencySymbol}{(weeklyAmount * 4).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly betting:</span>
                      <span className="font-medium">{currencySymbol}{(weeklyAmount * 52).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-red-600">
                    💸 Money lost to betting
                  </div>
                </div>

                {/* Future Growth */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">Wealth Path</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Weekly savings:</span>
                      <span className="font-medium">{currencySymbol}{halfAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly savings:</span>
                      <span className="font-medium">{currencySymbol}{monthlySavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly savings:</span>
                      <span className="font-medium">{currencySymbol}{yearlySavings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-green-600">
                    📈 Growing with 8% annual return
                  </div>
                </div>
              </div>

              {/* Growth Chart Visualization */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-4">1-Year Growth Projection</h3>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-end justify-between h-32 space-x-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const cumulativeSavings = monthlySavings * month;
                      const growthValue = monthlySavings * (Math.pow(1 + monthlyRate, month) - 1) / monthlyRate;
                      const totalValue = cumulativeSavings + growthValue;
                      const height = (totalValue / futureValue) * 100;

                      return (
                        <div key={month} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-green-500 rounded-t w-full min-h-[4px]"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-xs text-gray-500 mt-1">M{month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {currencySymbol}{futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-gray-600">Total value after 1 year</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Ready to Start Your Wealth Journey?</h2>
              <p className="text-red-100 mb-6">
                Join thousands who have redirected their betting money into real wealth growth
              </p>

              <div className="space-y-4">
                <a
                  href="https://owodealajo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
                >
                  🚀 Start Building Wealth Now
                </a>

                <p className="text-sm text-red-200">
                  Visit owodealajo.com to begin your transformation
                </p>
              </div>
            </div>

            {/* Accountability Partner Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">👥</span>
                Get an Accountability Partner
              </h3>
              <p className="text-blue-700 mb-4">
                Success is easier with support. Connect with someone who understands your journey.
              </p>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">WhatsApp Support Group</h4>
                    <p className="text-sm text-gray-600">Join our community of wealth builders</p>
                  </div>
                </div>

                <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center">
                  <span className="mr-2">💬</span>
                  Join WhatsApp Group
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowWealthPath(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Continue to Dashboard
              </button>
              <button
                onClick={() => {
                  setShowWealthPath(false);
                  setShowOnboarding(true);
                  setCurrentQuestion(0);
                  setOnboardingAnswers({});
                  setOnboardingComplete(false);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Emergency modal (demo)
  const EmergencyInterventionModal = () =>
    interventionActive ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">AI Risk Alert</h2>
            <p className="text-red-600 text-sm">
              Our AI detected high-risk patterns. Let’s get you support right now.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-medium text-red-800 text-sm mb-1">Detected Patterns</h4>
              <ul className="text-red-700 text-xs space-y-1">
                <li>• 3 gambling site visits in last hour</li>
                <li>• Increased phone usage (stress indicator)</li>
                <li>• Search: “quick money”</li>
                <li>• Current time high-risk window</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 md:p-4 rounded-xl animate__animated animate__fadeInUp">
              <h4 className="font-medium text-green-800 text-sm mb-1">Your Wealth at Risk</h4>
              <div className="text-green-700 text-xs">
                <p>• Total saved: {currencySymbol}{userData.totalWealth.toLocaleString()}</p>
                <p>• Family goal progress: 67%</p>
                <p>• Weekly streak: {userData.streakDays} days</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setCurrentView("therapy")}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700"
            >
              <Phone className="inline mr-2" size={16} />
              Call Crisis Support Now
            </button>

            <button
              onClick={() => setCurrentView("rebuilding")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Alert My Family
            </button>

            <button
              onClick={() => setCurrentView("dashboard")}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700"
            >
              Show My Progress Instead
            </button>

            <button
              onClick={() => {
                setInterventionActive(false);
                setShowEmergencyAlert(false);
              }}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              I’m OK (Risk Score: {aiRiskScore.toFixed(0)})
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // ——— Main dashboard section (renamed to avoid shadowing) ———
  const DashboardHome = () => (
    <div className="space-y-4 md:space-y-6">
      {/* TOP: AI Risk Monitor + Owode Link */}
      <div
        className={`rounded-xl p-3 md:p-4 ${
          aiRiskScore > 50 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain
              className={`mr-2 md:mr-3 ${aiRiskScore > 50 ? "text-red-600" : "text-green-600"}`}
              size={20}
            />
            <div>
              <h3
                className={`font-medium text-sm md:text-base ${
                  aiRiskScore > 50 ? "text-red-800" : "text-green-800"
                }`}
              >
                AI Risk: {aiRiskScore > 50 ? "ELEVATED" : "LOW RISK"}
              </h3>
              <p
                className={`text-xs md:text-sm ${aiRiskScore > 50 ? "text-red-600" : "text-green-600"}`}
              >
                Score: {aiRiskScore.toFixed(0)}/100 • Updated: {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Activity className={`${aiRiskScore > 50 ? "text-red-500" : "text-green-500"}`} size={16} />
        </div>
      </div>


      {/* MIDDLE: Results Preview (Wealth Stats + Savings Challenge) */}
      {onboardingComplete && <ResultsPreview />}

      {/* BOTTOM: Family Recovery Dashboard */}
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate__animated">
        <h3 className="text-base md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
          <Users className="mr-2 text-blue-600" size={20} />
          Family Recovery Dashboard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm">
                J
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm md:text-base truncate">{userData.family.spouse}</h4>
                <p className="text-xs md:text-sm text-gray-600">Spouse • Support Partner</p>
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm font-medium text-green-600">Trust: 87%</div>
                <div className="text-xs text-gray-500">Improving</div>
              </div>
            </div>

            <div className="bg-green-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 text-sm md:text-base">Shared Goals</h4>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span>House Down Payment:</span>
                  <span className="font-medium">{currencySymbol}32,000 / {currencySymbol}48,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "67%" }} />
                </div>
                <div className="flex justify-between text-xs text-green-700">
                  <span>67% Complete</span>
                  <span>8 months left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="bg-yellow-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2 text-sm md:text-base">Family Therapy</h4>
              <div className="space-y-2 text-xs md:text-sm text-yellow-700">
                <div className="flex items-center">
                  <Calendar className="mr-2" size={14} />
                  <span>Next: Tomorrow 7 PM</span>
                </div>
                <div className="flex items-center">
                  <User className="mr-2" size={14} />
                  <span>Dr. Sarah Chen</span>
                </div>
                <button className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700">
                  Join Session
                </button>
              </div>
            </div>

            <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2 text-sm md:text-base">Education Fund</h4>
              <div className="text-xs md:text-sm text-purple-700 space-y-1">
                <p>Monthly: {currencySymbol}200</p>
                <p>Balance: {currencySymbol}2,847</p>
                <p className="text-xs">Protected from gambling</p>
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  );

  // Tournament with Real Backend Integration
  const InvestmentTournament = () => {
    const [tournamentData, setTournamentData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [investing, setInvesting] = useState(false);

    // Load tournament data on component mount
    useEffect(() => {
      const loadTournamentData = async () => {
        try {
          const [tournamentResponse, leaderboardResponse, userStatsResponse] = await Promise.all([
            tournamentAPI.getTournamentData(),
            tournamentAPI.getLeaderboard(),
            tournamentAPI.getUserTournamentStats()
          ]);

          setTournamentData(tournamentResponse);
          setLeaderboard(leaderboardResponse);
          setUserStats(userStatsResponse);
        } catch (error) {
          console.error('Failed to load tournament data:', error);
          // Fallback to empty data if API fails - only real registered users will appear
          setTournamentData({
            name: "December Challenge",
            description: "Compete to build wealth, not lose it",
            players: 0,
            totalInvested: 0,
            timeLeft: "Loading..."
          });
          setLeaderboard([]); // Empty leaderboard - only real registered users
        } finally {
          setIsLoading(false);
        }
      };

      loadTournamentData();
    }, []);

    // Handle investment
    const handleInvest = async (amount) => {
      setInvesting(true);
      try {
        await tournamentAPI.investInTournament(amount);
        // Refresh data after investment
        const [leaderboardResponse, userStatsResponse] = await Promise.all([
          tournamentAPI.getLeaderboard(),
          tournamentAPI.getUserTournamentStats()
        ]);
        setLeaderboard(leaderboardResponse);
        setUserStats(userStatsResponse);
        alert(`Successfully invested ${currencySymbol}${amount}!`);
      } catch (error) {
        alert(`Investment failed: ${error.message}`);
      } finally {
        setInvesting(false);
      }
    };

    if (isLoading) {
      return (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 md:p-6 rounded-xl animate-pulse">
            <div className="h-6 bg-yellow-400 rounded mb-2"></div>
            <div className="h-4 bg-yellow-400 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 bg-yellow-400 rounded"></div>
              <div className="h-8 bg-yellow-400 rounded"></div>
              <div className="h-8 bg-yellow-400 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 md:p-6 rounded-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-2">{tournamentData?.name || "December Challenge"}</h2>
          <p className="text-yellow-100 text-sm md:text-base">{tournamentData?.description || "Compete to build wealth, not lose it"}</p>
          <div className="mt-3 md:mt-4 grid grid-cols-3 gap-3 md:gap-4 text-center text-sm md:text-base">
            <div>
              <div className="text-lg md:text-2xl font-bold">{tournamentData?.players || 847}</div>
              <div className="text-xs text-yellow-200">Players</div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold">{currencySymbol}{(tournamentData?.totalInvested || 2100000).toLocaleString()}</div>
              <div className="text-xs text-yellow-200">Invested</div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold">{tournamentData?.timeLeft || "2d 14h"}</div>
              <div className="text-xs text-yellow-200">Left</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Leaderboard</h3>
          <div className="space-y-3 md:space-y-4">
            {leaderboard.map((player) => (
              <div
                key={player.rank || player.id}
                className={`flex items-center p-3 md:p-4 rounded-lg ${
                  player.isCurrentUser ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-3 md:mr-4 text-white font-bold text-sm ${
                    player.rank === 1
                      ? "bg-yellow-500"
                      : player.rank === 2
                      ? "bg-gray-400"
                      : player.rank === 3
                      ? "bg-orange-400"
                      : "bg-gray-300"
                  }`}
                >
                  {player.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-medium mr-2 text-sm md:text-base truncate">{player.name}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-1 md:px-2 py-1 rounded">
                      {player.badge}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">{player.streak} day streak</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm md:text-lg">{currencySymbol}{player.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">invested</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4">Quick Invest</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => handleInvest(25)}
              disabled={investing}
              className="bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed p-3 md:p-4 rounded-lg text-center transition-colors"
            >
              <DollarSign className="mx-auto mb-2 text-green-600" size={20} />
              <div className="font-medium text-sm md:text-base">{currencySymbol}25</div>
              <div className="text-xs text-gray-600">Move to 2nd</div>
            </button>
            <button
              onClick={() => handleInvest(50)}
              disabled={investing}
              className="bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed p-3 md:p-4 rounded-lg text-center transition-colors"
            >
              <DollarSign className="mx-auto mb-2 text-blue-600" size={20} />
              <div className="font-medium text-sm md:text-base">{currencySymbol}50</div>
              <div className="text-xs text-gray-600">Secure 3rd</div>
            </button>
            <button
              onClick={() => handleInvest(100)}
              disabled={investing}
              className="bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed p-3 md:p-4 rounded-lg text-center transition-colors"
            >
              <DollarSign className="mx-auto mb-2 text-purple-600" size={20} />
              <div className="font-medium text-sm md:text-base">{currencySymbol}100</div>
              <div className="text-xs text-gray-600">Bonus reward</div>
            </button>
          </div>
          {investing && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Processing investment...
            </div>
          )}
        </div>
      </div>
    );
  };

  // Therapy (placeholder)
  const TherapyHub = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Financial Therapy Hub</h2>
      <p className="text-gray-600 mb-4">
        Connect with specialized therapists for gambling recovery and financial planning.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800">Next Session</h3>
          <p className="text-blue-700 text-sm">Dr. Sarah Chen — Tomorrow 2:00 PM</p>
          <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Join Video Call
          </button>
        </div>
      </div>
    </div>
  );

  // Analytics (placeholder)
  const PredictiveAnalytics = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4">AI Predictive Analytics</h2>
      <p className="text-gray-600 mb-4">Advanced risk prediction and personalized intervention.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{userData.streakDays}</div>
          <div className="text-sm text-gray-600">Days Clean</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">96%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>
    </div>
  );

  // Life Rebuilding (placeholder)
  const LifeRebuilding = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Life Rebuilding Center</h2>
      <p className="text-gray-600 mb-4">Comprehensive support beyond just stopping gambling.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <Building2 className="mx-auto mb-2 text-blue-600" size={32} />
          <h3 className="font-bold">Career Services</h3>
          <p className="text-sm text-gray-600">Job placement and skills training</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <User className="mx-auto mb-2 text-green-600" size={32} />
          <h3 className="font-bold">Legal Support</h3>
          <p className="text-sm text-gray-600">Gambling-related legal issues</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <Heart className="mx-auto mb-2 text-purple-600" size={32} />
          <h3 className="font-bold">Education Fund</h3>
          <p className="text-sm text-gray-600">Scholarships for affected families</p>
        </div>
      </div>
    </div>
  );

  // Top/Bottom navigation
  const NavigationBar = () => (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto">
        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8 px-6">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "tournament", label: "Tournament", icon: Trophy },
            { id: "therapy", label: "Therapy", icon: Heart },
            { id: "analytics", label: "Analytics", icon: Brain },
            { id: "rebuilding", label: "Life Rebuild", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                  currentView === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} className="mr-1" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile top scrollable nav */}
        <nav className="md:hidden flex overflow-x-auto px-4 py-2 space-x-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "tournament", label: "Tournament", icon: Trophy },
            { id: "therapy", label: "Therapy", icon: Heart },
            { id: "analytics", label: "Analytics", icon: Brain },
            { id: "rebuilding", label: "Life Rebuild", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${
                  currentView === tab.id ? "bg-red-100 text-red-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="flex justify-around py-2">
            {[
              { id: "dashboard", label: "Home", icon: Home },
              { id: "tournament", label: "Compete", icon: Trophy },
              { id: "therapy", label: "Support", icon: Heart },
              { id: "analytics", label: "Stats", icon: Brain },
              { id: "rebuilding", label: "Rebuild", icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex flex-col items-center py-1 px-2 min-w-0 ${
                    currentView === tab.id ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-xs font-medium truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" key="dashboard-main">
      {/* Hide number input spinners */}
      <style dangerouslySetInnerHTML={{
        __html: `
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `
      }} />

      <EmergencyInterventionModal />

      {/* Onboarding Flow */}
      {showOnboarding && <OnboardingFlow key="onboarding-flow" />}

      {/* Wealth Path Page */}
      {showWealthPath && <WealthPathPage key="wealth-path-page" />}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 md:p-6" key="dashboard-header">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden" key="mobile-header">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Chainbrek Logo"
                className="h-12 w-auto"
              />
              <div>
                <p className="text-red-100 text-sm truncate">Hi {userData.name.split(" ")[0]}!</p>
                <div className="text-center">
                  <div className="text-lg font-bold">{userData.streakDays}</div>
                  <div className="text-red-100 text-xs">Days</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyAlert(true)}
              className="bg-red-800 hover:bg-red-900 p-2 rounded-lg"
              aria-label="Crisis support"
            >
              <Phone size={18} />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between" key="desktop-header">
            <div className="flex items-center gap-4 lg:gap-6">
              <img
                src="/logo.png"
                alt="Chainbrek Logo"
                className="h-16 lg:h-20 xl:h-24 w-auto animate__animated animate__bounceIn"
              />
              <div>
                <p className="text-red-100 text-sm lg:text-base animate__animated animate__fadeIn animate__delay-1s">
                  Welcome back, {userData.name}! • {userData.level}
                </p>
                <a
                  href="https://owodealajo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-white text-red-700 px-3 py-2 rounded-lg font-semibold hover:bg-red-50 text-sm"
                >
                  Open Owode (owodealajo.com)
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold">{userData.streakDays}</div>
                <div className="text-red-100 text-sm">Days Strong</div>
              </div>
              <button
                onClick={() => setShowEmergencyAlert(true)}
                className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                aria-label="Crisis support"
              >
                <Phone size={20} />
              </button>
              <button
                onClick={() => {
                  tokenManager.removeToken();
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="bg-red-600 hover:bg-red-800 px-3 py-2 rounded-lg text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <NavigationBar key="navigation-bar" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-3 md:p-6 pb-20 md:pb-6" key="main-content">
        {currentView === "dashboard" && <DashboardHome key="dashboard-home" />}
        {currentView === "tournament" && <InvestmentTournament key="tournament" />}
        {currentView === "therapy" && <TherapyHub key="therapy" />}
        {currentView === "analytics" && <PredictiveAnalytics key="analytics" />}
        {currentView === "rebuilding" && <LifeRebuilding key="rebuilding" />}
      </div>

     
    </div>
  );
};

export default Dashboard;
