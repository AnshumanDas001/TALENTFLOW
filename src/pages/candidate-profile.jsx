import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]); // local only
  const [job, setJob] = useState(null);

  const mentionSuggestions = useMemo(() => {
    // naive local suggestions
    return ["@alice", "@bob", "@charlie", "@diana", "@eric"];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [rc, rt] = await Promise.all([
          fetch(`/api/candidates/${id}`),
          fetch(`/api/candidates/${id}/timeline`),
        ]);
        if (!rc.ok) throw new Error("Failed to load candidate");
        const c = await rc.json();
        const t = rt.ok ? (await rt.json())?.items || [] : [];
        setCandidate(c);
        setTimeline(t);

        // Fetch job information if candidate has a jobId
        if (c.jobId) {
          try {
            const rj = await fetch(`/api/jobs/${c.jobId}`);
            if (rj.ok) {
              const j = await rj.json();
              setJob(j);
            }
          } catch (_) {
            // Job fetch failed, but candidate is still valid
          }
        }
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addNote = () => {
    if (!note.trim()) return;
    const created = { id: String(Date.now()), at: Date.now(), body: note };
    setNotes([created, ...notes]);
    setNote("");
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidate Profile</h1>
        <div className="text-sm opacity-70">Render-only notes & timeline</div>
      </div>

      {loading && <div className="mt-4">Loading…</div>}
      {error && <div className="mt-4 text-red-400">{error}</div>}

      {candidate && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-md border border-gray-700 p-4 bg-gray-900/40">
              <div className="text-xl font-semibold">{candidate.name}</div>
              <div className="opacity-80 text-sm">{candidate.email}</div>
              <div className="mt-2 text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 inline-block capitalize">
                {candidate.stage}
              </div>
              {candidate.jobId && (
                <div className="mt-2 text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 inline-block">
                  {job?.title || `${candidate.jobId}`}
                </div>
              )}
            </div>

            <div className="rounded-md border border-gray-700 bg-gray-900/40">
              <div className="px-4 py-2 border-b border-gray-700 font-semibold">Timeline</div>
              <div className="p-4 space-y-3">
                {timeline.length === 0 && <div className="opacity-70 text-sm">No timeline events</div>}
                {timeline.map((e) => (
                  <div key={e.at} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div className="text-sm"><span className="capitalize">{e.action}</span> • {new Date(e.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-gray-700 bg-gray-900/40">
              <div className="px-4 py-2 border-b border-gray-700 font-semibold">Notes</div>
              <div className="p-4 space-y-3">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note. Use @ to mention (e.g., @alice)"
                />
                {note.includes("@") && (
                  <div className="text-xs opacity-80">
                    Suggestions: {mentionSuggestions.join(", ")}
                  </div>
                )}
                <Button onClick={addNote}>Add note</Button>
                <div className="pt-2 space-y-2">
                  {notes.length === 0 && <div className="opacity-70 text-sm">No notes yet</div>}
                  {notes.map((n) => (
                    <div key={n.id} className="rounded border border-gray-700 p-2 bg-gray-800/50">
                      <div className="text-xs opacity-70">{new Date(n.at).toLocaleString()}</div>
                      <div className="text-sm whitespace-pre-wrap mt-1">{n.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Link className="underline" to="/candidates">← Back to candidates</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateProfilePage;
