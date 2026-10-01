import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton: React.FC = () => {
    // wa.me expects the number in international format without "+" or spaces.
    const phoneNumber = "919570994444";
    const message = "Join Our WhatsApp Community & Learn Flutter + AI";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="group fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.6)] ring-4 ring-white transition-all duration-200 hover:scale-105 hover:bg-[#1ebe5a] focus-visible:scale-105 sm:bottom-6 sm:right-6"
        >
            <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
            <span
                role="tooltip"
                className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white opacity-0 shadow-[var(--shadow-lift)] transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
            >
                Chat on WhatsApp
            </span>
        </a>
    );
};

export default WhatsAppButton;
