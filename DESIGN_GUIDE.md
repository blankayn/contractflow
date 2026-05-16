# ContractFlow Dark Theme Design Guide

## 🎨 Color System

### Core Colors
- **Primary Black**: `#000000` - Main backgrounds and text on light
- **Deep Black**: `#0a0a0a` - Page background
- **Cyan Accent**: `#00d9ff` - Interactive elements, accents, glows
- **Cyan Light**: `#33e5ff` - Hover states and lighter accents
- **Text**: `#ffffff` - Main text on dark
- **Text Muted**: `#a0aec0` - Secondary text

### CSS Variables
All colors are defined in `:root` scope:

```css
--primary: #000000;
--accent: #00d9ff;
--background: #0a0a0a;
--text-main: #ffffff;
--text-muted: #a0aec0;
```

## 🎯 Component Styling

### Buttons
- **Primary**: Black → Cyan on hover
- **Secondary**: Transparent cyan with border → Lighter cyan on hover

### Cards & Containers
- Dark glass morphism (rgba(0,0,0,0.6) to rgba(0,0,0,0.8))
- Cyan borders with low opacity: rgba(0,217,255,0.2)
- Cyan shadows for depth

### Forms
- Dark inputs with cyan borders
- Cyan glow on focus
- Upload areas: Cyan dashed borders

### Tables
- Dark headers with cyan text
- Cyan accent borders on rows
- Cyan status pills

## 🔆 Visual Effects

### Shadows & Glows
- Light shadow: `rgba(0, 217, 255, 0.1)`
- Medium shadow: `rgba(0, 217, 255, 0.15)`
- Heavy shadow: `rgba(0, 217, 255, 0.3)`

### Backdrops
- Strong glass: `rgba(0, 0, 0, 0.8) + blur(20px)`
- Light glass: `rgba(0, 0, 0, 0.6) + blur(15px)`
- Fallback gradient: Cyan radial gradients

## 📱 Responsive
- Mobile: Stacked layouts maintained
- Breakpoint: 768px
- All dark theme values remain consistent across breakpoints

## 🔗 Spline Integration
The design is optimized for black Spline 3D scenes:
- Cyan accents highlight 3D objects
- Dark backgrounds create contrast
- Glowing effects mirror 3D lighting

## 💡 Implementation Notes
When adding new components:
1. Use CSS variables from `:root`
2. Apply cyan accents for interactive elements
3. Use dark glass morphism for containers
4. Include cyan shadows for depth
5. Test contrast ratio for accessibility (aim for WCAG AA)
