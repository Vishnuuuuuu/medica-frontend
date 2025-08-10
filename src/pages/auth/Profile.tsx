import { EditOutlined, MailOutlined, UserOutlined, CalendarOutlined, SafetyOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Descriptions, Space, Typography, Tag, Row, Col, Statistic } from 'antd';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Mock profile data - in a real app, this would come from your backend
  const profileStats = {
    totalHours: 156.5,
    shiftsCompleted: 23,
    averageShiftLength: 6.8,
    joinDate: '2024-01-15',
    lastClockIn: dayjs().subtract(2, 'hours').format('MMM DD, YYYY h:mm A'),
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Profile</Title>
        <Text type="secondary">Manage your account information and view your statistics</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Information */}
        <Col xs={24} lg={16}>
          <Card title="Profile Information" extra={<Button icon={<EditOutlined />}>Edit Profile</Button>}>
            <div className="flex items-start space-x-6 mb-6">
              <Avatar 
                size={80} 
                src={user.picture} 
                icon={<UserOutlined />}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <Title level={3} className="mb-2">{user.name}</Title>
                <Space direction="vertical" size="small">
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-gray-500" />
                    <Text>{user.email}</Text>
                  </div>
                  <div className="flex items-center">
                    <SafetyOutlined className="mr-2 text-gray-500" />
                    <Tag color={user.role === 'MANAGER' ? 'gold' : 'blue'}>
                      {user.role === 'MANAGER' ? 'Manager' : 'Care Worker'}
                    </Tag>
                  </div>
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-500" />
                    <Text>Joined {dayjs(profileStats.joinDate).format('MMMM DD, YYYY')}</Text>
                  </div>
                </Space>
              </div>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Employee ID">
                {user.id.substring(0, 8).toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {user.role === 'MANAGER' ? 'Management' : 'Patient Care'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={user.isClocked ? 'processing' : 'default'}>
                  {user.isClocked ? 'Currently Clocked In' : 'Not Working'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Activity">
                {user.isClocked ? 'Currently active' : profileStats.lastClockIn}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} lg={8}>
          <Card title="Your Statistics" className="mb-6">
            <Space direction="vertical" size="large" className="w-full">
              <Statistic
                title="Total Hours Worked"
                value={profileStats.totalHours}
                precision={1}
                suffix="hrs"
                valueStyle={{ color: '#3f8600' }}
              />
              <Statistic
                title="Shifts Completed"
                value={profileStats.shiftsCompleted}
                valueStyle={{ color: '#1890ff' }}
              />
              <Statistic
                title="Average Shift Length"
                value={profileStats.averageShiftLength}
                precision={1}
                suffix="hrs"
                valueStyle={{ color: '#722ed1' }}
              />
            </Space>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" size="small">
            <Space direction="vertical" className="w-full">
              <Button type="primary" block disabled={user.isClocked}>
                Clock In
              </Button>
              <Button type="default" block disabled={!user.isClocked}>
                Clock Out
              </Button>
              <Button type="default" block>
                View Shift History
              </Button>
              <Button type="default" block>
                Download Timesheet
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <Text strong>Clocked out from Healthcare Center A</Text>
              <br />
              <Text type="secondary" className="text-sm">8 hour shift completed</Text>
            </div>
            <Text type="secondary" className="text-sm">Yesterday, 5:00 PM</Text>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <Text strong>Clocked in at Healthcare Center A</Text>
              <br />
              <Text type="secondary" className="text-sm">Started morning shift</Text>
            </div>
            <Text type="secondary" className="text-sm">Yesterday, 9:00 AM</Text>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <Text strong>Profile updated</Text>
              <br />
              <Text type="secondary" className="text-sm">Contact information changed</Text>
            </div>
            <Text type="secondary" className="text-sm">2 days ago</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;