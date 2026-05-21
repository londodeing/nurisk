'use client';

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLogisticsRequest, LogisticsStatus, LogisticsPriority } from '@/hooks/use-logistics';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';

const statusConfig: Record<LogisticsStatus, { label: string; color: string; step: number }> = {
  [LogisticsStatus.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800', step: 0 },
  [LogisticsStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', step: 1 },
  [LogisticsStatus.APPROVED]: { label: 'Approved', color: 'bg-green-100 text-green-800', step: 2 },
  [LogisticsStatus.REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-800', step: -1 },
  [LogisticsStatus.IN_TRANSIT]: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800', step: 3 },
  [LogisticsStatus.DELIVERED]: { label: 'Delivered', color: 'bg-purple-100 text-purple-800', step: 4 },
  [LogisticsStatus.COMPLETED]: { label: 'Completed', color: 'bg-green-200 text-green-900', step: 5 },
  [LogisticsStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-gray-200 text-gray-600', step: -1 },
};

const priorityConfig: Record<LogisticsPriority, { label: string; color: string }> = {
  [LogisticsPriority.LOW]: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  [LogisticsPriority.NORMAL]: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  [LogisticsPriority.HIGH]: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  [LogisticsPriority.URGENT]: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

const statusSteps = [
  { status: LogisticsStatus.SUBMITTED, label: 'Submitted', icon: '📋' },
  { status: LogisticsStatus.APPROVED, label: 'Approved', icon: '✅' },
  { status: LogisticsStatus.IN_TRANSIT, label: 'In Transit', icon: '🚚' },
  { status: LogisticsStatus.DELIVERED, label: 'Delivered', icon: '📦' },
  { status: LogisticsStatus.COMPLETED, label: 'Completed', icon: '✅✅' },
];

export function LogisticsDetail() {
  const { id } = useParams<{ id: string }>();
  const { request, loading, error, refetch } = useLogisticsRequest(id || '');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({ carrier: '', trackingNumber: '', eta: '' });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !request) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error || 'Request not found'}</div>
          <Link to="/dashboard/admin/logistics">
            <Button className="mt-2">Back to List</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentStep = statusConfig[request.status].step;

  const getTimelineIcon = (step: number) => {
    if (step < currentStep) return '✅';
    if (step === currentStep) return '🔵';
    return '⭕';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/admin/logistics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono">{request.requestNumber}</h1>
            <Badge className={priorityConfig[request.priority].color}>
              {priorityConfig[request.priority].label}
            </Badge>
          </div>
        </div>
        <Badge className={statusConfig[request.status].color}>
          {statusConfig[request.status].label}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {getTimelineIcon(index)}
                  </div>
                  <div className="text-sm mt-2">{step.label}</div>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requester Info */}
        <Card>
          <CardHeader>
            <CardTitle>Requester Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{request.requesterName}</div>
                  <div className="text-sm text-gray-500">Requester</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{request.requesterPhone}</div>
                  <div className="text-sm text-gray-500">Contact</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{request.requesterLocation}</div>
                  <div className="text-sm text-gray-500">Delivery Location</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Items Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.quantity} {item.unit}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-gray-500">{item.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Location */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium">{request.deliveryLocation.address}</div>
              <div className="text-sm text-gray-500">
                {request.deliveryLocation.lat}, {request.deliveryLocation.lng}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Info */}
      {request.tracking && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Carrier</div>
                <div className="font-medium">{request.tracking.carrier || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tracking Number</div>
                <div className="font-medium font-mono">{request.tracking.trackingNumber || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">ETA</div>
                <div className="font-medium">
                  {request.tracking.eta
                    ? new Date(request.tracking.eta).toLocaleDateString()
                    : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {request.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{request.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Actions */}
      {request.status === LogisticsStatus.SUBMITTED && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={async () => {
                  const { approveRequest } = useLogisticsRequest(id || '').refetch as never;
                  await approveRequest(id!);
                  refetch();
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ship Actions */}
      {request.status === LogisticsStatus.APPROVED && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShipDialogOpen(true)}>
              <Truck className="w-4 h-4 mr-2" />
              Mark as In Transit
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deliver Actions */}
      {request.status === LogisticsStatus.IN_TRANSIT && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Mark as Delivered
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complete Actions */}
      {request.status === LogisticsStatus.DELIVERED && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Completed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setRejectDialogOpen(false)}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ship Dialog */}
      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Request</DialogTitle>
            <DialogDescription>
              Enter tracking information for this shipment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Carrier</label>
              <Input
                value={trackingInfo.carrier}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                placeholder="e.g., JNE, TIKI, POS"
              />
            </div>
            <div>
              <label className="text-sm">Tracking Number</label>
              <Input
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                placeholder="Tracking number"
              />
            </div>
            <div>
              <label className="text-sm">ETA</label>
              <Input
                type="date"
                value={trackingInfo.eta}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, eta: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShipDialogOpen(false)}>
              <Truck className="w-4 h-4 mr-2" />
              Ship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}