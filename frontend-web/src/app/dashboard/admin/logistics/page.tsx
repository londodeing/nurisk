'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { LogisticsList } from '@/components/logistics/LogisticsList';
import { LogisticsForm } from '@/components/logistics/LogisticsForm';

export default function LogisticsPage() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">New Logistics Request</h1>
        </div>
        <LogisticsForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-3">
        <Package className="w-8 h-8" />
        <div>
          <h1 className="text-2xl font-bold">Logistics Management</h1>
          <p className="text-gray-600">Manage logistics requests and shipments</p>
        </div>
      </div>
      <LogisticsList onCreateNew={() => setShowForm(true)} />
    </div>
  );
}