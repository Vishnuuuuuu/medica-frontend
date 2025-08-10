import React from 'react';
import { Table, Card, Typography, Tag, Badge } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title } = Typography;

interface ActiveStaffMember {
  id: string;
  name: string;
  clockInTime: string;
  location: string;
  duration: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const ActiveStaff: React.FC = () => {
  // Enhanced mock data for currently clocked-in staff
  const activeStaffData: ActiveStaffMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      clockInTime: dayjs().subtract(3, 'hour').format('h:mm A'),
      location: 'Healthcare Center A',
      duration: '3h 15m',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    {
      id: '2',
      name: 'David Wilson',
      clockInTime: dayjs().subtract(2, 'hour').format('h:mm A'),
      location: 'Healthcare Center B',
      duration: '2h 30m',
      coordinates: { lat: 37.7849, lng: -122.4094 }
    },
    {
      id: '3',
      name: 'Emma Brown',
      clockInTime: dayjs().subtract(4, 'hour').format('h:mm A'),
      location: 'Healthcare Center A',
      duration: '4h 45m',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    {
      id: '4',
      name: 'Frank Miller',
      clockInTime: dayjs().subtract(1, 'hour').format('h:mm A'),
      location: 'Emergency Response Unit',
      duration: '1h 20m',
      coordinates: { lat: 37.7949, lng: -122.3994 }
    }
  ];

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ActiveStaffMember, b: ActiveStaffMember) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <div className="flex items-center">
          <Badge status="processing" className="mr-2" />
          <strong>{name}</strong>
        </div>
      ),
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      sorter: (a: ActiveStaffMember, b: ActiveStaffMember) => 
        dayjs(a.clockInTime, 'h:mm A').unix() - dayjs(b.clockInTime, 'h:mm A').unix(),
      render: (time: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-blue-500" />
          {time}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: ActiveStaffMember, b: ActiveStaffMember) => {
        const aDuration = parseFloat(a.duration.replace('h', '').replace('m', ''));
        const bDuration = parseFloat(b.duration.replace('h', '').replace('m', ''));
        return aDuration - bDuration;
      },
      render: (duration: string) => (
        <Tag color="blue">{duration}</Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string, record: ActiveStaffMember) => (
        <div>
          <div className="flex items-center">
            <EnvironmentOutlined className="mr-2 text-green-500" />
            {location}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {record.coordinates.lat}, {record.coordinates.lng}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ActiveStaffMember) => (
        <div className="space-x-2">
          <a href="#" className="text-blue-600 hover:text-blue-800">View Details</a>
          <a href="#" className="text-red-600 hover:text-red-800">Force Clock Out</a>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalActive = activeStaffData.length;
  const averageDuration = activeStaffData.reduce((total, staff) => {
    const hours = parseFloat(staff.duration.replace('h', '').replace('m', '')) || 0;
    return total + hours;
  }, 0) / totalActive;

  const locationCounts = activeStaffData.reduce((counts, staff) => {
    const location = staff.location.split(' - ')[0]; // Get just the center name
    counts[location] = (counts[location] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Active Staff</Title>
        <p className="text-gray-600">Staff currently clocked in - {dayjs().format('MMMM DD, YYYY')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{totalActive}</div>
          <div className="text-gray-600">Currently Active</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {totalActive > 0 ? averageDuration.toFixed(1) : 0}h
          </div>
          <div className="text-gray-600">Average Duration</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {Object.keys(locationCounts).length}
          </div>
          <div className="text-gray-600">Active Locations</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {Math.max(...Object.values(locationCounts), 0)}
          </div>
          <div className="text-gray-600">Max Per Location</div>
        </Card>
      </div>

      {/* Active Staff Table */}
      <Card title="Currently Clocked In Staff">
        <Table
          columns={columns}
          dataSource={activeStaffData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} active staff members`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Location Breakdown */}
      <Card title="Staff Distribution by Location">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(locationCounts).map(([location, count]) => (
            <div key={location} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600">{location}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ActiveStaff;