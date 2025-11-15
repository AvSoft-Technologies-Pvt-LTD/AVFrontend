import { useState, useRef, useCallback } from 'react';

export const usePreview = () => {
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);

  const generatePreview = useCallback(async (template, color, userData) => {
    setIsGenerating(true);
    
    // Simulate preview generation (in real app, this might involve canvas rendering)
    setTimeout(() => {
      const preview = {
        template,
        color,
        userData,
        timestamp: new Date().toISOString(),
        elements: generatePreviewElements(template, color, userData)
      };
      
      setPreviewData(preview);
      setIsPreviewVisible(true);
      setIsGenerating(false);
    }, 500);
  }, []);

  const generatePreviewElements = useCallback((template, color, userData) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      header: {
        title: userData?.hospitalName || template.sections?.header?.title || 'MEDICAL CENTER',
        subtitle: userData?.hospitalSubtitle || template.sections?.header?.subtitle || 'Healthcare Services',
        doctorName: userData?.doctorFullName || 'Dr. John Smith',
        department: userData?.doctorDepartment || 'General Medicine',
        color: color
      },
      patientInfo: {
        name: userData?.patientName || 'Patient Name',
        age: userData?.age || 'Age',
        gender: userData?.gender || 'Gender',
        contact: userData?.contact || 'Contact Information',
        address: userData?.address || 'Patient Address'
      },
      medicalContent: generateMedicalContent(template),
      footer: {
        signature: userData?.doctorFullName || 'Doctor Signature',
        date: currentDate,
        time: currentTime,
        license: userData?.doctorLicense || 'Medical License',
        color: color
      }
    };
  }, []);

  const generateMedicalContent = useCallback((template) => {
    const sections = [];
    const medicalSections = template.sections?.medicalSections || {};

    if (medicalSections.chiefComplaint) {
      sections.push({ 
        title: 'Chief Complaint', 
        content: 'Patient presents with reported symptoms requiring medical attention and evaluation.',
        type: 'default'
      });
    }

    if (medicalSections.historyOfPresentIllness || medicalSections.history) {
      sections.push({ 
        title: 'History of Present Illness', 
        content: 'Detailed account of symptom onset, progression, and associated factors.',
        type: 'info'
      });
    }

    if (medicalSections.physicalExamination || medicalSections.examination) {
      sections.push({ 
        title: 'Physical Examination', 
        content: 'Comprehensive physical assessment findings and clinical observations.',
        type: 'info'
      });
    }

    if (medicalSections.diagnosis) {
      sections.push({ 
        title: 'Diagnosis', 
        content: 'Provisional diagnosis based on clinical evaluation and assessment.',
        type: 'warning'
      });
    }

    if (medicalSections.treatmentPlan || medicalSections.treatment) {
      sections.push({ 
        title: 'Treatment Plan', 
        content: 'Prescribed medications, therapies, and recommended follow-up care.',
        type: 'success'
      });
    }

    if (medicalSections.notes) {
      sections.push({ 
        title: 'Additional Notes', 
        content: 'Clinical notes, recommendations, and patient education provided.',
        type: 'default'
      });
    }

    // Ensure at least one section is shown
    if (sections.length === 0) {
      sections.push({
        title: 'Medical Assessment',
        content: 'Professional medical evaluation and clinical documentation.',
        type: 'default'
      });
    }

    return sections;
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewData(null);
  }, []);

  const downloadPreview = useCallback(async () => {
    if (!previewRef.current) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `template-preview-${previewData.template.name}-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error downloading preview:', error);
    }
  }, [previewData]);

  return {
    // State
    previewData,
    isPreviewVisible,
    isGenerating,
    previewRef,
    
    // Methods
    generatePreview,
    closePreview,
    downloadPreview
  };
};