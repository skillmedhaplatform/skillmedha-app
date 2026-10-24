"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, Check } from "lucide-react";
import { message } from "antd";

export default function ShareModal({ isOpen, onClose, courseTitle, title, courseId, slug, type = "course" }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const resolvedTitle = title || courseTitle || "";
  const resolvedSlug = slug || (resolvedTitle ? resolvedTitle.toLowerCase().replace(/[^a-z0-9]/g, "") : courseId);
  const resolvedType = type || "course";

  // Generate dynamic website URL using the slug for both local and live production
  const origin = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:8080";
  const shareUrl = `${origin}/${resolvedType}/${resolvedSlug}`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(
    resolvedTitle ? `Check out "${resolvedTitle}" on SkillMedha!` : "Check out this program on SkillMedha!"
  );

  const platforms = [
    {
      id: "embed",
      name: "Embed",
      bg: "bg-[#27272a] hover:bg-[#3f3f46]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      onClick: () => {
        const embedCode = `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        message.success("Embed code copied to clipboard!");
      },
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      bg: "bg-[#25D366] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.188 8.188 0 0 1-5.82 2.41h-.01c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23zm4.52 11.64c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7 2.46 1.06 2.46.71 2.91.66.44-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z" />
        </svg>
      ),
      onClick: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "messages",
      name: "Messages",
      bg: "bg-[#007AFF] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
        </svg>
      ),
      onClick: () => {
        window.open(`sms:?&body=${encodedTitle}%20${encodedUrl}`, "_self");
      },
    },
    {
      id: "facebook",
      name: "Facebook",
      bg: "bg-[#1877F2] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "x",
      name: "X",
      bg: "bg-black hover:bg-neutral-900 border border-neutral-700",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      bg: "bg-[#0A66C2] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      bg: "bg-[#229ED9] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.827.942z" />
        </svg>
      ),
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "email",
      name: "Email",
      bg: "bg-[#EA4335] hover:brightness-105",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      onClick: () => {
        window.open(
          `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
            `Check out this program on SkillMedha: ${shareUrl}`
          )}`,
          "_self"
        );
      },
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      message.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error("Failed to copy link");
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 160, behavior: "smooth" });
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#212121] text-white rounded-2xl shadow-2xl p-6 border border-neutral-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="text-lg font-semibold text-white">Share</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Social Platforms Row */}
        <div className="relative py-5">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={p.onClick}
                className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${p.bg}`}
                >
                  {p.icon}
                </div>
                <span className="text-xs text-neutral-300 font-medium group-hover:text-white transition-colors">
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          {/* Scroll arrow on right */}
          <button
            onClick={handleScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-800/90 border border-neutral-700 shadow-lg flex items-center justify-center text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* URL and Copy Link container */}
        <div className="mt-2 flex items-center justify-between gap-3 bg-[#0f0f10] border border-neutral-800 rounded-2xl p-2 pl-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent text-xs sm:text-sm text-neutral-200 outline-none select-all truncate font-normal"
          />
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                Copied
              </>
            ) : (
              "Copy"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return null;
}
