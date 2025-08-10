import { AimOutlined, EnvironmentOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Space, Typography, message } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const { Title, Text } = Typography;

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GlobalLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number] | null) => void;
  form: any;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, form }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      form.setFieldsValue({ latitude: lat, longitude: lng });
      message.success(`Location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    },
  });

  return position ? (
    <>
      <Marker position={position} />
      <Circle 
        center={position} 
        radius={form.getFieldValue('radius') || 2000}
        pathOptions={{ 
          color: 'blue', 
          fillColor: 'blue', 
          fillOpacity: 0.1 
        }} 
      />
    </>
  ) : null;
};

const LocationManager: React.FC = () => {
  const [globalLocation, setGlobalLocation] = useState<GlobalLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to SF
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGlobalLocation();
    getCurrentLocationForMap();
  }, []);

  const fetchGlobalLocation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      if (response.ok) {
        const locations = await response.json();
        if (locations.length > 0) {
          const location = locations[0];
          setGlobalLocation(location);
          form.setFieldsValue(location);
          setPosition([location.latitude, location.longitude]);
          setMapCenter([location.latitude, location.longitude]);
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const getCurrentLocationForMap = () => {
    if (!navigator.geolocation) {
      message.warning('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
      },
      () => {
        console.log('Could not get current location for map center');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  };

  const getCurrentLocation = () => {
    setGeoLoading(true);
    
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by this browser');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPosition: [number, number] = [latitude, longitude];
        setPosition(newPosition);
        setMapCenter(newPosition);
        form.setFieldsValue({ latitude, longitude });
        setGeoLoading(false);
        message.success('Current location detected!');
      },
      () => {
        setGeoLoading(false);
        message.error('Failed to get current location. Please click on the map to select.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSave = async (values: any) => {
    if (!position) {
      message.error('Please select a location on the map first!');
      return;
    }

    setLoading(true);
    
    try {
      const method = globalLocation ? 'PATCH' : 'POST';
      const url = globalLocation 
        ? `${import.meta.env.VITE_API_URL}/api/locations/${globalLocation.id}`
        : `${import.meta.env.VITE_API_URL}/api/locations`;

      const payload = {
        ...values,
        latitude: position[0],
        longitude: position[1]
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedLocation = await response.json();
        setGlobalLocation(savedLocation);
        message.success(globalLocation ? 'Location updated successfully!' : 'Location created successfully!');
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to save location');
      }
    } catch (error) {
      message.error('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <div className="mb-6">
          <Title level={2} className="flex items-center gap-2 mb-2">
            <EnvironmentOutlined className="text-blue-600" />
            Global Clock-in Location
          </Title>
          <Text type="secondary">
            Click on the map to select the global location where care workers can clock in. Care workers must be within the specified radius to clock in.
          </Text>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSave}
              initialValues={{ radius: 2000 }}
            >
              <Form.Item
                name="name"
                label="Location Name"
                rules={[{ required: true, message: 'Please enter a location name' }]}
              >
                <Input placeholder="e.g., Main Healthcare Center" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter the address' }]}
              >
                <Input placeholder="e.g., 123 Main Street, City, State" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="latitude"
                  label="Latitude"
                  rules={[{ required: true, message: 'Please select location on map' }]}
                >
                  <InputNumber 
                    placeholder="Select on map" 
                    className="w-full"
                    precision={6}
                    step={0.000001}
                    readOnly
                  />
                </Form.Item>

                <Form.Item
                  name="longitude"
                  label="Longitude"
                  rules={[{ required: true, message: 'Please select location on map' }]}
                >
                  <InputNumber 
                    placeholder="Select on map" 
                    className="w-full"
                    precision={6}
                    step={0.000001}
                    readOnly
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="radius"
                label="Allowed Radius (meters)"
                rules={[{ required: true, message: 'Please enter the radius' }]}
              >
                <InputNumber 
                  placeholder="2000" 
                  className="w-full"
                  min={100}
                  max={10000}
                  step={100}
                  addonAfter="meters"
                  onChange={() => {
                    // Trigger map update when radius changes
                    setTimeout(() => {
                      setPosition(position); // Force re-render of circle
                    }, 100);
                  }}
                />
              </Form.Item>

              <Space className="w-full" direction="vertical" size="large">
                <Button
                  type="default"
                  icon={geoLoading ? <LoadingOutlined /> : <AimOutlined />}
                  onClick={getCurrentLocation}
                  loading={geoLoading}
                  size="large"
                  className="w-full"
                >
                  {geoLoading ? 'Getting Location...' : 'Use Current Location'}
                </Button>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="w-full"
                  disabled={!position}
                >
                  {globalLocation ? 'Update Location' : 'Save Location'}
                </Button>
              </Space>
            </Form>
          </Col>

          <Col xs={24} lg={12}>
            <div className="mb-4">
              <Title level={4}>Select Location on Map</Title>
              <Text type="secondary">Click anywhere on the map to set the clock-in location</Text>
            </div>
            
            <div style={{ height: '500px', width: '100%' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} form={form} />
              </MapContainer>
            </div>
          </Col>
        </Row>

        {globalLocation && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <Text strong className="text-green-800">Current Global Location:</Text>
            <div className="mt-2 text-sm">
              <div><strong>Name:</strong> {globalLocation.name}</div>
              <div><strong>Address:</strong> {globalLocation.address}</div>
              <div><strong>Coordinates:</strong> {globalLocation.latitude}, {globalLocation.longitude}</div>
              <div><strong>Radius:</strong> {globalLocation.radius}m ({(globalLocation.radius/1000).toFixed(1)}km)</div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <Text className="text-blue-800 text-sm">
            <strong>Instructions:</strong><br />
            1. Click on the map to select the exact location or use "Current Location"<br />
            2. The blue circle shows the 2km radius where care workers can clock in<br />
            3. Fill in the location name and address<br />
            4. Save the location - this will be the global clock-in location for all care workers
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LocationManager;
