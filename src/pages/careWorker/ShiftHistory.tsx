import React from 'react';
import { Table, Card, Typography, Tag, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title } = Typography;

interface ShiftRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  duration: string;
  notes: string;
  location: string;
}

const ShiftHistory: React.FC = () => {
  // Mock shift data
  const shiftData: ShiftRecord[] = [
    {
      id: '1',
      date: dayjs().format('YYYY-MM-DD'),
      clockIn: dayjs().subtract(2, 'hour').format('h:mm A'),
      clockOut: 'In Progress',
      duration: '2h 30m',
      notes: 'Regular shift at main facility',
      location: 'Healthcare Center A'
    },
    {
      id: '2',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      clockIn: '8:00 AM',
      clockOut: '4:00 PM',
      duration: '8h 0m',
      notes: 'Double shift coverage',
      location: 'Healthcare Center A'
    },
    {
      id: '3',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      clockIn: '9:00 AM',
      clockOut: '5:00 PM',
      duration: '8h 0m',
      notes: 'Training session included',
      location: 'Healthcare Center B'
    },
    {
      id: '4',
      date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
      clockIn: '7:30 AM',
      clockOut: '3:30 PM',
      duration: '8h 0m',
      notes: 'Emergency response shift',
      location: 'Healthcare Center A'
    },
    {
      id: '5',
      date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
      clockIn: '10:00 AM',
      clockOut: '6:00 PM',
      duration: '8h 0m',
      notes: 'Weekend coverage',
      location: 'Healthcare Center C'
    }
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: ShiftRecord, b: ShiftRecord) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'clockIn',
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'clockOut',
      render: (clockOut: string) => (
        clockOut === 'In Progress' ? (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            In Progress
          </Tag>
        ) : clockOut
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: ShiftRecord, b: ShiftRecord) => {
        const aDuration = parseFloat(a.duration.replace('h', '').replace('m', ''));
        const bDuration = parseFloat(b.duration.replace('h', '').replace('m', ''));
        return aDuration - bDuration;
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      filters: [
        { text: 'Healthcare Center A', value: 'Healthcare Center A' },
        { text: 'Healthcare Center B', value: 'Healthcare Center B' },
        { text: 'Healthcare Center C', value: 'Healthcare Center C' },
      ],
      onFilter: (value: any, record: ShiftRecord) => record.location === value,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  // Calculate summary statistics
  const totalHours = shiftData
    .filter(shift => shift.clockOut !== 'In Progress')
    .reduce((total, shift) => {
      const hours = parseFloat(shift.duration.replace('h', '').replace('m', '')) || 0;
      return total + hours;
    }, 0);

  const thisWeekShifts = shiftData.filter(shift => 
    dayjs(shift.date).isAfter(dayjs().startOf('week'))
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Shift History</Title>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{totalHours.toFixed(1)}h</div>
          <div className="text-gray-600">Total Hours This Week</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{thisWeekShifts}</div>
          <div className="text-gray-600">Shifts This Week</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {thisWeekShifts > 0 ? (totalHours / thisWeekShifts).toFixed(1) : 0}h
          </div>
          <div className="text-gray-600">Average Shift Length</div>
        </Card>
      </div>

      {/* Shifts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={shiftData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} shifts`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ShiftHistory;