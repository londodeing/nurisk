'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLogistics, LogisticsStatus, LogisticsPriority, type LogisticsRequest } from '@/hooks/use-logistics';
import {
  Search,
  Plus,
  Package,
  Clock,
  MapPin,
} from 'lucide-react';

const statusConfig: Record<LogisticsStatus, { label: string; color: string; icon: string }> = {
  [LogisticsStatus.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  [LogisticsStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: '📋' },
  [LogisticsStatus.APPROVED]: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: '✅' },
  [LogisticsStatus.REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
  [LogisticsStatus.IN_TRANSIT]: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800', icon: '🚚' },
  [LogisticsStatus.DELIVERED]: { label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: '📦' },
  [LogisticsStatus.COMPLETED]: { label: 'Completed', color: 'bg-green-200 text-green-900', icon: '✅✅' },
  [LogisticsStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-gray-200 text-gray-600', icon: '🚫' },
};

const priorityConfig: Record<LogisticsPriority, { label: string; color: string }> = {
  [LogisticsPriority.LOW]: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  [LogisticsPriority.NORMAL]: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  [LogisticsPriority.HIGH]: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  [LogisticsPriority.URGENT]: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

interface LogisticsListProps {
  onCreateNew?: () => void;
}

export function LogisticsList({ onCreateNew }: LogisticsListProps) {
  const { requests, loading, error, filters, setFilters, refetch } = useLogistics({});
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const handleSearch = () => {
    setFilters({ ...filters, search });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status as LogisticsStatus || undefined });
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters({ ...filters, priority: priority as LogisticsPriority || undefined });
  };

  const handleDateFilter = (type: 'start' | 'date', value: string) => {
    if (type === 'start') {
      setFilters({ ...filters, startDate: value || undefined });
    } else {
      setFilters({ ...filters, endDate: value || undefined });
    }
  };

  const getTotalItems = (items: LogisticsRequest['items']) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
          <Button onClick={refetch} className="mt-2">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Logistics Requests</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ID or requester..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || ''}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {Object.values(LogisticsStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].icon} {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filters.priority || ''}
              onValueChange={handlePriorityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                {Object.values(LogisticsPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priorityConfig[priority].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={view === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('table')}
              >
                Table
              </Button>
              <Button
                variant={view === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('cards')}
              >
                Cards
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <Input
                type="date"
                onChange={(e) => handleDateFilter('start', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <Input
                type="date"
                onChange={(e) => handleDateFilter('date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : view === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No logistics requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {request.requestNumber}
                    </TableCell>
                    <TableCell>
                      <div>{request.requesterName}</div>
                      <div className="text-xs text-gray-500">{request.requesterLocation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {getTotalItems(request.items)} items
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[request.status].color}>
                        {statusConfig[request.status].icon}{' '}
                        {statusConfig[request.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityConfig[request.priority].color}>
                        {priorityConfig[request.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.timeline.submittedAt
                        ? new Date(request.timeline.submittedAt).toLocaleDateString()
                        : new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link to={`/dashboard/admin/logistics/${request.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/dashboard/admin/logistics/${request.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-mono">
                      {request.requestNumber}
                    </CardTitle>
                    <Badge className={priorityConfig[request.priority].color}>
                      {priorityConfig[request.priority].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{getTotalItems(request.items)} items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate">{request.requesterLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {request.timeline.submittedAt
                          ? new Date(request.timeline.submittedAt).toLocaleDateString()
                          : new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge className={statusConfig[request.status].color}>
                      {statusConfig[request.status].icon}{' '}
                      {statusConfig[request.status].label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === LogisticsStatus.SUBMITTED).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === LogisticsStatus.APPROVED).length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === LogisticsStatus.IN_TRANSIT).length}
              </div>
              <div className="text-sm text-gray-600">In Transit</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === LogisticsStatus.COMPLETED).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}