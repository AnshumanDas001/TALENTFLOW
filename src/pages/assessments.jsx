import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AssessmentBuilder from "@/components/assessment/AssessmentBuilder";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import { defaultAssessment } from "@/lib/assessment-schema";
import { getAssessment, persistAssessment, persistResponse } from "@/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const [schema, setSchema] = useState(defaultAssessment());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const saveTimer = useRef(null);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  // Load jobs for switching
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs?page=1&pageSize=100&sort=order`);
        if (!res.ok) throw new Error("Failed to load jobs");
        const json = await res.json();
        setJobs(json.items || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load existing schema
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const existing = await getAssessment(jobId);
        if (!mounted) return;
        if (existing && existing.sections) {
          setSchema({ sections: existing.sections });
        } else {
          setSchema(defaultAssessment());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  // Debounced autosave
  useEffect(() => {
    if (loading) return; // don't save during initial load
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await persistAssessment(jobId, { sections: schema.sections });
        setStatus("Saved");
        setTimeout(() => setStatus(""), 1200);
      } catch (e) {
        console.error(e);
        setStatus("Failed to save");
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [schema, jobId, loading]);

  const handleSubmitResponse = async ({ answers }) => {
    const payload = {
      id: crypto.randomUUID(),
      jobId,
      payload: { answers, submittedAt: new Date().toISOString() },
    };
    await persistResponse(payload);
    setStatus("Response saved locally");
    setTimeout(() => setStatus(""), 1500);
  };

  const sectionsCount = useMemo(() => schema.sections?.length || 0, [schema]);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assessment Builder</h1>
          <div className="text-xs opacity-70">Job ID: <code>{jobId}</code> • Sections: {sectionsCount}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-64">
            <Select value={String(jobId)} onValueChange={(v) => navigate(`/assessments/${v}`)}>
              <SelectTrigger>
                <SelectValue placeholder="Pick job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm opacity-70">{status || (loading ? "Loading…" : "Auto-saves")}</div>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-6">
        <div>
          <AssessmentBuilder value={schema} onChange={setSchema} />
          <div className="mt-4">
            <Link className="underline" to="/jobs">← Back to jobs</Link>
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold mb-2">Live Preview</div>
          <div className="text-xs opacity-70 mb-4">This is a fillable form rendered from the schema. Submitting stores responses locally.</div>
          <div className="rounded-md border border-gray-700 p-4">
            <AssessmentForm schema={schema} onSubmit={handleSubmitResponse} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilderPage;
