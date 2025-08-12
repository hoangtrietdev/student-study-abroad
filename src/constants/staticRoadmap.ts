// Static roadmap configuration that doesn't depend on hooks
export interface RoadmapStep {
  titleKey: string;
  descriptionKey?: string;
  optional?: boolean;
  referenceLink?: string;
}

export interface RoadmapSection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  steps: RoadmapStep[];
  position: { x: number; y: number };
  color: string;
}

// Static roadmap sections with translation keys
export const staticRoadmapSections: RoadmapSection[] = [
  {
    id: "choose-school",
    titleKey: "sections.choose-school.title",
    descriptionKey: "sections.choose-school.description",
    position: { x: 600, y: 0 },
    color: "#d946ef",
    steps: [
      { titleKey: "sections.choose-school.steps.0.title", descriptionKey: "sections.choose-school.steps.0.description", optional: false, referenceLink: "https://www.mastersportal.com" },
      { titleKey: "sections.choose-school.steps.1.title", descriptionKey: "sections.choose-school.steps.1.description", optional: false, referenceLink: "https://www.ets.org/gre" },
      { titleKey: "sections.choose-school.steps.2.title", descriptionKey: "sections.choose-school.steps.2.description", optional: true, referenceLink: "https://www.ielts.org" },
      { titleKey: "sections.choose-school.steps.3.title", descriptionKey: "sections.choose-school.steps.3.description", optional: false, referenceLink: "https://www.purdue.edu/ogs/prospective/statementofpurpose.php" },
      { titleKey: "sections.choose-school.steps.4.title", descriptionKey: "sections.choose-school.steps.4.description", optional: false, referenceLink: "https://grad.berkeley.edu/admissions/apply/letters-of-recommendation/" },
      { titleKey: "sections.choose-school.steps.5.title", descriptionKey: "sections.choose-school.steps.5.description", optional: true, referenceLink: "https://www.wes.org" },
      { titleKey: "sections.choose-school.steps.6.title", descriptionKey: "sections.choose-school.steps.6.description", optional: true },
      { titleKey: "sections.choose-school.steps.7.title", descriptionKey: "sections.choose-school.steps.7.description", optional: true, referenceLink: "https://www.scholarships.com" },
      { titleKey: "sections.choose-school.steps.8.title", descriptionKey: "sections.choose-school.steps.8.description", optional: true },
    ]
  },
  {
    id: "applying",
    titleKey: "sections.applying.title",
    descriptionKey: "sections.applying.description",
    position: { x: 600, y: 300 },
    color: "#f97316",
    steps: [
      { titleKey: "sections.applying.steps.0.title", descriptionKey: "sections.applying.steps.0.description", optional: false },
      { titleKey: "sections.applying.steps.1.title", descriptionKey: "sections.applying.steps.1.description", optional: false },
      { titleKey: "sections.applying.steps.2.title", descriptionKey: "sections.applying.steps.2.description", optional: true },
      { titleKey: "sections.applying.steps.3.title", descriptionKey: "sections.applying.steps.3.description", optional: true },
      { titleKey: "sections.applying.steps.4.title", descriptionKey: "sections.applying.steps.4.description", optional: false },
      { titleKey: "sections.applying.steps.5.title", descriptionKey: "sections.applying.steps.5.description", optional: false },
    ]
  },
  {
    id: "immigration",
    titleKey: "sections.immigration.title",
    descriptionKey: "sections.immigration.description",
    position: { x: 0, y: 650 },
    color: "#3b82f6",
    steps: [
      { titleKey: "sections.immigration.steps.0.title", descriptionKey: "sections.immigration.steps.0.description", optional: false },
      { titleKey: "sections.immigration.steps.1.title", descriptionKey: "sections.immigration.steps.1.description", optional: false },
      { titleKey: "sections.immigration.steps.2.title", descriptionKey: "sections.immigration.steps.2.description", optional: false },
      { titleKey: "sections.immigration.steps.3.title", descriptionKey: "sections.immigration.steps.3.description", optional: false },
      { titleKey: "sections.immigration.steps.4.title", descriptionKey: "sections.immigration.steps.4.description", optional: false },
      { titleKey: "sections.immigration.steps.5.title", descriptionKey: "sections.immigration.steps.5.description", optional: false },
    ]
  },
  {
    id: "transportation",
    titleKey: "sections.transportation.title",
    descriptionKey: "sections.transportation.description",
    position: { x: 400, y: 650 },
    color: "#10b981",
    steps: [
      { titleKey: "sections.transportation.steps.0.title", descriptionKey: "sections.transportation.steps.0.description", optional: false, referenceLink: "https://www.studentuniverse.com" },
      { titleKey: "sections.transportation.steps.1.title", descriptionKey: "sections.transportation.steps.1.description", optional: true, referenceLink: "https://www.kayak.com" },
      { titleKey: "sections.transportation.steps.2.title", descriptionKey: "sections.transportation.steps.2.description", optional: true, referenceLink: "https://www.rome2rio.com" },
    ]
  },
  {
    id: "housing",
    titleKey: "sections.housing.title",
    descriptionKey: "sections.housing.description",
    position: { x: 800, y: 650 },
    color: "#8b5cf6",
    steps: [
      { titleKey: "sections.housing.steps.0.title", descriptionKey: "sections.housing.steps.0.description", optional: true },
      { titleKey: "sections.housing.steps.1.title", descriptionKey: "sections.housing.steps.1.description", optional: false },
    ]
  },
  {
    id: "necessary-items",
    titleKey: "sections.necessary-items.title",
    descriptionKey: "sections.necessary-items.description",
    position: { x: 1200, y: 650 },
    color: "#ef4444",
    steps: [
      { titleKey: "sections.necessary-items.steps.0.title", descriptionKey: "sections.necessary-items.steps.0.description", optional: false },
      { titleKey: "sections.necessary-items.steps.1.title", descriptionKey: "sections.necessary-items.steps.1.description", optional: false },
      { titleKey: "sections.necessary-items.steps.2.title", descriptionKey: "sections.necessary-items.steps.2.description", optional: false },
      { titleKey: "sections.necessary-items.steps.3.title", descriptionKey: "sections.necessary-items.steps.3.description", optional: false },
      { titleKey: "sections.necessary-items.steps.4.title", descriptionKey: "sections.necessary-items.steps.4.description", optional: false },
      { titleKey: "sections.necessary-items.steps.5.title", descriptionKey: "sections.necessary-items.steps.5.description", optional: false },
      { titleKey: "sections.necessary-items.steps.6.title", descriptionKey: "sections.necessary-items.steps.6.description", optional: false },
    ]
  },
  {
    id: "student-card",
    titleKey: "sections.student-card.title",
    descriptionKey: "sections.student-card.description",
    position: { x: 600, y: 1000 },
    color: "#f59e0b",
    steps: [
      { titleKey: "sections.student-card.steps.0.title", descriptionKey: "sections.student-card.steps.0.description", optional: false },
      { titleKey: "sections.student-card.steps.1.title", descriptionKey: "sections.student-card.steps.1.description", optional: false },
      { titleKey: "sections.student-card.steps.2.title", descriptionKey: "sections.student-card.steps.2.description", optional: false },
    ]
  },
  {
    id: "bank-account",
    titleKey: "sections.bank-account.title",
    descriptionKey: "sections.bank-account.description",
    position: { x: 600, y: 1350 },
    color: "#3b82f6",
    steps: [
      { titleKey: "sections.bank-account.steps.0.title", descriptionKey: "sections.bank-account.steps.0.description", optional: false },
      { titleKey: "sections.bank-account.steps.1.title", descriptionKey: "sections.bank-account.steps.1.description", optional: true },
      { titleKey: "sections.bank-account.steps.2.title", descriptionKey: "sections.bank-account.steps.2.description", optional: false },
    ]
  },
  {
    id: "orientation",
    titleKey: "sections.orientation.title",
    descriptionKey: "sections.orientation.description",
    position: { x: 600, y: 1700 },
    color: "#84cc16",
    steps: [
      { titleKey: "sections.orientation.steps.0.title", descriptionKey: "sections.orientation.steps.0.description", optional: false },
      { titleKey: "sections.orientation.steps.1.title", descriptionKey: "sections.orientation.steps.1.description", optional: false },
      { titleKey: "sections.orientation.steps.2.title", descriptionKey: "sections.orientation.steps.2.description", optional: false },
      { titleKey: "sections.orientation.steps.3.title", descriptionKey: "sections.orientation.steps.3.description", optional: false },
      { titleKey: "sections.orientation.steps.4.title", descriptionKey: "sections.orientation.steps.4.description", optional: false },
    ]
  },
];
