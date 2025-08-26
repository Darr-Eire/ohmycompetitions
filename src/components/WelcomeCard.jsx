function WelcomeCard({ onClose }) {
  const firstBtnRef = useRef(null);

  // ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus first button on open
  useEffect(() => {
    firstBtnRef.current?.focus();
  }, []);

  return (
    <div
      className="bg-[#0f1b33] border border-cyan-400 rounded-2xl p-8 max-w-md w-[92%] shadow-[0_0_30px_#00f0ff88]
                 text-center animate-[fadeIn_.18s_ease-out] outline-none"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 id="welcome-title" className="text-2xl font-bold text-cyan-300 font-orbitron mb-2">
        ☘️ Céad Míle Fáilte ☘️
      </h2>

      <p id="welcome-desc" className="text-white/90 mb-6 text-sm">
        Let The Competitions Begin
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          ref={firstBtnRef}
          className="bg-gradient-to-r from-cyan-300 to-blue-500 text-black font-semibold py-2 rounded-lg
                     shadow-md hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="bg-gradient-to-r from-blue-500 to-cyan-300 text-black font-semibold py-2 rounded-lg
                     shadow-md hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Sign Up
        </Link>

        <button
          onClick={onClose}
          className="bg-transparent border border-cyan-400 text-cyan-300 font-semibold py-2 rounded-lg
                     hover:bg-cyan-400/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Explore App
        </button>
      </div>

      {/* Optional close (X) in the corner */}
      <button
        onClick={onClose}
        aria-label="Close welcome dialog"
        className="absolute top-3 right-3 text-cyan-300/80 hover:text-cyan-100 focus:outline-none
                   focus:ring-2 focus:ring-cyan-400 rounded-md px-2 py-1"
      >
        ✕
      </button>

      {/* Tiny keyframe for the card pop-in (uses Tailwind arbitrary animation) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { transform: translateY(4px) scale(.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
