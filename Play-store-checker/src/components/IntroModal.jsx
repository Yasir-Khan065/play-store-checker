import Modal from "./Modal.jsx";

const BULLETS = [
  "Detect metadata violations",
  "Improve keyword optimization",
  "Analyze readability and density",
];

export default function IntroModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Welcome">
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7L5.5 10.5L12 3.5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-base font-bold tracking-tight text-zinc-900">
            Play Listing Checker
          </h1>
        </div>

        <h2 className="text-lg font-bold text-zinc-900 leading-snug mb-1.5">
          Google Play Metadata Compliance Checker
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          Analyze titles, descriptions, ASO quality, and policy compliance
          instantly.
        </p>

        <ul className="flex flex-col gap-2 mb-5">
          {BULLETS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-sm text-zinc-700"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="mt-1 flex-shrink-0 text-indigo-500"
              >
                <path
                  d="M2 7L5.5 10.5L12 3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          Start Checking
        </button>
      </div>
    </Modal>
  );
}
