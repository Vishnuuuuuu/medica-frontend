import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Alert, Badge, Card, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import React, { useEffect, useState } from 'react';

dayjs.extend(duration);

const { Title } = Typography;

interface ActiveStaffMember {
  id: string;
  auth0Id: string;
  name: string;
  email: string;
  role: string;
  shiftId: string;
  clockInAt: string;
  clockInLocation: {
    latitude: number;
    longitude: number;
  };
  note?: string;
  status: string;
}

const ActiveStaff: React.FC = () => {
  const [activeStaff, setActiveStaff] = useState<ActiveStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active staff data from the API
  const fetchActiveStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/staff/active`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active staff: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Active staff data:', data);
      setActiveStaff(data);
    } catch (err) {
      console.error('Error fetching active staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch active staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStaff();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchActiveStaff, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate duration for each staff member
  const getStaffWithDuration = (staff: ActiveStaffMember[]) => {
    return staff.map(member => {
      const clockInTime = dayjs(member.clockInAt);
      const now = dayjs();
      const durationObj = dayjs.duration(now.diff(clockInTime));
      
      const hours = Math.floor(durationObj.asHours());
      const minutes = durationObj.minutes();
      
      return {
        ...member,
        clockInTimeFormatted: clockInTime.format('h:mm A'),
        duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        durationMinutes: Math.floor(durationObj.asMinutes())
      };
    });
  };

  const staffWithDuration = getStaffWithDuration(activeStaff);

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string, record: any) => (
        <div className="flex items-center">
          <Badge status="processing" className="mr-2" />
          <div>
            <strong>{name}</strong>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockInTimeFormatted',
      key: 'clockInTime',
      sorter: (a: any, b: any) => dayjs(a.clockInAt).unix() - dayjs(b.clockInAt).unix(),
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
      sorter: (a: any, b: any) => a.durationMinutes - b.durationMinutes,
      render: (duration: string) => (
        <Tag color="blue">{duration}</Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'clockInLocation',
      key: 'location',
      render: (location: { latitude: number; longitude: number }) => (
        <div>
          <div className="flex items-center">
            <EnvironmentOutlined className="mr-2 text-green-500" />
            Work Location
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        </div>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => (
        <div className="max-w-xs">
          {note ? (
            <span className="text-sm text-gray-600">{note}</span>
          ) : (
            <span className="text-xs text-gray-400 italic">No note</span>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="space-x-2">
          <a 
            href="#" 
            className="text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement view details
              console.log('View details for:', record);
            }}
          >
            View Details
          </a>
          <a 
            href="#" 
            className="text-red-600 hover:text-red-800"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement force clock out
              console.log('Force clock out for:', record);
            }}
          >
            Force Clock Out
          </a>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalActive = staffWithDuration.length;
  const averageDuration = totalActive > 0 
    ? staffWithDuration.reduce((total, staff) => total + staff.durationMinutes, 0) / totalActive / 60
    : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={2}>Active Staff</Title>
          <p className="text-gray-600">Loading active staff...</p>
        </div>
        <div className="flex justify-center items-center p-8">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={2}>Active Staff</Title>
          <p className="text-gray-600">Staff currently clocked in - {dayjs().format('MMMM DD, YYYY')}</p>
        </div>
        <Alert
          message="Error Loading Active Staff"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchActiveStaff}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Active Staff</Title>
        <p className="text-gray-600">Staff currently clocked in - {dayjs().format('MMMM DD, YYYY')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {totalActive > 0 ? Math.max(...staffWithDuration.map(s => s.durationMinutes)) : 0}m
          </div>
          <div className="text-gray-600">Longest Shift</div>
        </Card>
      </div>

      {/* Active Staff Table */}
      <Card 
        title="Currently Clocked In Staff"
        extra={
          <button 
            onClick={fetchActiveStaff}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        }
      >
        {totalActive === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">No staff currently clocked in</div>
            <div className="text-gray-500 text-sm">Staff members will appear here when they clock in</div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={staffWithDuration}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} active staff members`,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ActiveStaff;