import { TFunction } from 'next-i18next';
import { staticRoadmapSections } from '../constants/staticRoadmap';

// Translated versions
export interface RoadmapStep {
  title: string;
  description?: string;
  optional?: boolean;
  referenceLink?: string;
}

export interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  position: { x: number; y: number };
  color: string;
}

export const translateRoadmapSections = (t: TFunction): RoadmapSection[] => {
  return staticRoadmapSections.map(section => ({
    id: section.id,
    title: t(section.titleKey),
    description: t(section.descriptionKey),
    steps: section.steps.map(step => ({
      title: t(step.titleKey),
      description: step.descriptionKey ? t(step.descriptionKey) : undefined,
      optional: step.optional,
      referenceLink: step.referenceLink,
    })),
    position: section.position,
    color: section.color,
  }));
};
