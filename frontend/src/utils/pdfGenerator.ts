export const generateFormalTimetableHTML = (
  collegeName: string,
  departmentName: string,
  academicYear: string,
  title: string, // "CLASS & SEMESTER: III B. Tech IT & V SEM" or "STAFF NAME: Dr. Mythili"
  subtitle: string, // "CLASS ADVISOR: Mr. John" or "DESIGNATION: Assistant Professor"
  periods: any[],
  workingDays: string[],
  scheduleMatrix: any, // { [day]: { [periodId]: slot } }
  uniqueSubjects: any[] // array of { code, name, teacher }
) => {
  // Generate periods header
  let periodTimesHtml = '<th style="border: 1px solid #000; padding: 5px; width: 60px;">DAY</th>';
  let periodNumsHtml = '<th style="border: 1px solid #000; padding: 5px;">PERIOD</th>';
  
  let pIdx = 1;
  periods.forEach(p => {
    if (p.type === 'break') {
      periodTimesHtml += `<th style="border: 1px solid #000; padding: 5px; width: 40px; font-size: 10px;">${p.time.replace(' - ', '<br/>to<br/>')}</th>`;
      periodNumsHtml += `<th style="border: 1px solid #000; padding: 5px;"></th>`;
    } else {
      periodTimesHtml += `<th style="border: 1px solid #000; padding: 5px;">${p.time.replace(' - ', '<br/>to<br/>')}</th>`;
      periodNumsHtml += `<th style="border: 1px solid #000; padding: 5px;">${pIdx++}</th>`;
    }
  });

  // Generate grid rows
  let gridRowsHtml = '';
  workingDays.forEach((day, index) => {
    let rowHtml = `<tr><td style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center;">${day ? day.substring(0, 3).toUpperCase() : ''}</td>`;
    periods.forEach(p => {
      if (p.type === 'break') {
        if (index === 0) {
          let breakText = (p.name || 'BREAK').toUpperCase();
          if (breakText.includes('LUNCH')) breakText = 'LUNCH';
          else breakText = 'BREAK';
          const stackedText = breakText.split('').join('<br/>');
          rowHtml += `<td rowspan="${workingDays.length}" style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 12px; font-weight: bold; color: #000; letter-spacing: 1px; line-height: 1.5;">${stackedText}</td>`;
        }
      } else {
        const slot = scheduleMatrix[day] && scheduleMatrix[day][p.id];
          let cellText = '-';
          if (slot) {
            if (typeof slot.subject === 'string') {
              cellText = slot.subjectCode || slot.subject.substring(0, 4).toUpperCase();
            } else if (slot.subject && typeof slot.subject === 'object') {
              cellText = slot.subject.code || (slot.subject.name ? slot.subject.name.substring(0, 4).toUpperCase() : '');
            }
          }
          rowHtml += `<td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; font-size: 11px;">${cellText}</td>`;
      }
    });
    rowHtml += '</tr>';
    gridRowsHtml += rowHtml;
  });

  // Generate subjects bottom table
  let subjectsRowsHtml = '';
  uniqueSubjects.forEach((sub, index) => {
    subjectsRowsHtml += `
      <tr>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${sub.code || ''}</td>
        <td style="border: 1px solid #000; padding: 4px;">${sub.name ? sub.name.toUpperCase() : ''}</td>
        <td style="border: 1px solid #000; padding: 4px;">${sub.teacher || ''}</td>
        <td style="border: 1px solid #000; padding: 4px;"></td>
      </tr>
    `;
  });

  // Pad with empty rows to ensure at least 6 rows in the subjects table
  const minRows = 8;
  const currentRows = uniqueSubjects.length;
  if (currentRows < minRows) {
    for (let i = currentRows; i < minRows; i++) {
      subjectsRowsHtml += `
        <tr>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">${i + 1}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;"></td>
          <td style="border: 1px solid #000; padding: 4px;"></td>
          <td style="border: 1px solid #000; padding: 4px;"></td>
          <td style="border: 1px solid #000; padding: 4px;"></td>
        </tr>
      `;
    }
  }

  return `
    <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 10px; width: 730px; height: 1040px; overflow: hidden; box-sizing: border-box; position: relative; margin: 0 auto;">
      
      <!-- Header -->
      <div style="text-align: center; line-height: 1.25; margin-bottom: 5px;">
        <h1 style="color: #d32f2f; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">${collegeName.toUpperCase()}</h1>
        <p style="margin: 2px 0; font-size: 10px; font-weight: bold; color: #000080;">Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai.</p>
        <p style="margin: 1px 0; font-size: 10px; font-weight: bold; color: #000080;">Accredited by NAAC and Recognized 2(f) status by UGC.</p>
        <p style="margin: 1px 0; font-size: 10px; font-weight: bold; color: #000080;">Nehru Nagar (W), Kalapatti Road, Coimbatore - 641014</p>
      </div>
      
      <div style="border-bottom: 2px solid #800000; margin-bottom: 8px;"></div>

      <!-- Department & Title -->
      <div style="text-align: center; margin-bottom: 10px; line-height: 1.3;">
        <h3 style="margin: 0; font-size: 14px; text-decoration: underline;">DEPARTMENT OF ${departmentName.toUpperCase()}</h3>
        <h4 style="margin: 2px 0 0 0; font-size: 13px; text-decoration: underline;">ACADEMIC TIME TABLE (${academicYear}) WITH EFFECT ON 04.08.2025</h4>
      </div>

      <!-- Class Info -->
      <div style="margin-bottom: 8px; font-size: 12px; font-weight: bold; line-height: 1.3;">
        <p style="margin: 2px 0;">${title.toUpperCase()}</p>
        <p style="margin: 2px 0;">${subtitle.toUpperCase()}</p>
      </div>

      <!-- Timetable Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
        <thead>
          <tr>${periodTimesHtml}</tr>
          <tr>${periodNumsHtml}</tr>
        </thead>
        <tbody>
          ${gridRowsHtml}
        </tbody>
      </table>

      <!-- Subjects Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 4px; width: 40px;">S.NO</th>
            <th style="border: 1px solid #000; padding: 4px; width: 100px;">SUB CODE</th>
            <th style="border: 1px solid #000; padding: 4px;">SUB NAME</th>
            <th style="border: 1px solid #000; padding: 4px; width: 220px;">STAFF INCHARGE</th>
            <th style="border: 1px solid #000; padding: 4px; width: 90px;">SIGN</th>
          </tr>
        </thead>
        <tbody>
          ${subjectsRowsHtml}
        </tbody>
      </table>
    </div>
  `;
};
