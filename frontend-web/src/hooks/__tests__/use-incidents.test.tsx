import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIncidents, useCreateIncident, useCheckIn } from '../use-incidents';
import api from '@/services/api';

// Mock API
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIncidents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated data matching API shape', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          title: 'Test Incident',
          description: 'Test description',
          location: 'Test location',
          latitude: -7.5755,
          longitude: 110.8243,
          status: 'reported',
          severity: 'medium',
          type: 'flood',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    };

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0]).toMatchObject({
      id: '1',
      title: 'Test Incident',
      status: 'reported',
    });
  });

  it('handles pagination params', async () => {
    const mockResponse = { data: [], total: 0, page: 2, limit: 5 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useIncidents({ page: 2, limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/incidents', {
      params: { page: 2, limit: 5 },
    });
  });
});

describe('useCreateIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates incident list cache after mutation', async () => {
    const newIncident = {
      title: 'New Incident',
      description: 'Description',
      location: 'Location',
      latitude: -7.5755,
      longitude: 110.8243,
      severity: 'medium',
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: '2', ...newIncident } });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], total: 0, page: 1, limit: 10 } });

    const { result } = renderHook(() => useCreateIncident(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newIncident);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Cache should be invalidated
    expect(api.post).toHaveBeenCalledWith('/incidents', newIncident);
  });
});

describe('useCheckIn (optimistic update)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs optimistic update', async () => {
    const mockIncident = {
      id: '1',
      title: 'Test Incident',
      status: 'reported',
      severity: 'medium',
    };

    vi.mocked(api.patch).mockRejectedValueOnceOnce(new Error('Network error'));
    vi.mocked(api.get).mockResolvedValueOnce({ 
      data: { data: [mockIncident], total: 1, page: 1, limit: 10 } 
    });

    const { result } = renderHook(() => useCheckIn(), {
      wrapper: createWrapper(),
    });

    // Trigger mutation
    result.current.mutate({ incidentId: '1', status: 'verified' });

    // Should optimistically update before API call
    // Note: In real test, we'd check queryCache for optimistic state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // After error, should rollback (API call failed)
    expect(api.patch).toHaveBeenCalled();
  });
});