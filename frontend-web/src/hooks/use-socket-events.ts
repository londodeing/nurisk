import { useEffect } from 'react';
import { socketManager } from '@/lib/socket';
import { useIncidentStore } from '@/stores/use-incident-store';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/use-auth-store';
import type { Incident } from '@nurisk/shared-types/incident';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function useSocketEvents() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { addIncident, updateIncident, incidents: _incidents } = useIncidentStore();

  useEffect(() => {
    // incident:created
    const handleIncidentCreated = (incident: Incident) => {
      addIncident(incident);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      
      toast({
        title: 'Incident Baru',
        description: `${incident.type} - ${incident.location.address ?? incident.location.lat}`,
        variant: incident.severity === 'CRITICAL' ? 'destructive' : 'default',
      });
    };

    // incident:updated
    const handleIncidentUpdated = (incident: Incident) => {
      updateIncident(incident);
      queryClient.invalidateQueries({ queryKey: ['incidents', incident.id] });
    };

    // incident:emergency (role-scoped)
    const handleEmergency = (data: { title: string; message: string; roles: string[] }) => {
      if (user?.role && data.roles.includes(user.role)) {
        // Show emergency modal
        window.dispatchEvent(new CustomEvent('emergency:alert', { detail: data }));
        
        // Play alert sound if enabled
        const soundEnabled = localStorage.getItem('alert_sound') !== 'false';
        if (soundEnabled) {
          new Audio('/sounds/alert.mp3').play().catch(() => {});
        }
      }
    };

    // chat:message
    const handleChatMessage = (message: ChatMessage) => {
      // Update messages in store
      window.dispatchEvent(new CustomEvent('chat:message', { detail: message }));
      
      // Increment unread if not focused
      if (!document.hasFocus()) {
        queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
      }
    };

    // Register handlers
    socketManager.on('incident:created', handleIncidentCreated);
    socketManager.on('incident:updated', handleIncidentUpdated);
    socketManager.on('incident:emergency', handleEmergency);
    socketManager.on('chat:message', handleChatMessage);

    return () => {
      socketManager.off('incident:created', handleIncidentCreated);
      socketManager.off('incident:updated', handleIncidentUpdated);
      socketManager.off('incident:emergency', handleEmergency);
      socketManager.off('chat:message', handleChatMessage);
    };
  }, [user, toast, queryClient, addIncident, updateIncident]);
}

export default useSocketEvents;