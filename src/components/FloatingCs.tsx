import { MessageCircle } from "lucide-react";

const WA_CS_HREF =
  "https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20saya%20mau%20tanya-tanya%20dulu";

/**
 * Tombol chat CS mengambang kanan-bawah (semua halaman publik).
 * Disembunyikan di area admin agar tidak mengganggu dashboard.
 */
export function FloatingCs() {
  return (
    <a
      href={WA_CS_HREF}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat CS Buana Computer via WhatsApp"
      title="Chat CS — fast respon jam toko"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-0 rounded-full bg-[#25D366] p-0 shadow-xl shadow-green-900/20 transition-all duration-300 hover:bg-[#1eb856] hover:shadow-2xl animate-in fade-in zoom-in"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.2s]" />
        <MessageCircle size={26} className="relative text-white" fill="currentColor" />
        <span className="absolute right-3 top-3 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#25D366] bg-white" />
        </span>
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold text-white transition-all duration-300 group-hover:ml-1 group-hover:mr-5 group-hover:max-w-[140px]">
        Chat CS Kami
      </span>
    </a>
  );
}
