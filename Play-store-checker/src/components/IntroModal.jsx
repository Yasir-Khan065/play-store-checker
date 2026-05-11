import Modal from "./Modal.jsx";

const BULLETS = [
  "Detect metadata violations",
  "Improve keyword optimization",
  "Analyze readability and density",
];

export default function IntroModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Welcome">
      <div className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-[#6C63FF] to-[#8B7CFF] flex items-center justify-center flex-shrink-0 shadow-[0_8px_22px_-6px_rgba(108,99,255,0.55)]">
            <span className="text-white font-extrabold text-xl leading-none">
              P
            </span>
          </div>
          <h1 className="text-base font-bold tracking-tight text-[#1F2937]">
            Play Listing Checker
          </h1>
        </div>

        <h2 className="text-lg font-bold text-[#1F2937] leading-snug mb-2">
          Google Play Metadata Compliance Checker
        </h2>
        <p className="text-sm text-[#475467] leading-relaxed mb-5">
          Analyze titles, descriptions, ASO quality, and policy compliance
          instantly.
        </p>

        <ul className="flex flex-col gap-2.5 mb-6">
          {BULLETS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 text-sm text-[#1F2937]"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#F4F3FF] flex items-center justify-center text-[#6C63FF]">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7L5.5 10.5L12 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#6C63FF] to-[#8B7CFF] text-white text-sm font-semibold py-3 rounded-xl shadow-[0_8px_22px_-8px_rgba(108,99,255,0.55)] hover:shadow-[0_10px_26px_-8px_rgba(108,99,255,0.7)] transition-all duration-200"
        >
          Start Checking
        </button>
      </div>
    </Modal>
  );
}
