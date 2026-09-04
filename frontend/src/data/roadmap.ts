export interface RoadmapStep {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: string;
}

export const roadmapSteps: RoadmapStep[] = [
  {
    id: 'plan',
    step: '01',
    title: 'Plan',
    description: 'Understand your requirements, budget and site. We evaluate every detail before the first line is drawn.',
    icon: 'clipboard',
  },
  {
    id: 'design',
    step: '02',
    title: 'Design',
    description: 'Develop the home concept, floor plans and material selections tailored to your vision.',
    icon: 'blueprint',
  },
  {
    id: 'estimate',
    step: '03',
    title: 'Estimate',
    description: 'Provide transparent costing and a clear scope of work with no hidden charges.',
    icon: 'receipt',
  },
  {
    id: 'build',
    step: '04',
    title: 'Build',
    description: 'Execute construction with quality control and project supervision at every stage.',
    icon: 'building',
  },
  {
    id: 'deliver',
    step: '05',
    title: 'Deliver',
    description: 'Complete your home with final quality checks, handover and ongoing support.',
    icon: 'check-circle',
  },
];
