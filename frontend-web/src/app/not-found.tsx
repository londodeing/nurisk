'use client';

import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
        <FileQuestion className="h-16 w-16 text-gray-400" />
      </div>

      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
        404
      </h1>

      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Halaman Tidak Ditemukan
      </h2>

      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        Silakan kembali ke halaman utama atau gunakan pencarian.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => navigate(-1)} variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Link to="/">
          <Button variant="default">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}