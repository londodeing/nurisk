'use client';

import { useState } from 'react';
import {
  getWarningLevelLabel,
  type WarningCreateRequest,
} from '@/services/earlyWarningService';

interface WarningCreationProps {
  onSubmit?: (warning: WarningCreateRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function WarningCreation({
  onSubmit,
  onCancel,
  isLoading = false,
}: WarningCreationProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    severity: string;
    expiresAt: string;
    issuedAt: string;
    affectedAreas: string[];
    source: string;
  }>({
    title: '',
    description: '',
    severity: 'ADVISORY',
    expiresAt: '',
    issuedAt: new Date().toISOString().slice(0, 16),
    affectedAreas: [],
    source: '',
  });

  const [newAreaName, setNewAreaName] = useState('');

  const severityOptions = ['EMERGENCY', 'WARNING', 'WATCH', 'ADVISORY', 'INFORMATIONAL'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAffectedArea = () => {
    if (newAreaName.trim()) {
      setFormData((prev) => ({
        ...prev,
        affectedAreas: [...prev.affectedAreas, newAreaName.trim()],
      }));
      setNewAreaName('');
    }
  };

  const removeAffectedArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      affectedAreas: prev.affectedAreas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const warning: WarningCreateRequest = {
      title: formData.title,
      description: formData.description,
      severity: formData.severity as any,
      status: 'ACTIVE',
      affectedAreas: formData.affectedAreas,
      issuedAt: new Date(formData.issuedAt).toISOString(),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      source: formData.source || undefined,
    };

    onSubmit?.(warning);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul Peringatan
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Contoh: Peringatan Dini Tsunami Selatan Jawa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Deskripsi detail peringatan..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {severityOptions.map((sev) => (
              <option key={sev} value={sev}>
                {getWarningLevelLabel(sev as any)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sumber
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="BMKG, BNPB, dll."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waktu Diterbitkan
          </label>
          <input
            type="datetime-local"
            name="issuedAt"
            value={formData.issuedAt}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waktu Kadaluarsa
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wilayah Terdampak
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAffectedArea();
              }
            }}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nama wilayah..."
          />
          <button
            type="button"
            onClick={addAffectedArea}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Tambah
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.affectedAreas.map((area, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              📍 {area}
              <button
                type="button"
                onClick={() => removeAffectedArea(index)}
                className="ml-1 text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-200 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Menyimpan...' : 'Buat Peringatan'}
        </button>
      </div>
    </form>
  );
}

export default WarningCreation;
