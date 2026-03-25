# HotelHive Color Theme

## New Color Palette (March 2026)

The application has been updated from a luxury emerald/rose/pink theme to a modern midnight blue/electric blue/soft gold palette.

### Color Swatches

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|-----------------|
| **Primary (Midnight Blue)** | `#14213D` | Main buttons, primary actions, navbar, borders | `primary` |
| **Secondary (Dark Blue)** | `#1F4068` | Hover states, secondary elements | `secondary` |
| **Accent (Electric Blue)** | `#00B4D8` | Highlights, accents, important text | `accent` |
| **Highlight (Soft Gold)** | `#FFD60A` | Warnings, gold accents, special elements | `highlight` |
| **Background (Light Gray)** | `#F1F5F9` | Light backgrounds, card backgrounds | `background` |

### Tailwind Configuration

The colors are defined in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#14213D',
      secondary: '#1F4068',
      accent: '#00B4D8',
      highlight: '#FFD60A',
      background: '#F1F5F9',
    }
  },
}
```

## Color Replacement Guide

### Old → New Color Mappings

| Old Color | Old Class | New Class | New Hex |
|-----------|-----------|-----------|---------|
| Emerald 700 | `emerald-700` | `primary` | `#14213D` |
| Emerald 600 | `emerald-600` | `secondary` | `#1F4068` |
| Emerald 500 | `emerald-500` | `primary` | `#14213D` |
| Teal 600 | `teal-600` | `accent` | `#00B4D8` |
| Teal 500 | `teal-500` | `accent` | `#00B4D8` |
| Rose 600 | `rose-600` | `highlight` | `#FFD60A` |
| Rose 500 | `rose-500` | `highlight` | `#FFD60A` |
| Pink 700 | `pink-700` | `highlight` | `#FFD60A` |
| Emerald 50 | `emerald-50` | `blue-50` | - |
| Rose 50 | `rose-50` | `amber-50` | - |

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
