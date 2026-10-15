
export default function PageSkeleton({ cards = 6 }) {
  return (
    <div
      className="sk-wrap"
      role="status"
      aria-busy="true"
      aria-label="লোড হচ্ছে"
    >
      <div className="sk sk-title" />
      <div className="sk sk-subtitle" />

      <div className="sk-grid">
        {Array.from({ length: cards }).map((_, index) => (
          <div className="sk-card" key={index}>
            <div className="sk sk-emoji" />
            <div className="sk sk-line" />
            <div className="sk sk-line sk-short" />
            <div className="sk sk-line sk-price" />
          </div>
        ))}
      </div>

      <style>{`
        .sk-wrap {
          width: 100%;
          max-width: 1152px;
          margin: 0 auto;
          padding: 32px 16px;
        }
        .sk {
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            #e8efe8 25%,
            #f4f8f4 50%,
            #e8efe8 75%
          );
          background-size: 200% 100%;
          animation: sk-shimmer 1.3s ease-in-out infinite;
        }
        .sk-title { height: 32px; width: min(320px, 70%); margin-bottom: 12px; }
        .sk-subtitle { height: 16px; width: min(480px, 90%); margin-bottom: 28px; }
        .sk-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
        }
        .sk-card {
          padding: 16px;
          border: 1px solid #dbe6db;
          border-radius: 12px;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sk-emoji { height: 56px; width: 56px; border-radius: 50%; }
        .sk-line { height: 16px; width: 80%; }
        .sk-short { width: 45%; }
        .sk-price { height: 22px; width: 60%; margin-top: 6px; }
        @media (min-width: 560px) {
          .sk-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 800px) {
          .sk-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1100px) {
          .sk-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @keyframes sk-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sk { animation: none; }
        }
      `}</style>
    </div>
  );
}
