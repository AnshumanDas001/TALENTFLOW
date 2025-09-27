// Assessment schema types and helpers
// Section: { id, title, description?, questions: Question[] }
// Question: { id, type, label, description?, required?, maxLength?, min?, max?, options?, condition? }
// type: 'single' | 'multi' | 'short' | 'long' | 'number' | 'file'
// condition: { dependsOn: questionId, op: 'eq' | 'neq' | 'includes', value: any }

export const newSection = () => ({
  id: crypto.randomUUID(),
  title: 'Untitled Section',
  description: '',
  questions: [],
});

export const newQuestion = (type = 'short') => ({
  id: crypto.randomUUID(),
  type,
  label: 'Untitled question',
  description: '',
  required: false,
  maxLength: type === 'short' ? 120 : type === 'long' ? 1000 : undefined,
  min: type === 'number' ? 0 : undefined,
  max: type === 'number' ? 100 : undefined,
  options: type === 'single' || type === 'multi' ? ['Option 1', 'Option 2'] : undefined,
  condition: null,
});

export const defaultAssessment = () => ({
  sections: [newSection()],
});

export const questionTypes = [
  { key: 'single', label: 'Single Choice' },
  { key: 'multi', label: 'Multi Choice' },
  { key: 'short', label: 'Short Text' },
  { key: 'long', label: 'Long Text' },
  { key: 'number', label: 'Number (range)' },
  { key: 'file', label: 'File upload (stub)' },
];

export function isQuestionVisible(question, answersById, questionsById = {}) {
  const c = question.condition;
  if (!c || !c.dependsOn) return true;
  const val = answersById[c.dependsOn];
  const depQ = questionsById[c.dependsOn];
  let cmpValue = c.value;
  if (depQ?.type === 'number') {
    const num = Number(c.value);
    cmpValue = Number.isNaN(num) ? c.value : num;
  }
  switch (c.op) {
    case 'eq':
      return val === cmpValue;
    case 'neq':
      return val !== cmpValue;
    case 'includes':
      return Array.isArray(val) && val.includes(cmpValue);
    default:
      return true;
  }
}

export function validateAnswer(q, ans) {
  // required
  if (q.required) {
    const empty =
      ans === undefined ||
      ans === null ||
      (typeof ans === 'string' && ans.trim() === '') ||
      (Array.isArray(ans) && ans.length === 0);
    if (empty) return 'This field is required';
  }
  // max length
  if ((q.type === 'short' || q.type === 'long') && q.maxLength && typeof ans === 'string') {
    if (ans.length > q.maxLength) return `Max length is ${q.maxLength}`;
  }
  // number range
  if (q.type === 'number' && typeof ans === 'number') {
    if (q.min !== undefined && ans < q.min) return `Must be >= ${q.min}`;
    if (q.max !== undefined && ans > q.max) return `Must be <= ${q.max}`;
  }
  // file stub: ensure object shape if required
  if (q.type === 'file' && q.required) {
    if (!ans || !ans.name) return 'Please select a file';
  }
  return null;
}
