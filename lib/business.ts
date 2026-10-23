// Single source of truth for OCNOO's real business details, taken from the
// billing/terms/safety documents supplied by the business. Previously the
// WhatsApp number was duplicated as a fake placeholder in two components and
// the social links pointed at "#".

export const BUSINESS = {
  legalName: "King Ocnoo Computer Ventures",
  brandName: "OCNOO Online Store",
  /** Display format used in copy. */
  phoneDisplay: "+234 813 885 5603",
  /** E.164 without the plus, for wa.me / tel: links. */
  phoneDial: "2348138855603",
  email: "kingocnoocomputerventures@gmail.com",
  facebook: "https://www.facebook.com/share/1FdEfBkykK/",
  instagram: "https://www.instagram.com/king_ocnoo_computer_ventures",
  bank: {
    bankName: "UBA Bank Plc",
    accountName: "King Ocnoo Computer Ventures",
    accountNumber: "1024640744",
  },
} as const;

export const WHATSAPP_LINK = `https://wa.me/${BUSINESS.phoneDial}`;
export const TEL_LINK = `tel:+${BUSINESS.phoneDial}`;
export const MAILTO_LINK = `mailto:${BUSINESS.email}`;
