import { LockOutlined, MailOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, Typography, message } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, googleAuth } = useAuth();

  const onFinish = async (values: { 
    name: string; 
    email: string; 
    password: string; 
  }) => {
    setLoading(true);
    try {
      await signup(values.name, values.email, values.password);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
          <Text type="secondary">Create your Care Worker account</Text>
        </div>

        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
          </Form.Item>

          <div className="mb-4 p-3 bg-blue-50 rounded">
            <Text type="secondary" className="text-sm">
              Only Care Workers can sign up through this form. Manager accounts are created by administrators.
            </Text>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              disabled={googleLoading}
            >
              Sign Up as Care Worker
            </Button>
          </Form.Item>

          <Divider>Or</Divider>

          <Button
            icon={<GoogleOutlined />}
            onClick={handleGoogleSignup}
            loading={googleLoading}
            disabled={loading}
            block
            className="mb-4"
          >
            Continue with Google
          </Button>

          <div className="text-center">
            <Text>Already have an account? </Text>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SignUp;