import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Toggle } from './ui/toggle';
import {
  Camera,
  FlipHorizontal,
  Zap,
  ZapOff,
  Grid3x3,
  Download,
  Upload,
  ZoomIn,
  MapPin,
  Settings,
  X,
  RefreshCcw,
  Info,
  Package,
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import { Instructions } from './Instructions';
import { Libraries } from './Libraries';

export const GeoCam = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Camera states
  const [facingMode, setFacingMode] = useState('environment');
  const [flashMode, setFlashMode] = useState('off');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [logo, setLogo] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLibraries, setShowLibraries] = useState(false);
  
  // Geolocation
  const { location, address, error: geoError, loading: geoLoading } = useGeolocation();

  // Logo upload
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
        toast({
          title: 'Logo uploaded',
          description: 'Your logo has been successfully uploaded',
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
    },
    maxFiles: 1,
  });

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Toggle flash mode
  const toggleFlash = () => {
    setFlashMode((prev) => {
      const next = prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off';
      return next;
    });
  };

    // Handle capture
    const capturePhoto = () => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    };
  
    // Download image
    const downloadImage = () => {
      if (!capturedImage) return;
      const link = document.createElement('a');
      const filename = `geotag_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.download = filename;
      link.href = capturedImage;
      link.click();
    };
  
    // Reset capture
    const resetCapture = () => {
      setCapturedImage(null);
    };
  
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <main className="flex flex-col h-full">
          {!showInstructions && !showLibraries ? (
            <>
              <div className="flex-1 bg-black relative overflow-hidden">
                {!capturedImage ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode,
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${zoom})`,
                    }}
                  />
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                )}
  
                {showGrid && !capturedImage && (
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px'}} />
                )}
  
                {showLocation && location && !capturedImage && (
                  <div className="absolute top-4 left-4 bg-blue-900/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-blue-500/50">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white font-medium">
                      {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                    </span>
                  </div>
                )}
  
                {showLogo && logo && !capturedImage && (
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
                  </div>
                )}
              </div>
  
              <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10 space-y-4">
                {!capturedImage ? (
                  <>
                    {zoom > 1 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Zoom</span>
                          <span className="text-white">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={(value) => setZoom(value[0])} className="w-full" />
                      </div>
                    )}
  
                    <div className="flex gap-3">
                      <Button onClick={toggleCamera} variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
                        <FlipHorizontal className="w-5 h-5 text-white" />
                      </Button>
                      <Button onClick={toggleFlash} variant="outline" size="icon" className={cn("flex-1 bg-white/10 hover:bg-white/20 border-white/20", flashMode !== 'off' && "bg-yellow-500/30 border-yellow-500/50")}>
                        {flashMode === 'off' ? <ZapOff className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-yellow-400" />}
                      </Button>
                      <Toggle pressed={showGrid} onPressedChange={setShowGrid} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3">
                        <Grid3x3 className="w-5 h-5 text-white" />
                      </Toggle>
                    </div>
  
                    <div className="flex gap-3">
                      <Toggle pressed={showLocation} onPressedChange={setShowLocation} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3">
                        <MapPin className="w-5 h-5 text-white" />
                      </Toggle>
                      <Toggle pressed={showLogo} onPressedChange={setShowLogo} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3">
                        <Package className="w-5 h-5 text-white" />
                      </Toggle>
                      <Button onClick={() => setShowControls(!showControls)} variant="outline" size="icon" className="flex-1 bg-white/10 hover:bg-white/20 border-white/20">
                        <Settings className="w-5 h-5 text-white" />
                      </Button>
                    </div>
  
                    <Button onClick={capturePhoto} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-6 text-lg rounded-lg flex items-center justify-center gap-2">
                      <Camera className="w-6 h-6" />
                      Capture Photo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={downloadImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Save Photo
                    </Button>
                    <Button onClick={resetCapture} variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold py-4 rounded-lg">
                      <RefreshCcw className="w-5 h-5 mr-2" />
                      Retake
                    </Button>
                  </>
                )}
  
                {showControls && !capturedImage && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <Button onClick={() => setShowInstructions(true)} variant="ghost" className="w-full text-white hover:bg-white/10">
                      <Info className="w-4 h-4 mr-2" />
                      Instructions
                    </Button>
                    <Button onClick={() => setShowLibraries(true)} variant="ghost" className="w-full text-white hover:bg-white/10">
                      <Package className="w-4 h-4 mr-2" />
                      Libraries
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : null}
  
          {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}
          {showLibraries && <Libraries onClose={() => setShowLibraries(false)} />}
        </main>
      </div>
    );
  };
  
  export default GeoCam;
