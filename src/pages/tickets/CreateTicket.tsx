import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Select, Spin, Typography } from 'antd';
import { companiesApi, ticketsApi } from '../../api/services';
import type { TicketPriority } from '../../types';

const { Title } = Typography;

export default function CreateTicket() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    companiesApi
      .listForTicket()
      .then(({ data }) => {
        setCompanies(data);
        if (data.length > 0) {
          form.setFieldValue('companyId', data[0].id);
        }
      })
      .catch(() => setError('Could not load companies from database'))
      .finally(() => setLoadingCompanies(false));
  }, [form]);

  const onFinish = async (values: {
    companyId: string;
    title: string;
    description: string;
    priority: TicketPriority;
  }) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await ticketsApi.create(values);
      navigate(`/tickets/${data.id}`);
    } catch {
      setError('Failed to create ticket. Ensure a valid company is selected.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompanies) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page">
      <Title level={2}>Create ticket</Title>
      <Card style={{ maxWidth: 640, marginTop: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ priority: 'medium' }}
        >
          <Form.Item
            label="Company"
            name="companyId"
            rules={[{ required: true, message: 'Select a company' }]}
            extra="Ticket is saved with the selected company ID from the database."
          >
            <Select
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select a company"
            />
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, min: 3 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, min: 5 }]}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
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
              disabled={companies.length === 0}
            >
              Submit ticket
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
