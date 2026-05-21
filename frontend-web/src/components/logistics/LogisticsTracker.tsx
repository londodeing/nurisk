'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogisticsStatus, type LogisticsRequest } from '@/hooks/use-logistics';
import { Truck, MapPin, Clock } from 'lucide-react';

interface LogisticsTrackerProps {
  request: LogisticsRequest;
}

export function LogisticsTracker({ request }: LogisticsTrackerProps) {
  const timeline = request.timeline;

  const getStatusIcon = (status: LogisticsStatus) => {
    switch (status) {
      case LogisticsStatus.SUBMITTED:
        return '📋';
      case LogisticsStatus.APPROVED:
        return '✅';
      case LogisticsStatus.REJECTED:
        return '❌';
      case LogisticsStatus.IN_TRANSIT:
        return '🚚';
      case LogisticsStatus.DELIVERED:
        return '📦';
      case LogisticsStatus.COMPLETED:
        return '✅✅';
      case LogisticsStatus.CANCELLED:
        return '🚫';
      default:
        return '📝';
    }
  };

  const timelineEvents = [
    {
      status: LogisticsStatus.SUBMITTED,
      label: 'Request Submitted',
      date: timeline.submittedAt,
      description: 'Request has been submitted and is pending approval',
    },
    {
      status: LogisticsStatus.APPROVED,
      label: 'Request Approved',
      date: timeline.approvedAt,
      description: 'Request has been approved and is ready for shipping',
    },
    {
      status: LogisticsStatus.REJECTED,
      label: 'Request Rejected',
      date: timeline.rejectedAt,
      description: 'Request has been rejected',
    },
    {
      status: LogisticsStatus.IN_TRANSIT,
      label: 'In Transit',
      date: timeline.shippedAt,
      description: request.tracking?.trackingNumber
        ? `Tracking: ${request.tracking.carrier} - ${request.tracking.trackingNumber}`
        : 'Package is on the way',
    },
    {
      status: LogisticsStatus.DELIVERED,
      label: 'Delivered',
      date: timeline.deliveredAt,
      description: 'Package has been delivered to destination',
    },
    {
      status: LogisticsStatus.COMPLETED,
      label: 'Completed',
      date: timeline.completedAt,
      description: 'Request has been completed',
    },
  ];

  const completedEvents = timelineEvents.filter((event) => event.date);
  const pendingEvents = timelineEvents.filter((event) => !event.date);

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getStatusIcon(request.status)}</div>
            <div>
              <div className="text-xl font-bold">{request.status}</div>
              {request.tracking?.eta && (
                <div className="text-sm text-gray-500">
                  ETA: {new Date(request.tracking.eta).toLocaleDateString()}
                </div>
              )}
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
            <div className="grid grid-cols-2 gap-4">
              {request.tracking.carrier && (
                <div>
                  <div className="text-sm text-gray-500">Carrier</div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>{request.tracking.carrier}</span>
                  </div>
                </div>
              )}
              {request.tracking.trackingNumber && (
                <div>
                  <div className="text-sm text-gray-500">Tracking Number</div>
                  <div className="font-mono">{request.tracking.trackingNumber}</div>
                </div>
              )}
              {request.tracking.eta && (
                <div>
                  <div className="text-sm text-gray-500">ETA</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(request.tracking.eta).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Completed Events */}
            {completedEvents.map((event, _index) => (
              <div key={event.status} className="relative flex gap-4 pb-6">
                <div className="relative z-10 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="font-medium">{event.label}</div>
                  <div className="text-sm text-gray-500">
                    {event.date && new Date(event.date).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">{event.description}</div>
                </div>
              </div>
            ))}

            {/* Current Event */}
            {request.status !== LogisticsStatus.COMPLETED &&
              request.status !== LogisticsStatus.REJECTED &&
              request.status !== LogisticsStatus.CANCELLED && (
                <div className="relative flex gap-4 pb-6">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    ●
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-600">
                      {timelineEvents.find((e) => e.status === request.status)?.label}
                    </div>
                    <div className="text-sm text-gray-500">In Progress</div>
                  </div>
                </div>
              )}

            {/* Pending Events */}
            {pendingEvents.map((event, _index) => {
              // Skip if it's the current status
              if (event.status === request.status) return null;
              // Skip rejected/cancelled for non-rejected requests
              if (
                (event.status === LogisticsStatus.REJECTED ||
                  event.status === LogisticsStatus.CANCELLED) &&
                request.status !== LogisticsStatus.REJECTED &&
                request.status !== LogisticsStatus.CANCELLED
              )
                return null;

              return (
                <div key={event.status} className="relative flex gap-4 pb-6">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    ○
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-400">{event.label}</div>
                    <div className="text-sm text-gray-400">Pending</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}