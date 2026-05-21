'use client';

import { useState } from 'react';
import { useDecision, useDecisionActions } from '@/hooks/use-decision';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, CheckCircle, XCircle, AlertTriangle, Clock, User, MessageSquare } from 'lucide-react';

interface DecisionDetailProps {
  id: string;
  onClose?: () => void;
}

export function DecisionDetail({ id, onClose }: DecisionDetailProps) {
  const { decision, loading, error, refetch } = useDecision(id);
  const { approve, reject, modify, loading: actionLoading } = useDecisionActions(id);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    try {
      await approve(notes);
      refetch();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await reject(rejectReason);
      refetch();
      setShowRejectForm(false);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !decision) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          Gagal memuat detail keputusan
        </CardContent>
      </Card>
    );
  }

  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{decision.type}</h2>
          <p className="text-sm text-gray-500">
            ID: {decision.id} • Dibuat: {new Date(decision.createdAt).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            decision.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            decision.status === 'approved' ? 'bg-green-100 text-green-800' :
            decision.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {decision.status === 'pending' && 'Menunggu'}
            {decision.status === 'approved' && 'Disetujui'}
            {decision.status === 'rejected' && 'Ditolak'}
            {decision.status === 'modified' && 'Dimodifikasi'}
          </span>
        </div>
      </div>

      {/* AI Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Reasoning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{decision.reasoning}</p>
        </CardContent>
      </Card>

      {/* Input Factors */}
      {decision.inputFactors && (
        <Card>
          <CardHeader>
            <CardTitle>Faktor Input</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(decision.inputFactors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Alternatives */}
      {decision.alternatives && decision.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Opsi Alternatif</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {decision.alternatives.map((alt, i) => (
                <li key={i} className="text-gray-700">{alt}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {decision.riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Penilaian Risiko
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                riskColors[decision.riskAssessment.level]
              }`}>
                {decision.riskAssessment.level.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Kepercayaan: {decision.confidence}%
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {decision.riskAssessment.factors.map((factor, i) => (
                <li key={i} className="text-gray-700">{factor}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions - Only for pending decisions */}
      {decision.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Aksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRejectForm ? (
              <>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApprove} 
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setuju
                  </Button>
                  <Button 
                    onClick={() => setShowRejectForm(true)} 
                    disabled={actionLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                </div>
                <div>
                  <label className="block text-sm mb-1">Catatan (opsional)</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm mb-1">Alasan Penolakan</label>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Alasan penolakan..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleReject} 
                    disabled={actionLoading || !rejectReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Konfirmasi Tolak
                  </Button>
                  <Button 
                    onClick={() => setShowRejectForm(false)} 
                    variant="outline"
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}