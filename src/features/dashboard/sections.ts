import type { ToolId } from '@/features/tools';

// Dashboard layout: which tools appear in which section. Tool icons,
// colours and text come from features/tools.
type DashboardSection = {
  id: 'create' | 'transform';
  // `grid`: two tiles per row. `list`: one full-width row each.
  layout: 'grid' | 'list';
  tools: ToolId[];
};

export const dashboardSections: DashboardSection[] = [
  { id: 'create', layout: 'grid', tools: ['voiceClone', 'voiceDesign'] },
  {
    id: 'transform',
    layout: 'list',
    tools: ['voiceChanger', 'audioClean', 'speechEditor', 'speechToText'],
  },
];
