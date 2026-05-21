'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DecisionDashboard } from '@/components/decision/DecisionDashboard';
import { DecisionList } from '@/components/decision/DecisionList';
import { DecisionDetail } from '@/components/decision/DecisionDetail';
import { DecisionConfig } from '@/components/decision/DecisionConfig';

export default function DecisionPage() {
  const [activeView, setActiveView] = useState<'list' | 'config'>('list');
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard/admin" className="hover:underline">← Dashboard</Link>
          <h1 className="text-xl font-bold">Decision Engine</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Stats Overview */}
        <section className="mb-8">
          <DecisionDashboard />
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'list' 
                ? 'bg-nu-green text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Daftar Keputusan
          </button>
          <button
            onClick={() => setActiveView('config')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'config' 
                ? 'bg-nu-green text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Konfigurasi
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className={selectedDecision ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {activeView === 'list' && (
              <DecisionList onSelect={setSelectedDecision} />
            )}
            {activeView === 'config' && (
              <DecisionConfig />
            )}
          </div>

          {/* Detail Panel */}
          {selectedDecision && activeView === 'list' && (
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <DecisionDetail 
                  id={selectedDecision} 
                  onClose={() => setSelectedDecision(null)} 
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}