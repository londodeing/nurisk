'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResourceOverview } from '@/components/resources/ResourceOverview';
import { ResourceAllocation } from '@/components/resources/ResourceAllocation';
import { ResourceForecast } from '@/components/resources/ResourceForecast';
import { ResourceOptimization } from '@/components/resources/ResourceOptimization';
import { Package, Users, Truck, MapPin, TrendingUp, Lightbulb } from 'lucide-react';

type ResourceTab = 'overview' | 'allocation' | 'forecast' | 'optimization';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'allocation', label: 'Alokasi', icon: MapPin },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'optimization', label: 'Optimasi', icon: Lightbulb },
] as const;

export default function ResourceIntelligencePage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/admin" className="hover:underline">← Dashboard</Link>
            <h1 className="text-xl font-bold">Resource Intelligence</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Truck className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Tambah Resource
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as ResourceTab)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <ResourceOverview />}
          {activeTab === 'allocation' && <ResourceAllocation />}
          {activeTab === 'forecast' && <ResourceForecast />}
          {activeTab === 'optimization' && <ResourceOptimization />}
        </div>
      </main>
    </div>
  );
}