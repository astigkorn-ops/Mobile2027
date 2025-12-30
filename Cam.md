# GeoSnap Studio - Architecture Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Dependencies & Libraries](#dependencies--libraries)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Utilities & Helpers](#utilities--helpers)
6. [Hooks](#hooks)
7. [Pages](#pages)
8. [Styling System](#styling-system)
9. [API Integrations](#api-integrations)

---

## 🎯 Project Overview

**GeoSnap Studio** is a feature-rich web-based camera application that enables users to:
- Capture photos with live camera preview
- Embed GPS coordinates and EXIF metadata
- Add custom watermarks and text overlays
- Perform reverse geocoding for location information
- Export high-quality geotagged images

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS

---

## 📦 Dependencies & Libraries

### Core Camera & Media Libraries

#### 1. **react-webcam** (v7.2.0)
- **Purpose:** Camera access and photo capture
- **File:** `src/pages/GeoSnapStudio.jsx`
- **Usage:**
  ```typescript
  import Webcam from 'react-webcam';
  const webcamRef = useRef<Webcam>(null);
  const imageSrc = webcamRef.current?.getScreenshot();
  ```
- **Features Used:**
  - Front/back camera switching (`facingMode`)
  - Screenshot capture in JPEG format
  - Video constraints configuration
  - Real-time preview with zoom

#### 2. **html2canvas** (v1.4.1)
- **Purpose:** Canvas rendering for watermark composition
- **File:** `src/pages/GeoSnapStudio.jsx` (line 133-138)
- **Usage:**
  ```typescript
  import html2canvas from 'html2canvas';
  const canvas = await html2canvas(previewRef.current, {
    backgroundColor: '#000000',
    scale: 2, // For high quality
    useCORS: true,
    allowTaint: true,
  });
  ```
- **Features Used:**
  - Composite rendering of image + overlays
  - Quality scaling options
  - CORS-enabled image loading

---

### Geolocation Libraries

#### 3. **react-geolocated** (v4.4.0)
- **Purpose:** Real-time GPS coordinate tracking
- **File:** `src/pages/GeoSnapStudio.jsx` (line 62-70)
- **Usage:**
  ```typescript
  import { useGeolocated } from 'react-geolocated';
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    },
    watchPosition: true,
  });
  ```
- **Features Used:**
  - High-accuracy GPS positioning
  - Continuous position watching
  - Latitude, longitude, altitude, accuracy data

#### 4. **Nominatim API (OpenStreetMap)**
- **Purpose:** Reverse geocoding (coordinates → address)
- **File:** `src/pages/GeoSnapStudio.jsx` (line 92-104)
- **API Endpoint:**
  ```
  https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}
  ```
- **Features Used:**
  - Free reverse geocoding
  - No API key required
  - Returns formatted address strings

---

### EXIF Data Handling

#### 5. **piexifjs** (v1.0.6)
- **Purpose:** Embed and read EXIF metadata in JPEG images
- **File:** `src/utils/exifHandler.ts`
- **Usage:**
  ```typescript
  import piexif from 'piexifjs';
  
  // Embed EXIF data
  const exifBytes = piexif.dump(exifObj);
  const newImageDataUrl = piexif.insert(exifBytes, imageDataUrl);
  
  // Read EXIF data
  const exifObj = piexif.load(imageDataUrl);
  ```
- **Features Used:**
  - GPS coordinate embedding (lat/long/altitude)
  - Timestamp metadata
  - Device and software information
  - EXIF standard compliance

---

### File Upload & Drag-and-Drop

#### 6. **react-dropzone** (v14.3.8)
- **Purpose:** Logo file upload with drag-and-drop
- **File:** `src/pages/GeoSnapStudio.jsx` (line 85-89)
- **Usage:**
  ```typescript
  import { useDropzone } from 'react-dropzone';
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxFiles: 1,
  });
  ```
- **Features Used:**
  - Drag-and-drop zone
  - File type validation
  - Single file selection

---

### Date & Time Formatting

#### 7. **date-fns** (v4.1.0)
- **Purpose:** Date formatting for timestamps
- **File:** `src/pages/GeoSnapStudio.jsx` (line 6, 159, 426)
- **Usage:**
  ```typescript
  import { format } from 'date-fns';
  
  // Filename timestamp
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  
  // Display timestamp
  const displayTime = format(new Date(), 'PPpp');
  ```
- **Features Used:**
  - Flexible date formatting
  - Locale support
  - Human-readable formats

---

### UI Component Libraries

#### 8. **shadcn/ui Components** (Radix UI + Tailwind)
**File Paths:**
- `src/components/ui/button.jsx` - Button component
- `src/components/ui/slider.jsx` - Slider for zoom/opacity
- `src/components/ui/input.jsx` - Text input fields
- `src/components/ui/label.jsx` - Form labels
- `src/components/ui/switch.jsx` - Toggle switches
- `src/components/ui/select.jsx` - Dropdown selects
- `src/components/ui/card.jsx` - Card containers
- `src/components/ui/tabs.jsx` - Tabbed navigation

**Radix UI Dependencies:**
```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-slider": "^1.3.6",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-tabs": "^1.1.13"
}
```

#### 9. **lucide-react** (v0.561.0)
- **Purpose:** Icon library
- **File:** `src/pages/GeoSnapStudio.jsx` (line 7-10)
- **Icons Used:**
  - `Camera`, `Download`, `RotateCcw`, `Settings`
  - `MapPin`, `Zap`, `ZapOff`, `Grid3X3`
  - `ZoomIn`, `ZoomOut`, `FlipHorizontal`, `Upload`
  - `Image`, `Type`, `Sliders`, `Eye`, `EyeOff`, `Trash2`, `Save`

#### 10. **react-hot-toast** (v2.6.0)
- **Purpose:** Toast notifications
- **File:** `src/pages/GeoSnapStudio.jsx` (line 20)
- **Usage:**
  ```typescript
  import { toast } from 'react-hot-toast';
  toast.success('Photo captured!');
  toast.error('Failed to download image');
  toast.loading('Generating image...');
  ```

---

### Utility Libraries

#### 11. **@dnd-kit/core** (v6.3.1)
- **Purpose:** Drag-and-drop functionality for logo positioning
- **Status:** Available but currently using native mouse events
- **Potential Use:** Enhanced drag-and-drop for watermark positioning

#### 12. **framer-motion** (v12.23.26)
- **Purpose:** Animation library
- **Status:** Available for future animations
- **Potential Use:** Smooth transitions for camera controls

#### 13. **class-variance-authority** (v0.7.1)
- **Purpose:** Component variant management
- **File:** Used in UI components for button/card variants

#### 14. **clsx** (v2.1.1) + **tailwind-merge** (v3.4.0)
- **Purpose:** Conditional CSS class merging
- **File:** `src/lib/utils.ts`
- **Usage:**
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

---

## 📁 Project Structure

```
geosnap-studio-7jygs15t/
├── public/
│   ├── favicon.svg
│   ├── vite.svg
│   └── _redirects
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   └── ui/                      # shadcn UI components (50+ files)
│   │       ├── button.jsx
│   │       ├── slider.jsx
│   │       ├── input.jsx
│   │       ├── card.jsx
│   │       ├── tabs.jsx
│   │       └── ... (40+ more)
│   ├── hooks/
│   │   ├── use-mobile.jsx           # Mobile detection hook
│   │   └── use-toast.ts             # Toast notification hook
│   ├── lib/
│   │   └── utils.ts                 # Utility functions (cn helper)
│   ├── pages/
│   │   └── GeoSnapStudio.jsx        # Main camera application (708 lines)
│   ├── utils/
│   │   └── exifHandler.ts           # EXIF data utilities (175 lines)
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles & theme
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
├── tailwind.config.cjs              # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── ARCHITECTURE.md                  # This file
```

---

## 🧩 Core Components

### Main Application Component
**Path:** `src/pages/GeoSnapStudio.jsx`

#### State Management

```typescript
// Camera state
const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
const [showGrid, setShowGrid] = useState(false);
const [zoomLevel, setZoomLevel] = useState(1);
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');

// Watermark state
const [watermarkLogo, setWatermarkLogo] = useState<string | null>(null);
const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
const [logoSize, setLogoSize] = useState(100);
const [logoOpacity, setLogoOpacity] = useState(100);

// Text overlay state
const [eventTitle, setEventTitle] = useState('GeoSnap Studio');
const [eventSubtitle, setEventSubtitle] = useState('Professional Geotagging');
const [textColor, setTextColor] = useState('#FBBF24');
const [fontSize, setFontSize] = useState(24);
const [showEventText, setShowEventText] = useState(true);

// Geotag state
const [showGeoData, setShowGeoData] = useState(true);
const [showAddress, setShowAddress] = useState(true);
const [address, setAddress] = useState<string>('');

// Settings state
const [imageQuality, setImageQuality] = useState<'low' | 'medium' | 'high'>('high');
const [gpsUpdateInterval, setGpsUpdateInterval] = useState(5000);
const [showSettings, setShowSettings] = useState(false);
const [activeTemplate, setActiveTemplate] = useState('default');
```

#### Key Functions

1. **capturePhoto()** - Lines 107-119
   - Captures screenshot from webcam
   - Triggers reverse geocoding
   - Shows success toast

2. **downloadImage()** - Lines 127-171
   - Renders preview with html2canvas
   - Embeds EXIF data
   - Downloads as JPEG with timestamp filename

3. **fetchAddress()** - Lines 92-104
   - Reverse geocodes coordinates using Nominatim API
   - Updates address state

4. **applyTemplate()** - Lines 202-232
   - Applies predefined watermark templates
   - Templates: minimal, professional, compact, default

5. **Logo Drag Handlers** - Lines 180-199
   - `handleLogoMouseDown()` - Initiates drag
   - `handleLogoMouseMove()` - Updates position
   - `handleLogoMouseUp()` - Ends drag

---

## 🛠️ Utilities & Helpers

### EXIF Handler Utility
**Path:** `src/utils/exifHandler.ts`

#### Type Definitions
```typescript
interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

interface ExifData {
  coordinates?: GeoCoordinates;
  timestamp?: Date;
  deviceMake?: string;
  deviceModel?: string;
  software?: string;
  imageDescription?: string;
}
```

#### Core Functions

1. **embedExifData(imageDataUrl, exifData)** - Lines 73-149
   - Converts decimal coordinates to DMS format
   - Creates EXIF object with GPS, timestamp, device info
   - Inserts EXIF bytes into JPEG image
   - Returns modified image data URL

2. **toDegreesMinutesSeconds(coordinate)** - Lines 22-34
   - Converts decimal degrees to DMS format
   - Returns: `[[degrees, 1], [minutes, 1], [seconds*100, 100]]`

3. **latitudeToExif(latitude)** - Lines 39-44
   - Converts latitude with N/S reference
   - Returns: `{ value: DMS, ref: 'N' | 'S' }`

4. **longitudeToExif(longitude)** - Lines 49-54
   - Converts longitude with E/W reference
   - Returns: `{ value: DMS, ref: 'E' | 'W' }`

5. **formatExifDate(date)** - Lines 59-68
   - Formats date as: `YYYY:MM:DD HH:mm:ss`
   - EXIF-compliant timestamp format

6. **readExifData(imageDataUrl)** - Lines 154-162
   - Reads existing EXIF data from image
   - Returns parsed EXIF object

7. **removeExifData(imageDataUrl)** - Lines 167-174
   - Strips EXIF data from image
   - Returns clean image data URL

---

### Utils Library
**Path:** `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Purpose:** Merges Tailwind CSS classes with conflict resolution

**Usage:**
```typescript
import { cn } from '@/lib/utils';
<div className={cn('base-class', isActive && 'active-class', className)} />
```

---

## 🪝 Hooks

### 1. use-mobile.jsx
**Path:** `src/hooks/use-mobile.jsx`

```typescript
import { useMediaQuery } from 'react-responsive';

export function useMobile() {
  return useMediaQuery({ maxWidth: 768 });
}
```

**Purpose:** Detects if viewport is mobile-sized
**Usage:** `const isMobile = useMobile();`

---

### 2. use-toast.ts
**Path:** `src/hooks/use-toast.ts`

**Purpose:** Toast notification state management
**Used by:** shadcn Toast components
**Integration:** Works with `react-hot-toast` for notifications

---

## 📄 Pages

### GeoSnapStudio.jsx
**Path:** `src/pages/GeoSnapStudio.jsx`
**Lines:** 708 total

#### Layout Structure

```
┌─────────────────────────────────────────────┐
│ Header (Logo + Settings Button)            │
├─────────────────────────────────────────────┤
│                                             │
│  Main Content Area                          │
│  ┌──────────────────┬────────────────────┐ │
│  │                  │  Settings Sidebar  │ │
│  │  Camera View     │  ┌──────────────┐ │ │
│  │  (or Preview)    │  │ Watermark    │ │ │
│  │                  │  │ Geotag       │ │ │
│  │                  │  │ Settings     │ │ │
│  │                  │  └──────────────┘ │ │
│  └──────────────────┴────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### UI Sections

1. **Header (Lines 243-258)**
   - Camera icon + "GeoSnap Studio" title
   - Settings toggle button

2. **Camera View (Lines 264-356)**
   - Full-screen webcam preview
   - Grid overlay (optional)
   - GPS status indicator
   - Camera controls:
     - Grid toggle
     - Flash on/off
     - Capture button (center)
     - Flip camera button
     - Zoom slider

3. **Preview View (Lines 358-455)**
   - Captured image display
   - Logo watermark (draggable)
   - Event text overlay
   - Geotag information panel
   - Download & Retake buttons

4. **Settings Sidebar (Lines 460-708)**
   - Tabs: Watermark | Geotag | Settings
   
   **Watermark Tab:**
   - Logo upload dropzone
   - Logo size slider (50%-200%)
   - Logo opacity slider (10%-100%)
   - Event title/subtitle inputs
   - Text color picker
   - Font size slider
   - Template presets
   
   **Geotag Tab:**
   - Show GPS coordinates toggle
   - Show address toggle
   - Location accuracy display
   - GPS update interval
   
   **Settings Tab:**
   - Image quality selector (low/medium/high)
   - GPS update interval slider
   - Clear cache button

---

## 🎨 Styling System

### index.css
**Path:** `src/index.css`

#### Font Imports
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:...');
```

**Fonts:**
- **Sans:** DM Sans (headings, body text)
- **Serif:** Lora (alternative text styles)
- **Mono:** IBM Plex Mono (code, technical text)

#### CSS Variables (Theme System)

**Light Mode Colors:**
```css
:root {
  --background: 208 100% 97.0588%;
  --foreground: 216.9231 19.1176% 26.6667%;
  --primary: 280 70% 50%;           /* ⚠️ Placeholder */
  --accent: 280 60% 60%;            /* ⚠️ Placeholder */
  --ring: 280 70% 50%;              /* ⚠️ Placeholder */
  /* ... more colors ... */
}
```

**Dark Mode Colors:**
```css
.dark {
  --background: 222.2222 47.3684% 11.1765%;
  --foreground: 216 12.1951% 83.9216%;
  --primary: 280 65% 55%;           /* ⚠️ Placeholder */
  /* ... more colors ... */
}
```

**Shadow System:**
```css
--shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
--shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px ...;
--shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px ...;
--shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px ...;
--shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px ...;
```

#### Tailwind Configuration
**Path:** `tailwind.config.cjs`

**Custom Configuration:**
- Extends theme with CSS variables
- Custom color palette
- Border radius system
- Animation utilities

---

## 🌐 API Integrations

### 1. Nominatim (OpenStreetMap)

**Endpoint:**
```
GET https://nominatim.openstreetmap.org/reverse
```

**Parameters:**
- `format=json` - Response format
- `lat={latitude}` - Latitude coordinate
- `lon={longitude}` - Longitude coordinate
- `zoom=18` - Zoom level (1-18, higher = more detailed)
- `addressdetails=1` - Include address components

**Response Example:**
```json
{
  "place_id": 123456,
  "lat": "40.7128",
  "lon": "-74.0060",
  "display_name": "New York, NY, USA",
  "address": {
    "city": "New York",
    "state": "New York",
    "country": "United States"
  }
}
```

**Rate Limits:**
- 1 request per second
- Include User-Agent header
- Free for non-commercial use

**Usage in Code:**
```typescript
const fetchAddress = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
  );
  const data = await response.json();
  setAddress(data.display_name || 'Address not available');
};
```

---

## 📊 Data Flow

### Photo Capture Flow
```
1. User clicks capture button
   ↓
2. webcamRef.current.getScreenshot()
   ↓
3. Set capturedImage state
   ↓
4. If GPS enabled → fetchAddress(coords)
   ↓
5. Display preview with overlays
```

### Download Flow
```
1. User clicks download button
   ↓
2. html2canvas(previewRef.current)
   ↓
3. Convert canvas to JPEG data URL
   ↓
4. embedExifData() with GPS coordinates
   ↓
5. Create download link with timestamp filename
   ↓
6. Trigger download
```

### GPS Flow
```
1. useGeolocated() hook initializes
   ↓
2. Browser requests location permission
   ↓
3. Continuous position updates (watchPosition: true)
   ↓
4. coords state updates automatically
   ↓
5. Display in UI + embed in EXIF on download
```

---

## 🔧 Configuration Files

### package.json
**Path:** `package.json`

**Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "npm run lint:types && npm run lint:js && npm run lint:css",
  "preview": "vite preview"
}
```

### vite.config.ts
**Path:** `vite.config.ts`

**Key Configuration:**
- React plugin
- Path aliases (`@/` → `src/`)
- Build optimization

### tsconfig.json
**Path:** `tsconfig.json`

**TypeScript Configuration:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled

---

## 🚀 Development Workflow

### Starting Development
```bash
npm run dev
# or
bun run dev
```

### Building for Production
```bash
npm run build
# Creates optimized production build in dist/
```

### Running Linter
```bash
npm run lint
# Runs TypeScript, ESLint, and CSS linting
```

---

## 📝 Key Features Implementation

### 1. Camera Access
- **Library:** react-webcam
- **Code:** GeoSnapStudio.jsx lines 266-276
- **Features:** Front/back switch, zoom, grid overlay

### 2. Geotagging
- **Libraries:** react-geolocated, piexifjs
- **Code:** 
  - GPS: GeoSnapStudio.jsx lines 62-70
  - EXIF: exifHandler.ts lines 73-149
- **Features:** Real-time GPS, EXIF embedding, accuracy indicator

### 3. Watermarking
- **Libraries:** html2canvas, react-dropzone
- **Code:** GeoSnapStudio.jsx lines 85-89, 374-394
- **Features:** Logo upload, drag positioning, size/opacity control

### 4. Text Overlays
- **Code:** GeoSnapStudio.jsx lines 397-412
- **Features:** Custom title/subtitle, color picker, font size

### 5. Reverse Geocoding
- **API:** Nominatim (OpenStreetMap)
- **Code:** GeoSnapStudio.jsx lines 92-104
- **Features:** Address display, location text

---

## 🎯 Future Enhancement Opportunities

1. **Google Maps API Integration**
   - More accurate geocoding
   - Map preview mode

2. **Advanced Watermark Templates**
   - More preset styles
   - Custom template builder

3. **Batch Photo Mode**
   - Multiple captures
   - Bulk EXIF embedding

4. **Cloud Storage**
   - Direct upload to cloud services
   - Photo gallery management

5. **Photo Editing**
   - Filters and adjustments
   - Crop and rotate

---

## 📚 Additional Resources

### Official Documentation Links
- [react-webcam](https://www.npmjs.com/package/react-webcam)
- [react-geolocated](https://www.npmjs.com/package/react-geolocated)
- [html2canvas](https://html2canvas.hertzen.com/)
- [piexifjs](https://github.com/hMatoba/piexifjs)
- [react-dropzone](https://react-dropzone.js.org/)
- [date-fns](https://date-fns.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)

### EXIF Standards
- [EXIF Specification](https://www.exif.org/Exif2-2.PDF)
- [GPS EXIF Tags](https://www.awaresystems.be/imaging/tiff/tifftags/privateifd/gps.html)

---

