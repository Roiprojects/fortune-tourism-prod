import { useState } from "react";
import {
  Printer,
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Ticket,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface TourPackageOption {
  duration: string;
  name: string;
  price: number;
}

const TOUR_PACKAGES: TourPackageOption[] = [
  { duration: "1 Day Tour", name: "Bangalore Sight Seeing", price: 1000 },
  { duration: "1 Day Tour", name: "Mysore Sight Seeing", price: 1500 },
  { duration: "2 Day's Tour", name: "Mysore-Ooty Sight Seeing", price: 4500 },
  { duration: "3 Day's Tour", name: "Mysore-Ooty-Coonoor S S", price: 7500 },
];

export function TourPackageTicketCopySection() {
  const [selectedPkg, setSelectedPkg] = useState<TourPackageOption | null>(TOUR_PACKAGES[0]);
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(true);

  // Ticket Copy form state matching attached format
  const [travellingType, setTravellingType] = useState("CAR");
  const [passengerName, setPassengerName] = useState("FORTUNE GROUP");
  const [passengerPhoneNo, setPassengerPhoneNo] = useState("9845003000");
  const [tourType, setTourType] = useState("LOCAL TRIP");
  const [ticketNumber, setTicketNumber] = useState("FT3423CZ");
  const [pnrNumber, setPnrNumber] = useState("FC17G3423");
  const [departureOn, setDepartureOn] = useState("14-07-2017.10.45");
  const [tripType, setTripType] = useState("PACKAGE");
  const [typeOfCar, setTypeOfCar] = useState("MARUTI SUZUKI CIAZ");
  const [boardingPoint, setBoardingPoint] = useState("BANGALORE AIRPORT");
  const [fromPoint, setFromPoint] = useState("BANGALORE");
  const [toPoint, setToPoint] = useState("BANGALORE");
  const [driverName, setDriverName] = useState("ZAMEER");
  const [phoneNo, setPhoneNo] = useState("9740463404");
  const [taxiNumber, setTaxiNumber] = useState("KA 51 AA 598");
  const [packageName, setPackageName] = useState("BANGALORE SIGHT SEEING ONE DAY");
  const [exactBoardingPoint, setExactBoardingPoint] = useState(
    "AKASH GUEST HOUSE BOMMASANDRA BANGALORE",
  );
  const [amount, setAmount] = useState<number>(1000);
  const [balanceAmount, setBalanceAmount] = useState<number>(9000);
  const [totalAmount, setTotalAmount] = useState<number>(9000);
  const [payBy, setPayBy] = useState("G PAY");

  const handleSelectPackage = (pkg: TourPackageOption) => {
    setSelectedPkg(pkg);
    setPackageName(pkg.name.toUpperCase());
    setAmount(pkg.price);
    setShowBookingForm(true);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-8 my-8 mx-4 md:mx-8">
      {/* Printable CSS block for Ticket Copy */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          .ticket-copy-print-area, .ticket-copy-print-area * {
            visibility: visible;
          }
          .ticket-copy-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container: Tour Packages List + Ticket Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: TOUR PACKAGES List Table (Matching Image 3) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Ticket className="h-5 w-5" />
            </span>
            <h3 className="font-heading text-lg font-bold uppercase text-slate-900 tracking-wider">
              TOUR PACKAGES
            </h3>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Tour Package</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {TOUR_PACKAGES.map((pkg, idx) => {
                  const isSelected = selectedPkg?.name === pkg.name;
                  return (
                    <tr
                      key={idx}
                      className={`transition ${isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"}`}
                    >
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-bold">
                        {pkg.duration}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-extrabold">{pkg.name}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSelectPackage(pkg)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                            isSelected
                              ? "bg-emerald-700 text-white"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                        >
                          Book now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              Package Customization Note:
            </p>
            <p className="text-[11px] text-amber-800">
              Same Type For 2 Days Tour And More Schedule Follow The Samething Day 3 Night 4 Days or
              As Our Itinerary Shows.
            </p>
            <p className="text-[11px] text-amber-800 font-semibold">
              Same Type Follow As Train, Bus, Flight Columns.
            </p>
          </div>
        </div>

        {/* Right Side: Ticket Booking Form & "Ticket Copy For Your Journey" */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">
                Official Ticket Voucher Generator
              </span>
              <h3 className="font-heading text-xl font-bold text-slate-900">Ticket Booking Form</h3>
            </div>
            <button
              type="button"
              onClick={handlePrintTicket}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs shadow hover:bg-slate-800 transition"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              Print Ticket Copy
            </button>
          </div>

          {/* Passenger Count Dropdown (Matching Image 3: "List Of Passengers 1 or More In Numbers With Drop Down List Like 1,2,3,4,5,6,7") */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              List Of Passengers (1 or More In Numbers With Drop Down List Like 1,2,3,4,5,6,7):
            </label>
            <select
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} Passenger{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* TICKET COPY FOR YOUR JOURNEY (Table Layout matching attached Image 3) */}
          <div className="ticket-copy-print-area border-2 border-slate-900 rounded-2xl overflow-hidden bg-white p-4 space-y-4">
            {/* Header with Logo & Address */}
            <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1">
                <img
                  src="/images/packages/fortune-tourism-full-logo.png"
                  alt="FORTUNE Tourism"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
                <div className="text-[11px] font-bold text-slate-800">
                  Address: No.256/A next To Narayana Hospital, Health City, Bommasandra Bangalore.560099
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-900">Phone No: +91 9740463404</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-900 text-white text-center py-2 font-extrabold text-sm uppercase tracking-widest rounded-xl">
                Ticket Copy For Your Journey
              </div>
              <p className="text-center text-[10px] font-extrabold text-amber-700 uppercase tracking-wide">
                This Copy For After Confirming The Driver &amp; Cab/Bus/Flight Details
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-900 font-semibold">
                <tbody>
                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold w-40">Type of Travelling</td>
                    <td colSpan={5} className="p-2">
                      <select
                        value={travellingType}
                        onChange={(e) => setTravellingType(e.target.value)}
                        className="w-full font-extrabold text-slate-900 bg-amber-50 p-1.5 rounded-lg border border-amber-300 focus:outline-none cursor-pointer"
                      >
                        <option value="CAR">CAR</option>
                        <option value="BUS">BUS</option>
                        <option value="FLIGHT">FLIGHT</option>
                        <option value="TRAIN">TRAIN</option>
                      </select>
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold">Driver Name:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Phone Number:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Taxi Number:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={taxiNumber}
                        onChange={(e) => setTaxiNumber(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold">Package:</td>
                    <td colSpan={2} className="p-2 font-bold text-slate-900">
                      {packageName}
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Boarding Point</td>
                    <td colSpan={2} className="p-2">
                      <input
                        type="text"
                        value={exactBoardingPoint}
                        onChange={(e) => setExactBoardingPoint(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold w-28">Passenger Name:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold w-36">Passenger Phone No.:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={passengerPhoneNo}
                        onChange={(e) => setPassengerPhoneNo(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold w-24">Tour Type</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={tourType}
                        onChange={(e) => setTourType(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold w-28">FROM</td>
                    <td colSpan={2} className="p-2">
                      <input
                        type="text"
                        value={fromPoint}
                        onChange={(e) => setFromPoint(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold w-28">TO:</td>
                    <td colSpan={2} className="p-2">
                      <input
                        type="text"
                        value={toPoint}
                        onChange={(e) => setToPoint(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold">Ticket Number:</td>
                    <td className="p-2 font-mono font-bold">{ticketNumber}</td>
                    <td className="p-2 bg-slate-100 font-bold">PNR Number:</td>
                    <td className="p-2 font-mono font-bold">{pnrNumber}</td>
                    <td className="p-2 bg-slate-100 font-bold">Departure On:</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={departureOn}
                        onChange={(e) => setDepartureOn(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold">Trip Type:</td>
                    <td className="p-2">{tripType}</td>
                    <td className="p-2 bg-slate-100 font-bold">Type Of Car:/bus/Flight</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={typeOfCar}
                        onChange={(e) => setTypeOfCar(e.target.value)}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Fare Amount:</td>
                    <td className="p-2 flex items-center gap-0.5">
                      <span className="text-emerald-700 font-bold">Rs.</span>
                      <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        className="w-full font-bold text-emerald-700 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-slate-900 divide-x divide-slate-900">
                    <td className="p-2 bg-slate-100 font-bold">Advance Amount</td>
                    <td className="p-2 flex items-center gap-0.5">
                      <span className="text-slate-700">Rs.</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Balance Amount:</td>
                    <td className="p-2 flex items-center gap-0.5">
                      <span className="text-red-600">Rs.</span>
                      <input
                        type="number"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(Number(e.target.value))}
                        className="w-full font-bold text-red-600 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 bg-slate-100 font-bold">Total Amount:</td>
                    <td className="p-2 flex items-center gap-0.5">
                      <span className="text-emerald-700">Rs.</span>
                      <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        className="w-full font-extrabold text-emerald-700 focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>

                  <tr className="divide-x divide-slate-900">
                    <td colSpan={2} className="p-2 bg-slate-100 font-bold">
                      Pay By: G PAY ,Cash,Ph Pay.By Drop Down Box
                    </td>
                    <td colSpan={4} className="p-2">
                      <select
                        value={payBy}
                        onChange={(e) => setPayBy(e.target.value)}
                        className="w-full font-bold text-slate-900 bg-amber-50 p-1.5 rounded-lg border border-amber-300 focus:outline-none"
                      >
                        <option value="G PAY">G PAY</option>
                        <option value="Cash">Cash</option>
                        <option value="Ph Pay">Ph Pay</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms And Conditions */}
            <div className="border border-slate-900 rounded-xl p-3 space-y-1">
              <p className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Terms And Conditions
              </p>
              <p className="text-[10px] text-slate-700 leading-relaxed">
                1. This ticket is valid for particular journey, which service is Issued.
              </p>
              <p className="text-[10px] text-slate-700 leading-relaxed">
                2. Subject To Bangalore Juridictions Only.
              </p>
            </div>

            <div className="text-[10px] text-slate-500 text-center font-medium border-t pt-2">
              Fortune Tourism & Travels · No.256/A Next To Narayana Hospital, Health City,
              Bommasandra, Bangalore. 560099 · Phone: +91 9740463404 · Wish you a Happy & Safe
              Journey!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
