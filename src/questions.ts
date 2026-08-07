import { RAW_QUESTIONS_CSV } from './questionsData';

export interface Question {
  id: string;
  text: string;
  type: string;
  correctAnswer: string;
  choices: string[];
  category: 'Define' | 'Measure' | 'Analyze' | 'Improve' | 'Control' | 'Lean Culture & Core';
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function getCategory(id: string, text: string): Question['category'] {
  const txt = text.toLowerCase();
  
  // Specific OSE or culture matching
  if (txt.includes('culture') || txt.includes('safety') || txt.includes('servant') || txt.includes('respect') || txt.includes('leadership') || txt.includes('forming') || txt.includes('storming') || txt.includes('norming') || txt.includes('performing') || txt.includes('team development') || txt.includes('change agent') || txt.includes('cross-functional')) {
    return 'Lean Culture & Core';
  }
  // DMAIC Phase matches
  if (txt.includes('define') || txt.includes('sipoc') || txt.includes('voc') || txt.includes('customer') || txt.includes('charter') || txt.includes('swot') || txt.includes('problem statement') || txt.includes('affinity diagram') || txt.includes('functional requirements') || txt.includes('project champion')) {
    return 'Define';
  }
  if (txt.includes('measure') || txt.includes('dmpo') || txt.includes('dpmo') || txt.includes('sampling') || txt.includes('standard deviation') || txt.includes('variance') || txt.includes('mean') || txt.includes('median') || txt.includes('mode') || txt.includes('data collection') || txt.includes('cpk') || txt.includes('precision') || txt.includes('accuracy') || txt.includes('bias') || txt.includes('linearity') || txt.includes('stability') || txt.includes('measurement')) {
    return 'Measure';
  }
  if (txt.includes('analyze') || txt.includes('anova') || txt.includes('hypothesis') || txt.includes('t test') || txt.includes('chi-square') || txt.includes('correlation') || txt.includes('root cause') || txt.includes('rca') || txt.includes('fishbone') || txt.includes('fmea') || txt.includes('pareto') || txt.includes('cause and effect') || txt.includes('why') || txt.includes('constraints')) {
    return 'Analyze';
  }
  if (txt.includes('improve') || txt.includes('kaizen') || txt.includes('poka-yoke') || txt.includes('error proofing') || txt.includes('mistake proofing') || txt.includes('smed') || txt.includes('changeover') || txt.includes('5s') || txt.includes('kanban') || txt.includes('pull system') || txt.includes('just-in-time') || txt.includes('waste') || txt.includes('downtime') || txt.includes('flow') || txt.includes('standard work') || txt.includes('takt time') || txt.includes('one piece flow') || txt.includes('bottleneck') || txt.includes('maintenance') || txt.includes('tpm') || txt.includes('pilot')) {
    return 'Improve';
  }
  if (txt.includes('control') || txt.includes('spc') || txt.includes('run chart') || txt.includes('control chart') || txt.includes('x-bar') || txt.includes('p chart') || txt.includes('np chart') || txt.includes('i-mr') || txt.includes('visual management') || txt.includes('travel lanes') || txt.includes('sustaining') || txt.includes('a3') || txt.includes('work instructions')) {
    return 'Control';
  }
  
  // Fallbacks by ID numbers to distribute evenly
  const num = parseInt(id.replace('LSSGB-', ''), 10);
  if (isNaN(num)) return 'Lean Culture & Core';
  if (num <= 35) return 'Define';
  if (num <= 70) return 'Measure';
  if (num <= 115) return 'Analyze';
  if (num <= 165) return 'Improve';
  return 'Control';
}

export function loadAllQuestions(): Question[] {
  const lines = RAW_QUESTIONS_CSV.split(/\r?\n/);
  const questions: Question[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    if (fields.length < 8) continue;
    
    const [id, text, type, correctAnswer, , incorrect1, incorrect2, incorrect3] = fields;
    
    // Combine correct and incorrect answers to choices
    const choices = [correctAnswer, incorrect1, incorrect2, incorrect3].filter(Boolean);
    
    questions.push({
      id,
      text,
      type,
      correctAnswer,
      choices,
      category: getCategory(id, text)
    });
  }
  
  return questions;
}

// Utility to shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
