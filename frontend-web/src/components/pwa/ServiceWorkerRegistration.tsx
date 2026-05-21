import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationProps {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export default function ServiceWorkerRegistration({ onUpdate }: ServiceWorkerRegistrationProps) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
        setRegistration(reg);
        onUpdate?.(reg);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      }).catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
    }
  }, [onUpdate]);

  const handleUpdate = () => {
    registration?.update().then(() => {
      window.location.reload();
    });
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-nu-green text-white p-4 rounded-lg shadow-lg z-50">
      <p className="mb-2">Update tersedia!</p>
      <button
        onClick={handleUpdate}
        className="bg-white text-nu-green px-4 py-2 rounded font-medium"
      >
        Muat Ulang
      </button>
    </div>
  );
}