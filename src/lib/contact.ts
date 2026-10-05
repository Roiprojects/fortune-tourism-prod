export const CONTACT = {
  phone: "+91 97404 63404",
  phoneHref: "tel:+919740463404",
  whatsapp: "919740463404",
  email: "hello@fortunetourism.in",
  address: "Health City, 99, Bommasandra Industrial Area, Bommasandra, Karnataka 560099",
  hours: "Open 24 × 7 for enquiries",
} as const;

export interface WhatsAppMessage {
  service?: string;
  vehicle?: string;
  package?: string;
  pickup?: string;
  destination?: string;
  date?: string;
  returnDate?: string;
  passengers?: number | string;
  name?: string;
  phone?: string;
  notes?: string;
}

export function buildWhatsAppUrl(msg: WhatsAppMessage | string = {}) {
  let text = "";
  if (typeof msg === "string") {
    text = encodeURIComponent(msg);
  } else {
    const lines = [
      "Hello Fortune Tourism, I would like to enquire:",
      msg.service && `• Service: ${msg.service}`,
      msg.package && `• Package: ${msg.package}`,
      msg.vehicle && `• Vehicle: ${msg.vehicle}`,
      msg.pickup && `• Pickup: ${msg.pickup}`,
      msg.destination && `• Destination: ${msg.destination}`,
      msg.date && `• Travel date: ${msg.date}`,
      msg.returnDate && `• Return date: ${msg.returnDate}`,
      msg.passengers && `• Passengers: ${msg.passengers}`,
      msg.name && `• Name: ${msg.name}`,
      msg.phone && `• Phone: ${msg.phone}`,
      msg.notes && `• Notes: ${msg.notes}`,
    ].filter(Boolean);
    text = encodeURIComponent(lines.join("\n"));
  }
  return `https://wa.me/${CONTACT.whatsapp}?text=${text}`;
}