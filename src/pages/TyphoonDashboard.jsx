import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TyphoonDashboard = () => {
  const [typhoonData, setTyphoonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTyphoonData();
  }, []);

  const fetchTyphoonData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll simulate data
      const mockData = {
        id: 'typhoon-2027',
        name: 'Typhoon Agaton',
        signalLevel: '3',
        location: '150 km East of Manila',
        maxWindSpeed: 185,
        movement: 'West at 15 kph',
        estimatedLandfall: '2025-01-15 14:00:00',
        status: 'approaching',
        updatedAt: new Date().toISOString(),
      };
      
      setTyphoonData(mockData);
      
      // Check if we need to send a notification
      if (shouldSendNotification(mockData)) {
        sendTyphoonNotification(mockData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching typhoon data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine if a notification should be sent
  const shouldSendNotification = (data) => {
    // Check if this is a new significant update compared to last notification
    const lastNotification = localStorage.getItem('lastTyphoonNotification');
    if (!lastNotification) return true;
    
    const lastData = JSON.parse(lastNotification);
    // Send notification if signal level increased or new typhoon
    return data.signalLevel > lastData.signalLevel || data.id !== lastData.id;
  };

  // Function to send typhoon notification
  const sendTyphoonNotification = (data) => {
    // Store this notification to avoid duplicates
    localStorage.setItem('lastTyphoonNotification', JSON.stringify(data));
    
    // Send notification to service worker if available
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'SEND_PUSH_NOTIFICATION',
          payload: {
            type: 'typhoon-alert',
            title: `Typhoon ${data.name} Alert`,
            body: `Signal #${data.signalLevel} issued. Expected landfall: ${new Date(data.estimatedLandfall).toLocaleString()}`,
            tag: `typhoon-${data.id}`,
            url: '/typhoon-dashboard',
            typhoonName: data.name,
            signalLevel: data.signalLevel,
            estimatedTime: data.estimatedLandfall,
            id: data.id,
            message: `Signal #${data.signalLevel} issued for Typhoon ${data.name}. Expected landfall: ${new Date(data.estimatedLandfall).toLocaleString()}`
          }
        });
      });
    }
  };

  // Function to send signal warning notification
  const sendSignalWarning = (signalLevel, message) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'SEND_PUSH_NOTIFICATION',
          payload: {
            type: 'signal-warning',
            title: `Signal Warning ${signalLevel}`,
            body: message,
            tag: `signal-${signalLevel}-${Date.now()}`,
            url: '/typhoon-dashboard',
            signalLevel: signalLevel,
            message: message
          }
        });
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading typhoon data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
        <Button onClick={fetchTyphoonData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Typhoon Dashboard</h1>
      
      {typhoonData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Typhoon {typhoonData.name}</span>
              <Badge 
                variant={typhoonData.signalLevel >= 4 ? "destructive" : typhoonData.signalLevel === 3 ? "default" : "secondary"}
                className="text-lg py-1 px-3"
              >
                Signal {typhoonData.signalLevel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>{typhoonData.location}</p>
              </div>
              <div>
                <h3 className="font-semibold">Max Wind Speed</h3>
                <p>{typhoonData.maxWindSpeed} km/h</p>
              </div>
              <div>
                <h3 className="font-semibold">Movement</h3>
                <p>{typhoonData.movement}</p>
              </div>
              <div>
                <h3 className="font-semibold">Estimated Landfall</h3>
                <p>{new Date(typhoonData.estimatedLandfall).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={() => sendSignalWarning('4', 'New signal level 4 warning issued for upcoming typhoon')}>
                Test Signal Warning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preparedness Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Secure loose outdoor objects</li>
              <li>Prepare emergency kit</li>
              <li>Check evacuation routes</li>
              <li>Charge all devices</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evacuation Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nearest evacuation centers in your area</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Quick access to emergency numbers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TyphoonDashboard;