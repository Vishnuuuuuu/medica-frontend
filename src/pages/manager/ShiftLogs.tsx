import React, { useState } from 'react';
import { Table, Card, Typography, Select, DatePicker, Input, Button, Tag, Space } from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface ShiftLog {
  id: string;
  staffName: string;
  date: string;
  clockInTime: string;
  clockOutTime: string;
  duration: string;
  clockInLocation: string;
  clockOutLocation: string;
  notes: string;
  status: 'completed' | 'ongoing' | 'incomplete';
}

const ShiftLogs: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock shift logs data
  const shiftLogsData: ShiftLog[] = [
    {
      id: '1',
      staffName: 'Alice Johnson',
      date: dayjs().format('YYYY-MM-DD'),
      clockInTime: dayjs().subtract(3, 'hour').format('h:mm A'),
      clockOutTime: 'In Progress',
      duration: '3h 15m',
      clockInLocation: 'Healthcare Center A',
      clockOutLocation: '-',
      notes: 'Regular shift - Patient care',
      status: 'ongoing'
    },
    {
      id: '2',
      staffName: 'Bob Smith',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      clockInTime: '8:00 AM',
      clockOutTime: '4:00 PM',
      duration: '8h 0m',
      clockInLocation: 'Healthcare Center A',
      clockOutLocation: 'Healthcare Center A',
      notes: 'Double shift - Emergency coverage',
      status: 'completed'
    },
    {
      id: '3',
      staffName: 'Carol Davis',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      clockInTime: '9:00 AM',
      clockOutTime: '5:00 PM',
      duration: '8h 0m',
      clockInLocation: 'Healthcare Center B',
      clockOutLocation: 'Healthcare Center B',
      notes: 'Regular shift with training',
      status: 'completed'
    },
    {
      id: '4',
      staffName: 'David Wilson',
      date: dayjs().format('YYYY-MM-DD'),
      clockInTime: dayjs().subtract(2, 'hour').format('h:mm A'),
      clockOutTime: 'In Progress',
      duration: '2h 30m',
      clockInLocation: 'Healthcare Center B',
      clockOutLocation: '-',
      notes: 'Emergency response duty',
      status: 'ongoing'
    },
    {
      id: '5',
      staffName: 'Emma Brown',
      date: dayjs().format('YYYY-MM-DD'),
      clockInTime: dayjs().subtract(4, 'hour').format('h:mm A'),
      clockOutTime: 'In Progress',
      duration: '4h 45m',
      clockInLocation: 'Healthcare Center A',
      clockOutLocation: '-',
      notes: 'ICU patient monitoring',
      status: 'ongoing'
    },
    {
      id: '6',
      staffName: 'Frank Miller',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      clockInTime: '7:30 AM',
      clockOutTime: '3:30 PM',
      duration: '8h 0m',
      clockInLocation: 'Emergency Response Unit',
      clockOutLocation: 'Emergency Response Unit',
      notes: 'Weekend shift',
      status: 'completed'
    },
    {
      id: '7',
      staffName: 'Grace Lee',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      clockInTime: '2:00 PM',
      clockOutTime: 'No Clock Out',
      duration: 'Incomplete',
      clockInLocation: 'Healthcare Center A',
      clockOutLocation: '-',
      notes: 'System error - missed clock out',
      status: 'incomplete'
    },
    {
      id: '8',
      staffName: 'Henry Davis',
      date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
      clockInTime: '6:00 AM',
      clockOutTime: '2:00 PM',
      duration: '8h 0m',
      clockInLocation: 'Healthcare Center B',
      clockOutLocation: 'Healthcare Center B',
      notes: 'Night shift coverage',
      status: 'completed'
    },
    {
      id: '9',
      staffName: 'Isabella Wilson',
      date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
      clockInTime: '10:00 AM',
      clockOutTime: '6:00 PM',
      duration: '8h 0m',
      clockInLocation: 'Healthcare Center A',
      clockOutLocation: 'Healthcare Center A',
      notes: 'Regular day shift',
      status: 'completed'
    },
    {
      id: '10',
      staffName: 'Jack Thompson',
      date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
      clockInTime: '3:00 PM',
      clockOutTime: '11:00 PM',
      duration: '8h 0m',
      clockInLocation: 'Emergency Response Unit',
      clockOutLocation: 'Emergency Response Unit',
      notes: 'Evening emergency coverage',
      status: 'completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'ongoing':
        return 'blue';
      case 'incomplete':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'In Progress';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Staff Name',
      dataIndex: 'staffName',
      key: 'staffName',
      sorter: (a: ShiftLog, b: ShiftLog) => a.staffName.localeCompare(b.staffName),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: ShiftLog) =>
        record.staffName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: ShiftLog, b: ShiftLog) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: (clockOut: string) => (
        clockOut === 'In Progress' ? (
          <Tag color="blue">In Progress</Tag>
        ) : clockOut === 'No Clock Out' ? (
          <Tag color="red">Missing</Tag>
        ) : clockOut
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string) => (
        duration === 'Incomplete' ? (
          <Tag color="red">Incomplete</Tag>
        ) : duration
      ),
    },
    {
      title: 'In Location',
      dataIndex: 'clockInLocation',
      key: 'clockInLocation',
      filters: [
        { text: 'Healthcare Center A', value: 'Healthcare Center A' },
        { text: 'Healthcare Center B', value: 'Healthcare Center B' },
        { text: 'Healthcare Center C', value: 'Healthcare Center C' },
      ],
      filteredValue: selectedLocation !== 'all' ? [selectedLocation] : null,
      onFilter: (value: any, record: ShiftLog) => record.clockInLocation === value,
    },
    {
      title: 'Out Location',
      dataIndex: 'clockOutLocation',
      key: 'clockOutLocation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'In Progress', value: 'ongoing' },
        { text: 'Incomplete', value: 'incomplete' },
      ],
      filteredValue: selectedStatus !== 'all' ? [selectedStatus] : null,
      onFilter: (value: any, record: ShiftLog) => record.status === value,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  const exportData = () => {
    // Mock export functionality
    console.log('Exporting shift logs data...');
  };

  // Filter data based on selected filters
  const filteredData = shiftLogsData.filter(record => {
    const matchesSearch = searchText === '' || 
      record.staffName.toLowerCase().includes(searchText.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || 
      record.clockInLocation === selectedLocation;
    const matchesStatus = selectedStatus === 'all' || 
      record.status === selectedStatus;
    
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Calculate summary statistics
  const completedShifts = filteredData.filter(shift => shift.status === 'completed').length;
  const ongoingShifts = filteredData.filter(shift => shift.status === 'ongoing').length;
  const incompleteShifts = filteredData.filter(shift => shift.status === 'incomplete').length;
  const totalHours = filteredData
    .filter(shift => shift.status === 'completed')
    .reduce((total, shift) => {
      const hours = parseFloat(shift.duration.replace('h', '').replace('m', '')) || 0;
      return total + hours;
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={2}>Shift Logs</Title>
          <p className="text-gray-600">Comprehensive view of all staff shifts</p>
        </div>
        <Button type="primary" icon={<DownloadOutlined />} onClick={exportData}>
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{completedShifts}</div>
          <div className="text-gray-600">Completed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{ongoingShifts}</div>
          <div className="text-gray-600">In Progress</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">{incompleteShifts}</div>
          <div className="text-gray-600">Incomplete</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">{totalHours.toFixed(1)}h</div>
          <div className="text-gray-600">Total Hours</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Search by staff name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          
          <Select
            placeholder="Filter by location"
            value={selectedLocation}
            onChange={setSelectedLocation}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">All Locations</Select.Option>
            <Select.Option value="Healthcare Center A">Healthcare Center A</Select.Option>
            <Select.Option value="Healthcare Center B">Healthcare Center B</Select.Option>
            <Select.Option value="Healthcare Center C">Healthcare Center C</Select.Option>
          </Select>

          <Select
            placeholder="Filter by status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">All Statuses</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="ongoing">In Progress</Select.Option>
            <Select.Option value="incomplete">Incomplete</Select.Option>
          </Select>

          <RangePicker style={{ width: '100%' }} />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} shift records`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ShiftLogs;