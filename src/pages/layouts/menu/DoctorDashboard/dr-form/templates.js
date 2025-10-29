// File: DrForm/templates.js
// Full self-contained templates for printing

export const getVitalsTemplate = (d = {}) => `
  <h4 style="color:#16a085;">Vitals Report</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:10px;">
    <thead>
      <tr>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Heart Rate</th>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Temperature</th>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Blood Sugar</th>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Blood Pressure</th>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Height</th>
        <th style="border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;">Weight</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.heartRate || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.temperature || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.bloodSugar || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.bloodPressure || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.height || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.weight || "-"}</td>
      </tr>
    </tbody>
  </table>
`;

export const getClinicalNotesTemplate = (d = {}) => `
  <h4 style="color:#2980b9;">Clinical Notes</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:10px;">
    <thead>
      <tr>
        <th style="border:1px solid #ddd;padding:8px;background:#f8f9fa;">Chief Complaint</th>
        <th style="border:1px solid #ddd;padding:8px;background:#f8f9fa;">History</th>
        <th style="border:1px solid #ddd;padding:8px;background:#f8f9fa;">Advice</th>
        <th style="border:1px solid #ddd;padding:8px;background:#f8f9fa;">Plan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.chiefComplaint || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.history || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.advice || "-"}</td>
        <td style="border:1px solid #ddd;padding:10px;background:#fff;">${d.plan || "-"}</td>
      </tr>
    </tbody>
  </table>
`;

