import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssessment, db } from "@/db";

function AssessmentsIndexPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMap, setHasMap] = useState({});
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs?page=1&pageSize=50&sort=order`);
        if (!res.ok) throw new Error("Failed to load jobs");
        const json = await res.json();
        const items = json.items || [];
        setJobs(items);
        // Check assessment existence per job
        const map = {};
        await Promise.all(
          items.map(async (j) => {
            try {
              const a = await getAssessment(j.id);
              map[j.id] = !!(a && a.sections && a.sections.length);
            } catch {
              map[j.id] = false;
            }
          })
        );
        setHasMap(map);
        // Load all saved assessments for quick access list
        try {
          const list = await db.assessments.toArray();
          setAssessments(list || []);
        } catch {
          setAssessments([]);
        }
      } catch (e) {
        setError(e.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assessments</h1>
        <div className="text-sm opacity-70">Pick a job to manage its assessment</div>
      </div>
      {loading && <div className="mt-4">Loading…</div>}
      {error && <div className="mt-4 text-red-400">{error}</div>}
      {/* Saved assessments list */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Saved Assessments</h2>
          <div className="text-sm opacity-70">Total: {assessments.length}</div>
        </div>
        {assessments.length === 0 ? (
          <div className="mt-3 opacity-70 text-sm">No assessments saved yet.</div>
        ) : (
          <div className="mt-3 border border-gray-700 rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3">Job</th>
                  <th className="p-3">Sections</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const job = jobs.find((j) => String(j.id) === String(a.jobId));
                  return (
                    <tr key={a.jobId} className="border-t border-gray-800">
                      <td className="p-3">{job?.title || `Job ${a.jobId}`}</td>
                      <td className="p-3">{Array.isArray(a.sections) ? a.sections.length : 0}</td>
                      <td className="p-3">
                        <Link className="underline" to={`/assessments/${a.jobId}`}>Open</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Jobs grid */}
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-md border border-gray-700 p-4 bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{j.title}</div>
                <div className="text-sm opacity-70">{(j.tags || []).join(", ")}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${hasMap[j.id] ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                {hasMap[j.id] ? 'Assessment exists' : 'No assessment'}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Link to={`/assessments/${j.id}`} className="underline">{hasMap[j.id] ? 'Edit assessment →' : 'Create assessment →'}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssessmentsIndexPage;
