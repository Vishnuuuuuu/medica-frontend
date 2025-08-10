import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input, Select, Space, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

interface ShiftLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  clockInAt: string;
  clockOutAt: string | null;
  clockInLocation: {
    latitude: number;
    longitude: number;
  };
  clockOutLocation: {
    latitude: number;
    longitude: number;
  } | null;
  clockInNote?: string;
  clockOutNote?: string;
  duration: number | null; // Duration in minutes
  status: 'COMPLETED' | 'ACTIVE';
}

const ShiftLogs: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const fetchShiftLogs = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/shifts/logs?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shift logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Shift logs data:', data);
      
      setShiftLogs(data.shifts || []);
      setPagination({
        current: data.pagination?.page || 1,
        pageSize: data.pagination?.limit || 20,
        total: data.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error fetching shift logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shift logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftLogs();
  }, []);

  // Filter data based on search and status
  const filteredData = shiftLogs.filter(log => {
    const matchesSearch = searchText === '' || 
      log.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      log.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Transform data for display
  const transformedData = filteredData.map(log => ({
    id: log.id,
    staffName: log.user.name,
    email: log.user.email,
    date: dayjs(log.clockInAt).format('YYYY-MM-DD'),
    clockInTime: dayjs(log.clockInAt).format('h:mm A'),
    clockOutTime: log.clockOutAt ? dayjs(log.clockOutAt).format('h:mm A') : 'In Progress',
    duration: log.duration ? 
      `${Math.floor(log.duration / 60)}h ${log.duration % 60}m` : 
      (log.status === 'ACTIVE' ? 
        `${Math.floor(dayjs().diff(dayjs(log.clockInAt), 'minutes') / 60)}h ${dayjs().diff(dayjs(log.clockInAt), 'minutes') % 60}m` : 
        '-'),
    clockInLocation: `${log.clockInLocation.latitude.toFixed(6)}, ${log.clockInLocation.longitude.toFixed(6)}`,
    clockOutLocation: log.clockOutLocation ? 
      `${log.clockOutLocation.latitude.toFixed(6)}, ${log.clockOutLocation.longitude.toFixed(6)}` : 
      '-',
    notes: log.clockInNote || log.clockOutNote || '-',
    status: log.status.toLowerCase() as 'completed' | 'active',
    rawLog: log
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'active':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'In Progress';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Staff Name',
      dataIndex: 'staffName',
      key: 'staffName',
      sorter: (a: any, b: any) => a.staffName.localeCompare(b.staffName),
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      sorter: (a: any, b: any) => 
        dayjs(a.clockInTime, 'h:mm A').unix() - dayjs(b.clockInTime, 'h:mm A').unix(),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: (time: string) => (
        <span className={time === 'In Progress' ? 'text-blue-600' : ''}>
          {time}
        </span>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: any, b: any) => {
        const getDurationMinutes = (duration: string) => {
          if (duration === '-') return 0;
          const hours = duration.match(/(\d+)h/);
          const minutes = duration.match(/(\d+)m/);
          return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
        };
        return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
      },
    },
    {
      title: 'Clock In Location',
      dataIndex: 'clockInLocation',
      key: 'clockInLocation',
      ellipsis: true,
      render: (location: string) => (
        <span className="text-xs font-mono">{location}</span>
      ),
    },
    {
      title: 'Clock Out Location',
      dataIndex: 'clockOutLocation',
      key: 'clockOutLocation',
      ellipsis: true,
      render: (location: string) => (
        <span className="text-xs font-mono">{location}</span>
      ),
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
        { text: 'In Progress', value: 'active' },
      ],
      filteredValue: selectedStatus !== 'all' ? [selectedStatus] : null,
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  const exportData = () => {
    console.log('Exporting shift logs data...');
  };

  // Calculate summary statistics
  const completedShifts = transformedData.filter(shift => shift.status === 'completed').length;
  const activeShifts = transformedData.filter(shift => shift.status === 'active').length;
  const totalHours = transformedData
    .filter(shift => shift.status === 'completed')
    .reduce((total, shift) => {
      const match = shift.duration.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        return total + (parseInt(match[1]) + parseInt(match[2]) / 60);
      }
      return total;
    }, 0);

  const handleTableChange = (paginationInfo: any) => {
    if (paginationInfo.current !== pagination.current) {
      fetchShiftLogs(paginationInfo.current, paginationInfo.pageSize);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={2}>Shift Logs</Title>
          <p className="text-gray-600">Loading shift logs...</p>
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
          <Title level={2}>Shift Logs</Title>
          <p className="text-gray-600">Comprehensive shift tracking and management</p>
        </div>
        <Alert
          message="Error Loading Shift Logs"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={() => fetchShiftLogs()}
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
        <Title level={2}>Shift Logs</Title>
        <p className="text-gray-600">Comprehensive shift tracking and management</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{completedShifts}</div>
          <div className="text-gray-600">Completed Shifts</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{activeShifts}</div>
          <div className="text-gray-600">Active Shifts</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">{totalHours.toFixed(1)}h</div>
          <div className="text-gray-600">Total Hours</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">{transformedData.length}</div>
          <div className="text-gray-600">Total Records</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by staff name or email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <Select
            placeholder="Filter by status"
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            <Select.Option value="all">All Statuses</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="active">In Progress</Select.Option>
          </Select>
          <Space>
            <Button 
              onClick={() => fetchShiftLogs(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={exportData}
            >
              Export
            </Button>
          </Space>
        </div>
      </Card>

      {/* Shift Logs Table */}
      <Card title="Shift Records">
        <Table
          columns={columns}
          dataSource={transformedData}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} shift records`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default ShiftLogs;
