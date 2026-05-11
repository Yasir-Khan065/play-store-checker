import Modal from "./Modal.jsx";

export default function AboutModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="About">
      <div className="p-7">
        <h2 className="text-base font-bold text-[#1F2937] mb-3">
          About Play Listing Checker
        </h2>
        <p className="text-sm text-[#475467] leading-relaxed mb-4">
          A small utility for app developers to audit Google Play store
          listings against Google&rsquo;s Developer Content Policy and common
          ASO best practices.
        </p>

        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6C63FF] mb-1.5">
          Purpose
        </h3>
        <p className="text-sm text-[#475467] leading-relaxed mb-4">
          Catch violations, ranking-claim language, and metadata issues
          before submission &mdash; and surface ASO insights like keyword
          density and readability.
        </p>

        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6C63FF] mb-1.5">
          Privacy
        </h3>
        <ul className="text-sm text-[#475467] leading-relaxed flex flex-col gap-1 mb-4">
          <li>&middot; All analysis runs locally in your browser.</li>
          <li>&middot; Your descriptions are never sent to any server.</li>
          <li>&middot; No analytics, cookies, or tracking are used.</li>
          <li>&middot; Nothing is stored or persisted between sessions.</li>
        </ul>

        <p className="text-[11px] text-[#8A94A6] leading-relaxed">
          This tool is independent and not affiliated with Google or Google
          Play. Always confirm results against the official{" "}
          <a
            href="https://play.google.com/about/developer-content-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6C63FF] hover:underline"
          >
            Developer Content Policy
          </a>
          .
        </p>
      </div>
    </Modal>
  );
}
