import {
    EnvironmentOutlined,
    FileTextOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Layout as AntLayout, Avatar, Button, Dropdown, Menu, Space } from 'antd';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const careWorkerMenuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/history',
      icon: <FileTextOutlined />,
      label: 'History',
    },
  ];

  const managerMenuItems = [
    {
      key: '/manager',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/manager/staff',
      icon: <TeamOutlined />,
      label: 'Staff Management',
    },
    {
      key: '/manager/analytics',
      icon: <FileTextOutlined />,
      label: 'Analytics',
    },
    {
      key: '/manager/location',
      icon: <EnvironmentOutlined />,
      label: 'Location Settings',
    },
  ];

  const menuItems = user?.role === 'MANAGER' ? managerMenuItems : careWorkerMenuItems;

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntLayout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        className="bg-white border-r border-gray-200"
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="text-lg font-bold text-blue-600">
            {collapsed ? 'HC' : 'HealthCare'}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      
      <AntLayout>
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden"
            />
            <h1 className="text-xl font-semibold ml-4 text-gray-800">
              {user?.role === 'MANAGER' ? 'Manager Portal' : 'Care Worker Portal'}
            </h1>
          </div>
          
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div className="cursor-pointer">
              <Space>
                <Avatar 
                  src={user?.picture} 
                  icon={<UserOutlined />} 
                />
                <span className="hidden sm:inline">{user?.name}</span>
              </Space>
            </div>
          </Dropdown>
        </Header>
        
        <Content className="m-6 p-6 bg-gray-50 min-h-96">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;