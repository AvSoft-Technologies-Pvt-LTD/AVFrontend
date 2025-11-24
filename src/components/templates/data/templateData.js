// Predefined Medical Templates Data
export const predefinedTemplates = [
  {
    id: 1,
    name: "Classic Medical",
    description: "Traditional medical prescription format designed for clear readability and structured diagnosis sections. Perfect for general practitioners and traditional clinics.",
    templateKey: "TEMPLATE_001",
    bgColor: "#F8FAFC",
    category: "medical",
    iconName: "Stethoscope",
    previewText: "Traditional medical prescription format",
    layoutName: "classic",
    sortOrder: 1,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: true,
    tags: ["prescription", "traditional", "general"],
    sections: {
      header: {
        title: "MEDICAL PRESCRIPTION",
        subtitle: "Professional Healthcare Services",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "address", "emergencyContact"],
        layout: "grid"
      },
      medicalSections: {
        chiefComplaint: {
          enabled: true,
          title: "Chief Complaint",
          required: true
        },
        historyOfPresentIllness: {
          enabled: true,
          title: "History of Present Illness",
          required: false
        },
        physicalExamination: {
          enabled: true,
          title: "Physical Examination",
          required: true
        },
        diagnosis: {
          enabled: true,
          title: "Provisional Diagnosis",
          required: true
        },
        treatmentPlan: {
          enabled: true,
          title: "Treatment Plan",
          required: true
        },
        medications: {
          enabled: true,
          title: "Prescribed Medications",
          required: false
        },
        notes: {
          enabled: true,
          title: "Additional Notes",
          required: false
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Professional Layout", "Structured Sections", "Clear Typography", "Print Optimized"]
  },
  {
    id: 2,
    name: "Modern Healthcare",
    description: "Clean, modern design with emphasis on readability and professional layout for daily consultations. Features minimalist design with optimal information hierarchy.",
    templateKey: "TEMPLATE_002",
    bgColor: "#FFFFFF",
    category: "medical",
    iconName: "Heart",
    previewText: "Clean, modern design with emphasis on readability",
    layoutName: "modern",
    sortOrder: 2,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: true,
    tags: ["modern", "minimalist", "professional"],
    sections: {
      header: {
        title: "HEALTHCARE CLINIC",
        subtitle: "Modern Medical Solutions",
        showLogo: false,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "contact", "address", "bloodGroup"],
        layout: "vertical"
      },
      medicalSections: {
        chiefComplaint: {
          enabled: true,
          title: "Presenting Complaint",
          required: true
        },
        history: {
          enabled: true,
          title: "Clinical History",
          required: false
        },
        examination: {
          enabled: true,
          title: "Clinical Examination",
          required: true
        },
        diagnosis: {
          enabled: true,
          title: "Clinical Diagnosis",
          required: true
        },
        treatment: {
          enabled: true,
          title: "Treatment & Management",
          required: true
        },
        followUp: {
          enabled: true,
          title: "Follow-up Instructions",
          required: false
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: false,
        includeDoctorStamp: false
      }
    },
    features: ["Minimalist Design", "Optimal Readability", "Modern Typography", "Digital Friendly"]
  },
  {
    id: 3,
    name: "Pediatric Care",
    description: "Child-friendly design with soft colors and playful elements suited for pediatric consultations. Includes growth charts and vaccination records sections.",
    templateKey: "TEMPLATE_003",
    bgColor: "#FEFCE8",
    category: "pediatric",
    iconName: "Baby",
    previewText: "Child-friendly design with soft colors",
    layoutName: "pediatric",
    sortOrder: 3,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["pediatric", "child-friendly", "growth", "vaccination"],
    sections: {
      header: {
        title: "PEDIATRIC CARE CENTER",
        subtitle: "Caring for Little Ones",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "guardian", "contact", "birthWeight", "birthHeight"],
        layout: "detailed"
      },
      medicalSections: {
        chiefComplaint: {
          enabled: true,
          title: "Presenting Complaint",
          required: true
        },
        developmentHistory: {
          enabled: true,
          title: "Development History",
          required: false
        },
        growthParameters: {
          enabled: true,
          title: "Growth Parameters",
          required: true
        },
        examination: {
          enabled: true,
          title: "Pediatric Examination",
          required: true
        },
        diagnosis: {
          enabled: true,
          title: "Diagnosis",
          required: true
        },
        treatment: {
          enabled: true,
          title: "Treatment Plan",
          required: true
        },
        vaccination: {
          enabled: true,
          title: "Vaccination Record",
          required: false
        },
        followUp: {
          enabled: true,
          title: "Follow-up & Advice",
          required: false
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Child-Friendly Design", "Growth Tracking", "Vaccination Records", "Parent Guidance"]
  },
  {
    id: 4,
    name: "Specialist Clinic",
    description: "Professional template tailored for specialist consultations, suitable for cardiology, neurology, orthopedics and other specialized medical fields.",
    templateKey: "TEMPLATE_004",
    bgColor: "#F9FAFB",
    category: "specialist",
    iconName: "Brain",
    previewText: "Professional template for specialist consultations",
    layoutName: "modern",
    sortOrder: 4,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: true,
    tags: ["specialist", "detailed", "comprehensive", "referral"],
    sections: {
      header: {
        title: "SPECIALIST MEDICAL CENTER",
        subtitle: "Expert Healthcare Services",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "referralDoctor", "previousHistory"],
        layout: "detailed"
      },
      medicalSections: {
        chiefComplaint: {
          enabled: true,
          title: "Chief Complaint",
          required: true
        },
        medicalHistory: {
          enabled: true,
          title: "Detailed Medical History",
          required: true
        },
        specialistExamination: {
          enabled: true,
          title: "Specialist Examination",
          required: true
        },
        testResults: {
          enabled: true,
          title: "Investigation Results",
          required: false
        },
        diagnosis: {
          enabled: true,
          title: "Specialist Diagnosis",
          required: true
        },
        treatmentPlan: {
          enabled: true,
          title: "Comprehensive Treatment Plan",
          required: true
        },
        recommendations: {
          enabled: true,
          title: "Specialist Recommendations",
          required: false
        },
        followUp: {
          enabled: true,
          title: "Follow-up Plan",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Detailed Sections", "Investigation Tracking", "Referral Ready", "Comprehensive"]
  },
  {
    id: 5,
    name: "Luxury Clinic",
    description: "Premium template featuring elegant design with gold accents and refined typography, ideal for high-end healthcare facilities and premium medical services.",
    templateKey: "TEMPLATE_005",
    bgColor: "#FFF7ED",
    category: "luxury",
    iconName: "Crown",
    previewText: "Premium design with elegant elements",
    layoutName: "luxury",
    sortOrder: 5,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["premium", "luxury", "elegant", "executive"],
    sections: {
      header: {
        title: "PREMIUM HEALTHCARE",
        subtitle: "Excellence in Medical Care",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "preferences", "specialRequirements"],
        layout: "elegant"
      },
      medicalSections: {
        consultation: {
          enabled: true,
          title: "Executive Consultation",
          required: true
        },
        examination: {
          enabled: true,
          title: "Comprehensive Examination",
          required: true
        },
        diagnosis: {
          enabled: true,
          title: "Medical Diagnosis",
          required: true
        },
        treatment: {
          enabled: true,
          title: "Personalized Treatment Plan",
          required: true
        },
        wellness: {
          enabled: true,
          title: "Wellness Recommendations",
          required: false
        },
        followUp: {
          enabled: true,
          title: "Executive Follow-up",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Premium Design", "Elegant Typography", "Executive Layout", "Personalized Care"]
  },
  {
    id: 6,
    name: "Emergency Care",
    description: "High-contrast, clear template designed for emergency departments with quick information access and critical care documentation.",
    templateKey: "TEMPLATE_006",
    bgColor: "#FEF2F2",
    category: "emergency",
    iconName: "Activity",
    previewText: "Emergency department optimized template",
    layoutName: "modern",
    sortOrder: 6,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["emergency", "critical", "quick", "urgent"],
    sections: {
      header: {
        title: "EMERGENCY DEPARTMENT",
        subtitle: "Critical Care Services",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "emergencyContact", "bloodGroup", "allergies"],
        layout: "quick"
      },
      medicalSections: {
        triage: {
          enabled: true,
          title: "Triage Assessment",
          required: true
        },
        vitalSigns: {
          enabled: true,
          title: "Vital Signs",
          required: true
        },
        chiefComplaint: {
          enabled: true,
          title: "Emergency Complaint",
          required: true
        },
        emergencyExamination: {
          enabled: true,
          title: "Emergency Examination",
          required: true
        },
        emergencyDiagnosis: {
          enabled: true,
          title: "Emergency Diagnosis",
          required: true
        },
        emergencyTreatment: {
          enabled: true,
          title: "Emergency Treatment",
          required: true
        },
        disposition: {
          enabled: true,
          title: "Disposition & Referral",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Quick Access", "Critical Care Focus", "High Contrast", "Emergency Optimized"]
  },
  {
    id: 7,
    name: "Dental Clinic",
    description: "Specialized template for dental practices with tooth charts, dental history, and treatment planning sections.",
    templateKey: "TEMPLATE_007",
    bgColor: "#F0FDF4",
    category: "dental",
    iconName: "Tooth",
    previewText: "Specialized dental practice template",
    layoutName: "modern",
    sortOrder: 7,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["dental", "teeth", "oral", "denture"],
    sections: {
      header: {
        title: "DENTAL CARE CLINIC",
        subtitle: "Comprehensive Oral Healthcare",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "dentalHistory", "oralHygiene"],
        layout: "detailed"
      },
      medicalSections: {
        dentalComplaint: {
          enabled: true,
          title: "Dental Complaint",
          required: true
        },
        oralExamination: {
          enabled: true,
          title: "Oral Examination",
          required: true
        },
        dentalCharting: {
          enabled: true,
          title: "Dental Charting",
          required: true
        },
        diagnosis: {
          enabled: true,
          title: "Dental Diagnosis",
          required: true
        },
        treatmentPlan: {
          enabled: true,
          title: "Dental Treatment Plan",
          required: true
        },
        procedures: {
          enabled: true,
          title: "Dental Procedures",
          required: false
        },
        followUp: {
          enabled: true,
          title: "Dental Follow-up",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Dental Charting", "Oral Health Focus", "Treatment Planning", "Dental Specific"]
  },
  {
    id: 8,
    name: "Physiotherapy",
    description: "Template designed for physiotherapy and rehabilitation centers with exercise plans, progress tracking, and therapy sessions documentation.",
    templateKey: "TEMPLATE_008",
    bgColor: "#EFF6FF",
    category: "physiotherapy",
    iconName: "Activity",
    previewText: "Physiotherapy and rehabilitation template",
    layoutName: "modern",
    sortOrder: 8,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["physio", "rehab", "exercise", "therapy"],
    sections: {
      header: {
        title: "PHYSIOTHERAPY CENTER",
        subtitle: "Movement & Rehabilitation",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "condition", "mobilityLevel"],
        layout: "detailed"
      },
      medicalSections: {
        assessment: {
          enabled: true,
          title: "Initial Assessment",
          required: true
        },
        rangeOfMotion: {
          enabled: true,
          title: "Range of Motion",
          required: true
        },
        strengthTesting: {
          enabled: true,
          title: "Strength Testing",
          required: true
        },
        treatmentPlan: {
          enabled: true,
          title: "Treatment Plan",
          required: true
        },
        exerciseProgram: {
          enabled: true,
          title: "Exercise Program",
          required: true
        },
        progressNotes: {
          enabled: true,
          title: "Progress Notes",
          required: true
        },
        goals: {
          enabled: true,
          title: "Treatment Goals",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Exercise Planning", "Progress Tracking", "Rehab Focus", "Movement Assessment"]
  },
  {
    id: 9,
    name: "Wellness Center",
    description: "Holistic health template for wellness centers, spas, and alternative medicine practices with focus on overall wellbeing and preventive care.",
    templateKey: "TEMPLATE_009",
    bgColor: "#FAF5FF",
    category: "wellness",
    iconName: "Sparkles",
    previewText: "Holistic wellness and preventive care template",
    layoutName: "modern",
    sortOrder: 9,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: false,
    tags: ["wellness", "holistic", "preventive", "spa"],
    sections: {
      header: {
        title: "WELLNESS CENTER",
        subtitle: "Holistic Health & Wellbeing",
        showLogo: true,
        showDoctorInfo: true,
        showContact: true
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact", "lifestyle", "wellnessGoals"],
        layout: "wellness"
      },
      medicalSections: {
        wellnessAssessment: {
          enabled: true,
          title: "Wellness Assessment",
          required: true
        },
        lifestyleEvaluation: {
          enabled: true,
          title: "Lifestyle Evaluation",
          required: true
        },
        healthGoals: {
          enabled: true,
          title: "Health & Wellness Goals",
          required: true
        },
        wellnessPlan: {
          enabled: true,
          title: "Wellness Plan",
          required: true
        },
        recommendations: {
          enabled: true,
          title: "Wellness Recommendations",
          required: true
        },
        followUp: {
          enabled: true,
          title: "Wellness Follow-up",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: true,
        includeDoctorStamp: true
      }
    },
    features: ["Holistic Approach", "Wellness Focus", "Preventive Care", "Lifestyle Integration"]
  },
  {
    id: 10,
    name: "Minimalist Care",
    description: "Simple and clean design focusing on essential information and quick readability. Perfect for quick consultations and straightforward cases.",
    templateKey: "TEMPLATE_010",
    bgColor: "#F3F4F6",
    category: "minimalist",
    iconName: "Minimize",
    previewText: "Simple and clean design focusing on essentials",
    layoutName: "minimalist",
    sortOrder: 10,
    isActive: true,
    templateTypeId: 6,
    createdAt: "2025-11-14 15:23:06",
    updatedAt: "2025-11-14 15:23:06",
    isPopular: true,
    tags: ["minimalist", "simple", "clean", "quick"],
    sections: {
      header: {
        title: "MEDICAL CONSULTATION",
        subtitle: "Healthcare Services",
        showLogo: false,
        showDoctorInfo: true,
        showContact: false
      },
      patientInfo: {
        show: true,
        fields: ["name", "age", "gender", "contact"],
        layout: "minimal"
      },
      medicalSections: {
        complaint: {
          enabled: true,
          title: "Complaint",
          required: true
        },
        assessment: {
          enabled: true,
          title: "Assessment",
          required: true
        },
        plan: {
          enabled: true,
          title: "Plan",
          required: true
        }
      },
      footer: {
        show: true,
        includeSignature: true,
        includeDate: true,
        includePageNumber: false,
        includeDoctorStamp: false
      }
    },
    features: ["Minimal Design", "Quick Documentation", "Essential Only", "Clean Layout"]
  }
];

// Default User Data Structure
export const defaultUserData = {
  // Hospital/Clinic Information
  hospitalName: "AV MEDICAL CENTER",
  hospitalSubtitle: "Multi-Speciality Hospital",
  hospitalAddressLine1: "123 Health Street, Medical Complex",
  hospitalAddressLine2: "Dharwad - 580001, Karnataka, India",
  hospitalCity: "Dharwad",
  hospitalState: "Karnataka",
  hospitalPincode: "580001",
  hospitalCountry: "India",
  hospitalPhone: "+91-22-12345678",
  hospitalEmail: "info@avmedicalcenter.com",
  hospitalWebsite: "www.avmedicalcenter.com",
  hospitalRegistration: "MCI-2023-MH-12345",
  
  // Doctor Information
  doctorFullName: "Dr. Haris Patel",
  doctorDepartment: "Cardiology",
  doctorSpecialization: "Consultant Cardiologist",
  doctorLicense: "MMC-12345",
  doctorRegistration: "MCI-56789",
  doctorContact: "+91-9876543210",
  doctorEmail: "dr.haris.patel@avmedicalcenter.com",
  doctorQualifications: "MD, DM Cardiology, FACC",
  doctorExperience: "15+ years",
  doctorSignature: "Dr. Haris Patel",
  
  // Clinic Hours and Availability
  clinicHours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 2:00 PM",
    sunday: "Emergency Only"
  },
  
  // Emergency Contact
  emergencyContact: {
    phone: "+91-22-9876543210",
    available: "24/7"
  },
  
  // Facilities and Services
  facilities: [
    "24/7 Emergency Services",
    "ICU & Critical Care",
    "Advanced Diagnostics",
    "Pharmacy",
    "Ambulance Services",
    "Health Check-ups"
  ],
  
  // Insurance and Payment
  insuranceProviders: [
    "Star Health Insurance",
    "ICICI Lombard",
    "HDFC Ergo",
    "Bajaj Allianz",
    "New India Assurance"
  ],
  
  // Social Media and Online Presence
  socialMedia: {
    website: "www.avmedicalcenter.com",
    email: "info@avmedicalcenter.com",
    phone: "+91-22-12345678"
  }
};




// Export everything
export default {
  predefinedTemplates,
  defaultUserData,
};