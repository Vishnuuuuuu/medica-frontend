import { LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, Typography, message } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleAuth } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleAuth();
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="text-blue-600 mb-2">HealthCare</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              disabled={googleLoading}
            >
              Sign In
            </Button>
          </Form.Item>

          <Divider>Or</Divider>

          <Button
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading}
            block
            className="mb-4"
          >
            Continue with Google
          </Button>

          <div className="text-center">
            <Text>Don't have an account? </Text>
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign up as Care Worker
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;