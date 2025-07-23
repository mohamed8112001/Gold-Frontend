/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Colors (New Design System)
        primary: {
          1: "#FAF7EA", // Primary 1
          2: "#F6EED5", // Primary 2
          50: "#FAF7EA",
          100: "#F6EED5",
          200: "#F0E5C0",
          300: "#E8D8A0",
          400: "#DFC980",
          500: "#D4AF37", // Button Primary 500
          600: "#A88924", // Button Primary Hover
          700: "#8A6F1E",
          800: "#6B5518",
          900: "#2A2209", // Text Primary 900
          950: "#1A1506",
        },

        // Secondary Colors (New Design System)
        secondary: {
          1: "#F2F2F2", // Secondary 1
          2: "#E6E6E6", // Secondary 2
          50: "#F9F9F9",
          100: "#F2F2F2",
          200: "#E6E6E6",
          300: "#D9D9D9",
          400: "#CCCCCC",
          500: "#BFBFBF",
          600: "#999999",
          700: "#737373",
          800: "#4D4D4D",
          900: "#262626",
          950: "#0D0D0D",
        },

        // Button Colors (New Design System)
        button: {
          primary: {
            500: "#D4AF37", // Button Primary 500
            hover: "#A88924", // Button Primary Hover
          },
          success: {
            500: "#21CF61", // Success 500
            600: "#1CA651", // Success Hover 600
          },
          error: {
            500: "#FD0D0D", // Error 500
            600: "#D80604", // Error Hover 600
          },
        },

        // Success Colors (New Design System)
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#21CF61", // Success 500
          600: "#1CA651", // Success Hover 600
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },

        // Error Colors (New Design System)
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#FD0D0D", // Error 500
          600: "#D80604", // Error Hover 600
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },

        // Warning Colors (maintained for compatibility)
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },

        // Background Colors (New Design System)
        background: {
          primary: "#FFFFFF", // Background
          secondary: "#FAF7EA", // Primary 1
          tertiary: "#F6EED5", // Primary 2
          neutral: "#F2F2F2", // Secondary 1
        },

        // Text Colors (New Design System)
        text: {
          primary: "#2A2209", // Text Primary 900
          secondary: "#4D4D4D", // Darker gray for secondary text
          muted: "#737373", // Medium gray for muted text
          inverse: "#FFFFFF", // White text for dark backgrounds
        },

        // Border Colors (New Design System)
        border: {
          light: "#E6E6E6", // Secondary 2
          medium: "#D9D9D9",
          dark: "#CCCCCC",
        },

        // Neutral palette for general use
        neutral: {
          50: "#F9F9F9",
          100: "#F2F2F2",
          200: "#E6E6E6",
          300: "#D9D9D9",
          400: "#CCCCCC",
          500: "#BFBFBF",
          600: "#999999",
          700: "#737373",
          800: "#4D4D4D",
          900: "#262626",
          950: "#0D0D0D",
        },
      },

      // Custom spacing for golden ratio inspired design
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Typography enhancements - Cairo Font Primary
      fontFamily: {
        cairo: ["Cairo", "system-ui", "sans-serif"],
        primary: ["Cairo", "system-ui", "sans-serif"],
        secondary: ["Cairo", "system-ui", "sans-serif"],
        decorative: ["Cairo", "system-ui", "sans-serif"],
        display: ["Cairo", "system-ui", "sans-serif"],
        body: ["Cairo", "system-ui", "sans-serif"],
        sans: ["Cairo", "system-ui", "sans-serif"],
        serif: ["Cairo", "system-ui", "sans-serif"],
        DEFAULT: ["Cairo", "system-ui", "sans-serif"],
      },



      // Animation and transitions
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "golden-glow": "goldenGlow 2s ease-in-out infinite alternate",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        goldenGlow: {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },

      // Border radius for consistent design
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
