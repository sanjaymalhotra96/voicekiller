import { apiRequest } from '@/lib/api';

// Campaigns. Screens use features/text-to-speech/hooks.ts.
//
// GET /api/dashboard/campaign
//   200 -> { success: true, campaigns: string[] }   e.g. ["default", "Podcast Ads"]

export const campaignsService = {
  async list(): Promise<string[]> {
    const { campaigns } = await apiRequest<{ campaigns?: string[] }>(
      '/api/dashboard/campaign',
    );
    return campaigns ?? [];
  },
};
