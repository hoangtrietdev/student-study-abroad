
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

export const roadmapSections: RoadmapSection[] = [
  {
    id: "choose-school",
    title: "University Research & Selection",
    description: "The foundation of your study abroad journey. Proper research ensures you select institutions that align with your academic goals, career aspirations, and financial capacity. This phase determines your eligibility and competitive positioning.",
    steps: [
      { 
        title: "Research universities and programs using comprehensive databases",
        referenceLink: "https://www.mastersportal.com",
        description: "Utilize professional academic databases to identify programs matching your field of study"
      },
      { 
        title: "Evaluate GPA requirements and academic prerequisites",
        referenceLink: "https://www.ets.org/gre",
        description: "Ensure your academic credentials meet minimum requirements for target institutions"
      },
      { 
        title: "Obtain required English proficiency certification",
        optional: true,
        referenceLink: "https://www.ielts.org",
        description: "Complete IELTS/TOEFL testing if required by target institutions"
      },
      { 
        title: "Draft compelling statement of purpose",
        referenceLink: "https://www.purdue.edu/ogs/prospective/statementofpurpose.php",
        description: "Articulate your academic objectives and research interests professionally"
      },
      { 
        title: "Secure academic and professional reference letters",
        referenceLink: "https://grad.berkeley.edu/admissions/apply/letters-of-recommendation/",
        description: "Obtain recommendations from faculty and supervisors who can attest to your capabilities"
      },
      { 
        title: "Compile comprehensive academic transcripts",
        optional: true,
        referenceLink: "https://www.wes.org",
        description: "Prepare detailed course descriptions and credential evaluations if required"
      },
      { 
        title: "Document professional work experience",
        optional: true,
        description: "Provide employment verification and professional accomplishments"
      },
      { 
        title: "Research and apply for scholarships",
        optional: true,
        referenceLink: "https://www.scholarships.com",
        description: "Explore funding opportunities to reduce financial burden"
      },
      { 
        title: "Network with current students and alumni",
        optional: true,
        description: "Gain insider perspectives on academic programs and campus life"
      }
    ],
    position: { x: 600, y: 0 },
    color: "#d946ef",
  },
  {
    id: "applying",
    title: "Application Submission Process",
    description: "The critical phase where you formally present your candidacy. Attention to detail, deadline adherence, and complete documentation are essential for successful admission outcomes.",
    steps: [
      { 
        title: "Create comprehensive application timeline with deadlines",
        description: "Organize applications chronologically to avoid missing critical dates"
      },
      { 
        title: "Submit applications through official university portals",
        description: "Complete online applications ensuring all required fields are properly filled"
      },
      { 
        title: "Process application fees and documentation",
        optional: true,
        description: "Submit required fees and upload supporting documents in specified formats"
      },
      { 
        title: "Prepare for and attend admission interviews",
        optional: true,
        description: "Demonstrate communication skills and academic commitment during interviews"
      },
      { 
        title: "Monitor application status and respond to admission decisions",
        description: "Track progress and respond promptly to admission committee communications"
      },
      { 
        title: "Submit enrollment deposit and accept admission offer",
        description: "Secure your seat by submitting required deposits within specified timeframes"
      }
    ],
    position: { x: 600, y: 300 },
    color: "#f97316",
  },
  {
    id: "immigration",
    title: "Legal Documentation & Immigration",
    description: "Essential legal processes for international study authorization. Proper documentation ensures legal entry and residence status, preventing complications that could jeopardize your academic plans.",
    steps: [
      { 
        title: "Apply for appropriate student visa category",
        description: "Submit F-1 or equivalent student visa application with required documentation"
      },
      { 
        title: "Provide certified proof of accommodation arrangements",
        description: "Document housing arrangements as required by immigration authorities"
      },
      { 
        title: "Submit official letter of admission and I-20 form",
        description: "Provide university-issued documents confirming enrollment and program details"
      },
      { 
        title: "Demonstrate sufficient financial resources",
        description: "Provide bank statements and financial guarantees meeting visa requirements"
      },
      { 
        title: "Obtain comprehensive health insurance coverage",
        description: "Secure health insurance meeting university and visa requirements"
      },
      { 
        title: "Register for residence permit upon arrival",
        description: "Complete local registration requirements within specified timeframe after arrival"
      }
    ],
    position: { x: 0, y: 650 },
    color: "#3b82f6",
  },
  {
    id: "transportation",
    title: "Travel Planning & Logistics",
    description: "Strategic planning for international travel and local mobility. Proper preparation ensures cost-effective transportation and smooth transition to your new academic environment.",
    steps: [
      { 
        title: "Research student discounts for international flights",
        referenceLink: "https://www.studentuniverse.com",
        description: "Utilize student-specific booking platforms for discounted airfare"
      },
      { 
        title: "Book international flights with appropriate timing",
        optional: true,
        referenceLink: "https://www.kayak.com",
        description: "Schedule arrival allowing time for orientation and settlement"
      },
      { 
        title: "Plan local transportation from airport to accommodation",
        optional: true,
        referenceLink: "https://www.rome2rio.com",
        description: "Research and book ground transportation for arrival day"
      }
    ],
    position: { x: 400, y: 650 },
    color: "#10b981",
  },
  {
    id: "housing",
    title: "Accommodation Arrangements",
    description: "Securing appropriate living arrangements is crucial for academic success and personal well-being. Housing decisions impact your budget, social integration, and daily academic routine.",
    steps: [
      { 
        title: "Apply for university dormitory accommodation",
        optional: true,
        description: "Submit dormitory applications early as spaces are typically limited"
      },
      { 
        title: "Secure verified off-campus rental accommodation",
        description: "Research and secure housing through reputable platforms with proper lease agreements"
      }
    ],
    position: { x: 800, y: 650 },
    color: "#8b5cf6",
  },
  {
    id: "necessary-items",
    title: "Essential Documentation & Preparations",
    description: "Comprehensive preparation of essential items and documentation prevents complications and ensures smooth integration into your new academic and social environment.",
    steps: [
      { 
        title: "Verify health insurance coverage and documentation",
        description: "Ensure health insurance meets university requirements and provides adequate coverage"
      },
      { 
        title: "Prepare passport-sized photographs meeting official specifications",
        description: "Obtain professionally taken photos meeting visa and university documentation standards"
      },
      { 
        title: "Organize and secure original academic and legal documents",
        description: "Compile transcripts, diplomas, passport, visa, and I-20 in organized portfolio"
      },
      { 
        title: "Create certified copies of all important documents",
        description: "Prepare notarized copies as backup and for various registration processes"
      },
      { 
        title: "Prepare prescription medications and health records",
        description: "Ensure adequate medication supply and translated medical records if necessary"
      },
      { 
        title: "Pack appropriate clothing for climate and cultural context",
        description: "Research local climate and cultural norms to pack appropriately"
      },
      { 
        title: "Arrange international phone service and connectivity",
        description: "Secure reliable communication methods for emergency and daily use"
      }
    ],
    position: { x: 1200, y: 650 },
    color: "#ef4444",
  },
  {
    id: "student-card",
    title: "Student Identification & Services Registration",
    description: "Student ID cards provide access to university facilities, services, and significant discounts. This registration process integrates you into the university system and local student community.",
    steps: [
      { 
        title: "Research university student ID card requirements and procedures",
        description: "Understand documentation requirements and processing timelines for student ID"
      },
      { 
        title: "Complete student ID registration process with required documentation",
        description: "Submit required forms, photos, and documentation to obtain official student ID"
      },
      { 
        title: "Activate student discounts and benefits across services",
        description: "Utilize student ID for transportation, dining, entertainment, and retail discounts"
      }
    ],
    position: { x: 600, y: 1000 },
    color: "#f59e0b",
  },
  {
    id: "bank-account",
    title: "Financial Services Setup",
    description: "Establishing local banking relationships is essential for managing tuition payments, living expenses, and building financial credibility. Local accounts often provide better exchange rates and reduced fees.",
    steps: [
      { 
        title: "Research banks offering specialized student account programs",
        description: "Compare student banking packages, fees, and services offered by local institutions"
      },
      { 
        title: "Obtain required tax identification documentation",
        optional: true,
        description: "Apply for SSN or ITIN if required for banking and employment purposes"
      },
      { 
        title: "Establish local bank account and arrange tuition payment methods",
        description: "Open checking account and set up automatic tuition payment systems"
      }
    ],
    position: { x: 600, y: 1350 },
    color: "#3b82f6",
  },
  {
    id: "orientation",
    title: "Academic & Social Integration",
    description: "Orientation programs provide essential information about academic expectations, campus resources, and social opportunities. Active participation accelerates your integration and academic success.",
    steps: [
      { 
        title: "Participate in international student orientation programs",
        description: "Attend mandatory orientation sessions covering academic policies and campus life"
      },
      { 
        title: "Locate and register with essential university service offices",
        description: "Identify locations of registrar, financial aid, career services, and counseling centers"
      },
      { 
        title: "Understand course registration procedures and academic requirements",
        description: "Learn course selection process, prerequisites, and graduation requirements for your program"
      },
      { 
        title: "Review university safety protocols and campus security procedures",
        description: "Understand emergency procedures, campus safety resources, and reporting mechanisms"
      },
      { 
        title: "Obtain emergency contact information and support services directory",
        description: "Compile essential contact numbers for medical, security, and administrative emergencies"
      }
    ],
    position: { x: 600, y: 1700 },
    color: "#84cc16",
  },
];
