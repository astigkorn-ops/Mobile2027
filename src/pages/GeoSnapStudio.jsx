import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useGeolocated } from 'react-geolocated';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { 
  Camera, Download, RotateCcw, Settings, MapPin, Zap, ZapOff, 
  Grid3X3, ZoomIn, ZoomOut, FlipHorizontal, Upload, X, Image as ImageIcon,
  Type, Sliders, Eye, EyeOff, Trash2, Save, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { embedExifData } from '@/utils/exifHandler';

export default function GeoSnapStudio() {
  // Camera state
  const [facingMode, setFacingMode] = useState('environment');
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  
  // Watermark state
  const [watermarkLogo, setWatermarkLogo] = useState(null);
  const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
  const [logoSize, setLogoSize] = useState(100);
  const [logoOpacity, setLogoOpacity] = useState(100);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  
  // Text overlay state
  const [eventTitle, setEventTitle] = useState('GeoSnap Studio');
  const [eventSubtitle, setEventSubtitle] = useState('Professional Geotagging');
  const [textColor, setTextColor] = useState('#FBBF24');
  const [fontSize, setFontSize] = useState(24);
  const [showEventText, setShowEventText] = useState(true);
  
  // Geotag state
  const [showGeoData, setShowGeoData] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [address, setAddress] = useState('');
  
  // Settings state
  const [imageQuality, setImageQuality] = useState('high');
  const [gpsUpdateInterval, setGpsUpdateInterval] = useState(5000);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('default');
  
  // Refs
  const webcamRef = useRef(null);
  const previewRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Geolocation hook
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    },
    watchPosition: true,
    userDecisionTimeout: 10000,
  });

  // Logo upload with react-dropzone
  const onDropLogo = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setWatermarkLogo(reader.result);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  // Reverse geocoding with OpenStreetMap
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || 'Address not available';
      setAddress(formattedAddress);
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress('Address unavailable');
    }
  };

  // Capture photo
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      
      // Fetch address if coords available
      if (coords && showAddress) {
        fetchAddress(coords.latitude, coords.longitude);
      }
      
      toast.success('Photo captured!');
    }
  }, [coords, showAddress]);

  // Toggle camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Download with watermark, geotag, and EXIF data
  const downloadImage = async () => {
    if (!previewRef.current || !capturedImage) return;

    try {
      toast.loading('Generating image with EXIF data...');
      
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#000000',
        scale: imageQuality === 'high' ? 2 : imageQuality === 'medium' ? 1.5 : 1,
        useCORS: true,
        allowTaint: true,
      });

      // Get image data URL (JPEG format for EXIF compatibility)
      let imageDataUrl = canvas.toDataURL('image/jpeg', imageQuality === 'high' ? 0.95 : imageQuality === 'medium' ? 0.85 : 0.75);

      // Embed EXIF data if GPS coordinates are available
      if (coords) {
        imageDataUrl = embedExifData(imageDataUrl, {
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            altitude: coords.altitude || undefined,
            accuracy: coords.accuracy || undefined,
          },
          timestamp: new Date(),
          software: 'GeoSnap Studio v1.0',
          imageDescription: `${eventTitle} - ${eventSubtitle}`,
        });
      }

      const link = document.createElement('a');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      link.download = `geosnap_${timestamp}.jpg`;
      link.href = imageDataUrl;
      link.click();
      
      toast.dismiss();
      toast.success('Image with EXIF data downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download image');
      console.error('Download error:', error);
    }
  };

  // Reset capture
  const resetCapture = () => {
    setCapturedImage(null);
    setAddress('');
  };

  // Logo drag handlers
  const handleLogoMouseDown = (e) => {
    setIsDraggingLogo(true);
    dragStartPos.current = {
      x: e.clientX - logoPosition.x,
      y: e.clientY - logoPosition.y,
    };
  };

  const handleLogoMouseMove = (e) => {
    if (isDraggingLogo && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - dragStartPos.current.x, rect.width - logoSize));
      const y = Math.max(0, Math.min(e.clientY - rect.top - dragStartPos.current.y, rect.height - logoSize));
      setLogoPosition({ x, y });
    }
  };

  const handleLogoMouseUp = () => {
    setIsDraggingLogo(false);
  };

  // Template presets
  const applyTemplate = (template) => {
    switch (template) {
      case 'minimal':
        setShowEventText(false);
        setShowGeoData(true);
        setShowAddress(false);
        setLogoOpacity(80);
        break;
      case 'professional':
        setShowEventText(true);
        setShowGeoData(true);
        setShowAddress(true);
        setLogoOpacity(100);
        setTextColor('#FBBF24');
        break;
      case 'compact':
        setShowEventText(true);
        setShowGeoData(true);
        setShowAddress(false);
        setFontSize(18);
        break;
      default:
        // Default template
        setShowEventText(true);
        setShowGeoData(true);
        setShowAddress(true);
        setLogoOpacity(100);
    }
    setActiveTemplate(template);
    toast.success(`Applied ${template} template`);
  };

  // Clear cache
  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache cleared successfully!');
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-blue-500/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">GeoSnap Studio</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!capturedImage ? (
            // Camera View
            <div className="flex-1 relative bg-black">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  aspectRatio: 16 / 9,
                }}
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="h-full w-full grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
              )}

              {/* GPS Status Indicator */}
              {isGeolocationAvailable && isGeolocationEnabled && coords && (
                <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  GPS Active
                </div>
              )}

              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  {/* Left Controls */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowGrid(!showGrid)}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFlashMode(prev => prev === 'off' ? 'on' : 'off')}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {flashMode === 'off' ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </Button>
                  </div>

                  {/* Capture Button */}
                  <Button
                    size="icon"
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-gray-900"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>

                  {/* Right Controls */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleCamera}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Zoom Control */}
                <div className="mt-4 flex items-center gap-3 max-w-md mx-auto">
                  <ZoomOut className="w-5 h-5 text-white" />
                  <Slider
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    min={1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ) : (
            // Preview View
            <div className="flex-1 bg-black relative overflow-hidden">
              <div
                ref={previewRef}
                className="w-full h-full relative"
                onMouseMove={handleLogoMouseMove}
                onMouseUp={handleLogoMouseUp}
                onMouseLeave={handleLogoMouseUp}
              >
                {/* Captured Image */}
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />

                {/* Logo Overlay */}
                {watermarkLogo && (
                  <div
                    className="absolute cursor-move"
                    style={{
                      left: `${logoPosition.x}px`,
                      top: `${logoPosition.y}px`,
                      width: `${logoSize}px`,
                      height: `${logoSize}px`,
                      opacity: logoOpacity / 100,
                    }}
                    onMouseDown={handleLogoMouseDown}
                  >
                    <img
                      src={watermarkLogo}
                      alt="Logo"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Event Text Overlay */}
                {showEventText && (
                  <div className="absolute top-6 left-6 right-6">
                    <div
                      className="font-bold mb-1"
                      style={{ color: textColor, fontSize: `${fontSize}px` }}
                    >
                      {eventTitle}
                    </div>
                    <div
                      className="text-white"
                      style={{ fontSize: `${fontSize * 0.65}px` }}
                    >
                      {eventSubtitle}
                    </div>
                  </div>
                )}

                {/* Geotag Overlay */}
                {showGeoData && coords && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold">
                      <MapPin className="w-5 h-5" />
                      GEOTAGGED PHOTO
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white text-sm">
                      <div><strong>Latitude:</strong> {coords.latitude.toFixed(6)}°</div>
                      <div><strong>Longitude:</strong> {coords.longitude.toFixed(6)}°</div>
                      <div><strong>Accuracy:</strong> ±{coords.accuracy?.toFixed(0)}m</div>
                      <div><strong>Altitude:</strong> {coords.altitude?.toFixed(0) || 'N/A'}m</div>
                      <div className="col-span-2"><strong>Time:</strong> {format(new Date(), 'PPpp')}</div>
                    </div>
                    {showAddress && address && (
                      <div className="mt-2 text-white text-sm">
                        <strong>Location:</strong> {address}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={downloadImage}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={resetCapture}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-96 bg-slate-900/95 backdrop-blur-md border-l border-blue-500/30 overflow-y-auto">
            <Tabs defaultValue="watermark" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-slate-800">
                <TabsTrigger value="watermark">Watermark</TabsTrigger>
                <TabsTrigger value="geotag">Geotag</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Watermark Tab */}
              <TabsContent value="watermark" className="p-4 space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Logo Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-300">
                        {isDragActive ? 'Drop logo here' : 'Drag & drop logo or click to browse'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG or JPEG</p>
                    </div>

                    {watermarkLogo && (
                      <div className="flex items-center justify-between bg-slate-700 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white">Logo uploaded</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setWatermarkLogo(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-white">Logo Size: {logoSize}px</Label>
                      <Slider
                        value={[logoSize]}
                        onValueChange={(value) => setLogoSize(value[0])}
                        min={50}
                        max={200}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Logo Opacity: {logoOpacity}%</Label>
                      <Slider
                        value={[logoOpacity]}
                        onValueChange={(value) => setLogoOpacity(value[0])}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Text Overlay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Text</Label>
                      <Switch
                        checked={showEventText}
                        onCheckedChange={setShowEventText}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Event Title</Label>
                      <Input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Subtitle</Label>
                      <Input
                        value={eventSubtitle}
                        onChange={(e) => setEventSubtitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Font Size: {fontSize}px</Label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={16}
                        max={48}
                        step={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['default', 'professional', 'minimal', 'compact'].map((template) => (
                      <Button
                        key={template}
                        variant={activeTemplate === template ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => applyTemplate(template)}
                      >
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Geotag Tab */}
              <TabsContent value="geotag" className="p-4 space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">GPS Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show GPS Data</Label>
                      <Switch
                        checked={showGeoData}
                        onCheckedChange={setShowGeoData}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Address</Label>
                      <Switch
                        checked={showAddress}
                        onCheckedChange={setShowAddress}
                      />
                    </div>

                    <div className="p-3 bg-slate-700 rounded-lg">
                      <div className="text-sm text-white space-y-1">
                        {isGeolocationAvailable ? (
                          isGeolocationEnabled ? (
                            coords ? (
                              <>
                                <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                                  <MapPin className="w-4 h-4" />
                                  GPS Active
                                </div>
                                <div><strong>Lat:</strong> {coords.latitude.toFixed(6)}°</div>
                                <div><strong>Lon:</strong> {coords.longitude.toFixed(6)}°</div>
                                <div><strong>Accuracy:</strong> ±{coords.accuracy?.toFixed(0)}m</div>
                              </>
                            ) : (
                              <div className="text-yellow-400">Acquiring GPS signal...</div>
                            )
                          ) : (
                            <div className="text-red-400">GPS not enabled</div>
                          )
                        ) : (
                          <div className="text-red-400">GPS not available</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-4 space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Image Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={imageQuality} onValueChange={(value) => setImageQuality(value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Fast)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={clearCache}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}