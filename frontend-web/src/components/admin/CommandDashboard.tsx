import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, Users, Clock, TrendingUp, 
  TrendingDown, Activity, Shield, Car
} from 'lucide-react';
import api from '@/services/api';

type View = 'tactical' | 'operational' | 'strategic';

export default function CommandDashboard() {
  const [view, setView] = useState<View>('tactical');

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex justify-between items-center">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="tactical">Tactical</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="strategic">Strategic</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'tactical' && <TacticalView />}
      {view === 'operational' && <OperationalView />}
      {view === 'strategic' && <StrategicView />}
    </div>
  );
}

function TacticalView() {
  const { data: incidents = [] } = useQuery({
    queryKey: ['tactical-incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents?status=active&limit=20');
      return res.data;
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['tactical-alerts'],
    queryFn: async () => {
      const res = await api.get('/alerts?priority=high');
      return res.data;
    },
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Live Incident Feed */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-danger-red" />
              Live Incident Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidents.map((incident: { id: string; title: string; type: string; severity: string; location: string; updatedAt: string }) => (
                <div key={incident.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    incident.severity === 'CRITICAL' ? 'bg-danger-red animate-pulse' :
                    incident.severity === 'HIGH' ? 'bg-warning-yellow' :
                    'bg-nu-green'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-xs text-slate-500">{incident.type} • {incident.location}</p>
                  </div>
                  <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {incident.severity}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(incident.updatedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Widget */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-yellow" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert: { id: string; message: string; priority: string; createdAt: string }) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.priority === 'critical' ? 'bg-danger-red/10' : 'bg-warning-yellow/10'
                }`}>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(alert.createdAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OperationalView() {
  const { data: shifts = [] } = useQuery({
    queryKey: ['operational-shifts'],
    queryFn: async () => {
      const res = await api.get('/shifts/today');
      return res.data;
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['operational-resources'],
    queryFn: async () => {
      const res = await api.get('/resources/health');
      return res.data;
    },
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Shift Summary */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-nu-green" />
              Shift Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {shifts.map((shift: { id: string; name: string; volunteers: number; status: string }) => (
                <div key={shift.id} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium">{shift.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{shift.volunteers} volunteers</span>
                  </div>
                  <Badge className="mt-2" variant={shift.status === 'active' ? 'default' : 'secondary'}>
                    {shift.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Health */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-safe-green" />
              Resource Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((resource: { id: string; name: string; status: string; capacity: number }) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{resource.name}</span>
                  </div>
                  <Badge variant={resource.status === 'healthy' ? 'default' : 'destructive'}>
                    {resource.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StrategicView() {
  const { data: trends = [] } = useQuery({
    queryKey: ['strategic-trends'],
    queryFn: async () => {
      const res = await api.get('/analytics/trends');
      return res.data;
    },
  });

  const { data: trajectory = {} } = useQuery({
    queryKey: ['strategic-trajectory'],
    queryFn: async () => {
      const res = await api.get('/analytics/trajectory');
      return res.data;
    },
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Trends */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-nu-green" />
              Trends & Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {trends.map((trend: { metric: string; value: number; change: number; direction: string }) => (
                <div key={trend.metric} className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">{trend.metric}</p>
                  <p className="text-2xl font-bold mt-1">{trend.value}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    (trend.direction === 'up' && trend.metric !== 'Response Time') ||
                    (trend.direction === 'down' && trend.metric === 'Response Time')
                      ? 'text-safe-green' : 'text-danger-red'
                  }`}>
                    {trend.direction === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm">{trend.change}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trajectory Indicators */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Trajectory Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Incident Rate</p>
                <p className="text-xl font-bold">{trajectory.incidentRate}</p>
                <p className="text-xs text-slate-400">vs last week</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Response Efficiency</p>
                <p className="text-xl font-bold">{trajectory.responseEfficiency}</p>
                <p className="text-xs text-slate-400">vs last week</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Resource Utilization</p>
                <p className="text-xl font-bold">{trajectory.resourceUtilization}</p>
                <p className="text-xs text-slate-400">vs last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}