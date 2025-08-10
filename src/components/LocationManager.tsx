import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, Space, message, Row, Col, Divider, Alert } from 'antd';
import { EnvironmentOutlined, SaveOutlined, EditOutlined, AimOutlined, LoadingOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const { Title, Text } = Typography;

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const LocationManager: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);

  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const radiusInMeters = 2000; // 2km radius

  // Load saved location on component mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = () => {
    try {
      const savedLocation = localStorage.getItem('clockin-location');
      if (savedLocation) {
        const locationData: LocationData = JSON.parse(savedLocation);
        setLocation(locationData);
        setLocationName(locationData.name);
        message.success('Saved location loaded successfully');
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
      message.error('Failed to load saved location');
    }
  };

  const getCurrentLocation = async () => {
    setGeoLoading(true);
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser');
      setGeoLoading(false);
      message.error('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const placeName = data.display_name || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            // Extract a more readable name from the address components
            let readableName = '';
            if (data.address) {
              const address = data.address;
              if (address.hospital || address.clinic) {
                readableName = address.hospital || address.clinic;
              } else if (address.building || address.house_name) {
                readableName = address.building || address.house_name;
              } else if (address.road && address.house_number) {
                readableName = `${address.house_number} ${address.road}`;
              } else if (address.road) {
                readableName = address.road;
              } else if (address.neighbourhood || address.suburb) {
                readableName = address.neighbourhood || address.suburb;
              } else {
                readableName = placeName.split(',')[0]; // Take first part of display name
              }
            }
            
            const detectedLocation: LocationData = {
              lat: latitude,
              lng: longitude,
              name: readableName || `Current Location`,
              timestamp: new Date().toISOString(),
            };
            
            setLocation(detectedLocation);
            setLocationName(readableName || 'Current Location');
            setIsEditing(true);
            
            message.success('Current location detected successfully!');
          } else {
            throw new Error('Failed to get location name');
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          
          // Fallback: use coordinates without name
          const fallbackLocation: LocationData = {
            lat: latitude,
            lng: longitude,
            name: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            timestamp: new Date().toISOString(),
          };
          
          setLocation(fallbackLocation);
          setLocationName(fallbackLocation.name);
          setIsEditing(true);
          
          message.warning('Location detected but could not get place name');
        }
        
        setGeoLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location';
            break;
        }
        
        setGeoError(errorMessage);
        setGeoLoading(false);
        message.error(errorMessage);
      },
      options
    );
  };
  const handleLocationSelect = (lat: number, lng: number) => {
    const newLocation: LocationData = {
      lat,
      lng,
      name: locationName,
      timestamp: new Date().toISOString(),
    };
    setLocation(newLocation);
    setIsEditing(true);
    message.info('Location selected. Click "Save Location" to confirm.');
  };

  const handleSaveLocation = async () => {
    if (!location) {
      message.warning('Please select a location on the map first');
      return;
    }

    if (!locationName.trim()) {
      message.warning('Please enter a location name');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const locationToSave: LocationData = {
        ...location,
        name: locationName.trim(),
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage (simulating backend)
      localStorage.setItem('clockin-location', JSON.stringify(locationToSave));
      
      setLocation(locationToSave);
      setIsEditing(false);
      
      message.success('Clock-in location saved successfully!');
    } catch (error) {
      console.error('Error saving location:', error);
      message.error('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMode = () => {
    setIsEditing(true);
    message.info('Edit mode enabled. Click on the map to select a new location.');
  };

  const handleCancelEdit = () => {
    if (location) {
      setLocationName(location.name);
    }
    setIsEditing(false);
    message.info('Edit cancelled');
  };

  const mapCenter: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <div className="mb-6">
          <Title level={2} className="flex items-center gap-2 mb-2">
            <EnvironmentOutlined className="text-blue-600" />
            Clock-in Location Manager
          </Title>
          <Text type="secondary">
            Set and manage the clock-in location for healthcare staff. Click on the map to select a location.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Map Section */}
          <Col xs={24} lg={16}>
            <Card title="Select Location" size="small" className="h-full">
              <div className="mb-4">
                <Text type="secondary" className="text-sm">
                  Click anywhere on the map to set the clock-in location. The blue circle shows the 2km radius.
                </Text>
              </div>
              
              <div className="relative">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
                  className="rounded-lg border border-gray-200"
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  
                  {location && (
                    <>
                      <Marker position={[location.lat, location.lng]}>
                        <Popup>
                          <div className="text-center">
                            <strong>Current Clock-in Zone</strong>
                            <br />
                            {location.name || 'Unnamed Location'}
                            <br />
                            <small>
                              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </small>
                          </div>
                        </Popup>
                      </Marker>
                      
                      <Circle
                        center={[location.lat, location.lng]}
                        radius={radiusInMeters}
                        pathOptions={{
                          color: '#1890ff',
                          fillColor: '#1890ff',
                          fillOpacity: 0.1,
                          weight: 2,
                        }}
                      />
                    </>
                  )}
                </MapContainer>
              </div>
            </Card>
          </Col>

          {/* Controls Section */}
          <Col xs={24} lg={8}>
            <Card title="Location Details" size="small" className="h-full">
              <Space direction="vertical" className="w-full" size="large">
                {/* Location Name Input */}
                <div>
                  <Text strong className="block mb-2">Location Name</Text>
                  <Input
                    placeholder="e.g., Main Hospital Entrance"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    disabled={!isEditing && location !== null}
                    prefix={<EnvironmentOutlined />}
                    size="large"
                  />
                </div>

                {/* Coordinates Display */}
                {location && (
                  <div>
                    <Text strong className="block mb-2">Coordinates</Text>
                    <div className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Latitude:</span>
                          <span className="font-mono">{location.lat.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Longitude:</span>
                          <span className="font-mono">{location.lng.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Radius:</span>
                          <span>2.0 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {location && !isEditing && (
                  <div>
                    <Text strong className="block mb-2">Last Updated</Text>
                    <Text type="secondary" className="text-sm">
                      {new Date(location.timestamp).toLocaleString()}
                    </Text>
                  </div>
                )}

                <Divider className="my-4" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Get Current Location Button */}
                  <Button
                    type="default"
                    icon={geoLoading ? <LoadingOutlined /> : <AimOutlined />}
                    onClick={getCurrentLocation}
                    loading={geoLoading}
                    size="large"
                    className="w-full"
                    disabled={loading}
                  >
                    {geoLoading ? 'Getting Location...' : 'Use Current Location'}
                  </Button>
                  
                  {geoError && (
                    <Alert
                      message="Location Error"
                      description={geoError}
                      type="warning"
                      showIcon
                      closable
                      onClose={() => setGeoError('')}
                      className="text-xs"
                    />
                  )}

                  {!location || isEditing ? (
                    <Space className="w-full" direction="vertical">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveLocation}
                        loading={loading}
                        disabled={!location || !locationName.trim()}
                        size="large"
                        className="w-full"
                      >
                        Save Location
                      </Button>
                      
                      {isEditing && location && (
                        <Button
                          onClick={handleCancelEdit}
                          size="large"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      )}
                    </Space>
                  ) : (
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={handleEditMode}
                      size="large"
                      className="w-full"
                    >
                      Edit Location
                    </Button>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <Text className="text-blue-800 text-sm">
                    <strong>Instructions:</strong>
                    <br />
                    1. Click anywhere on the map to select a location
                    <br />
                    2. Enter a descriptive name for the location
                    <br />
                    3. Click "Save Location" to confirm
                    <br />
                    4. Staff can clock in within the 2km radius
                  </Text>
                  <br /><br />
                  <Text className="text-blue-800 text-sm"><strong>Tip:</strong> Use "Current Location" to automatically detect your position and get the place name.</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LocationManager;