import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Home,
  User,
  Phone,
  ChevronDown,
  LogOut,
  Settings,
  IndianRupee,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { DriverDetailsEditorModal } from "@/components/admin/DriverDetailsEditorModal";
import { DayBookHub } from "@/components/admin/DayBookHub";
import logoAsset from "@/assets/fortune-tourism-logo.png";
import fullLogoAsset from "@/assets/fortune-tourism-full-logo.png";
import keralaHeroImg from "@/assets/kerala-hero.jpg";
import karnatakaHeroImg from "@/assets/karnataka-hero.jpg";
import pondicherryHeroImg from "@/assets/pondicherry-hero.jpg";
import andhraHeroImg from "@/assets/andhra-hero.jpg";
import tamilnaduHeroImg from "@/assets/tamilnadu-hero.jpg";
import fleetInnovaImg from "@/assets/fleet-innova-hero.jpg";
import fleetTempoImg from "@/assets/fleet-tempo-hero.jpg";
import fleetDzireImg from "@/assets/fleet-dzire-hero.jpg";
import fleetHondaImg from "@/assets/fleet-honda-hero.jpg";
import fleetUrbaniaImg from "@/assets/fleet-urbania-hero.png";

const LOGIN_DESTINATION_SLIDES = [
  {
    eyebrow: "EXPLORE",
    title: "KERALA",
    tagline: "GOD'S OWN COUNTRY.",
    quote: "“Backwaters, misty hills and coconut coasts — where nature slows time down.”",
    image: keralaHeroImg,
    alt: "Explore Kerala - God's Own Country",
  },
  {
    eyebrow: "EXPLORE",
    title: "KARNATAKA",
    tagline: "ONE STATE. ENDLESS EXPERIENCES.",
    quote: "“From royal palaces to whispering waterfalls — every road here tells a story.”",
    image: karnatakaHeroImg,
    alt: "Explore Karnataka - One State. Endless Experiences.",
  },
  {
    eyebrow: "EXPLORE",
    title: "PONDICHERRY",
    tagline: "A FRENCH SOUL BY THE SEA.",
    quote: "“Cobbled lanes, café mornings and turquoise waters — a little Europe on Indian shores.”",
    image: pondicherryHeroImg,
    alt: "Explore Pondicherry - A French Soul By The Sea.",
  },
  {
    eyebrow: "EXPLORE",
    title: "ANDHRA PRADESH",
    tagline: "SPIRITUAL. SCENIC. UNFORGETTABLE.",
    quote: "“Temple bells, hill trains and golden shores — the soul of the south awaits.”",
    image: andhraHeroImg,
    alt: "Explore Andhra Pradesh - Spiritual. Scenic. Unforgettable.",
  },
  {
    eyebrow: "EXPLORE",
    title: "TAMIL NADU",
    tagline: "LAND OF HERITAGE, NATURE & SPIRITUALITY.",
    quote: "“Temples, coastlines and cool hill escapes — a journey of culture in every direction.”",
    image: tamilnaduHeroImg,
    alt: "Explore Tamil Nadu - Land of Heritage, Nature & Spirituality.",
  },
  {
    eyebrow: "PREMIUM FLEET",
    title: "TOYOTA INNOVA",
    tagline: "COMFORT. LUXURY. RELIABILITY.",
    quote: "“Spacious executive travel crafted for long journeys, family tours and highway comfort.”",
    image: fleetInnovaImg,
    alt: "Toyota Innova - Fortune Tourism Fleet",
  },
  {
    eyebrow: "GROUP TRAVEL",
    title: "TEMPO TRAVELLER",
    tagline: "SPACE. TOGETHERNESS. ADVENTURE.",
    quote: "“Comfortable luxury group touring for family outings, pilgrimages and corporate events.”",
    image: fleetTempoImg,
    alt: "Force Tempo Traveller - Fortune Tourism Fleet",
  },
  {
    eyebrow: "LUXURY COMMUTE",
    title: "FORCE URBANIA",
    tagline: "MODERN. LUXURY. SPACIOUS.",
    quote: "“Next-generation luxury van crafted for premium group touring and executive travel.”",
    image: fleetUrbaniaImg,
    alt: "Force Urbania - Fortune Tourism Fleet",
  },
  {
    eyebrow: "CITY & OUTSTATION",
    title: "SWIFT DZIRE",
    tagline: "SMOOTH. EFFICIENT. ACCESSIBLE.",
    quote: "“The ideal sedan for fast airport transfers, business commutes and seamless city travel.”",
    image: fleetDzireImg,
    alt: "Maruti Suzuki Dzire - Fortune Tourism Fleet",
  },
  {
    eyebrow: "EXECUTIVE SEDAN",
    title: "HONDA CITY",
    tagline: "ELEGANCE. COMFORT. PRESTIGE.",
    quote: "“Refined luxury journeys and executive travel experiences with unmatched sophistication.”",
    image: fleetHondaImg,
    alt: "Honda City - Fortune Tourism Fleet",
  },
];

