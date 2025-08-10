import React from 'react';
import { Card, Typography, Table, Statistic, Row, Col } from 'antd';
import { UserOutlined, ClockCircleOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

interface StaffHours {
  id: string;
  name: string;
  totalHours: number;
  shiftsCount: number;
  averageHours: number;
}

const Dashboard: React.FC = () => {
  // Mock data for enhanced analytics
  const staffHoursData: StaffHours[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      totalHours: 45.2,
      shiftsCount: 7,
      averageHours: 6.5
    },
    {
      id: '2',
      name: 'Bob Smith',
      totalHours: 40.8,
      shiftsCount: 5,
      averageHours: 8.2
    },
    {
      id: '3',
      name: 'Carol Davis',
      totalHours: 38.5,
      shiftsCount: 6,
      averageHours: 6.4
    },
    {
      id: '4',
      name: 'David Wilson',
      totalHours: 42.0,
      shiftsCount: 6,
      averageHours: 7.0
    },
    {
      id: '5',
      name: 'Emma Brown',
      totalHours: 36.8,
      shiftsCount: 5,
      averageHours: 7.4
    },
    {
      id: '6',
      name: 'Frank Miller',
      totalHours: 44.2,
      shiftsCount: 6,
      averageHours: 7.4
    },
    {
      id: '7',
      name: 'Grace Lee',
      totalHours: 41.5,
      shiftsCount: 6,
      averageHours: 6.9
    }
  ];

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: StaffHours, b: StaffHours) => a.name.localeCompare(b.name),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      sorter: (a: StaffHours, b: StaffHours) => a.totalHours - b.totalHours,
      render: (hours: number) => `${hours.toFixed(1)}h`,
    },
    {
      title: 'Shifts',
      dataIndex: 'shiftsCount',
      key: 'shiftsCount',
      sorter: (a: StaffHours, b: StaffHours) => a.shiftsCount - b.shiftsCount,
    },
    {
      title: 'Average Hours/Shift',
      dataIndex: 'averageHours',
      key: 'averageHours',
      sorter: (a: StaffHours, b: StaffHours) => a.averageHours - b.averageHours,
      render: (hours: number) => `${hours.toFixed(1)}h`,
    },
  ];

  // Calculate statistics
  const totalStaff = staffHoursData.length;
  const staffClockedInToday = 4; // Mock data - people who clocked in today
  const peopleClockingInDaily = 5.2; // Mock average people clocking in per day
  const totalHoursThisWeek = staffHoursData.reduce((sum, staff) => sum + staff.totalHours, 0);
  const averageHoursPerDay = totalHoursThisWeek / staffHoursData.length / 7;

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
              title="Avg People Clocking In Daily"
              value={peopleClockingInDaily}
              precision={1}
              prefix={<TeamOutlined />}
              suffix="people"
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
          dataSource={staffHoursData}
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
              <div className="flex justify-between items-center">
                <span>Alice Johnson clocked out</span>
                <span className="text-gray-500 text-sm">2 minutes ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bob Smith clocked in</span>
                <span className="text-gray-500 text-sm">15 minutes ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Carol Davis clocked out</span>
                <span className="text-gray-500 text-sm">1 hour ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>David Wilson clocked in</span>
                <span className="text-gray-500 text-sm">2 hours ago</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Alerts & Notifications" size="small">
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm mb-1">
                  <strong>Late Clock Out:</strong> Emma Brown
                </p>
                <p className="text-yellow-600 text-xs">Scheduled to end at 5:00 PM</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-sm mb-1">
                  <strong>Overtime Alert:</strong> Carol Davis
                </p>
                <p className="text-blue-600 text-xs">45.2 hours this week</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm mb-1">
                  <strong>All systems normal</strong>
                </p>
                <p className="text-green-600 text-xs">No critical issues</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;