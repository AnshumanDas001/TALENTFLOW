import Dexie from "dexie";

// Dexie schema for local persistence
// Tables:
// - jobs: {id, title, slug, status, tags[], order}
// - candidates: {id, name, email, stage, jobId}
// - assessments: {jobId, sections}
// - responses: {id, jobId, payload}
// - timelines: {id, candidateId, items: [{at, action, note?}]}

export const db = new Dexie("talentflow");

db.version(1).stores({
  jobs: "id, slug, status, order", // indexes
  candidates: "id, stage, jobId",
  assessments: "jobId",
  responses: "id, jobId",
  timelines: "id, candidateId",
});

// Write-through helpers (network -> IndexedDB)
export const persistJobs = async (jobs) => {
  await db.jobs.bulkPut(jobs.map((j) => ({ ...j })));
};

export const persistJob = async (job) => db.jobs.put({ ...job });

export const getJobs = async () => db.jobs.orderBy("order").toArray();

export const persistCandidates = async (cands) => {
  await db.candidates.bulkPut(cands.map((c) => ({ ...c })));
};

export const persistCandidate = async (cand) => db.candidates.put({ ...cand });

export const getCandidatesByPage = async (page = 1, pageSize = 50) => {
  const offset = (page - 1) * pageSize;
  const total = await db.candidates.count();
  const items = await db.candidates.offset(offset).limit(pageSize).toArray();
  return { items, total, page, pageSize };
};

export const persistAssessment = async (jobId, assessment) =>
  db.assessments.put({ jobId, ...assessment });

export const getAssessment = async (jobId) => db.assessments.get({ jobId });

export const persistResponse = async (payload) => db.responses.put(payload);

export const getTimeline = async (candidateId) =>
  db.timelines.get({ candidateId }).then((t) => t?.items || []);

export const appendTimeline = async (candidateId, entry) => {
  const existing = (await db.timelines.get({ candidateId })) || {
    id: `${candidateId}`,
    candidateId,
    items: [],
  };
  existing.items.push(entry);
  await db.timelines.put(existing);
};

// Utility: restore initial cache if empty (run once at app start if needed)
export const ensureInitialized = async () => {
  const jobCount = await db.jobs.count();
  const candCount = await db.candidates.count();
  return { jobCount, candCount };
};
