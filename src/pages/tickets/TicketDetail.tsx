import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  List,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import { commentsApi, ticketsApi, usersApi } from '../../api/services';
import TicketBadge from '../../components/shared/TicketBadge';
import type { Ticket, TicketComment, TicketStatus, User } from '../../types';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph, Text } = Typography;

const STATUS_OPTIONS: TicketStatus[] = [
  'open',
  'in_progress',
  'resolved',
  'closed',
];

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [assignId, setAssignId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await ticketsApi.get(id);
      setTicket(data);
      setAssignId(data.assignedToId ?? '');
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this ticket');
        } else if (err.response?.status === 404) {
          setError('Ticket not found');
        } else {
          setError('Failed to load ticket');
        }
      } else {
        setError('Failed to load ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, user?.role]);

  useEffect(() => {
    if (user?.role !== 'admin' || !ticket?.companyId) return;
    usersApi
      .list()
      .then(({ data }) =>
        setAgents(
          data.filter(
            (u) => u.role === 'agent' && u.companyId === ticket.companyId,
          ),
        ),
      )
      .catch(() => {});
  }, [user?.role, ticket?.companyId]);

  const handleStatus = async (status: TicketStatus) => {
    if (!id) return;
    const { data } = await ticketsApi.update(id, { status });
    setTicket(data);
  };

  const handleAssign = async () => {
    if (!id || !assignId) return;
    setSubmitting(true);
    try {
      const { data } = await ticketsApi.assign(id, assignId);
      setTicket(data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (values: { message: string }) => {
    if (!id || !values.message.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.create(id, values.message.trim());
      form.resetFields();
      const { data } = await ticketsApi.get(id);
      setTicket(data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page">
        <Alert type="error" message={error || 'Not found'} showIcon />
        <Link to="/tickets" style={{ marginTop: 16, display: 'inline-block' }}>
          Back to tickets
        </Link>
      </div>
    );
  }

  const comments: TicketComment[] = ticket.comments ?? [];
  const canManage = user?.role === 'agent' || user?.role === 'admin';

  return (
    <div className="page">
      <Link to="/tickets">
        <Text type="secondary">← Back to tickets</Text>
      </Link>

      <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            {ticket.title}
          </Title>
          <Space>
            <TicketBadge type="status" value={ticket.status} />
            <TicketBadge type="priority" value={ticket.priority} />
          </Space>
        </div>

        <Card>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Paragraph>
          <Text type="secondary">
            Company: {ticket.company?.name ?? '—'} · Created by {ticket.createdBy?.name} ·{' '}
            {ticket.assignedTo
              ? `Assigned to ${ticket.assignedTo.name}`
              : 'Unassigned'}{' '}
            · {new Date(ticket.createdAt).toLocaleString()}
          </Text>
        </Card>

        {canManage && (
          <Card title="Update status">
            <Space wrap>
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  type={ticket.status === s ? 'primary' : 'default'}
                  onClick={() => handleStatus(s)}
                >
                  {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </Space>
          </Card>
        )}

        {user?.role === 'admin' && (
          <Card title="Assign agent">
            <Space wrap>
              <Select
                style={{ minWidth: 220 }}
                placeholder="Select agent"
                value={assignId || undefined}
                onChange={setAssignId}
                options={agents.map((a) => ({ value: a.id, label: a.name }))}
              />
              <Button
                type="primary"
                onClick={handleAssign}
                disabled={!assignId}
                loading={submitting}
              >
                Assign
              </Button>
            </Space>
          </Card>
        )}

        <Card title="Conversation">
          <List
            locale={{ emptyText: 'No replies yet' }}
            dataSource={comments}
            renderItem={(c) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{c.author?.name}</Text>
                      <Text type="secondary">({c.author?.role})</Text>
                      <Text type="secondary">
                        {new Date(c.createdAt).toLocaleString()}
                      </Text>
                    </Space>
                  }
                  description={c.message}
                />
              </List.Item>
            )}
          />
          <Form form={form} layout="vertical" onFinish={handleComment} style={{ marginTop: 16 }}>
            <Form.Item
              name="message"
              label="Add reply"
              rules={[{ required: true, message: 'Enter a message' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Send reply
            </Button>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
