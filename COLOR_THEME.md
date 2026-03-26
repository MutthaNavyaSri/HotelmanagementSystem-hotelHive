# HotelHive Color Theme

## Current Color Palette (March 2026 - Updated)

The application uses an elegant emerald/champagne/gold palette designed for luxury and sophistication.

### Color Swatches

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|-----------------|
| **Primary (Dark Emerald)** | `#0F3D3E` | Main buttons, primary actions, navbar, borders | `primary` |
| **Secondary (Champagne Gold)** | `#E2C799` | Accents, gold highlights, special elements | `secondary` |
| **Accent (Dark Teal)** | `#2C666E` | Highlights, focus states, important accents | `accent` |
| **Highlight (Champagne Gold)** | `#E2C799` | Warnings, gold accents, special elements | `highlight` |
| **Background (Light Gray)** | `#F7F7F7` | Light backgrounds, card backgrounds, page background | `background` |

### Tailwind Configuration

The colors are defined in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0F3D3E',
      secondary: '#E2C799',
      accent: '#2C666E',
      highlight: '#E2C799',
      background: '#F7F7F7',
    }
  },
}
```

## Color Usage Guide

### Primary Color (#0F3D3E - Dark Emerald)
- Main call-to-action buttons
- Navbar gradient backgrounds
- Primary text on light backgrounds
- Border colors for emphasis
- Form input focus states

### Secondary/Highlight Color (#E2C799 - Champagne Gold)
- Secondary buttons (SignUp, View Details)
- Gold accents in gradients
- Special highlight elements
- Hover states for luxury feel

### Accent Color (#2C666E - Dark Teal)
- Form input focus rings
- Accent borders
- Secondary action buttons
- Hover states for interactive elements

### Background Color (#F7F7F7 - Light Gray)
- Page background
- Body background
- Card backgrounds (where white is used for contrast)
- Prevents white flashing when scrolling

## Color Application Examples

```jsx
// Primary button
<button className="bg-[#0F3D3E] hover:bg-[#0A2829]">Action</button>

// Gold secondary button
<button className="bg-[#E2C799] hover:bg-[#D9BC85] text-[#0F3D3E]">Secondary</button>

// Accent focus state
<input className="focus:ring-2 focus:ring-[#2C666E]" />

// Gradient header
<div className="bg-gradient-to-r from-[#0F3D3E] to-[#2C666E]">Header</div>
```

## Previous Color Palettes (Archive)

### Old Palette (Midnight Blue/Electric Blue - Earlier Version)
- Primary: `#14213D`
- Secondary: `#1F4068`
- Accent: `#00B4D8`
- Highlight: `#FFD60A`

## Component Updates Status

### ✅ Completed
- [x] `tailwind.config.js` - Color definitions added
- [x] `frontend/src/components/ChatBot.jsx` - Full update to new palette
- [x] `frontend/src/pages/LoginPage.jsx` - Primary colors updated
- [x] `frontend/src/App.jsx` - Stories, navbar, hero section updated
- [x] Tailwind config colors registered

### 🟡 Partially Complete
- [ ] `frontend/src/pages/RoomDetailsPage.jsx` - Needs full update
- [ ] `frontend/src/pages/RoomListingPage.jsx` - Needs full update
- [ ] `frontend/src/pages/BookingPage.jsx` - Needs full update
- [ ] `frontend/src/pages/SignupPage.jsx` - Needs full update
- [ ] `frontend/src/pages/ProfilePage.jsx` - Needs full update
- [ ] `frontend/src/pages/BankingPage.jsx` - Needs full update
- [ ] `frontend/src/pages/UserDashboard.jsx` - Needs full update

### 📝 Usage Examples

**Primary Action Button:**
```jsx
// Old
<button className="bg-emerald-700 hover:bg-emerald-800">Click me</button>

// New
<button className="bg-primary hover:bg-secondary">Click me</button>
```

**Gradient Buttons (with custom hex):**
```jsx
// Old
<button className="bg-gradient-to-r from-emerald-700 to-teal-700">
  
// New
<button className="bg-gradient-to-r from-[#14213D] to-[#1F4068]">
```

**Border Colors:**
```jsx
// Old
<div className="border-t-4 border-emerald-700">

// New  
<div className="border-t-4 border-primary">
```

**Background Colors:**
```jsx
// Old
<div className="bg-emerald-50 text-emerald-700">

// New
<div className="bg-blue-50 text-primary">
```

## Design System Notes

### Color Psychology
- **Midnight Blue (#14213D)**: Trust, professionalism, stability
- **Dark Blue (#1F4068)**: Depth, consistency, formality
- **Electric Blue (#00B4D8)**: Energy, modernity, approachability
- **Soft Gold (#FFD60A)**: Warmth, premium feel, attention
- **Light Gray (#F1F5F9)**: Cleanliness, spaciousness, elegance

### Accessibility
- All text uses sufficient contrast ratios
- Primary text on light backgrounds
- Dark backgrounds for light text
- Color not used as sole means of communication

### Next Steps for Remaining Components

1. Update all remaining JSX files to use new color classes
2. Replace all `emerald-*` with appropriate new colors
3. Replace all `rose-*` and `pink-*` with `highlight` or gold variants
4. Replace all `teal-*` and `cyan-*` with `accent`
5. Test accessibility with color contrast checker
6. Verify all gradient combinations

### Maintenance Notes

When adding new features:
1. Use the custom color names (`primary`, `secondary`, `accent`, `highlight`, `background`)
2. For gradients requiring custom colors, use bracket notation: `from-[#14213D]`
3. Maintain consistent color usage across components
4. Test all color combinations for accessibility

---

**Last Updated:** March 26, 2026
**Version:** 1.0
