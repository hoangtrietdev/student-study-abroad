import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

export interface RoadmapStep {
  title: string;
  optional?: boolean;
  referenceLink?: string;
  description?: string;
}

export interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  position: { x: number; y: number };
  color: string;
}

// Static positions and colors remain the same
const sectionConfig = [
  { id: "choose-school", position: { x: 600, y: 0 }, color: "#d946ef" },
  { id: "applying", position: { x: 600, y: 400 }, color: "#f97316" },
  { id: "immigration", position: { x: 0, y: 850 }, color: "#3b82f6" },
  { id: "transportation", position: { x: 400, y: 850 }, color: "#10b981" },
  { id: "housing", position: { x: 800, y: 850 }, color: "#8b5cf6" },
  { id: "necessary-items", position: { x: 1200, y: 850 }, color: "#ef4444" },
  { id: "student-card", position: { x: 600, y: 1300 }, color: "#f59e0b" },
  { id: "bank-account", position: { x: 600, y: 1750 }, color: "#3b82f6" },
  { id: "orientation", position: { x: 600, y: 2200 }, color: "#84cc16" },
];

// Static reference links
const referenceLinks = {
  "choose-school": [
    "https://www.mastersportal.com",
    "https://www.ets.org/gre",
    "https://www.ielts.org",
    "https://www.purdue.edu/ogs/prospective/statementofpurpose.php",
    "https://grad.berkeley.edu/admissions/apply/letters-of-recommendation/",
    "https://www.wes.org",
    "",
    "https://www.scholarships.com",
    ""
  ],
  "applying": ["", "", "", "", "", ""],
  "immigration": ["", "", "", "", "", ""],
  "transportation": [
    "https://www.studentuniverse.com",
    "https://www.kayak.com", 
    "https://www.rome2rio.com"
  ],
  "housing": ["", ""],
  "necessary-items": ["", "", "", "", "", "", ""],
  "student-card": ["", "", ""],
  "bank-account": ["", "", ""],
  "orientation": ["", "", "", "", ""]
};

// Static optional flags
const optionalSteps = {
  "choose-school": [false, false, true, false, false, true, true, true, true],
  "applying": [false, false, true, true, false, false],
  "immigration": [false, false, false, false, false, false],
  "transportation": [false, true, true],
  "housing": [true, false],
  "necessary-items": [false, false, false, false, false, false, false],
  "student-card": [false, false, false],
  "bank-account": [false, true, false],
  "orientation": [false, false, false, false, false]
};

export const useLocalizedRoadmapSections = (): RoadmapSection[] => {
  const { t } = useTranslation('roadmap');
  
  return useMemo(() => {
    return sectionConfig.map(config => {
      const stepCount = optionalSteps[config.id as keyof typeof optionalSteps]?.length || 0;
      const steps: RoadmapStep[] = [];
      
      for (let i = 0; i < stepCount; i++) {
        const stepKey = `sections.${config.id}.steps.${i}`;
        steps.push({
          title: t(`${stepKey}.title`),
          description: t(`${stepKey}.description`),
          optional: optionalSteps[config.id as keyof typeof optionalSteps][i],
          referenceLink: referenceLinks[config.id as keyof typeof referenceLinks][i] || undefined
        });
      }
      
      return {
        id: config.id,
        title: t(`sections.${config.id}.title`),
        description: t(`sections.${config.id}.description`),
        steps,
        position: config.position,
        color: config.color,
      };
    });
  }, [t]);
};
