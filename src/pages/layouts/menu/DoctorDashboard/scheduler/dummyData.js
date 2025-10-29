const patientNames = [
  'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown',
  'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Maria Rodriguez',
  'James Lee', 'Patricia White', 'Michael Harris', 'Linda Clark', 'Richard Lewis',
  'Barbara Walker', 'Thomas Hall', 'Nancy Allen', 'Charles Young', 'Susan King',
  'Joseph Wright', 'Jessica Lopez', 'Christopher Hill', 'Karen Scott', 'Daniel Green',
  'Betty Adams', 'Matthew Baker', 'Dorothy Nelson', 'Anthony Carter', 'Sandra Mitchell'
];

const consultationTypes = ['Physical', 'Virtual'];
const symptomsTypes = [
  'Routine Checkup', 'Follow-up consultation', 'Annual Physical',
  'Medical Consultation', 'Health Screening', 'Preventive Care',
  'Lab Results Review', 'Medication Review', 'Wellness Check',
  'Vaccination', 'Physical Therapy', 'Dietary Consultation'
];

const colors = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const generateMeetLink = (id) => {
  const code = `${id}-${Math.random().toString(36).substring(2, 9)}`;
  return `https://meet.google.com/${code}`;
};

export const generateDummyAppointments = () => {
  const appointments = [];
  let idCounter = 1;

  // September 2025 (month index 8)
  for (let day = 1; day <= 30; day++) {
    const date = new Date(2025, 8, day);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) continue;

    const numAppointments = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < numAppointments; i++) {
      const hour = 8 + Math.floor(Math.random() * 9);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      const appointmentDate = new Date(2025, 8, day, hour, minute);
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)];
      const consultationType = consultationTypes[Math.floor(Math.random() * consultationTypes.length)];
      
      appointments.push({
        id: `sept-${idCounter}`,
        name: patientName,
        phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        email: `${patientName.toLowerCase().replace(' ', '.')}@example.com`,
        date: appointmentDate,
        consultationType,
        symptoms: symptomsTypes[Math.floor(Math.random() * symptomsTypes.length)],
        status: 'confirmed',
        color: colors[Math.floor(Math.random() * colors.length)],
        meetLink: consultationType === 'Virtual' ? generateMeetLink(`sept-${idCounter}`) : undefined
      });
      
      idCounter++;
    }
  }

  // October 2025 (month index 9)
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2025, 9, day);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) continue;

    const numAppointments = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < numAppointments; i++) {
      const hour = 8 + Math.floor(Math.random() * 9);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      const appointmentDate = new Date(2025, 9, day, hour, minute);
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)];
      const consultationType = consultationTypes[Math.floor(Math.random() * consultationTypes.length)];
      
      appointments.push({
        id: `oct-${idCounter}`,
        name: patientName,
        phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        email: `${patientName.toLowerCase().replace(' ', '.')}@example.com`,
        date: appointmentDate,
        consultationType,
        symptoms: symptomsTypes[Math.floor(Math.random() * symptomsTypes.length)],
        status: 'confirmed',
        color: colors[Math.floor(Math.random() * colors.length)],
        meetLink: consultationType === 'Virtual' ? generateMeetLink(`oct-${idCounter}`) : undefined
      });
      
      idCounter++;
    }
  }

  return appointments;
};