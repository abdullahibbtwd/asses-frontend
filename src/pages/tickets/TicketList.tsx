import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { ticketsApi, usersApi } from '../../api/services';
import TicketBadge from '../../components/shared/TicketBadge';
import type { Ticket, TicketPriority, TicketStatus, User } from '../../types';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

export default function TicketList() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: '' as TicketStatus | '',
    priority: '' as TicketPriority | '',
    assignedToId: '',
    search: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedToId) params.assignedToId = filters.assignedToId;
      if (filters.search.trim()) params.search = filters.search.trim();

      const { data } = await ticketsApi.list(params);
      setTickets(data.items);
      setPagination((p) => ({
        ...p,
        total: data.total,
        page: data.page,
        limit: data.limit,
      }));
    } catch {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role === 'admin') {
      usersApi
        .list()
        .then(({ data }) => setAgents(data.filter((u) => u.role === 'agent')))
        .catch(() => {});
    }
  }, [user?.role]);

  const columns: ColumnsType<Ticket> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <Link to={`/tickets/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      render: (_, r) => r.company?.name ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: TicketStatus) => <TicketBadge type="status" value={s} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (p: TicketPriority) => <TicketBadge type="priority" value={p} />,
    },
    {
      title: 'Created by',
      dataIndex: ['createdBy', 'name'],
    },
    {
      title: 'Assigned',
      render: (_, r) => r.assignedTo?.name ?? '—',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: '',
      key: 'actions',
      render: (_, r) => (
        <Button type="link" onClick={() => navigate(`/tickets/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  const onTableChange = (pag: TablePaginationConfig) => {
    setPagination((p) => ({
      ...p,
      page: pag.current ?? 1,
      limit: pag.pageSize ?? 10,
    }));
  };

  const canCreate = user?.role === 'customer' || user?.role === 'admin';

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Tickets
        </Title>
        {canCreate && (
          <Link to="/tickets/create">
            <Button type="primary">New ticket</Button>
          </Link>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search title or description"
            allowClear
            style={{ minWidth: 220 }}
            onSearch={(v) => {
              setFilters((f) => ({ ...f, search: v }));
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            value={filters.status || undefined}
            onChange={(v) => {
              setFilters((f) => ({ ...f, status: (v ?? '') as TicketStatus | '' }));
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <Select
            placeholder="Priority"
            allowClear
            style={{ width: 120 }}
            value={filters.priority || undefined}
            onChange={(v) => {
              setFilters((f) => ({
                ...f,
                priority: (v ?? '') as TicketPriority | '',
              }));
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          {user?.role === 'admin' && (
            <Select
              placeholder="Agent"
              allowClear
              style={{ width: 180 }}
              value={filters.assignedToId || undefined}
              onChange={(v) => {
                setFilters((f) => ({ ...f, assignedToId: v ?? '' }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              options={agents.map((a) => ({ value: a.id, label: a.name }))}
            />
          )}
          <Button onClick={load}>Refresh</Button>
        </Space>
      </Card>

      {error && (
        <Typography.Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
          {error}
        </Typography.Text>
      )}

      <Card>
        <Table<Ticket>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={tickets}
          locale={{ emptyText: <Empty description="No tickets found" /> }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} tickets`,
          }}
          onChange={onTableChange}
          onRow={(record) => ({
            onClick: () => navigate(`/tickets/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
