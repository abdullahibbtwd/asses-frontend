import { Tag } from 'antd';
import type { TicketPriority, TicketStatus } from '../../types';
import { priorityColor, statusColor } from '../../types';

interface Props {
  type: 'status' | 'priority';
  value: TicketStatus | TicketPriority;
}

export default function TicketBadge({ type, value }: Props) {
  const color =
    type === 'status'
      ? statusColor[value as TicketStatus]
      : priorityColor[value as TicketPriority];
  const label = String(value).replace(/_/g, ' ').toUpperCase();

  return <Tag color={color}>{label}</Tag>;
}
