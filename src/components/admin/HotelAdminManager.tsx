import { useState } from "react";
import {
  Hotel,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  IndianRupee,
  Phone,
  FileText,
  Building2,
  Bed,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface HotelBooking {
  id: string;
  bookingRef: string;
  guestName: string;
  guestPhone: string;
  hotelName: string;
  city: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  guests: number;
  totalAmount: number;
  advancePaid: number;
  status: "Confirmed" | "Pending" | "Checked In" | "Checked Out" | "Cancelled";
  voucherSent: boolean;
}

const INITIAL_HOTEL_BOOKINGS: HotelBooking[] = [
  {
    id: "HTL-101",
    bookingRef: "FT-HTL-2026-081",
    guestName: "Rajesh Sharma",
    guestPhone: "+91 98450 12345",
    hotelName: "Fortune Grand Heritage",
    city: "Mysuru",
    roomType: "Deluxe Suite King",
    checkIn: "2026-09-05",
    checkOut: "2026-09-08",
    nights: 3,
    rooms: 1,
    guests: 2,
    totalAmount: 14500,
    advancePaid: 5000,
    status: "Confirmed",
    voucherSent: true,
  },
  {
    id: "HTL-102",
    bookingRef: "FT-HTL-2026-082",
    guestName: "Sneha Reddy",
    guestPhone: "+91 97312 99881",
    hotelName: "The Promenade White Town",
    city: "Puducherry",
    roomType: "Sea View Executive",
    checkIn: "2026-09-10",
    checkOut: "2026-09-13",
    nights: 3,
    rooms: 2,
    guests: 4,
    totalAmount: 28000,
    advancePaid: 10000,
    status: "Confirmed",
    voucherSent: true,
  },
  {
    id: "HTL-103",
    bookingRef: "FT-HTL-2026-083",
    guestName: "Arun Kumar",
    guestPhone: "+91 94481 33221",
    hotelName: "Sterling Resort & Spa",
    city: "Ooty",
    roomType: "Valley View Chalet",
    checkIn: "2026-09-12",
    checkOut: "2026-09-14",
    nights: 2,
    rooms: 1,
    guests: 2,
    totalAmount: 11200,
    advancePaid: 0,
    status: "Pending",
    voucherSent: false,
  },
  {
    id: "HTL-104",
    bookingRef: "FT-HTL-2026-084",
    guestName: "Venkatesh Babu",
    guestPhone: "+91 99001 44552",
    hotelName: "Kumarakom Lake Luxury Resort",
    city: "Alleppey",
    roomType: "Heritage Lake Villa",
    checkIn: "2026-09-18",
    checkOut: "2026-09-21",
    nights: 3,
    rooms: 1,
    guests: 3,
    totalAmount: 39500,
    advancePaid: 39500,
    status: "Confirmed",
    voucherSent: true,
  },
  {
    id: "HTL-105",
    bookingRef: "FT-HTL-2026-085",
    guestName: "Priyanka Joshi",
    guestPhone: "+91 98860 77112",
    hotelName: "Coffee County Forest Resort",
    city: "Chikmagalur",
    roomType: "Plantation Cottage",
    checkIn: "2026-09-02",
    checkOut: "2026-09-04",
    nights: 2,
    rooms: 1,
    guests: 2,
    totalAmount: 9800,
    advancePaid: 9800,
    status: "Checked In",
    voucherSent: true,
  },
];

interface HotelAdminManagerProps {
  onOpenBookingFlow?: () => void;
}

export function HotelAdminManager({ onOpenBookingFlow }: HotelAdminManagerProps = {}) {
  const [bookings, setBookings] = useState<HotelBooking[]>(() => {
    try {
      const saved = localStorage.getItem("fortune_hotel_bookings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p: any) => p.id));
          const remainingDefaults = INITIAL_HOTEL_BOOKINGS.filter((item) => !ids.has(item.id));
          return [...parsed, ...remainingDefaults];
        }
      }
    } catch (e) {
      console.warn("Could not read fortune_hotel_bookings from storage", e);
    }
    return INITIAL_HOTEL_BOOKINGS;
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guestName: "",
    guestPhone: "",
    hotelName: "",
    city: "Bengaluru",
    roomType: "Deluxe AC Room",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: "",
    nights: 2,
    rooms: 1,
    guests: 2,
    totalAmount: 6000,
    advancePaid: 2000,
  });

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.toLowerCase().includes(q) ||
      b.hotelName.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.bookingRef.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalValue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed" || b.status === "Checked In").length;
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  const handleUpdateStatus = (id: string, newStatus: HotelBooking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    toast.success(`Booking ${id} status updated to ${newStatus}`);
  };

  const handleSendVoucher = (b: HotelBooking) => {
    setBookings((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, voucherSent: true } : item))
    );
    toast.success(`Hotel confirmation voucher dispatched to ${b.guestPhone}`);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.guestName || !newBooking.hotelName || !newBooking.guestPhone) {
      toast.error("Please fill in required fields");
      return;
    }
    const newId = `HTL-${100 + bookings.length + 1}`;
    const newRef = `FT-HTL-2026-0${80 + bookings.length + 1}`;
    const entry: HotelBooking = {
      id: newId,
      bookingRef: newRef,
      guestName: newBooking.guestName,
      guestPhone: newBooking.guestPhone,
      hotelName: newBooking.hotelName,
      city: newBooking.city,
      roomType: newBooking.roomType,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut || newBooking.checkIn,
      nights: Number(newBooking.nights),
      rooms: Number(newBooking.rooms),
      guests: Number(newBooking.guests),
      totalAmount: Number(newBooking.totalAmount),
      advancePaid: Number(newBooking.advancePaid),
      status: "Confirmed",
      voucherSent: true,
    };
    setBookings([entry, ...bookings]);
    setShowModal(false);
    toast.success("Hotel reservation created successfully!");
    setNewBooking({
      guestName: "",
      guestPhone: "",
      hotelName: "",
      city: "Bengaluru",
      roomType: "Deluxe AC Room",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: "",
      nights: 2,
      rooms: 1,
      guests: 2,
      totalAmount: 6000,
      advancePaid: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
              <Hotel className="w-3.5 h-3.5" />
              HOTEL &amp; RESORT RESERVATIONS
            </div>
            <h2 className="text-2xl font-black text-white">Hotel Management Section</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Manage client hotel reservations, room vouchers, check-in schedules, and partner resort allotments.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenBookingFlow && (
              <button
                type="button"
                onClick={onOpenBookingFlow}
                className="inline-flex items-center gap-2 bg-[#00c58e] hover:bg-[#00a87a] text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#00c58e]/20 transition-all cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4" /> New Hotel Booking Flow
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Quick Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Total Hotel Bookings</p>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{bookings.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across South India &amp; All Destinations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Confirmed / Active</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{confirmedCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Vouchers confirmed &amp; verified</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Pending Confirmation</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Awaiting hotel confirmation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Total Hotel Value</p>
            <IndianRupee className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalValue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Gross room booking turnover</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Guest, Hotel, City or Ref..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {["All", "Confirmed", "Pending", "Checked In", "Checked Out"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0b1329] text-amber-400"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3">Booking Ref</th>
                <th className="px-4 py-3">Guest Details</th>
                <th className="px-4 py-3">Hotel &amp; City</th>
                <th className="px-4 py-3">Room &amp; Stay</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                    No hotel bookings match the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const balance = b.totalAmount - b.advancePaid;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                        {b.bookingRef}
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">ID: {b.id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {b.guestName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {b.guestPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-800">{b.hotelName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {b.city}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Bed className="w-3 h-3 text-slate-500" />
                          {b.roomType}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.checkIn} to {b.checkOut} · {b.nights}N ({b.guests} Guests)
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-900">₹{b.totalAmount.toLocaleString("en-IN")}</div>
                        <div className="text-[10px] text-slate-500">
                          Adv: ₹{b.advancePaid.toLocaleString("en-IN")}
                          {balance > 0 ? (
                            <span className="text-rose-600 font-bold ml-1">· Bal: ₹{balance.toLocaleString("en-IN")}</span>
                          ) : (
                            <span className="text-emerald-600 font-bold ml-1">· Paid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            b.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.status === "Checked In"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : b.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {b.status === "Confirmed" && <CheckCircle2 className="w-3 h-3" />}
                          {b.status === "Pending" && <Clock className="w-3 h-3" />}
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleSendVoucher(b)}
                          title="Dispatch Booking Voucher"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {b.status === "Pending" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "Confirmed")}
                            title="Confirm Booking"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-bold"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status === "Confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "Checked In")}
                            title="Mark Checked In"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-bold"
                          >
                            Check-In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hotel Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Hotel className="w-5 h-5 text-amber-600" /> New Hotel Reservation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
                  placeholder="e.g. Ramesh Naidu"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newBooking.guestPhone}
                    onChange={(e) => setNewBooking({ ...newBooking, guestPhone: e.target.value })}
                    placeholder="e.g. 9964600247 / 9740463404"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Destination</label>
                  <input
                    type="text"
                    value={newBooking.city}
                    onChange={(e) => setNewBooking({ ...newBooking, city: e.target.value })}
                    placeholder="e.g. Ooty, Mysuru"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotel / Resort Name *</label>
                <input
                  type="text"
                  required
                  value={newBooking.hotelName}
                  onChange={(e) => setNewBooking({ ...newBooking, hotelName: e.target.value })}
                  placeholder="e.g. Taj West End / Fortune Park"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Type</label>
                  <input
                    type="text"
                    value={newBooking.roomType}
                    onChange={(e) => setNewBooking({ ...newBooking, roomType: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={newBooking.checkIn}
                    onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={newBooking.nights}
                    onChange={(e) => setNewBooking({ ...newBooking, nights: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total (₹)</label>
                  <input
                    type="number"
                    value={newBooking.totalAmount}
                    onChange={(e) => setNewBooking({ ...newBooking, totalAmount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance (₹)</label>
                  <input
                    type="number"
                    value={newBooking.advancePaid}
                    onChange={(e) => setNewBooking({ ...newBooking, advancePaid: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
