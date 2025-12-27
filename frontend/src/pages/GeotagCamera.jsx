import { useState, useRef, useEffect } from 'react';
import { Camera, Download, RotateCcw, MapPin, Settings, FlipHorizontal, Calendar, Navigation, WifiOff, CameraOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';

export default function GeotagCamera() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [gpsStatus, setGpsStatus] = useState('checking');
  const [cameraReady, setCameraReady] = useState(false);
  const [showGps, setShowGps] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [watermarkText, setWatermarkText] = useState('Resilient Pio Duran');
  const [watermarkSubtext, setWatermarkSubtext] = useState('Prepared for Tomorrow');
  const [watermarkLogo, setWatermarkLogo] = useState(null);
  const [showLogo, setShowLogo] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check GPS availability on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('available'),
        () => setGpsStatus('unavailable'),
        { timeout: 3000, maximumAge: 30000 }
      );
    } else {
      setGpsStatus('unsupported');
    }
  }, []);

  // Check available cameras on mount
  useEffect(() => {
    const checkAvailableCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError('Camera API not supported by this browser.');
          setCameraReady(false);
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setError('No camera devices found on this device.');
          setCameraReady(false);
          return;
        }
        
        setAvailableCameras(videoDevices);
        // Set the first camera as default
        setSelectedCameraId(videoDevices[0].deviceId);
        setCameraReady(true);
      } catch (err) {
        console.error('Error checking cameras:', err);
        setError('Unable to detect camera devices. Please ensure camera permissions are granted.');
        setCameraReady(false);
      }
    };

    checkAvailableCameras();
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      
      // Build constraints based on available cameras
      let constraints;
      
      if (selectedCameraId) {
        // If we have a specific camera selected
        constraints = {
          video: { 
            deviceId: { exact: selectedCameraId },
            facingMode: facingMode
          },
          audio: false
        };
      } else {
        // Fallback to facing mode only
        constraints = {
          video: { 
            facingMode: facingMode
          },
          audio: false
        };
      }
      
      // Try to get user media with the constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      // If the first attempt fails, try with more relaxed constraints
      if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        try {
          const fallbackConstraints = {
            video: true,
            audio: false
          };
          const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          setStream(mediaStream);
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (fallbackErr) {
          console.error('Fallback camera error:', fallbackErr);
          setError('Unable to access camera. Please check if another app is using the camera or grant camera permissions.');
          setCameraActive(false);
        }
      } else if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else {
        setError('Unable to access camera. Please ensure your device has a working camera.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(imageData);
    
    // Get GPS location if enabled
    if (showGps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          
          setGeoData({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
            accuracy: position.coords.accuracy.toFixed(2),
            timestamp: timestamp,
            altitude: position.coords.altitude ? position.coords.altitude.toFixed(2) : 'N/A',
            heading: position.coords.heading ? position.coords.heading.toFixed(2) : 'N/A',
            speed: position.coords.speed ? position.coords.speed.toFixed(2) : 'N/A'
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to get GPS location. Please enable location services.');
          
          // Still set timestamp even if GPS fails
          const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          
          setGeoData({
            latitude: 'N/A',
            longitude: 'N/A',
            accuracy: 'N/A',
            altitude: 'N/A',
            heading: 'N/A',
            speed: 'N/A',
            timestamp: timestamp
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    } else if (showGps) {
      setError('Geolocation is not supported by this browser.');
    }
    
    // Stop camera after capture
    stopCamera();
  };

  const downloadImage = () => {
    if (!capturedImage) return;

    // Create a new canvas to add geotag overlay
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      
      // Draw the captured image
      ctx.drawImage(img, 0, 0);
      
      // Add watermark text at top
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, 300, 80);
      
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(watermarkText, 10, 30);
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(watermarkSubtext, 10, 55);
      
      // Add logo if enabled
      if (showLogo && watermarkLogo) {
        const logo = new Image();
        logo.onload = () => {
          ctx.drawImage(logo, 10, 10, 50, 50);
          addGeotagOverlay(ctx);
        };
        logo.src = watermarkLogo;
      } else {
        addGeotagOverlay(ctx);
      }
    };
    
    img.src = capturedImage;
    
    const addGeotagOverlay = (ctx) => {
      if (showGps && geoData) {
        // Add semi-transparent overlay at bottom
        const overlayHeight = 160;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
        
        // Add geotag text
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('📍 GEOTAGGED PHOTO', 25, canvas.height - 125);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(`Lat: ${geoData.latitude}°  Long: ${geoData.longitude}°`, 25, canvas.height - 90);
        if (showDate) {
          ctx.fillText(`Time: ${geoData.timestamp}`, 25, canvas.height - 60);
        }
        if (geoData.accuracy !== 'N/A') {
          ctx.fillText(`Alt: ${geoData.altitude}m  Acc: ±${geoData.accuracy}m`, 25, canvas.height - 30);
        }
      } else if (showDate) {
        // Add date only if GPS is disabled
        const timestamp = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        // Add semi-transparent overlay at bottom
        const overlayHeight = 60;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
        
        // Add timestamp text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(`Time: ${timestamp}`, 25, canvas.height - 25);
      }
      
      // Download the image
      const link = document.createElement('a');
      const filename = `geotag_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
    };
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setGeoData(null);
    setError('');
    setShowSettings(false);
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      // If only one camera, toggle facing mode
      const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode);
    } else {
      // Cycle through available cameras
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].deviceId);
    }
    
    if (cameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermarkLogo(event.target.result);
        setShowLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getGpsStatusIcon = () => {
    switch (gpsStatus) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unavailable':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'unsupported':
        return <CameraOff className="w-5 h-5 text-gray-500" />;
      default:
        return <Navigation className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getGpsStatusText = () => {
    switch (gpsStatus) {
      case 'available':
        return 'GPS Ready';
      case 'unavailable':
        return 'GPS Unavailable';
      case 'unsupported':
        return 'GPS Not Supported';
      default:
        return 'Checking GPS...';
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-950 flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col">
        <Header
          title="Geotag Camera"
          showBack
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {!capturedImage ? (
            <div className="flex-1 flex flex-col">
              {/* Camera View */}
              <div className="flex-1 bg-black relative">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      data-testid="camera-video"
                    />
                    
                    {/* GPS Status Badge */}
                    <div className="absolute top-4 left-4 bg-blue-900/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-blue-500/50 shadow-lg">
                      {getGpsStatusIcon()}
                      <span className={`text-sm font-semibold ${
                        gpsStatus === 'available' ? 'text-green-400' : 
                        gpsStatus === 'unavailable' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {getGpsStatusText()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-28 h-28 text-gray-600 mx-auto mb-4" />
                      {!cameraReady ? (
                        <div className="space-y-2">
                          <p className="text-red-400 text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error || 'Checking camera devices...'}
                          </p>
                          {(!error || error.includes('permissions')) && (
                            <p className="text-gray-400 text-xs">Please allow camera permissions when prompted</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xl">Camera ready to start</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Settings Panel */}
                {showSettings && cameraActive && (
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl max-w-xs">
                    <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2.5">
                      <Settings className="w-5 h-5" />
                      Camera Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Camera Device</label>
                        {availableCameras.length > 0 && (
                          <select
                            value={selectedCameraId || ''}
                            onChange={(e) => setSelectedCameraId(e.target.value)}
                            className="w-full bg-white/10 text-white rounded-xl p-3 text-sm mb-2 backdrop-blur-sm border border-white/20 focus:border-yellow-400 focus:outline-none"
                            data-testid="camera-select"
                          >
                            {availableCameras.map((camera) => (
                              <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">GPS Location</label>
                        <button
                          onClick={() => setShowGps(!showGps)}
                          className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            showGps 
                              ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border border-green-500/30' 
                              : 'bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border border-red-500/30'
                          } backdrop-blur-sm`}
                          data-testid="toggle-gps-btn"
                        >
                          {showGps ? 'GPS ON' : 'GPS OFF'}
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Show Date</label>
                        <button
                          onClick={() => setShowDate(!showDate)}
                          className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            showDate 
                              ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border border-green-500/30' 
                              : 'bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border border-red-500/30'
                          } backdrop-blur-sm`}
                          data-testid="toggle-date-btn"
                        >
                          {showDate ? 'Date ON' : 'Date OFF'}
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Watermark Text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full bg-white/10 text-white rounded-xl p-3 text-sm mb-2 backdrop-blur-sm border border-white/20 focus:border-yellow-400 focus:outline-none"
                          placeholder="Main text"
                          data-testid="watermark-text-input"
                        />
                        <input
                          type="text"
                          value={watermarkSubtext}
                          onChange={(e) => setWatermarkSubtext(e.target.value)}
                          className="w-full bg-white/10 text-white rounded-xl p-3 text-sm backdrop-blur-sm border border-white/20 focus:border-yellow-400 focus:outline-none"
                          placeholder="Sub text"
                          data-testid="watermark-subtext-input"
                        />
                      </div>
                      
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Logo</label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-blue-500/30"
                            data-testid="upload-logo-btn"
                          >
                            Upload Logo
                          </button>
                          <button
                            onClick={() => setShowLogo(!showLogo)}
                            className={`w-16 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm ${
                              showLogo 
                                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border border-green-500/30' 
                                : 'bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border border-red-500/30'
                            }`}
                            data-testid="toggle-logo-btn"
                          >
                            {showLogo ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          data-testid="logo-file-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Controls */}
              <div className="p-5 bg-white/10 backdrop-blur-xl border-t border-white/20">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2" data-testid="error-message">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    disabled={!cameraReady}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-blue-950 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-yellow-400/30"
                    data-testid="start-camera-btn"
                  >
                    <Camera className="w-6 h-6" />
                    {cameraReady ? 'Start Camera' : 'Checking Camera...'}
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={switchCamera}
                      className="w-14 h-14 bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center"
                      title={availableCameras.length > 1 ? "Switch Camera" : "Switch Facing Mode"}
                      data-testid="switch-camera-btn"
                    >
                      <FlipHorizontal className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`w-14 h-14 rounded-2xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center ${
                        showSettings 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 text-white border border-blue-500/30'
                      }`}
                      title="Settings"
                      data-testid="settings-btn"
                    >
                      <Settings className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-950 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-yellow-400/30"
                      data-testid="capture-photo-btn"
                    >
                      <Camera className="w-6 h-6" />
                      Capture
                    </button>
                    
                    <button
                      onClick={stopCamera}
                      className="w-14 h-14 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm border border-red-500/30 flex items-center justify-center"
                      title="Stop Camera"
                      data-testid="stop-camera-btn"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-auto">
              {/* Captured Image Preview */}
              <div className="flex-1 bg-black relative">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-contain"
                  data-testid="captured-image"
                />
                
                {/* Geotag Overlay */}
                {geoData && showGps && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl p-5 border-t border-white/20">
                    <div className="text-yellow-400 font-bold text-xl mb-3 flex items-center gap-2.5">
                      <MapPin className="w-6 h-6" />
                      GEOTAGGED PHOTO
                    </div>
                    <div className="text-white text-sm space-y-2.5">
                      <div className="flex flex-wrap gap-4">
                        <div><strong>Latitude:</strong> {geoData.latitude}°</div>
                        <div><strong>Longitude:</strong> {geoData.longitude}°</div>
                      </div>
                      {geoData.accuracy !== 'N/A' && (
                        <div className="flex flex-wrap gap-4">
                          <div><strong>Accuracy:</strong> ±{geoData.accuracy}m</div>
                          <div><strong>Altitude:</strong> {geoData.altitude}m</div>
                        </div>
                      )}
                      {geoData.heading !== 'N/A' && (
                        <div className="flex flex-wrap gap-4">
                          <div><strong>Heading:</strong> {geoData.heading}°</div>
                          <div><strong>Speed:</strong> {geoData.speed} m/s</div>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-5 h-5" />
                        <strong>Timestamp:</strong> {geoData.timestamp}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-5 bg-white/10 backdrop-blur-xl border-t border-white/20">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-green-500/30"
                    data-testid="download-image-btn"
                  >
                    <Download className="w-6 h-6" />
                    Save Photo
                  </button>
                  <button
                    onClick={resetCapture}
                    className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-blue-500/30"
                    data-testid="reset-capture-btn"
                  >
                    <RotateCcw className="w-6 h-6" />
                    Retake
                  </button>
                </div>
                
                <div className="bg-green-500/15 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                  ✓ Photo captured with enhanced geotag data!
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
