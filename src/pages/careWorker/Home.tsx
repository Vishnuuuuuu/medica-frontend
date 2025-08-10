import React, { useState } from 'react';
import { Card, Button, Typography, Space, Badge, Modal, Form, Input, message } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CareWorkerHome: React.FC = () => {
  const { user, updateClockStatus } = useAuth();
  const [clockInModalVisible, setClockInModalVisible] = useState(false);
  const [clockOutModalVisible, setClockOutModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock location data
  const mockLocation = {
    lat: 37.7749,
    lng: -122.4194,
    address: "123 Healthcare Center, San Francisco, CA"
  };

  const handleClockIn = async (values: { note?: string }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateClockStatus(true);
      message.success('Successfully clocked in!');
      setClockInModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to clock in. Please try again.');
    }
  };

  const handleClockOut = async (values: { note?: string }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateClockStatus(false);
      message.success('Successfully clocked out!');
      setClockOutModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to clock out. Please try again.');
    }
  };

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
              status={user?.isClocked ? 'processing' : 'default'} 
              text={user?.isClocked ? 'Clocked In' : 'Clocked Out'}
              className="text-lg"
            />
          </div>
          
          <div className="mb-6">
            <ClockCircleOutlined className="text-6xl text-blue-500 mb-4" />
            <div>
              <Text strong className="block text-lg">Current Status</Text>
              <Text type="secondary">
                {user?.isClocked 
                  ? `Started at ${dayjs().subtract(2, 'hour').format('h:mm A')}`
                  : 'Not currently working'
                }
              </Text>
            </div>
          </div>

          <Space className="w-full" direction="vertical">
            <Button
              type="primary"
              size="large"
              disabled={user?.isClocked}
              onClick={() => setClockInModalVisible(true)}
              className="w-full"
            >
              Clock In
            </Button>
            
            {user?.isClocked && (
              <Button
                type="default"
                size="large"
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
              <Text strong>{user?.isClocked ? '2.5 hours' : '0 hours'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Shifts</Text>
              <Text strong>{user?.isClocked ? '1' : '0'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Location</Text>
              <Text strong>Healthcare Center A</Text>
            </div>
            <div className="flex justify-between">
              <Text>Status</Text>
              <Badge 
                status={user?.isClocked ? 'processing' : 'default'} 
                text={user?.isClocked ? 'Active' : 'Inactive'}
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
          <div className="mb-4">
            <Text strong>Location: </Text>
            <Text>{mockLocation.address}</Text>
            <div className="text-sm text-gray-500 mt-1">
              <EnvironmentOutlined /> Lat: {mockLocation.lat}, Lng: {mockLocation.lng}
            </div>
          </div>
          
          <Form.Item name="note" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes for this shift..." />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setClockInModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Clock In
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
          <div className="mb-4">
            <Text strong>Location: </Text>
            <Text>{mockLocation.address}</Text>
            <div className="text-sm text-gray-500 mt-1">
              <EnvironmentOutlined /> Lat: {mockLocation.lat}, Lng: {mockLocation.lng}
            </div>
          </div>
          
          <Form.Item name="note" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes about this shift..." />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setClockOutModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Clock Out
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CareWorkerHome;