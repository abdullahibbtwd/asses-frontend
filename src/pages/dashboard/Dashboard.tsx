import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Col, Row, Spin, Statistic, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { dashboardApi } from '../../api/services';
import TicketBadge from '../../components/shared/TicketBadge';
import type { DashboardStats, Ticket } from '../../types';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  if (!stats) return null;

  const recentColumns: ColumnsType<Ticket> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <Link to={`/tickets/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <TicketBadge type="status" value={s} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (p) => <TicketBadge type="priority" value={p} />,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      render: (d: string) => new Date(d).toLocaleString(),
    },
  ];

  return (
    <div className="page">
      <Title level={2}>Dashboard</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Overview for {user?.role}
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic title="Total" value={stats.tickets.total} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic title="Open" value={stats.tickets.open} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic title="In progress" value={stats.tickets.inProgress} valueStyle={{ color: '#d46b08' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic title="Resolved" value={stats.tickets.resolved} valueStyle={{ color: '#389e0d' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic title="Closed" value={stats.tickets.closed} />
          </Card>
        </Col>
        {stats.users !== undefined && (
          <Col xs={12} sm={8} md={4}>
            <Card>
              <Statistic title="Users" value={stats.users} />
            </Card>
          </Col>
        )}
      </Row>

      {stats.ticketsByAgent && stats.ticketsByAgent.length > 0 && (
        <Card title="Tickets by agent" style={{ marginBottom: 24 }}>
          <Table
            rowKey={(_, i) => String(i)}
            pagination={false}
            dataSource={stats.ticketsByAgent}
            columns={[
              {
                title: 'Agent',
                render: (_, r) => r.agent?.name ?? 'Unassigned',
              },
              { title: 'Assigned tickets', dataIndex: 'count' },
            ]}
          />
        </Card>
      )}

      <Card title="Recent activity">
        <Table<Ticket>
          rowKey="id"
          columns={recentColumns}
          dataSource={stats.recentActivity ?? []}
          pagination={false}
          locale={{ emptyText: 'No recent tickets' }}
          onRow={(record) => ({
            onClick: () => navigate(`/tickets/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
