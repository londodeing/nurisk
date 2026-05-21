import { useEffect, useCallback } from 'react';
import { socketManager } from '@/lib/socket';

export function useIncidentRoom(incidentId: string | undefined) {
  const joinRoom = useCallback(() => {
    if (incidentId) {
      socketManager.joinRoom(`incident:${incidentId}`);
    }
  }, [incidentId]);

  const leaveRoom = useCallback(() => {
    if (incidentId) {
      socketManager.leaveRoom(`incident:${incidentId}`);
    }
  }, [incidentId]);

  useEffect(() => {
    if (!incidentId) return;
    
    joinRoom();
    
    return () => {
      leaveRoom();
    };
  }, [incidentId, joinRoom, leaveRoom]);

  return { joinRoom, leaveRoom };
}

export function useRegionRoom(regionId: string | undefined) {
  const joinRoom = useCallback(() => {
    if (regionId) {
      socketManager.joinRoom(`region:${regionId}`);
    }
  }, [regionId]);

  const leaveRoom = useCallback(() => {
    if (regionId) {
      socketManager.leaveRoom(`region:${regionId}`);
    }
  }, [regionId]);

  useEffect(() => {
    if (!regionId) return;
    
    joinRoom();
    
    return () => {
      leaveRoom();
    };
  }, [regionId, joinRoom, leaveRoom]);

  return { joinRoom, leaveRoom };
}

export function useChatRoom(conversationId: string | undefined) {
  const joinRoom = useCallback(() => {
    if (conversationId) {
      socketManager.joinRoom(`chat:${conversationId}`);
    }
  }, [conversationId]);

  const leaveRoom = useCallback(() => {
    if (conversationId) {
      socketManager.leaveRoom(`chat:${conversationId}`);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    
    joinRoom();
    
    return () => {
      leaveRoom();
    };
  }, [conversationId, joinRoom, leaveRoom]);

  return { joinRoom, leaveRoom };
}

export default useIncidentRoom;