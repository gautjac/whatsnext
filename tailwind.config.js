/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // whatsnext — an almanac / field-guide to your next chapter. Warm bone
        // paper, deep pine ink, a marigold sun, a coral spark. Calm, literary,
        // forward-looking. Deliberately NOT le-penchant's oxblood-on-rag-paper.
        paper: {
          DEFAULT: "#f6f1e6", // primary surface — warm bone paper
          warm: "#fbf7ee", // raised panels / cards
          deep: "#ece2cf", // sunk wells
          edge: "#dac9aa", // hairlines / edges
        },
        // Ink — deep spruce-charcoal, warm not cold.
        ink: {
          DEFAULT: "#22302c", // primary text
          soft: "#505d57", // secondary
          faint: "#8a948c", // tertiary / placeholder
        },
        // The signature accent — pine, the structural color: trustworthy, calm,
        // "over the next ridge." Buttons, spines, rules, headings.
        pine: {
          DEFAULT: "#13564f",
          deep: "#0d3d38", // pressed / hover
          glow: "#2c857a", // lit / focus
          wash: "#3f7d74", // soft tint
        },
        // Marigold — the one warm metal: the rising sun, pins, fit-notes.
        marigold: {
          DEFAULT: "#c9842b",
          deep: "#9c651d",
          glow: "#eab14f",
        },
        // Coral — the spark of "what's next": headlines, the first step. A pop,
        // used with restraint against the pine structure.
        coral: {
          DEFAULT: "#cf5a33",
          deep: "#a8431f",
          glow: "#e87b4f",
        },
        thread: {
          DEFAULT: "#9a958a",
          faint: "#c7bda9",
        },
        sage: "#5e7a63", // a quiet field-green secondary, sparingly
      },
      fontFamily: {
        // The case is set in a literary, newsprint-warm serif.
        display: ['"Newsreader"', "Georgia", "serif"],
        serif: ['"Newsreader"', "Georgia", "serif"],
        // The UI / framing — a characterful geometric grotesque.
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Soft daylight on paper, never harsh.
        paper: "0 1px 0 rgba(255,255,255,0.6) inset, 0 16px 40px -22px rgba(34,48,44,0.4)",
        card: "0 1px 0 rgba(255,255,255,0.6) inset, 0 22px 50px -26px rgba(34,48,44,0.42), 0 2px 8px -3px rgba(34,48,44,0.14)",
        lift: "0 30px 70px -28px rgba(34,48,44,0.5)",
        pine: "0 0 0 1px rgba(19,86,79,0.35), 0 14px 40px -12px rgba(19,86,79,0.3)",
        sun: "0 0 0 1px rgba(201,132,43,0.45), 0 12px 36px -10px rgba(201,132,43,0.32)",
        inset: "inset 0 2px 10px -4px rgba(34,48,44,0.28)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // a card surfacing like a ridge coming into view
        layIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // a horizon line drawn across
        drawLine: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // the sun-dots pulsing while it thinks
        pulse3: {
          "0%,80%,100%": { transform: "scale(0.45)", opacity: "0.35" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        sheen: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        riseIn: "riseIn 0.6s cubic-bezier(0.2,0.7,0.2,1) both",
        fadeIn: "fadeIn 0.5s ease both",
        scaleIn: "scaleIn 0.4s cubic-bezier(0.2,0.7,0.2,1) both",
        layIn: "layIn 0.6s cubic-bezier(0.2,0.7,0.2,1) both",
        drawLine: "drawLine 0.7s cubic-bezier(0.2,0.7,0.2,1) both",
        pulse3: "pulse3 1.4s ease-in-out infinite",
        sheen: "sheen 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
