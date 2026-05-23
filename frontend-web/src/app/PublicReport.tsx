import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, FileText, Zap } from 'lucide-react';
import ReportForm from '@/components/report/ReportForm';
import EmergencyReportForm from '@/components/report/EmergencyReportForm';
import PanicButton from '@/components/report/PanicButton';

type ReportMode = 'full' | 'emergency' | 'quick';

export default function PublicReport() {
  const [mode, setMode] = useState<ReportMode>('full');

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3">
        <Card 
          className={`cursor-pointer transition-all ${mode === 'full' ? 'ring-2 ring-nu-green shadow-md' : 'hover:shadow-sm'}`}
          onClick={() => setMode('full')}
        >
          <CardContent className="p-4 text-center">
            <FileText className="w-7 h-7 mx-auto mb-2 text-nu-green" />
            <p className="font-semibold text-sm">Form Lengkap</p>
            <p className="text-xs text-slate-500">Isi detail kejadian</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${mode === 'emergency' ? 'ring-2 ring-danger-red shadow-md' : 'hover:shadow-sm'}`}
          onClick={() => setMode('emergency')}
        >
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-7 h-7 mx-auto mb-2 text-danger-red" />
            <p className="font-semibold text-sm text-danger-red">Darurat</p>
            <p className="text-xs text-slate-500">Butuh bantuan segera</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${mode === 'quick' ? 'ring-2 ring-warning-yellow shadow-md' : 'hover:shadow-sm'}`}
          onClick={() => setMode('quick')}
        >
          <CardContent className="p-4 text-center">
            <Zap className="w-7 h-7 mx-auto mb-2 text-warning-yellow" />
            <p className="font-semibold text-sm">Cepat</p>
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

      {/* Always visible panic button */}
      <div className="flex justify-center">
        <PanicButton size="md" />
      </div>
    </div>
  );
}
