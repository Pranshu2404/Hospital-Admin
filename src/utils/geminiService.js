import axios from 'axios';

// Ideally, this should be in an environment variable like import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using the 001 stable version usually resolves 404 errors
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
/**
 * Summarizes the patient's prescription history using Gemini.
 * @param {Array} prescriptions - List of prescription objects.
 * @param {Object} patientDetails - Basic patient details (name, age, gender).
 * @returns {Promise<string>} - The summary text.
 */
export const summarizePatientHistory = async (prescriptions, patientDetails) => {
  if (!prescriptions || prescriptions.length === 0) {
    return "No prescription history available to summarize.";
  }

  // Format the data for the prompt
  const historyText = prescriptions.map((rx, index) => {
    const medicines = rx.items?.map(m => 
      `- ${m.medicine_name} (${m.dosage}, ${m.frequency}) - ${m.duration}`
    ).join('\n    ');

    const time = rx.appointment_id?.time || '';

    return `
    Record #${index + 1}:
    Date: ${new Date(rx.issue_date || rx.createdAt).toLocaleDateString()} ${time ? 'at ' + time : ''}
    Doctor: ${rx.doctor_id?.firstName ? `Dr. ${rx.doctor_id.firstName} ${rx.doctor_id.lastName}` : 'N/A'}
    Diagnosis: ${rx.diagnosis || 'N/A'}
    Notes: ${rx.notes || 'None'}
    Investigation: ${rx.investigation || 'None'}
    Medicines:
    ${medicines || '    None'}
    `;
  }).join('\n');

  const prompt = `
    You are a medical data formatter. 
    Strictly list the patient's prescription history based ONLY on the provided data. 
    Do NOT provide any medical advice, analysis, suggestions, or summaries of your own.
    Do NOT use markdown bolding (double asterisks) or headings.

    Patient: ${patientDetails.name} (${patientDetails.gender}, ${patientDetails.age} yrs)
    
    Data:
    ${historyText}
    
    Instructions:
    1. START with a single line "OVERVIEW: [Detailed Clinical Summary: Identify the primary disease/conditions, their progression (improving/worsening), key treatments administered, and current status. Keep this entire overview as a single paragraph on one line. The length MUST be between 60 and 120 words. Consolidate repetitive conditions; do not list every instance of the same condition, but rather summarize the trend.]".
    2. Then, for each record, determine if it seems "Related/Follow-up" to the previous one (based on similar diagnosis/medicines) or "Independent" or "First Visit".
    3. Format each entry strictly as follows:
       [Date] -> [Doctor Name] -> [Diagnosis] -> [Notes] -> [Investigation] -> [Medicines List] -> [Status: Follow-up | Independent | First Visit]
    4. Use " -> " as the separator.
    5. List them in chronological order (oldest to newest).
    6. Do not add any other introductory text.
  `;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const candidate = response.data?.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts) {
      return candidate.content.parts.map(part => part.text).join('');
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }

  } catch (error) {
    console.error("Error summarizing patient history:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
};
