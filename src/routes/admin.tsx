import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { BusinessDashboard } from "@/components/business/BusinessDashboard";
import { ResourceManager } from "@/components/business/ResourceManager";
import { ClientStatementsManager } from "@/components/business/ClientStatementsManager";
import { DailyExpenseReport } from "@/components/business/DailyExpenseReport";
import { DayBookingsManager, BookingListManager, PendingPaymentsManager } from "@/components/admin/BookingManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { BookingFormModal } from "@/components/admin/BookingFormModal";
import { PaymentHistoryManager } from "@/components/admin/PaymentHistoryManager";
import { HotelAdminManager } from "@/components/admin/HotelAdminManager";
import { RechargeAdminManager } from "@/components/admin/RechargeAdminManager";
import { BillPaymentAdminManager } from "@/components/admin/BillPaymentAdminManager";
import { AccountsReportsHub, type AccountReportKey, REPORT_DEFINITIONS } from "@/components/admin/AccountsReportsHub";
import { AdminCabBookingFlow } from "@/components/admin/AdminCabBookingFlow";
import { AdminTicketBookingFlow } from "@/components/admin/AdminTicketBookingFlow";
import { AdminTourBookingFlow } from "@/components/admin/AdminTourBookingFlow";
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
import { BUSINESS_RESOURCES } from "@/lib/business-schema";
import { packages } from "@/data/packages";

const LOGIN_DESTINATION_SLIDES = [
  {
    eyebrow: "EXPLORE",
    title: "KERALA",
    tagline: "GOD'S OWN COUNTRY.",
    quote: "\u201CBackwaters, misty hills and coconut coasts \u2014 where nature slows time down.\u201D",
    image: keralaHeroImg,
    alt: "Explore Kerala - God's Own Country",
  },
  {
    eyebrow: "EXPLORE",
    title: "KARNATAKA",
    tagline: "ONE STATE. ENDLESS EXPERIENCES.",
    quote: "\u201CFrom royal palaces to whispering waterfalls \u2014 every road here tells a story.\u201D",
    image: karnatakaHeroImg,
    alt: "Explore Karnataka - One State. Endless Experiences.",
  },
  {
    eyebrow: "EXPLORE",
    title: "PONDICHERRY",
    tagline: "A FRENCH SOUL BY THE SEA.",
    quote: "\u201CCobbled lanes, caf\u00E9 mornings and turquoise waters \u2014 a little Europe on Indian shores.\u201D",
    image: pondicherryHeroImg,
    alt: "Explore Pondicherry - A French Soul By The Sea.",
  },
  {
    eyebrow: "EXPLORE",
    title: "ANDHRA PRADESH",
    tagline: "SPIRITUAL. SCENIC. UNFORGETTABLE.",
    quote: "\u201CTemple bells, hill trains and golden shores \u2014 the soul of the south awaits.\u201D",
    image: andhraHeroImg,
    alt: "Explore Andhra Pradesh - Spiritual. Scenic. Unforgettable.",
  },
  {
    eyebrow: "EXPLORE",
    title: "TAMIL NADU",
    tagline: "LAND OF HERITAGE, NATURE & SPIRITUALITY.",
    quote: "\u201CTemples, coastlines and cool hill escapes \u2014 a journey of culture in every direction.\u201D",
    image: tamilnaduHeroImg,
    alt: "Explore Tamil Nadu - Land of Heritage, Nature & Spirituality.",
  },
  {
    eyebrow: "PREMIUM FLEET",
    title: "TOYOTA INNOVA",
    tagline: "COMFORT. LUXURY. RELIABILITY.",
    quote: "\u201CSpacious executive travel crafted for long journeys, family tours and highway comfort.\u201D",
    image: fleetInnovaImg,
    alt: "Toyota Innova - Fortune Tourism Fleet",
  },
  {
    eyebrow: "GROUP TRAVEL",
    title: "TEMPO TRAVELLER",
    tagline: "SPACE. TOGETHERNESS. ADVENTURE.",
    quote: "\u201CComfortable luxury group touring for family outings, pilgrimages and corporate events.\u201D",
    image: fleetTempoImg,
    alt: "Force Tempo Traveller - Fortune Tourism Fleet",
  },
  {
    eyebrow: "LUXURY COMMUTE",
    title: "FORCE URBANIA",
    tagline: "MODERN. LUXURY. SPACIOUS.",
    quote: "\u201CNext-generation luxury van crafted for premium group touring and executive travel.\u201D",
    image: fleetUrbaniaImg,
    alt: "Force Urbania - Fortune Tourism Fleet",
  },
  {
    eyebrow: "CITY & OUTSTATION",
    title: "SWIFT DZIRE",
    tagline: "SMOOTH. EFFICIENT. ACCESSIBLE.",
    quote: "\u201CThe ideal sedan for fast airport transfers, business commutes and seamless city travel.\u201D",
    image: fleetDzireImg,
    alt: "Maruti Suzuki Dzire - Fortune Tourism Fleet",
  },
  {
    eyebrow: "EXECUTIVE SEDAN",
    title: "HONDA CITY",
    tagline: "ELEGANCE. COMFORT. PRESTIGE.",
    quote: "\u201CRefined luxury journeys and executive travel experiences with unmatched sophistication.\u201D",
    image: fleetHondaImg,
    alt: "Honda City - Fortune Tourism Fleet",
  },
];
import {
  BookOpen,
  ArrowLeft,
  Users,
  Car,
  Package,
  HardDrive,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  CheckCircle2,
  Clock,
  Upload,
  ExternalLink,
  ShieldCheck,
  ClipboardList,
  UserCog,
  Pencil,
  FileSpreadsheet,
  TrendingDown,
  CalendarDays,
  List,
  IndianRupee,
  Bus,
  TrainFront,
  Plane,
  Hotel,
  Smartphone,
  Receipt,
  Ticket,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  History,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Shield,
  Search,
  PhoneCall,
  MessageSquare,
  Home,
  CreditCard,
  TrendingUp,
  Wallet,
  Zap,
  User,
  Settings,
  X,
  Check,
  Phone,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Operations | Fortune Tourism" },
      {
        name: "description",
        content: "Fortune Tourism live database administration dashboard connected to PostgreSQL.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface Enquiry {
  id: string;
  enquiry_number?: string;
  created_at: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  service: string;
  pickup?: string;
  destination?: string;
  travel_date?: string;
  pickup_time?: string;
  passengers?: string;
  notes?: string;
  status: string;
  source?: string;
  trip_type?: string;
  vehicle_name?: string;
  car_type?: string;
}

interface TourPackageItem {
  id: string;
  slug: string;
  title: string;
  duration: string;
  from_city: string;
  starting_price: number;
  image: string;
  summary: string;
}

interface VehicleItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  seats: number;
  luggage: string;
  price_per_km: number;
  image: string;
  description: string;
  is_popular: boolean;
}

