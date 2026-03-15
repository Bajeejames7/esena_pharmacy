# BrandingSlider Component

A full-width, edge-to-edge responsive image slider component that displays branding images prominently at the top of the home page.

## Features

- **Edge-to-Edge Display**: Full width images with no padding or margins
- **Large, Prominent Images**: Substantial heights for maximum visual impact
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Auto-play**: Automatically advances slides every 4 seconds
- **Navigation Controls**: Previous/next buttons and slide indicators
- **Progress Bar**: Visual indicator of current slide position
- **Horizontal Image Support**: Special handling for landscape-oriented images
- **Smooth Transitions**: Professional slide animations

## Usage

```jsx
import BrandingSlider from '../components/BrandingSlider';

function HomePage() {
  return (
    <div>
      <BrandingSlider />
      {/* Other content */}
    </div>
  );
}
```

## Responsive Heights (Large & Prominent)

- **Mobile**: 80-96 (320-384px) for impactful mobile display
- **Tablet**: 96-112 (384-448px) for strong tablet presence  
- **Desktop**: 112-128 (448-512px) for commanding desktop display

## Intelligent Image Display System

The component now automatically detects image dimensions and optimizes display:

### Automatic Aspect Ratio Detection
- **Wide Images** (ratio > 1.5): Use `object-cover` to fill container
- **Square Images** (ratio 0.8-1.2): Use `object-contain` with background
- **Tall Images** (ratio < 0.8): Use `object-contain` with background

### Dynamic Height Adjustment
- **Square/Tall Images**: Taller containers for better visibility
- **Wide Images**: Standard heights for optimal display
- **Responsive**: Adapts to mobile, tablet, and desktop screens

### Background Enhancement
- Square and tall images get subtle gradient backgrounds
- Prevents empty space around smaller images
- Maintains professional appearance across all image sizes

## Interactive Navigation

Each branding image is now clickable and navigates to different pages:

### Navigation Map
- **branding1.1**: Home page (/)
- **branding1.2**: Book Appointment (/book-appointment)
- **branding2.1**: Personal Care (/personal-care)
- **branding2.2**: Personal Care (/personal-care)
- **branding3.1**: Personal Care (/personal-care)
- **branding3.2**: Personal Care (/personal-care)
- **branding4.1**: About Us (/about)
- **branding4.2**: Contact Us (/contact)
- **branding4.3**: Upload Prescription (/upload-prescription)

### Interactive Features
- **Hover Effects**: Images scale slightly and brighten on hover
- **Navigation Hints**: Tooltip appears showing destination on hover
- **Smooth Transitions**: Professional animations for all interactions
- **Accessibility**: Proper ARIA labels for screen readers

## Customization

- Modify the `brandingImages` array to change images and orientations
- Adjust timing in the `useEffect` for auto-play speed
- Update the `getSliderHeight()` function for different sizes
- Customize navigation button styles and positioning