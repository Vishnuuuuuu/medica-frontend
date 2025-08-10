import { ClockCircleOutlined, TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Spin, Statistic, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

interface User {
  id: string;
  auth0Id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    shifts: number;
  };
}

interface ShiftLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  clockInAt: string;
  clockOutAt: string | null;
  duration: number | null;
  status: string;
}

interface StaffStats {
  id: string;
  name: string;
  totalHours: number;
  shiftsCount: number;
  averageHours: number;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
            // Fetch all users
      const usersResponse = await fetch(`${baseUrl}/api/users`);
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      console.log('Fetched users:', usersData);

      // Fetch active staff
      const activeStaffResponse = await fetch(`${baseUrl}/api/staff/active`);
      if (!activeStaffResponse.ok) throw new Error('Failed to fetch active staff');
      const activeStaffData = await activeStaffResponse.json();
      console.log('Fetched active staff:', activeStaffData);

      // Fetch shift logs
      const logsResponse = await fetch(`${baseUrl}/api/shifts/logs`);
      if (!logsResponse.ok) throw new Error('Failed to fetch shift logs');
      const logsData = await logsResponse.json();
      console.log('Fetched shift logs:', logsData);

      setUsers(usersData);
      setActiveStaff(activeStaffData);
      setShiftLogs(logsData.shifts || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate staff statistics from the last 7 days
  const getStaffStats = (): StaffStats[] => {
    const sevenDaysAgo = dayjs().subtract(7, 'days');
    
    const userStats = users.map(user => {
      const userShifts = shiftLogs.filter(shift => 
        shift.user.id === user.id && 
        dayjs(shift.clockInAt).isAfter(sevenDaysAgo)
      );
      
      const completedShifts = userShifts.filter(shift => shift.clockOutAt);
      const totalMinutes = completedShifts.reduce((sum, shift) => sum + (shift.duration || 0), 0);
      const totalHours = totalMinutes / 60;
      
      return {
        id: user.id,
        name: user.name,
        totalHours: totalHours,
        shiftsCount: userShifts.length,
        averageHours: userShifts.length > 0 ? totalHours / userShifts.length : 0
      };
    });
    
    // Show all users, including those without shifts
    return userStats.filter(stat => stat.name && stat.name.trim() !== '');
  };

  const staffStats = getStaffStats();

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: StaffStats, b: StaffStats) => a.name.localeCompare(b.name),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      sorter: (a: StaffStats, b: StaffStats) => a.totalHours - b.totalHours,
      render: (hours: number) => hours > 0 ? `${hours.toFixed(1)}h` : 'No shifts',
    },
    {
      title: 'Shifts',
      dataIndex: 'shiftsCount',
      key: 'shiftsCount',
      sorter: (a: StaffStats, b: StaffStats) => a.shiftsCount - b.shiftsCount,
      render: (count: number) => count > 0 ? count : 'No shifts',
    },
    {
      title: 'Average Hours/Shift',
      dataIndex: 'averageHours',
      key: 'averageHours',
      sorter: (a: StaffStats, b: StaffStats) => a.averageHours - b.averageHours,
      render: (hours: number) => hours > 0 ? `${hours.toFixed(1)}h` : 'No shifts',
    },
  ];

  // Calculate statistics
  const totalStaff = users.length;
  const staffClockedInToday = activeStaff.length;
  const totalHoursThisWeek = staffStats.reduce((sum: number, staff: StaffStats) => sum + staff.totalHours, 0);
  const averageHoursPerDay = staffStats.length > 0 ? totalHoursThisWeek / staffStats.length / 7 : 0;

  // Get recent activity from shift logs
  const recentActivity = shiftLogs.slice(0, 4).map(shift => {
    const isClockOut = !!shift.clockOutAt;
    const timeAgo = dayjs().diff(dayjs(isClockOut ? shift.clockOutAt : shift.clockInAt), 'minutes');
    
    let timeText = '';
    if (timeAgo < 60) {
      timeText = `${timeAgo} minutes ago`;
    } else if (timeAgo < 1440) {
      timeText = `${Math.floor(timeAgo / 60)} hours ago`;
    } else {
      timeText = `${Math.floor(timeAgo / 1440)} days ago`;
    }
    
    return {
      action: `${shift.user.name} clocked ${isClockOut ? 'out' : 'in'}`,
      time: timeText
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={2}>Manager Dashboard</Title>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="flex justify-center items-center p-8">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={2}>Manager Dashboard</Title>
          <p className="text-gray-600">Overview for week of {dayjs().startOf('week').format('MMM DD, YYYY')}</p>
        </div>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchDashboardData}
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
        <Title level={2}>Manager Dashboard</Title>
        <p className="text-gray-600">Overview for week of {dayjs().startOf('week').format('MMM DD, YYYY')}</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="People Clocking In Today"
              value={staffClockedInToday}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Staff"
              value={totalStaff}
              precision={0}
              prefix={<TeamOutlined />}
              suffix="users"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Hours Clocked Per Day"
              value={averageHoursPerDay}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="hrs"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Hours This Week"
              value={totalHoursThisWeek}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="hrs"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Staff Hours Table */}
      <Card title="Staff Performance - Last 7 Days">
        <Table
          columns={columns}
          dataSource={staffStats}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} staff members`,
          }}
          size="middle"
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" size="small">
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{activity.action}</span>
                    <span className="text-gray-500 text-sm">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No recent activity
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="System Status" size="small">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm mb-1">
                  <strong>System Online</strong>
                </p>
                <p className="text-green-600 text-xs">All services operational</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-sm mb-1">
                  <strong>Active Staff:</strong> {staffClockedInToday}
                </p>
                <p className="text-blue-600 text-xs">Currently clocked in</p>
              </div>
              {staffStats.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p className="text-purple-800 text-sm mb-1">
                    <strong>Total Hours This Week:</strong> {totalHoursThisWeek.toFixed(1)}h
                  </p>
                  <p className="text-purple-600 text-xs">Across all staff</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;