function AdminPage() {
  type ServiceNavKey =
    | "home"
    | "flight"
    | "bus"
    | "train"
    | "cars"
    | "hotel"
    | "packages"
    | "accounts"
    | "recharge"
    | "bill_payment"
    | "cab_booking_flow"
    | "ticket_booking_flow"
    | "tour_booking_flow";
  const [activeService, setActiveService] = useState<ServiceNavKey>("home");
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false);
  const bookingDropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterBooking = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setBookingDropdownOpen(true);
  };

  const handleMouseLeaveBooking = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setBookingDropdownOpen(false);
    }, 250);
  };

  const handleToggleBookingDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setBookingDropdownOpen((prev) => !prev);
  };

  const handleSelectBookingOption = (key: ServiceNavKey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveService(key);
    setBookingDropdownOpen(false);
  };

  // Accounts Dropdown states & handlers
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const accountsDropdownRef = useRef<HTMLDivElement>(null);
  const accountsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeAccountReport, setActiveAccountReport] = useState<AccountReportKey>("reports");

  const handleMouseEnterAccounts = () => {
    if (accountsHoverTimeoutRef.current) {
      clearTimeout(accountsHoverTimeoutRef.current);
      accountsHoverTimeoutRef.current = null;
    }
    setAccountsDropdownOpen(true);
  };

  const handleMouseLeaveAccounts = () => {
    accountsHoverTimeoutRef.current = setTimeout(() => {
      setAccountsDropdownOpen(false);
    }, 250);
  };

  const handleToggleAccountsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (accountsHoverTimeoutRef.current) {
      clearTimeout(accountsHoverTimeoutRef.current);
      accountsHoverTimeoutRef.current = null;
    }
    setAccountsDropdownOpen((prev) => !prev);
  };

  const handleSelectAccountOption = (reportKey: AccountReportKey) => {
    if (accountsHoverTimeoutRef.current) {
      clearTimeout(accountsHoverTimeoutRef.current);
      accountsHoverTimeoutRef.current = null;
    }
    setActiveAccountReport(reportKey);
    setActiveService("accounts");
    setAccountsDropdownOpen(false);
  };

  const [accountsTab, setAccountsTab] = useState<
    "business" | "statements" | "daily_expenses" | "payment_history" | "pending_payments"
  >("business");

  // Account Menu dropdown states & handlers
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [financialLedgersOpen, setFinancialLedgersOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [offlineBookingModalOpen, setOfflineBookingModalOpen] = useState(false);
  const [offlineBookingSource, setOfflineBookingSource] = useState<any>({});
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bookingDropdownRef.current && !bookingDropdownRef.current.contains(event.target as Node)) {
        setBookingDropdownOpen(false);
      }
      if (accountsDropdownRef.current && !accountsDropdownRef.current.contains(event.target as Node)) {
        setAccountsDropdownOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBookingDropdownOpen(false);
        setAccountsDropdownOpen(false);
        setAccountMenuOpen(false);
        setProfileModalOpen(false);
        setSettingsModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (accountsHoverTimeoutRef.current) {
        clearTimeout(accountsHoverTimeoutRef.current);
      }
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    "bookings" | "business" | "statements" | "daily_expenses" | "drivers" | "enquiries" | "packages" | "vehicles" | "storage" | "day_bookings" | "all_bookings" | "pending_payments" | "payment_history"
  >("business");

  // Admin Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<{ email?: string; role?: string; name?: string } | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState("adminfortunetourism@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Login destination background slides auto-cycle (4.5s interval with pause on hover)
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

  // Data states
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [packagesList, setPackagesList] = useState<TourPackageItem[]>(() =>
    packages.map((p, idx) => ({
      id: `pkg-${idx}`,
      slug: p.slug,
      title: p.title,
      duration: p.duration,
      from_city: p.from,
      starting_price: p.startingPrice || 4999,
      image: p.image,
      summary: p.summary,
    }))
  );
  const [adminPkgDurationFilter, setAdminPkgDurationFilter] = useState<string>("ALL");

  const filteredAdminPackages = useMemo(() => {
    if (adminPkgDurationFilter === "ALL") return packagesList;
    if (adminPkgDurationFilter === "1") {
      return packagesList.filter(
        (p) => (p.duration || "").toLowerCase().includes("1 day") || (p.duration || "").startsWith("1")
      );
    }
    if (adminPkgDurationFilter === "2") {
      return packagesList.filter(
        (p) => (p.duration || "").toLowerCase().includes("2 day") || (p.duration || "").startsWith("2")
      );
    }
    if (adminPkgDurationFilter === "3") {
      return packagesList.filter(
        (p) => (p.duration || "").toLowerCase().includes("3 day") || (p.duration || "").startsWith("3")
      );
    }
    if (adminPkgDurationFilter === "4") {
      return packagesList.filter(
        (p) => (p.duration || "").toLowerCase().includes("4 day") || (p.duration || "").startsWith("4")
      );
    }
    if (adminPkgDurationFilter === "5+") {
      return packagesList.filter((p) => {
        const num = parseInt((p.duration || "").split(" ")[0], 10);
        return !isNaN(num) && num >= 5;
      });
    }
    return packagesList;
  }, [packagesList, adminPkgDurationFilter]);
  const [vehiclesList, setVehiclesList] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSource, setFilterSource] = useState<string>("All");
  const [enquirySearch, setEnquirySearch] = useState<string>("");

  // New & Edit Package Modal / Form state
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TourPackageItem | null>(null);
  const [newPkg, setNewPkg] = useState({
    slug: "",
    title: "",
    duration: "3 Days · 2 Nights",
    from_city: "Bengaluru",
    starting_price: 12000,
    summary: "",
    image: "",
  });

  // New & Edit Vehicle Modal / Form state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVeh, setEditingVeh] = useState<VehicleItem | null>(null);
  const [newVeh, setNewVeh] = useState({
    slug: "",
    name: "",
    category: "Sedan",
    seats: 4,
    luggage: "2 bags",
    price_per_km: 14,
    description: "",
    image: "",
  });

  // Storage Upload state
  const [uploadBucket, setUploadBucket] = useState("images");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Booking Stats state
  const [bookingStats, setBookingStats] = useState({
    todayRevenue: 0,
    todayAdvanceCollected: 0,
    todayPending: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    pendingPayments: 0,
    fullyPaid: 0,
    partiallyPaid: 0,
    cancelled: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    taxiBookings: 0,
    busBookings: 0,
    trainBookings: 0,
    flightBookings: 0,
    ticketsPending: 0,
    pendingEnquiries: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminKey = sessionStorage.getItem("fortune_admin_key") || localStorage.getItem("fortune_admin_key") || "";
      const headers: Record<string, string> = {
        "x-admin-key": adminKey,
      };

      const [enqRes, pkgRes, vehRes, statsRes, bookRes] = await Promise.all([
        fetch("/api/enquiries", { headers }),
        fetch("/api/packages", { headers }),
        fetch("/api/vehicles", { headers }),
        fetch("/api/bookings/stats", { headers }),
        fetch("/api/bookings?limit=15", { headers }),
      ]);

      if (enqRes.ok) {
        const d = await enqRes.json();
        if (d.success) setEnquiries(d.enquiries || []);
      }
      if (pkgRes.ok) {
        const d = await pkgRes.json();
        if (d.success && Array.isArray(d.packages) && d.packages.length > 0) {
          setPackagesList(d.packages);
        }
      }
      if (vehRes.ok) {
        const d = await vehRes.json();
        if (d.success) setVehiclesList(d.vehicles || []);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success) setBookingStats(d.stats);
      }
      if (bookRes.ok) {
        const d = await bookRes.json();
        if (d.success && Array.isArray(d.bookings)) {
          setRecentBookings(d.bookings);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PostgreSQL database records");
    } finally {
      setLoading(false);
    }
  };

  // Check login on mount
  useEffect(() => {
    const key = sessionStorage.getItem("fortune_admin_key") || localStorage.getItem("fortune_admin_key");
    const authStr = sessionStorage.getItem("fortune_admin_auth") || localStorage.getItem("fortune_admin_auth");

    if (key === "Admin@fortunetourism2026") {
      // If admin visits bare /admin without explicit dashboard view, redirect automatically to Day Book
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const isExplicitDashboard =
        urlParams?.get("view") === "dashboard" ||
        urlParams?.has("category") ||
        urlParams?.has("tab");

      if (!isExplicitDashboard) {
        window.location.replace("/admin/day-book");
        return;
      }

      setIsAuthenticated(true);
      const catParam =
        urlParams?.get("category") ||
        urlParams?.get("tab") ||
        urlParams?.get("service");
      if (
        catParam === "packages" ||
        catParam === "tour_packages" ||
        catParam === "tours"
      ) {
        setActiveService("packages");
      } else if (catParam === "tour_booking_flow") {
        setActiveService("tour_booking_flow");
      } else if (catParam === "cars") {
        setActiveService("cars");
      } else if (catParam === "ticket_booking_flow") {
        setActiveService("ticket_booking_flow");
      } else if (catParam === "cab_booking_flow") {
        setActiveService("cab_booking_flow");
      } else {
        setActiveService("home");
      }
      if (authStr) {
        try {
          setAdminUser(JSON.parse(authStr));
        } catch {
          setAdminUser({ email: "adminfortunetourism@gmail.com", name: "Administrator" });
        }
      } else {
        setAdminUser({ email: "adminfortunetourism@gmail.com", name: "Administrator" });
      }
      fetchData();
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
        window.location.href = "/admin/day-book";
      } else {
        setLoginError(data.error || "Invalid login credentials.");
        toast.error(data.error || "Invalid Email or Password");
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      setLoginError("Connection failed. Please check your network and try again.");
      toast.error("Login failed. Please check network connection.");
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Enquiry marked as ${newStatus}`);
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
        );
      } else {
        toast.error(d.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/enquiries?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        toast.success("Enquiry deleted from PostgreSQL");
        setEnquiries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete enquiry");
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.title || !newPkg.slug) {
      toast.error("Title and slug are required");
      return;
    }
    const isEditing = Boolean(editingPkg?.id);
    try {
      const res = await fetch("/api/packages", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { id: editingPkg!.id, ...newPkg } : newPkg),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(
          isEditing
            ? "Tour Package updated in PostgreSQL!"
            : "New Tour Package saved to PostgreSQL database!",
        );
        if (isEditing) {
          setPackagesList((prev) =>
            prev.map((p) => (String(p.id) === String(editingPkg!.id) ? d.package : p)),
          );
        } else {
          setPackagesList([d.package, ...packagesList]);
        }
        setShowPackageForm(false);
        setEditingPkg(null);
        setNewPkg({
          slug: "",
          title: "",
          duration: "3 Days · 2 Nights",
          from_city: "Bengaluru",
          starting_price: 12000,
          summary: "",
          image: "",
        });
      } else {
        toast.error(d.error || "Failed to save package");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving package");
    }
  };

  const handleEditPackageClick = (pkg: TourPackageItem) => {
    setEditingPkg(pkg);
    setNewPkg({
      slug: pkg.slug || "",
      title: pkg.title || "",
      duration: pkg.duration || "3 Days · 2 Nights",
      from_city: pkg.from_city || "Bengaluru",
      starting_price: pkg.starting_price || 0,
      summary: pkg.summary || "",
      image: pkg.image || "",
    });
    setShowPackageForm(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Delete this tour package from PostgreSQL?")) return;
    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        toast.success("Package deleted");
        setPackagesList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting package");
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVeh.name || !newVeh.slug) {
      toast.error("Name and slug are required");
      return;
    }
    const isEditing = Boolean(editingVeh?.id);
    try {
      const res = await fetch("/api/vehicles", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { id: editingVeh!.id, ...newVeh } : newVeh),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(
          isEditing
            ? "Vehicle updated in PostgreSQL!"
            : "New Vehicle saved to PostgreSQL database!",
        );
        if (isEditing) {
          setVehiclesList((prev) =>
            prev.map((v) => (String(v.id) === String(editingVeh!.id) ? d.vehicle : v)),
          );
        } else {
          setVehiclesList([d.vehicle, ...vehiclesList]);
        }
        setShowVehicleForm(false);
        setEditingVeh(null);
        setNewVeh({
          slug: "",
          name: "",
          category: "Sedan",
          seats: 4,
          luggage: "2 bags",
          price_per_km: 14,
          description: "",
          image: "",
        });
      } else {
        toast.error(d.error || "Failed to save vehicle");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving vehicle");
    }
  };

  const handleEditVehicleClick = (veh: VehicleItem) => {
    setEditingVeh(veh);
    setNewVeh({
      slug: veh.slug || "",
      name: veh.name || "",
      category: veh.category || "Sedan",
      seats: veh.seats || 4,
      luggage: veh.luggage || "2 bags",
      price_per_km: veh.price_per_km || 14,
      description: veh.description || "",
      image: veh.image || "",
    });
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Delete vehicle from PostgreSQL?")) return;
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        toast.success("Vehicle deleted");
        setVehiclesList((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting vehicle");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", uploadBucket);

    try {
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Image uploaded & saved to PostgreSQL storage BYTEA table!");
        setUploadedUrl(d.file.url);
      } else {
        toast.error(d.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading file to PostgreSQL");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const statusNormalized = (e.status || "NEW").toUpperCase();
    const matchesStatus =
      filterStatus === "All" ||
      statusNormalized === filterStatus.toUpperCase() ||
      (filterStatus === "New" && (statusNormalized === "NEW" || statusNormalized === "PENDING"));

    const sourceVal = e.source || "HOME_BANNER_ENQUIRY";
    const matchesSource =
      filterSource === "All" ||
      (filterSource === "Home Banner" && (sourceVal === "HOME_BANNER_ENQUIRY" || !e.source)) ||
      (filterSource === "Website Booking" && sourceVal === "WEBSITE");

    const q = enquirySearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.name?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.enquiry_number?.toLowerCase().includes(q) ||
      e.pickup?.toLowerCase().includes(q) ||
      e.destination?.toLowerCase().includes(q) ||
      e.service?.toLowerCase().includes(q) ||
      e.notes?.toLowerCase().includes(q);

    return matchesStatus && matchesSource && matchesSearch;
  });

  const stats = [
    {
      label: "Total Revenue Today",
      value: `₹${Number(bookingStats.todayRevenue || 0).toLocaleString("en-IN")}`,
      subtext: "Today's Bookings Value",
      icon: TrendingUp,
      color: "text-emerald-700 bg-emerald-50",
      highlight: true,
      onClick: () => setActiveTab("day_bookings"),
    },
    {
      label: "Advance Collected Today",
      value: `₹${Number(bookingStats.todayAdvanceCollected || 0).toLocaleString("en-IN")}`,
      subtext: "Received Transactions",
      icon: CreditCard,
      color: "text-blue-700 bg-blue-50",
      highlight: true,
      onClick: () => setActiveTab("payment_history"),
    },
    {
      label: "Pending Today",
      value: `₹${Number(bookingStats.todayPending || 0).toLocaleString("en-IN")}`,
      subtext: "Remaining Unpaid Balance",
      icon: IndianRupee,
      color: "text-rose-700 bg-rose-50",
      highlight: true,
      onClick: () => setActiveTab("pending_payments"),
    },
    {
      label: "Today's Bookings",
      value: bookingStats.todayBookings.toString(),
      subtext: "Trips & Day Bookings",
      icon: CalendarDays,
      color: "text-sky-600 bg-sky-50",
      onClick: () => setActiveTab("day_bookings"),
    },
    {
      label: "Taxi Bookings",
      value: bookingStats.taxiBookings.toString(),
      icon: Car,
      color: "text-amber-600 bg-amber-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Bus Bookings",
      value: bookingStats.busBookings.toString(),
      icon: Bus,
      color: "text-orange-600 bg-orange-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Train Bookings",
      value: bookingStats.trainBookings.toString(),
      icon: TrainFront,
      color: "text-indigo-600 bg-indigo-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Flight Bookings",
      value: bookingStats.flightBookings.toString(),
      icon: Plane,
      color: "text-blue-600 bg-blue-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Pending Enquiries",
      value: bookingStats.pendingEnquiries.toString(),
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Tickets Pending",
      value: bookingStats.ticketsPending.toString(),
      icon: Ticket,
      color: "text-yellow-600 bg-yellow-50",
      onClick: () => setActiveTab("bookings"),
    },
    {
      label: "Remaining Payments",
      value: bookingStats.pendingPayments.toString(),
      icon: IndianRupee,
      color: "text-rose-600 bg-rose-50",
      onClick: () => setActiveTab("pending_payments"),
    },
    {
      label: "Fully Paid",
      value: bookingStats.fullyPaid.toString(),
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
      onClick: () => setActiveTab("all_bookings"),
    },
    {
      label: "Total Revenue (All Time)",
      value: `₹${Number(bookingStats.totalRevenue || 0).toLocaleString("en-IN")}`,
      subtext: "Net Lifetime Collections",
      icon: TrendingDown,
      color: "text-green-600 bg-green-50",
      onClick: () => setActiveTab("payment_history"),
    },
    {
      label: "Total Bookings",
      value: bookingStats.totalBookings.toString(),
      icon: ClipboardList,
      color: "text-purple-600 bg-purple-50",
      onClick: () => setActiveTab("all_bookings"),
    },
    {
      label: "New Enquiries",
      value: enquiries.filter((e) => (e.status || "").toUpperCase() === "NEW").length.toString(),
      icon: Users,
      color: "text-teal-600 bg-teal-50",
      onClick: () => setActiveTab("enquiries"),
    },
  ];

  if (authChecking) {
    return (
      <SiteLayout transparentHeader>
        <div className="min-h-[75vh] flex flex-col items-center justify-center py-20 bg-slate-50">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-600">Verifying Admin Authorization...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!isAuthenticated) {
    const currentSlide = LOGIN_DESTINATION_SLIDES[activeSlide] || LOGIN_DESTINATION_SLIDES[0];

    return (
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col bg-slate-50 text-slate-900">
        {/* Top Header: Clean White Section with Official Integrated Fortune Tourism Logo */}
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

        {/* Two-Column Layout below Header */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col justify-center">
          <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
            {/* Left Side (~65% width): All Existing Promotional Slides as an Automatic Slider */}
            <div
              className="w-full lg:w-[65%] bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative group"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              {/* Top Text Content belonging to the current slide */}
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

              {/* Center Image Container: All images with smooth cross-fade, no dark tint, object-contain */}
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

                {/* Previous Arrow Button */}
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#063f2d] border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Arrow Button */}
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#063f2d] border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Navigation Dots & Hover Status */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {LOGIN_DESTINATION_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeSlide
                          ? "w-6 bg-[#063f2d] shadow-2xs"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to ${slide.title} slide`}
                      title={slide.title}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSliderHovered ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span>{isSliderHovered ? "Paused on hover" : "Auto-sliding"}</span>
                </div>
              </div>
            </div>

            {/* Right Side (~35% width): Admin Login Credentials Form Card */}
            <div className="w-full lg:w-[35%] bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-center">
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#063f2d] text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200/60">
                  <Shield className="w-3.5 h-3.5 text-[#063f2d]" />
                  Admin Portal
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                  Sign In to Dashboard
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your administrator credentials to access fleet, bookings, and itinerary management.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="font-medium leading-tight">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    User ID / Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="adminfortunetourism@gmail.com"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loginLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px] font-medium text-slate-500">
                  Authorized Fortune Tourism Personnel Only
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalBookingCount =
    (bookingStats.flightBookings || 0) +
    (bookingStats.busBookings || 0) +
    (bookingStats.trainBookings || 0) +
    (bookingStats.taxiBookings || 0);

  const isBookingActive = ["flight", "bus", "train", "cars"].includes(activeService);

  const bookingDropdownItems = [
    { key: "flight" as const, label: "Flight", icon: Plane, count: bookingStats.flightBookings },
    { key: "bus" as const, label: "Bus", icon: Bus, count: bookingStats.busBookings },
    { key: "train" as const, label: "Train", icon: TrainFront, count: bookingStats.trainBookings },
    { key: "cars" as const, label: "Cars", icon: Car, count: bookingStats.taxiBookings },
  ];

  return (
    <SiteLayout transparentHeader hideFooter hideFloatingContact>
      {/* First Navigation Bar - Compact Top Header */}
      <header className="sticky top-0 z-50 w-full bg-[#063f2d] border-b border-[#086a46] shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 sm:h-14">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveService("home")}
                className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-xl p-1 transition"
                title="Fortune Tourism Admin"
              >
                <span className="grid place-items-center overflow-hidden rounded-xl bg-white h-8 w-8 sm:h-9 sm:w-9 shadow-xs shrink-0">
                  <img
                    src={logoAsset}
                    alt="Fortune Tourism Logo"
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="text-left">
                  <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight flex items-center gap-1.5 leading-none">
                    <span className="text-white">Fortune Tourism</span>
                    <span className="text-[#d79a17] font-black">Admin</span>
                  </h1>
                </div>
              </button>
            </div>

            {/* Right: Phone Number with clean Phone icon */}
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

      {/* Second Navigation Bar */}
      <nav className="sticky top-13 sm:top-14 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1.5">
            {/* Left: Day Book & Dashboard Buttons (Day Book appears FIRST) */}
            <div className="flex items-center gap-2">
              <Link
                to="/admin/day-book"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-slate-700 hover:text-[#063f2d] hover:bg-slate-100"
              >
                <BookOpen className="w-4 h-4" />
                <span>Day Book</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveService("home")}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeService === "home"
                    ? "bg-[#063f2d] text-white shadow-xs font-extrabold"
                    : "text-slate-700 hover:text-[#063f2d] hover:bg-slate-100"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveService("packages")}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeService === "packages" || activeService === "tour_booking_flow"
                    ? "bg-[#063f2d] text-white shadow-xs font-extrabold"
                    : "text-slate-700 hover:text-[#063f2d] hover:bg-slate-100"
                }`}
                title="View & manage holiday tour packages"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Tour Packages</span>
              </button>

              <button
                type="button"
                onClick={() => setOfflineBookingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-[color:var(--color-navy)] hover:brightness-110 text-white shadow-xs hover:scale-102 shrink-0"
                title="Create walk-in or phone reservations (Car, Bus, Train, Flight)"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Offline Booking</span>
                <span className="sm:hidden">Offline Booking</span>
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
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Account Dropdown Menu: Profile, Settings, Logout */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-72 sm:w-80 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-2.5 ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{adminUser?.name || "Fortune Tourism Administrator"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{adminUser?.email || "adminfortunetourism@gmail.com"}</p>
                    </div>

                    {/* Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#063f2d] hover:bg-emerald-50 transition text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Profile</span>
                    </button>

                    {/* Settings */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#063f2d] hover:bg-emerald-50 transition text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Settings</span>
                    </button>

                    {/* Financial Ledgers with Dropdown */}
                    <div className="mt-0.5 space-y-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFinancialLedgersOpen((prev) => !prev);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                          financialLedgersOpen || activeService === "accounts"
                            ? "bg-emerald-50 text-[#063f2d] border border-emerald-200/50"
                            : "text-slate-700 hover:text-[#063f2d] hover:bg-emerald-50/60"
                        }`}
                        aria-expanded={financialLedgersOpen}
                      >
                        <div className="flex items-center gap-2.5">
                          <IndianRupee className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Financial Ledgers</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                            financialLedgersOpen ? "rotate-180 text-[#063f2d]" : ""
                          }`}
                        />
                      </button>

                      {financialLedgersOpen && (
                        <div className="pl-1 pr-1 py-1 space-y-0.5 bg-slate-50/90 rounded-xl border border-slate-200/80 max-h-64 overflow-y-auto scrollbar-thin">
                          {REPORT_DEFINITIONS.map((r) => {
                            const Icon = r.icon;
                            const isSel = activeService === "accounts" && activeAccountReport === r.key;
                            return (
                              <button
                                key={r.key}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAccountReport(r.key);
                                  setActiveService("accounts");
                                  setAccountMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                                  isSel
                                    ? "bg-[#0b1329] text-amber-400 font-extrabold shadow-2xs border border-amber-400/30"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-amber-400" : r.color}`} />
                                <span className="truncate">{r.shortTitle}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Logout */}
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
        className="relative py-6 sm:py-8 min-h-[calc(100vh-108px)] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col justify-center"
        style={{ backgroundImage: `url('/taj-mahal-admin-bg.jpg')` }}
      >
        {/* Soft elegant gradient overlay to ensure perfect contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-900/50 to-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

        <div className="container-fortune relative z-10">
          {/* HOME SERVICE VIEW: MODERN ADMIN DASHBOARD */}
          {activeService === "home" && (
            <>
              {/* New Offline Booking Quick Action Bar with Service Selection Buttons */}
              <div className="mb-6 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#063f2d] to-[#086a46] text-white flex items-center justify-center shadow-md shrink-0">
                      <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900">
                          New Offline Booking
                        </h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Car · Bus · Train · Flight
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                        Create walk-in or phone reservations, record custom pricing, passenger manifests, and token advance payments.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOfflineBookingSource({});
                      setOfflineBookingModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-navy)] px-4 py-2.5 text-xs font-bold text-white shadow hover:brightness-110 cursor-pointer shrink-0 transition-transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4" /> Quick Offline Booking
                  </button>
                </div>

                {/* The 3 Service Selection Cards / Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-5 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveService("cab_booking_flow");
                    }}
                    className="relative text-center p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between items-center group overflow-hidden shadow-xl backdrop-blur-xl border-t-4 border-t-emerald-400 hover:border-emerald-400/80 shadow-emerald-500/10 bg-[#0B132B]/95 hover:bg-[#101e42] border-white/15 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-full my-auto py-3">
                      <div className="font-black text-xl sm:text-2xl tracking-tight leading-tight text-white group-hover:text-emerald-300 transition-colors">
                        Cab Booking
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <div className="w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl text-center font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md bg-[#00c58e] group-hover:bg-[#00a87a] text-white shadow-[#00c58e]/25">
                        SELECT
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveService("ticket_booking_flow");
                    }}
                    className="relative text-center p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between items-center group overflow-hidden shadow-xl backdrop-blur-xl border-t-4 border-t-amber-400 hover:border-amber-400/80 shadow-amber-500/10 bg-[#0B132B]/95 hover:bg-[#101e42] border-white/15 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-full my-auto py-3">
                      <div className="font-black text-xl sm:text-2xl tracking-tight leading-tight text-white group-hover:text-amber-300 transition-colors">
                        Ticket Booking
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <div className="w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl text-center font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md bg-[#00c58e] group-hover:bg-[#00a87a] text-white shadow-[#00c58e]/25">
                        SELECT
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveService("packages");
                    }}
                    className="relative text-center p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between items-center group overflow-hidden shadow-xl backdrop-blur-xl border-t-4 border-t-purple-400 hover:border-purple-400/80 shadow-purple-500/10 bg-[#0B132B]/95 hover:bg-[#101e42] border-white/15 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-full my-auto py-3">
                      <div className="font-black text-xl sm:text-2xl tracking-tight leading-tight text-white group-hover:text-purple-300 transition-colors">
                        Tour Packages
                      </div>
                      <p className="text-[11px] text-purple-200/80 font-medium mt-1">
                        Holiday packages, 1-day tours &amp; tariffs
                      </p>
                    </div>
                    <div className="mt-4 w-full">
                      <div className="w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl text-center font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md bg-[#00c58e] group-hover:bg-[#00a87a] text-white shadow-[#00c58e]/25">
                        SELECT
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Booking Itinerary Service Cards */}
              <div className="mb-2">
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-heading drop-shadow-md tracking-tight">
                    Select Your Category
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Cab Booking",
                      description: "Airport transfers, local city rentals & outstation cab fleet tracking",
                      icon: Car,
                      badge: `${vehiclesList.length || 8} Vehicles`,
                      iconBg: "bg-emerald-50 text-[#063f2d]",
                      onClick: () => setActiveService("cars"),
                    },
                    {
                      title: "Ticket Booking",
                      description: "Issue tickets, track PNRs, generate official PDF vouchers & ticket copies",
                      icon: Ticket,
                      badge: "Ticketing Hub",
                      iconBg: "bg-blue-50 text-blue-700",
                      onClick: () => setActiveService("ticket_booking_flow"),
                    },
                    {
                      title: "Tour Packages",
                      description: "Curate South India holiday itineraries, seasonal tariffs & packages",
                      icon: Package,
                      badge: `${packagesList.length || 0} Packages`,
                      iconBg: "bg-amber-50 text-[#d79a17]",
                      onClick: () => setActiveService("packages"),
                    },
                    {
                      title: "Flight Booking",
                      description: "Domestic & international airline reservations, flight manifests & airfares",
                      icon: Plane,
                      badge: `${bookingStats.flightBookings || 0} Bookings`,
                      iconBg: "bg-sky-50 text-sky-700",
                      onClick: () => setActiveService("flight"),
                    },
                    {
                      title: "Bus Booking",
                      description: "Intercity sleeper, Volvo multi-axle & private bus seat allocations",
                      icon: Bus,
                      badge: `${bookingStats.busBookings || 0} Bookings`,
                      iconBg: "bg-orange-50 text-orange-700",
                      onClick: () => setActiveService("bus"),
                    },
                    {
                      title: "Hotel Booking",
                      description: "Resort suites, business hotel reservations, check-in schedules & tariffs",
                      icon: Hotel,
                      badge: "Stays & Resorts",
                      iconBg: "bg-indigo-50 text-indigo-700",
                      onClick: () => setActiveService("hotel"),
                    },
                  ].map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.title}
                        type="button"
                        onClick={service.onClick}
                        className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-5 shadow-lg hover:shadow-2xl hover:border-amber-400 hover:bg-white hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${service.iconBg}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900 transition shadow-2xs">
                              {service.badge}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#063f2d] transition">
                            {service.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                            {service.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#063f2d] group-hover:text-[#d79a17] transition">
                          <span>Open Service Panel</span>
                          <span className="text-sm leading-none transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
      {/* END HOME SERVICE VIEW */}

          {/* CAB BOOKING FLOW (OFFLINE MULTI-STEP FLOW) */}
          {activeService === "cab_booking_flow" && (
            <AdminCabBookingFlow
              onBack={() => setActiveService("home")}
              onBookingCompleted={fetchData}
            />
          )}

          {/* TICKET / TRAIN BOOKING FLOW (OFFLINE MULTI-STEP FLOW) */}
          {activeService === "ticket_booking_flow" && (
            <AdminTicketBookingFlow
              onBack={() => setActiveService("home")}
              onBookingCompleted={fetchData}
            />
          )}

          {/* TOUR PACKAGES BOOKING FLOW (OFFLINE MULTI-STEP FLOW) */}
          {activeService === "tour_booking_flow" && (
            <AdminTourBookingFlow
              onBack={() => setActiveService("home")}
              onOpenPackagesManagement={() => setActiveService("packages")}
              onBookingCompleted={fetchData}
            />
          )}

          {/* FLIGHT MANAGEMENT SECTION */}
          {activeService === "flight" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                      <Plane className="w-3.5 h-3.5" />
                      AIRLINE TICKETING &amp; FLIGHT OPERATIONS
                    </div>
                    <h2 className="text-2xl font-black text-white">Flight Management Section</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Manage domestic &amp; international flight bookings, PNR issues, ticket copy PDF generation, and passenger manifests.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-bold px-3.5 py-2 rounded-xl">
                      IndiGo · Air India · Akasa · SpiceJet
                    </span>
                  </div>
                </div>
              </div>

              {/* Flight Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Flight Bookings</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">{bookingStats.flightBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Confirmed air reservations</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Flight Enquiries</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {enquiries.filter((e) => (e.service || "").toUpperCase().includes("FLIGHT")).length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Airfare quote requests</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Tickets Pending</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{bookingStats.ticketsPending}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Requires PDF dispatch</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Payment Status</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">Live Gateway</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Connected to PostgreSQL</p>
                </div>
              </div>

              <BookingsManager initialTab="FLIGHT" />
            </div>
          )}

          {/* BUS MANAGEMENT SECTION */}
          {activeService === "bus" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                      <Bus className="w-3.5 h-3.5" />
                      INTERCITY &amp; PRIVATE BUS FLEET
                    </div>
                    <h2 className="text-2xl font-black text-white">Bus Management Section</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Manage AC Sleeper, Semi-Sleeper, KSRTC/SETC and private bus passenger manifests, boarding points, and seat allotments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-900/60 border border-orange-500/40 text-orange-200 text-xs font-bold px-3.5 py-2 rounded-xl">
                      Multi-Axle · AC Sleeper · Volvo
                    </span>
                  </div>
                </div>
              </div>

              {/* Bus Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Bus Bookings</p>
                  <p className="text-2xl font-black text-orange-600 mt-1">{bookingStats.busBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Confirmed bus seats</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Bus Enquiries</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {enquiries.filter((e) => (e.service || "").toUpperCase().includes("BUS")).length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Route &amp; timing requests</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Day Trips &amp; Routes</p>
                  <p className="text-2xl font-black text-sky-600 mt-1">{bookingStats.todayBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active departures today</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Fleet Operations</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">Operational</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live fleet dispatcher</p>
                </div>
              </div>

              <BookingsManager initialTab="BUS" />
            </div>
          )}

          {/* HOTEL MANAGEMENT SECTION */}
          {activeService === "hotel" && <HotelAdminManager />}

          {/* RECHARGE MANAGEMENT SECTION */}
          {activeService === "recharge" && <RechargeAdminManager />}

          {/* BILL PAYMENT MANAGEMENT SECTION */}
          {activeService === "bill_payment" && <BillPaymentAdminManager />}

          {/* TRAIN MANAGEMENT SECTION */}
          {activeService === "train" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                      <TrainFront className="w-3.5 h-3.5" />
                      IRCTC RAILWAY RESERVATIONS &amp; PNR
                    </div>
                    <h2 className="text-2xl font-black text-white">Train Management Section</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Monitor Tatkal requests, General quota PNR confirmations, Berth allotments (up to 6 passengers per ticket copy), and refund tracking.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold px-3.5 py-2 rounded-xl">
                      1A · 2A · 3A · SL · Tatkal Quota
                    </span>
                  </div>
                </div>
              </div>

              {/* Train Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Train Bookings</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{bookingStats.trainBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">IRCTC confirmed tickets</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Train Enquiries</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {enquiries.filter((e) => (e.service || "").toUpperCase().includes("TRAIN")).length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tatkal &amp; waitlist checks</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Ticket Copy Pending</p>
                  <p className="text-2xl font-black text-yellow-600 mt-1">{bookingStats.ticketsPending}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Requires client dispatch</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Berth Optimization</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">Active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Auto coach/berth generator</p>
                </div>
              </div>

              <BookingsManager initialTab="TRAIN" />
            </div>
          )}

          {/* CARS BOOKING MANAGEMENT SECTION */}
          {activeService === "cars" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                      <Car className="w-3.5 h-3.5" />
                      CAR RENTALS, TAXIS &amp; FLEET MANAGEMENT
                    </div>
                    <h2 className="text-2xl font-black text-white">Car Booking Management</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Manage local city cabs, outstation trips, airport transfers, chauffeur allotments, and fleet vehicle status.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl">
                      Sedan · SUV · Innova Crysta · Tempo Traveller
                    </span>
                  </div>
                </div>
              </div>

              {/* Cars Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Taxi / Car Bookings</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{bookingStats.taxiBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active &amp; completed car rentals</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Fleet Vehicles</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{vehiclesList.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Commercial fleet ready</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Today's Day Trips</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{bookingStats.todayBookings}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Assigned &amp; on road</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Fleet Status</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">Operational</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live GPS &amp; driver dispatch</p>
                </div>
              </div>

              <BookingsManager initialTab="CAR" />
            </div>
          )}

          {/* TOURISM PACKAGES MANAGEMENT SECTION */}
          {activeService === "packages" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                      <Package className="w-3.5 h-3.5" />
                      HOLIDAY TOURS &amp; ITINERARIES
                    </div>
                    <h2 className="text-2xl font-black text-white">Tourism Packages Management</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Create, customize, price, and manage tour packages across Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, and Goa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveService("home")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/15 hover:bg-white/10 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-amber-400" /> Back to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveService("tour_booking_flow")}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-105"
                    >
                      <Plus className="w-4 h-4" /> Tour Booking Flow
                    </button>
                    <button
                      onClick={() => {
                        setEditingPkg(null);
                        setNewPkg({
                          slug: "",
                          title: "",
                          duration: "3 Days · 2 Nights",
                          from_city: "Bengaluru",
                          starting_price: 12000,
                          summary: "",
                          image: "",
                        });
                        setShowPackageForm(true);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
                    >
                      <Plus className="w-4 h-4" /> Add New Package
                    </button>
                  </div>
                </div>
              </div>

              {/* Package Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Total Tour Packages</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{packagesList.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Published on website</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Popular Destinations</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">Ooty · Coorg · Munnar</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">South India circuits</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Package Enquiries</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {enquiries.filter((e) => (e.service || "").toUpperCase().includes("TOUR") || (e.service || "").toUpperCase().includes("PACKAGE")).length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Holiday quote requests</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <p className="text-xs font-bold uppercase text-slate-500">Hub City</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">Bengaluru</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Primary departure origin</p>
                </div>
              </div>

              {/* Add / Edit Package Modal */}
              {showPackageForm && (
                <form
                  onSubmit={handleSavePackage}
                  className="mb-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-xl grid gap-4 sm:grid-cols-2 animate-in fade-in duration-200"
                >
                  <h3 className="sm:col-span-2 font-black text-base border-b pb-2 text-slate-900 flex items-center justify-between">
                    <span>{editingPkg ? `Edit Package: ${editingPkg.title}` : "Add New Tour Package"}</span>
                    <button
                      type="button"
                      onClick={() => setShowPackageForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕ Cancel
                    </button>
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Title *</label>
                    <input
                      value={newPkg.title}
                      onChange={(e) =>
                        setNewPkg({
                          ...newPkg,
                          title: e.target.value,
                          slug: editingPkg
                            ? newPkg.slug
                            : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        })
                      }
                      placeholder="e.g. Bengaluru → Coorg Hill Station Special"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Slug *</label>
                    <input
                      value={newPkg.slug}
                      onChange={(e) => setNewPkg({ ...newPkg, slug: e.target.value })}
                      placeholder="e.g. bengaluru-coorg-hill-station"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Duration (Select Days of Trip)</label>
                    <select
                      value={newPkg.duration}
                      onChange={(e) => setNewPkg({ ...newPkg, duration: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="1 Day · Same Day">1 Day · Same Day Return</option>
                      <option value="2 Days · 1 Night">2 Days · 1 Night</option>
                      <option value="3 Days · 2 Nights">3 Days · 2 Nights</option>
                      <option value="4 Days · 3 Nights">4 Days · 3 Nights</option>
                      <option value="5 Days · 4 Nights">5 Days · 4 Nights</option>
                      <option value="6 Days · 5 Nights">6 Days · 5 Nights</option>
                      <option value="7 Days · 6 Nights">7 Days · 6 Nights</option>
                      <option value="8 Days · 7 Nights">8 Days · 7 Nights</option>
                      <option value="10 Days · 9 Nights">10 Days · 9 Nights</option>
                      <option value="12 Days · 11 Nights">12 Days · 11 Nights</option>
                      <option value="14 Days · 13 Nights">14 Days · 13 Nights</option>
                    </select>

                    {/* Quick selection day buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        "1 Day",
                        "2 Days · 1 Night",
                        "3 Days · 2 Nights",
                        "4 Days · 3 Nights",
                        "5 Days · 4 Nights",
                        "6 Days · 5 Nights",
                        "7 Days · 6 Nights",
                      ].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setNewPkg({ ...newPkg, duration: d })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            newPkg.duration === d
                              ? "bg-amber-500 text-slate-900 border-amber-600 font-extrabold shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">From City</label>
                    <input
                      value={newPkg.from_city}
                      onChange={(e) => setNewPkg({ ...newPkg, from_city: e.target.value })}
                      placeholder="Bengaluru"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Starting Price (₹)</label>
                    <input
                      type="number"
                      value={newPkg.starting_price}
                      onChange={(e) => setNewPkg({ ...newPkg, starting_price: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Image URL</label>
                    <input
                      value={newPkg.image}
                      onChange={(e) => setNewPkg({ ...newPkg, image: e.target.value })}
                      placeholder="/images/packages/coorg.jpg"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Summary / Highlights</label>
                    <textarea
                      value={newPkg.summary}
                      onChange={(e) => setNewPkg({ ...newPkg, summary: e.target.value })}
                      rows={3}
                      placeholder="Detailed itinerary overview, inclusions, sightseeing points..."
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPackageForm(false)}
                      className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 text-xs"
                    >
                      {editingPkg ? "Update Package in Database" : "Save Package to Database"}
                    </button>
                  </div>
                </form>
              )}

              {/* Trip Duration Filter Bar in Admin */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-700">Filter by Trip Days:</span>
                  {adminPkgDurationFilter === "1" ? (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                      ⚡ 1-Day Same Day Tours ({filteredAdminPackages.length} packages)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500">
                      ({filteredAdminPackages.length} packages available)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { key: "ALL", label: "All Packages", icon: "✨" },
                    { key: "1", label: "⚡ 1 Day Trip", icon: "⚡" },
                    { key: "2", label: "2 Days (1N)", icon: "🌿" },
                    { key: "3", label: "3 Days (2N)", icon: "🌄" },
                    { key: "4", label: "4 Days (3N)", icon: "🏖️" },
                    { key: "5+", label: "5+ Days", icon: "🌟" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setAdminPkgDurationFilter(f.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        adminPkgDurationFilter === f.key
                          ? "bg-amber-500 text-slate-900 font-black shadow-xs ring-2 ring-amber-500/50"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Packages Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAdminPackages.map((pkg) => (
                  <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      {pkg.image && (
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="h-36 w-full rounded-xl object-cover mb-3 bg-slate-100"
                        />
                      )}
                      <h3 className="font-extrabold text-slate-900 text-sm">{pkg.title}</h3>
                      <p className="text-xs font-medium text-amber-700 mt-1">
                        {pkg.duration} · From {pkg.from_city}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{pkg.summary}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Starting from</span>
                        <p className="text-base font-black text-slate-900">
                          ₹{Number(pkg.starting_price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPackageClick(pkg)}
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Package"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete Package"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAdminPackages.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                  <p className="text-sm font-bold text-slate-700">No packages found for this duration filter.</p>
                  <button
                    type="button"
                    onClick={() => setAdminPkgDurationFilter("ALL")}
                    className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Reset filter to view all packages
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ACCOUNTS & FINANCIAL OPERATIONS SECTION */}
          {activeService === "accounts" && (
            <AccountsReportsHub
              initialReport={activeAccountReport}
              onSelectReport={(k) => setActiveAccountReport(k)}
            />
          )}
        </div>
      </section>

      {/* Admin Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#063f2d] p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="absolute right-4 top-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#d79a17] mx-auto flex items-center justify-center text-white text-2xl font-black mb-2 shadow-inner">
                <Shield className="w-8 h-8 text-[#d79a17]" />
              </div>
              <h3 className="text-lg font-black text-white">Administrator Profile</h3>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">Fortune Tourism Operations Authority</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Full Name</span>
                  <span className="font-extrabold text-slate-900">{adminUser?.name || "Fortune Tourism Administrator"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Email / User ID</span>
                  <span className="font-extrabold text-slate-900">{adminUser?.email || "adminfortunetourism@gmail.com"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Access Role</span>
                  <span className="inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#063f2d] text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> SUPER ADMIN
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Database Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live PostgreSQL
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  <Check className="w-4 h-4 text-amber-700" /> Full System Privileges Active
                </p>
                Authorized to dispatch cabs, manage flight/train/bus manifests, edit packages, and reconcile financial ledgers.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0b1329] p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-amber-400 mx-auto flex items-center justify-center text-white text-2xl font-black mb-2 shadow-inner">
                <Settings className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-white">System Settings</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Application Preferences &amp; Synchronization</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Timezone</span>
                  <span className="font-extrabold text-slate-900">Asia/Kolkata (IST +05:30)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Default Currency</span>
                  <span className="font-extrabold text-slate-900">Indian Rupee (INR - ₹)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Auto-Sync Frequency</span>
                  <span className="font-extrabold text-emerald-700">Realtime on Page Load</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Security Protocol</span>
                  <span className="font-extrabold text-slate-900">Secure Header Key &amp; SameSite Cookie</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchData();
                    toast.success("All live database records synchronized!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#063f2d] hover:bg-[#086a46] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Data Now
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Booking Form Modal */}
      <BookingFormModal
        open={offlineBookingModalOpen}
        onClose={() => setOfflineBookingModalOpen(false)}
        onSaved={() => {
          setOfflineBookingModalOpen(false);
          fetchData();
        }}
        mode="create"
        source={offlineBookingSource}
      />
    </SiteLayout>
  );
}