export const getLabResultsTemplate = (d = {}) => `
  <h4 style="color:#8e44ad;">Lab Results</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:10px;">
    <thead><tr><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Test Name</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Code</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Instructions</th></tr></thead>
    <tbody>
      ${(d.selectedTests || []).map(t=>`<tr><td style="padding:10px;border:1px solid #ddd;background:#fff;">${t.name||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${t.code||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${t.instructions||"-"}</td></tr>`).join("")}
    </tbody>
  </table>
`;

export const getDentalTemplate = (d = {}) => `
  <h4 style="color:#e67e22;">Dental Problem Action Plan</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:10px;">
    <thead><tr><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Teeth Numbers</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Problems</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Action Plans</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Positions</th></tr></thead>
    <tbody>
      ${(d.plans||[]).map(p=>`<tr><td style="padding:10px;border:1px solid #ddd;background:#fff;">${(p.teeth||[]).join(", ")||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${(p.problems||[]).join(", ")||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${(p.actions||[]).join(", ")||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${(p.positions||[]).join(", ")||"-"}</td></tr>`).join("")}
    </tbody>
  </table>
`;

export const getEyeTestTemplate = (d = {}) => `
  <h4 style="color:#1976d2;">Eye Test Report</h4>
  <table style="width:100%;border-collapse:collapse;margin-top:10px;">
    <thead><tr><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Test Date</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Vision Type</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Eye</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">SPH</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">CYL</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">V/A</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">AXIS</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Prev.VA</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Remarks</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Product</th></tr></thead>
    <tbody>
      ${(d.rows||[]).map(r=>`<tr><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.testDate||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.visionType||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">Right Eye</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.od_sph||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.od_cyl||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.od_va||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.od_axis||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.od_prev_va||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.remarks||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.product||"-"}</td></tr><tr><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.testDate||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.visionType||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">Left Eye</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.os_sph||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.os_cyl||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.os_va||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.os_axis||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.os_prev_va||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.remarks||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${r.product||"-"}</td></tr>`).join("")}
    </tbody>
  </table>
`;

export const getPrescriptionTemplate = (prescriptions = []) => {
  const rows = prescriptions.map((m) => ({ ...m }));
  return `
    <h4 style="color:#2980b9;">Prescription</h4>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead><tr><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Medicine</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Dosage</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Frequency</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Intake</th><th style="padding:8px;background:#f8f9fa;border:1px solid #ddd;">Duration</th></tr></thead>
      <tbody>
        ${rows.map(m=>`<tr><td style="padding:10px;border:1px solid #ddd;background:#fff;">${m.drugName||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${m.dosage||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${m.frequency||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${m.intake||"-"}</td><td style="padding:10px;border:1px solid #ddd;background:#fff;">${m.duration||"-"} day(s)</td></tr>`).join("")}
      </tbody>
    </table>
  `;
};

/**
 * Returns a full HTML document (complete with head/styles) to be written to the print popup.
 * doctor: { name, qualifications, specialization }
 * patient: patient object
 * signature: dataURL or image URL
 * logoUrl: absolute URL to logo (use window.location.origin + '/logo.png' if necessary)
 * formContent: inner HTML for forms
 */
export const getStyledPrescriptionHTML = (doctor = {}, patient = {}, signature = null, logoUrl = '', formContent = '') => {
  // Ensure safe defaults to avoid undefined
  const safeLogo = logoUrl || '';
  const patientName = patient?.firstName || patient?.name || 'N/A';
  const patientAge = patient?.age || 'N/A';
  const patientGender = patient?.gender || 'N/A';
  const patientContact = patient?.phone || 'N/A';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Print - ${doctor.name || 'Doctor'}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
      html,body { margin:0; padding:0; background:#fff; -webkit-print-color-adjust:exact; color:#222; }
      body { font-family: 'Poppins', sans-serif; padding: 20px; box-sizing: border-box; }
      .container { width:800px; margin:0 auto; box-sizing:border-box; }
      .card { padding: 28px; border: 2px solid #0e1630; background: #fff; border-radius: 6px; box-sizing:border-box; }
      .header { display:flex; justify-content:space-between; align-items:center; gap:20px; }
      .doc-info h1 { margin:0; font-size:24px; color:#0e1630; }
      .doc-info p { margin:3px 0; font-size:13px; color:#0e1630; }
      .logo { width:80px; height:80px; object-fit:cover; border-radius:8px; }
      .patient-box { margin-top:18px; padding:12px 16px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-radius:6px; display:flex; justify-content:space-between; gap:12px; font-size:14px; color:#0e1630; }
      table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
      th, td { border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; }
      th { background:#f8f9fa; font-weight:600; }
      .footer { margin-top:28px; display:flex; justify-content:space-between; align-items:center; gap:20px; padding:14px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-top:3px solid #0e1630; }
      .footer .left { display:flex; align-items:center; gap:16px; }
      .footer .left .logo-small { width:80px; height:80px; border-radius:8px; object-fit:cover; }
      .signature { text-align:right; }
      .signature img { height:48px; display:block; margin:0 0 6px auto; }
      @media print {
        body { padding:0; }
        .container { width:100%; }
        .card { border:none; padding:10px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="doc-info">
            <h1>${doctor.name || ''}</h1>
            <p>${doctor.qualifications || ''}</p>
            <p>${doctor.specialization || ''}</p>
          </div>
          <div>
            ${safeLogo ? `<img src="${safeLogo}" class="logo" alt="logo" />` : ''}
          </div>
        </div>

        <div class="patient-box">
          <div><strong>Name:</strong> ${patientName}</div>
          <div><strong>Age:</strong> ${patientAge}</div>
          <div><strong>Gender:</strong> ${patientGender}</div>
          <div><strong>Contact:</strong> ${patientContact}</div>
        </div>

        <div class="content" style="margin-top:18px;">
          ${formContent || '<p>No content available</p>'}
        </div>

        <div class="footer">
          <div class="left">
            ${safeLogo ? `<img src="${safeLogo}" class="logo-small" alt="logo" />` : ''}
            <div>
              <div>Dharwad, Karnataka, 580001</div>
              <div>+12-345 678 9012</div>
            </div>
          </div>
          <div class="signature">
            ${signature ? `<img src="${signature}" alt="signature" />` : '<div style="height:48px;"></div>'}
            <div style="margin-top:6px;border-top:2px solid #0e1630;padding-top:6px;width:160px;margin-left:auto;">Doctor's Signature</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
};
