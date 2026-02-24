const ELEMENTS = [
  { char: "💕", left: 5, duration: 14, delay: 0, opacity: 0.08 },
  { char: "⭐", left: 15, duration: 18, delay: 2, opacity: 0.1 },
  { char: "🐾", left: 25, duration: 16, delay: 5, opacity: 0.08 },
  { char: "🌸", left: 35, duration: 20, delay: 1, opacity: 0.12 },
  { char: "🐟", left: 45, duration: 15, delay: 8, opacity: 0.07 },
  { char: "💖", left: 55, duration: 17, delay: 3, opacity: 0.09 },
  { char: "✨", left: 65, duration: 13, delay: 6, opacity: 0.1 },
  { char: "🌸", left: 75, duration: 19, delay: 4, opacity: 0.08 },
  { char: "⭐", left: 85, duration: 16, delay: 7, opacity: 0.11 },
  { char: "🐾", left: 92, duration: 14, delay: 9, opacity: 0.08 },
  { char: "💕", left: 10, duration: 22, delay: 11, opacity: 0.07 },
  { char: "🐟", left: 50, duration: 18, delay: 13, opacity: 0.06 },
  { char: "✨", left: 30, duration: 15, delay: 10, opacity: 0.09 },
  { char: "🌸", left: 70, duration: 21, delay: 12, opacity: 0.08 },
  { char: "💖", left: 40, duration: 17, delay: 14, opacity: 0.07 },
];

export default function FloatingBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {ELEMENTS.map((el, i) => (
        <span
          key={i}
          className="float-element"
          style={{
            left: `${el.left}%`,
            fontSize: "18px",
            "--float-duration": `${el.duration}s`,
            "--float-delay": `${el.delay}s`,
            "--float-opacity": el.opacity,
          }}
        >
          {el.char}
        </span>
      ))}
    </div>
  );
}
