/**
 * ==============================================================================
 * 🎨 MAAT BRAND THEME CONFIGURATION (SINGLE SOURCE OF TRUTH)
 * ==============================================================================
 * 
 * Change your Primary and Secondary brand colors here in ONE place!
 * Any update here will automatically reflect across:
 *   ✓ Tailwind CSS utility classes (bg-primary, text-primary, bg-secondary, etc.)
 *   ✓ Buttons (Primary MAAT action buttons & Secondary buttons)
 *   ✓ Sidebar logo, active menu items, and submenu highlights
 *   ✓ Header indicators and user avatars
 *   ✓ Recharts charts (AreaChart, BarChart, PieChart)
 *   ✓ KPI cards, active filter tabs, and status badges
 * ==============================================================================
 */

export const THEME_CONFIG = {
  // ── 1. PRIMARY BRAND COLOR (Pure Yellow) ──────────────────────────────────
  primary: {
    name: 'Pure Yellow',
    hex: '#FACC15',           // Pure bright yellow (Tailwind yellow-400)
    hoverHex: '#EAB308',      // Rich yellow hover (Tailwind yellow-500)
    hsl: '48 96% 53%',        // HSL value for CSS --primary
    foreground: '#0F172A',    // Deep slate text for high contrast on pure yellow
    foregroundHsl: '222.2 84% 4.9%',
  },

  // ── 2. SECONDARY BRAND COLOR (Current: Royal Blue) ──────────────────────────
  secondary: {
    name: 'Royal Blue',
    hex: '#2563EB',           // Hex for Recharts & SVG elements
    hoverHex: '#1D4ED8',      // Darker shade for hover states
    hsl: '221 83% 53%',       // HSL value for CSS --secondary
    foreground: '#FFFFFF',    // Text color for readability on secondary background
    foregroundHsl: '0 0% 100%',
  },
};

/**
 * Automatically applies the theme variables into the document root.
 * Call this once at app initialization (in main.jsx).
 */
export function applyBrandTheme() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--primary', THEME_CONFIG.primary.hsl);
  root.style.setProperty('--primary-foreground', THEME_CONFIG.primary.foregroundHsl);
  root.style.setProperty('--secondary', THEME_CONFIG.secondary.hsl);
  root.style.setProperty('--secondary-foreground', THEME_CONFIG.secondary.foregroundHsl);
  root.style.setProperty('--ring', THEME_CONFIG.primary.hsl);
}
