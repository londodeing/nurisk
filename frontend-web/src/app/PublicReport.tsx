import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, FileText, Zap } from 'lucide-react';
import ReportForm from '@/components/report/ReportForm';
import EmergencyReportForm from '@/components/report/EmergencyReportForm';
import PanicButton from '@/components/report/PanicButton';

type ReportMode = 'full' | 'emergency' | 'quick';

export default function PublicReport() {
  const [mode, setMode] = useState<ReportMode>('full');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">← Kembali</Link>
            <h1 className="text-xl font-bold">Lapor Bencana</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-colors ${mode === 'full' ? 'border-nu-green border-2' : ''}`}
            onClick={() => setMode('full')}
          >
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-nu-green" />
              <p className="font-semibold">Form Lengkap</p>
              <p className="text-xs text-slate-500">Isi detail kejadian</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-colors ${mode === 'emergency' ? 'border-danger-red border-2' : ''}`}
            onClick={() => setMode('emergency')}
          >
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-danger-red" />
              <p className="font-semibold text-danger-red">Darurat</p>
              <p className="text-xs text-slate-500">Butuh bantuan segera</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-colors ${mode === 'quick' ? 'border-warning-yellow border-2' : ''}`}
            onClick={() => setMode('quick')}
          >
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-warning-yellow" />
              <p className="font-semibold">Cepat</p>
              <p className="text-xs text-slate-500">One-tap report</p>
            </CardContent>
          </Card>
        </div>

        {/* Form based on mode */}
        {mode === 'full' && <ReportForm />}
        {mode === 'emergency' && <EmergencyReportForm />}
        {mode === 'quick' && (
          <div className="text-center py-12">
            <p className="text-lg mb-4">Tekan tombol merah untuk mengirim laporan darurat</p>
            <PanicButton size="lg" />
          </div>
        )}
      </main>

      {/* Always visible panic button */}
      <PanicButton size="md" />
    </div>
  );
}