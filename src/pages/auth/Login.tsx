import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { authApi } from '../../api/services';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(values.email, values.password);
      setAuth(data.accessToken, data.user);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card style={{ width: '100%', maxWidth: 420 }} bordered={false}>
        <Title level={2}>Sign in</Title>
        <Paragraph type="secondary">Multi-tenant helpdesk system</Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ email: 'admin@test.com', password: 'password123' }}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          {error && (
            <Form.Item>
              <Alert type="error" message={error} showIcon />
            </Form.Item>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Paragraph>
          No account? <Link to="/register">Register</Link>
        </Paragraph>

        <Card size="small" type="inner" title="Demo accounts">
          <Text type="secondary">
            <strong>Admin:</strong> admin@test.com
            <br />
            <strong>Customer:</strong> customer@test.com
            <br />
            <strong>Agents:</strong> agent.acme / globex / initech / umbrella
            @test.com
            <br />
            Password: <Text code>password123</Text>
          </Text>
        </Card>
      </Card>
    </div>
  );
}
