
export interface RoadmapStep {
  title: string;
  optional?: boolean;
}

export interface RoadmapSection {
  id: string;
  title: string;
  steps: RoadmapStep[];
  position: { x: number; y: number };
  color: string;
}

export const roadmapSections: RoadmapSection[] = [
  {
    id: "choose-school",
    title: "Choose your school",
    steps: [
      { title: "Research https://www.mastersportal.com to see your school" },
      { title: "Check GPA and English Requirement" },
      { title: "Get the English certificate", optional: true },
      { title: "Prepare motivation letter" },
      { title: "Prepare reference letter" },
      { title: "Prepare GPA record and detail of course structure", optional: true },
      { title: "Prepare working confirmation", optional: true },
      { title: "Prepare scholarship document", optional: true },
      { title: "Chat with student in this school to get more information", optional: true }
    ],
    position: { x: 600, y: 0 },
    color: "#d946ef",
  },
  {
    id: "applying",
    title: "Applying process",
    steps: [
      { title: "Have your school lists and know the application date" },
      { title: "Submit your application in school platform or portal" },
      { title: "Pay entry fee", optional: true },
      { title: "Interview with your school", optional: true },
      { title: "Receive the result mail" },
      { title: "Pay school fees" }
    ],
    position: { x: 600, y: 300 },
    color: "#f97316",
  },
  {
    id: "immigration",
    title: "Immigration Process",
    steps: [
      { title: "Visa Registration" },
      { title: "Proof of Accommodation" },
      { title: "Letter of Admission" },
      { title: "Proof of Financial Means" },
      { title: "Health Insurance" },
      { title: "Residence Permit" }
    ],
    position: { x: 50, y: 650 },
    color: "#3b82f6",
  },
  {
    id: "transportation",
    title: "Transportation",
    steps: [
      { title: "Apply student option for flight ticket", optional: true },
      { title: "Buy flight ticket", optional: true },
      { title: "Buy bus, train or private vehicle to travel", optional: true }
    ],
    position: { x: 450, y: 650 },
    color: "#10b981",
  },
  {
    id: "housing",
    title: "Housing",
    steps: [
      { title: "Register to dorm", optional: true },
      { title: "Rented accommodation" }
    ],
    position: { x: 750, y: 650 },
    color: "#8b5cf6",
  },
  {
    id: "necessary-items",
    title: "Necessary Items",
    steps: [
      { title: "Health Insurance" },
      { title: "Portrait photos (passport size)" },
      { title: "Important documents like GPA records, passport, personal documents" },
      { title: "Copy versions of important documents" },
      { title: "Medications" },
      { title: "Clothing" },
      { title: "Sim card" }
    ],
    position: { x: 1150, y: 650 },
    color: "#ef4444",
  },
  {
    id: "student-card",
    title: "Apply for student card",
    steps: [
      { title: "Know how to get the student card in your school" },
      { title: "Follow the instruction to get the student card" },
      { title: "Use student card to get promotion in public transport, grocery, renting, etc." }
    ],
    position: { x: 600, y: 1000 },
    color: "#f59e0b",
  },
  {
    id: "bank-account",
    title: "Open a local bank account",
    steps: [
      { title: "Find the best bank for student option" },
      { title: "Register the tax card for opening bank account", optional: true },
      { title: "Use local bank account to pay school fees" }
    ],
    position: { x: 600, y: 1350 },
    color: "#3b82f6",
  },
  {
    id: "orientation",
    title: "Join Orientation Event",
    steps: [
      { title: "Open network with friends" },
      { title: "Know the customer service office of school" },
      { title: "Know how to register subjects and GPA process" },
      { title: "Know school safety and security rules" },
      { title: "Know the hotline for emergencies" }
    ],
    position: { x: 600, y: 1700 },
    color: "#84cc16",
  },
];