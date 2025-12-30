import { 
  Camera, 
  FlipHorizontal, 
  Zap, 
  ZoomIn, 
  Grid3x3, 
  MapPin, 
  Upload, 
  Download,
  Settings,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface InstructionsProps {
  onClose: () => void;
}

export const Instructions = ({ onClose }: InstructionsProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">GeoCam Instructions</h1>
              <p className="text-sm text-white/60">Learn how to use all features</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Welcome */}
            <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
              <h2 className="text-xl font-bold text-white mb-2">Welcome to GeoCam!</h2>
              <p className="text-sm text-white/80 leading-relaxed">
                GeoCam is a smart event camera app that captures photos with GPS coordinates, 
                addresses, timestamps, and custom watermarks. Perfect for field documentation, 
                surveys, inspections, and events.
              </p>
            </Card>

            {/* Camera Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Camera Controls
              </h3>
              
              <Card className="p-5 bg-white/5 border-white/10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Capture Photo</h4>
                      <p className="text-sm text-white/70">
                        Tap the large white button at the bottom center to capture a photo with 
                        automatic geotagging and watermark overlay.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FlipHorizontal className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Switch Camera</h4>
                      <p className="text-sm text-white/70">
                        Toggle between front and rear cameras on mobile devices. Perfect for 
                        selfies or capturing the scene ahead.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
