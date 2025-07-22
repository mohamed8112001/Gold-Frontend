/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Golden Brown Primary Palette (based on #A37F41)
        primary: {
          50: "#FDF8F0",
          100: "#FAF0E1",
          200: "#F4E0C3",
          300: "#EDCFA4",
          400: "#E6BE86",
          500: "#D4A574", // Your existing primary
          600: "#A37F41", // Your base color
          700: "#8B6B35",
          800: "#6D552C",
          900: "#49391D",
          950: "#241C0F",
        },

        // Secondary/Background Palette (Beige & Earthy Tones)
        secondary: {
          50: "#F8F4ED", // Your lightest beige
          100: "#F0E8DB", // Your second lightest
          200: "#E2D2B6", // Your third
          300: "#D3BB92", // Your fourth
          400: "#C5A56D", // Your fifth
          500: "#B8956A", // Interpolated
          600: "#92723A", // Your sixth
          700: "#6D552C", // Your seventh
          800: "#49391D", // Your eighth
          900: "#241C0F", // Your ninth
          950: "#120E07", // Your darkest
        },

        // Neutral palette for backgrounds and surfaces
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },

        // Semantic colors with golden brown influence
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },

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

        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },

        // Custom golden brown variations for special use cases
        golden: {
          50: "#FDF8F0",
          100: "#FAF0E1",
          200: "#F4E0C3",
          300: "#EDCFA4",
          400: "#E6BE86",
          500: "#D4A574",
          600: "#A37F41",
          700: "#8B6B35",
          800: "#6D552C",
          900: "#49391D",
        },

        // Background variations
        background: {
          primary: "#F8F4ED", // Lightest beige for main backgrounds
          secondary: "#F0E8DB", // Slightly darker for cards
          tertiary: "#E2D2B6", // For sections and dividers
        },

        // Text colors optimized for contrast
        text: {
          primary: "#241C0F", // Darkest brown for main text
          secondary: "#49391D", // Medium brown for secondary text
          muted: "#6D552C", // Lighter brown for muted text
          inverse: "#F8F4ED", // Light text for dark backgrounds
        },

        // Border colors
        border: {
          light: "#E2D2B6",
          medium: "#D3BB92",
          dark: "#C5A56D",
        },
      },

      // Custom spacing for golden ratio inspired design
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Typography enhancements - Arabic Fonts
      fontFamily: {
        cairo: ["Cairo", "system-ui", "sans-serif"],
        tajawal: ["Tajawal", "system-ui", "sans-serif"],
        amiri: ["Amiri", "serif"],
        primary: ["Cairo", "system-ui", "sans-serif"],
        secondary: ["Tajawal", "system-ui", "sans-serif"],
        decorative: ["Amiri", "serif"],
        display: ["Cairo", "system-ui", "sans-serif"],
        body: ["Tajawal", "system-ui", "sans-serif"],
        sans: ["Tajawal", "Cairo", "system-ui", "sans-serif"],
        serif: ["Amiri", "serif"],
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