export const Route = createFileRoute("/admin_/day-book")({
  head: () => ({
    meta: [
      { title: "Day Book | Fortune Tourism Admin" },
      { name: "description", content: "Fortune Tourism Day Book - Active & Upcoming Travel Operations" },
    ],
  }),
  component: AdminDayBookPage,
});

function AdminDayBookPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ email?: string; role?: string; name?: string } | null>(null);

  // Account dropdown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [driverDetailsModalOpen, setDriverDetailsModalOpen] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("adminfortunetourism@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Slider states
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  useEffect(() => {
    if (isAuthenticated || isSliderHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % LOGIN_DESTINATION_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAuthenticated, isSliderHovered]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? LOGIN_DESTINATION_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % LOGIN_DESTINATION_SLIDES.length);
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Check login credentials on mount
  useEffect(() => {
    const key = sessionStorage.getItem("fortune_admin_key") || localStorage.getItem("fortune_admin_key");
    const authStr = sessionStorage.getItem("fortune_admin_auth") || localStorage.getItem("fortune_admin_auth");

    if (key === "Admin@fortunetourism2026") {
      setIsAuthenticated(true);
      if (authStr) {
        try {
          setAdminUser(JSON.parse(authStr));
        } catch {
          setAdminUser({ email: "adminfortunetourism@gmail.com", name: "Administrator" });
        }
      } else {
        setAdminUser({ email: "adminfortunetourism@gmail.com", name: "Administrator" });
      }
    }
    setAuthChecking(false);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setLoginError("Please enter both User ID/Email and Password.");
      toast.error("Please fill in all fields.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Signed in successfully to Fortune Tourism Admin!");
        sessionStorage.setItem("fortune_admin_key", data.admin_key);
        sessionStorage.setItem("fortune_admin_auth", JSON.stringify(data.user));
        localStorage.setItem("fortune_admin_key", data.admin_key);
        localStorage.setItem("fortune_admin_auth", JSON.stringify(data.user));
        setAdminUser(data.user);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Invalid User ID or Password.");
        toast.error(data.error || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError("Could not reach authentication server. Please check your network.");
      toast.error("Network error during login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fortune_admin_key");
    sessionStorage.removeItem("fortune_admin_auth");
    localStorage.removeItem("fortune_admin_key");
    localStorage.removeItem("fortune_admin_auth");
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginPassword("");
    toast.info("Logged out of Admin Portal.");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600">Verifying Admin Authorization...</p>
      </div>
    );
  }

  // If not logged in, render the standard Login Screen
  if (!isAuthenticated) {
    const currentSlide = LOGIN_DESTINATION_SLIDES[activeSlide] || LOGIN_DESTINATION_SLIDES[0];

    return (
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col bg-slate-50 text-slate-900">
        <header className="relative w-full shrink-0 bg-white border-b border-slate-200/90 py-2 sm:py-2.5 flex items-center justify-center shadow-xs z-20">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-center text-center px-4 sm:px-6">
            <h1 className="sr-only">Fortune Tourism - Meets all your travel needs</h1>
            <img
              src={fullLogoAsset}
              alt="Fortune Tourism - Meets all your travel needs"
              className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto max-w-[65vw] sm:max-w-[50vw] md:max-w-[40vw] object-contain block mx-auto"
            />
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col justify-center">
          <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
            <div
              className="w-full lg:w-[65%] bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative group"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <div className="min-h-[92px] sm:min-h-[102px]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-[#063f2d] border border-emerald-200/70 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#d79a17]" />
                      {currentSlide.eyebrow}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Fortune Tourism Showcase
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-400 font-mono tracking-wider">
                    {activeSlide + 1} / {LOGIN_DESTINATION_SLIDES.length}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-heading tracking-tight uppercase leading-tight">
                  {currentSlide.title}
                </h2>

                <div className="flex items-center gap-2 max-w-md my-1">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-500 w-8 sm:w-12 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#d79a17] whitespace-nowrap">
                    {currentSlide.tagline}
                  </p>
                  <div className="h-px bg-gradient-to-r from-amber-500 via-amber-400 to-transparent flex-1" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 italic font-serif leading-relaxed line-clamp-2">
                  {currentSlide.quote}
                </p>
              </div>

              <div className="relative flex-1 min-h-[230px] sm:min-h-[280px] lg:min-h-[320px] flex items-center justify-center my-3 overflow-hidden rounded-xl bg-slate-50/70 border border-slate-100 p-2 sm:p-4">
                {LOGIN_DESTINATION_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.title}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out p-2 ${
                      idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full max-h-[240px] sm:max-h-[290px] lg:max-h-[320px] object-contain mx-auto drop-shadow-sm transition-transform duration-500"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#063f2d] border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#063f2d] border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2">
                {LOGIN_DESTINATION_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide ? "w-6 bg-[#063f2d]" : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[35%] bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#063f2d] to-[#086a46] p-0.5 shadow-md mx-auto mb-3 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#063f2d]">
                    <ShieldCheck className="w-6 h-6 text-[#063f2d]" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                  Super Admin Sign In
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Enter credentials to access Fortune Tourism Day Book &amp; Portal
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    User ID / Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="adminfortunetourism@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063f2d] focus:border-transparent transition font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063f2d] focus:border-transparent transition font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#063f2d] to-[#086a46] hover:from-[#053224] hover:to-[#064e33] text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{loginLoading ? "Verifying..." : "Sign In to Day Book"}</span>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated: Render Day Book Page with Header & Navigation
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Top Header Bar with Logo and Phone */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#04281c] via-[#063f2d] to-[#085a3f] text-white border-b border-emerald-800/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 sm:h-14">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-xl p-1 transition"
                title="Fortune Tourism Admin"
              >
                <span className="grid place-items-center overflow-hidden rounded-xl bg-white h-8 w-8 sm:h-9 sm:w-9 shadow-xs shrink-0">
                  <img src={logoAsset} alt="Fortune Tourism Logo" className="h-full w-full object-contain" />
                </span>
                <div className="text-left">
                  <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight flex items-center gap-1.5 leading-none">
                    <span className="text-white">Fortune Tourism</span>
                    <span className="text-[#d79a17] font-black">Admin</span>
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right: Phone Number with Phone icon */}
            <div className="flex items-center">
              <a
                href="tel:9740463404"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/60 hover:bg-emerald-900 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white hover:border-amber-400/80 hover:text-amber-300 transition shadow-2xs cursor-pointer"
                title="Call 9740463404"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d79a17]" />
                <span className="tracking-wide">9740463404</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Second Navigation Bar: [ Day Book ] [ Dashboard ] ... [ Account ] */}
      <nav className="sticky top-13 sm:top-14 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1.5">
            {/* Left: Day Book & Dashboard Buttons (Day Book appears FIRST!) */}
            <div className="flex items-center gap-2">
              {/* 1. Day Book Button (ACTIVE) */}
              <Link
                to="/admin/day-book"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-[#063f2d] text-white shadow-xs font-extrabold"
              >
                <BookOpen className="w-4 h-4" />
                <span>Day Book</span>
              </Link>

              {/* 2. Dashboard Button (INACTIVE, links to category dashboard) */}
              <a
                href="/admin?view=dashboard"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-slate-700 hover:text-[#063f2d] hover:bg-slate-100"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </a>

              {/* 3. Driver Details Button */}
              <button
                type="button"
                onClick={() => setDriverDetailsModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-[#063f2d] border border-emerald-200/80 shadow-2xs shrink-0"
                title="Driver Details & Duty Sheet"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Driver Details</span>
              </button>
            </div>

            {/* Right: Account with image dropdown */}
            <div
              ref={accountMenuRef}
              className="relative"
              onMouseEnter={() => setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  accountMenuOpen
                    ? "border-[#063f2d] bg-emerald-50 text-[#063f2d]"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 shadow-2xs"
                }`}
                aria-expanded={accountMenuOpen}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#063f2d] to-[#086a46] p-0.5 shadow-xs flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#063f2d] font-extrabold text-xs">
                    <User className="w-3.5 h-3.5 text-[#063f2d]" />
                  </div>
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold block leading-none text-slate-900">Account</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">Super Admin</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-60 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-2 ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {adminUser?.name || "Fortune Tourism Administrator"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {adminUser?.email || "adminfortunetourism@gmail.com"}
                      </p>
                    </div>

                    <a
                      href="/admin?view=dashboard"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#063f2d] hover:bg-emerald-50 transition text-left cursor-pointer"
                    >
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span>Category Dashboard</span>
                    </a>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Taj Mahal Background */}
      <section
        className="relative py-6 sm:py-8 min-h-[calc(100vh-108px)] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col justify-start"
        style={{ backgroundImage: `url('/taj-mahal-admin-bg.jpg')` }}
      >
        {/* Soft elegant gradient overlay to ensure perfect contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/80 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative z-10 w-full">
          <DayBookHub />
        </div>
      </section>

      {/* Driver Details Modal */}
      {driverDetailsModalOpen && (
        <DriverDetailsEditorModal
          isOpen={driverDetailsModalOpen}
          onClose={() => setDriverDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}
