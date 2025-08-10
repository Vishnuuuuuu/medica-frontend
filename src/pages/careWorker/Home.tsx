import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Form, Input, message, Modal, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface ActiveShift {
  id: string;
  clockInAt: string;
  location?: Location;
}

const CareWorkerHome: React.FC = () => {
  const { user } = useAuth();
  const [clockInModalVisible, setClockInModalVisible] = useState(false);
  const [clockOutModalVisible, setClockOutModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cachedLocation, setCachedLocation] = useState<{ lat: number; lng: number; timestamp: number } | null>(null);

  // Fetch locations and active shift on component mount
  useEffect(() => {
    fetchLocations();
    fetchActiveShift();
    // Pre-cache location for faster clock-in
    preloadLocation();
  }, []);

  const preloadLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCachedLocation({ ...location, timestamp: Date.now() });
    } catch (error) {
      console.log('Could not preload location:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchActiveShift = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/active/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveShift(data);
      }
    } catch (error) {
      console.error('Error fetching active shift:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed fixUserInfo function since user sync is now handled in AuthContext
  // This eliminates redundant API calls and database updates

  // Removed fixUserInfo call since user sync is now handled in AuthContext
  // This prevents redundant API calls on every component mount
  useEffect(() => {
    if (user?.id) {
      console.log('✅ User data available:', { name: user.name, email: user.email });
    }
  }, [user]);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      // Use cached location if available and less than 2 minutes old
      if (cachedLocation && (Date.now() - cachedLocation.timestamp) < 120000) {
        console.log('Using cached location for speed');
        resolve({ lat: cachedLocation.lat, lng: cachedLocation.lng });
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Try cached location first for speed
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          // Update cache
          setCachedLocation({ ...location, timestamp: Date.now() });
          resolve(location);
        },
        (error) => {
          console.error('High accuracy failed, trying low accuracy:', error);
          // Fallback to lower accuracy for speed
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setCachedLocation({ ...location, timestamp: Date.now() });
              resolve(location);
            },
            (fallbackError) => {
              reject(fallbackError);
            },
            {
              enableHighAccuracy: false,
              timeout: 3000,
              maximumAge: 300000 // 5 minutes cache
            }
          );
        },
        {
          enableHighAccuracy: false, // Faster, less precise
          timeout: 3000, // 3 seconds instead of 10
          maximumAge: 300000 // Use 5-minute cached location
        }
      );
    });
  };

  const handleClockIn = async (values: { note?: string }) => {
    setIsGettingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      console.log('Clock-in attempt:', {
        userLocation: location,
        globalLocation: locations[0],
        userId: user?.id
      });
      
      const payload = {
        userId: user?.id,
        latitude: location.lat,
        longitude: location.lng,
        note: values.note
      };

      console.log('Sending clock-in payload:', payload);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add user information in the payload instead of relying on JWT
        },
        body: JSON.stringify({
          ...payload,
          userName: user?.name,
          userEmail: user?.email
        }),
      });

      const data = await response.json();
      console.log('Clock-in response:', data);

      if (response.ok) {
        message.success('Successfully clocked in!');
        setClockInModalVisible(false);
        form.resetFields();
        fetchActiveShift();
      } else {
        // Show the specific error message from the backend
        const errorMessage = data.error || 'Failed to clock in';
        message.error(errorMessage);
        
        // If it's a distance error, show additional info
        if (data.distance && data.allowedRadius) {
          console.log(`Distance check failed: ${data.distance}m away, allowed: ${data.allowedRadius}m`);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to get location. Please check your permissions.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClockOut = async (values: { note?: string }) => {
    setIsGettingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/clock-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          latitude: location.lat,
          longitude: location.lng,
          note: values.note,
          userName: user?.name,
          userEmail: user?.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Successfully clocked out!');
        setClockOutModalVisible(false);
        form.resetFields();
        setActiveShift(null);
      } else {
        message.error(data.error || 'Failed to clock out');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to get location. Please check your permissions.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Title level={2}>Welcome back, {user?.name}!</Title>
        <Text type="secondary">
          Today is {dayjs().format('dddd, MMMM D, YYYY')}
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock Status Card */}
        <Card className="text-center">
          <div className="mb-4">
            <Badge 
              status={activeShift ? 'processing' : 'default'} 
              text={activeShift ? 'Clocked In' : 'Clocked Out'}
              className="text-lg"
            />
          </div>
          
          <div className="mb-6">
            <ClockCircleOutlined className="text-6xl text-blue-500 mb-4" />
            <div>
              <Text strong className="block text-lg">Current Status</Text>
              <Text type="secondary">
                {activeShift 
                  ? `Started at ${dayjs(activeShift.clockInAt).format('h:mm A')}`
                  : 'Not currently working'
                }
              </Text>
            </div>
          </div>

          <Space className="w-full" direction="vertical">
            <Button
              type="primary"
              size="large"
              disabled={!!activeShift}
              loading={isGettingLocation && clockInModalVisible}
              onClick={() => setClockInModalVisible(true)}
              className="w-full"
            >
              Clock In
            </Button>
            
            {activeShift && (
              <Button
                type="default"
                size="large"
                loading={isGettingLocation && clockOutModalVisible}
                onClick={() => setClockOutModalVisible(true)}
                className="w-full"
              >
                Clock Out
              </Button>
            )}
          </Space>
        </Card>

        {/* Today's Summary Card */}
        <Card title="Today's Summary">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text>Hours Worked</Text>
              <Text strong>
                {activeShift 
                  ? `${dayjs().diff(dayjs(activeShift.clockInAt), 'hour', true).toFixed(1)} hours` 
                  : '0 hours'
                }
              </Text>
            </div>
            <div className="flex justify-between">
              <Text>Shifts</Text>
              <Text strong>{activeShift ? '1' : '0'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Location</Text>
              <Text strong>{activeShift?.location?.name || 'No location'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Status</Text>
              <Badge 
                status={activeShift ? 'processing' : 'default'} 
                text={activeShift ? 'Active' : 'Inactive'}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Clock In Modal */}
      <Modal
        title="Clock In"
        open={clockInModalVisible}
        onCancel={() => setClockInModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleClockIn} layout="vertical">
          {locations.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <Text strong>Global Clock-in Location: </Text>
              <Text>{locations[0].name}</Text>
              <div className="text-sm text-gray-500 mt-1">
                {locations[0].address} • Radius: {(locations[0].radius/1000).toFixed(1)}km
              </div>
            </div>
          )}
          
          {currentLocation && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <Text strong>Your Current Location: </Text>
              <div className="text-sm text-gray-500 mt-1">
                <EnvironmentOutlined /> Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </div>
            </div>
          )}
          
          <Form.Item name="note" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes for this shift..." />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setClockInModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isGettingLocation}>
              {isGettingLocation ? 'Getting Location...' : 'Clock In'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Clock Out Modal */}
      <Modal
        title="Clock Out"
        open={clockOutModalVisible}
        onCancel={() => setClockOutModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleClockOut} layout="vertical">
          {activeShift?.location && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <Text strong>Shift Location: </Text>
              <Text>{activeShift.location.name}</Text>
              <div className="text-sm text-gray-500 mt-1">
                {activeShift.location.address}
              </div>
            </div>
          )}
          
          {currentLocation && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <Text strong>Your Current Location: </Text>
              <div className="text-sm text-gray-500 mt-1">
                <EnvironmentOutlined /> Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </div>
            </div>
          )}
          
          <Form.Item name="note" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes about this shift..." />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setClockOutModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isGettingLocation}>
              {isGettingLocation ? 'Getting Location...' : 'Clock Out'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CareWorkerHome;