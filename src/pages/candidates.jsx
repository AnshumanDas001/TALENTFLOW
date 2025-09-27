import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

// Reduce to 4 primary stages for a cleaner board
const STAGES = ["applied", "screen", "tech", "offer"]; // (hired/rejected hidden from board)

function CandidatesPage() {
  const { add: addToast } = useToast();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("any");
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [view, setView] = useState("kanban"); // list | kanban (default kanban)
  const [activeId, setActiveId] = useState(null);
  const [jobs, setJobs] = useState([]);

  const normalize = (c) => ({ ...c, id: c?.id != null ? String(c.id) : undefined });

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "1000" });
      if (stage !== "any") params.set("stage", stage);
      if (jobId && jobId !== "any") params.set("jobId", String(jobId));
      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const json = await res.json();
      const items = (json.items || []).map(normalize).filter((c) => c.id);
      setItems(items);
    } catch (e) {
      setError(e.message || "Error loading candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, jobId]);

  // Load jobs for filter + label mapping
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs?page=1&pageSize=200&sort=order`);
        const json = await res.json();
        const list = (json.items || []).map((j) => ({ id: String(j.id || j.slug), title: j.title }));
        setJobs(list);
        try { window.__jobsCache = list; } catch (_) { /* ignore if not in browser */ }
      } catch (_) {}
    })();
  }, []);

  // Listen for external refresh triggers (e.g., after create in a column)
  useEffect(() => {
    const handler = (e) => {
      const c = e.detail?.candidate;
      if (c) {
        const n = normalize(c);
        if (!n.id) return;
        setItems((prev) => [n, ...prev]);
      } else {
        fetchCandidates();
      }
    };
    window.addEventListener("candidates:refresh", handler);
    return () => window.removeEventListener("candidates:refresh", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(q));
  }, [items, search]);

  // Kanban state derived by stage
  const columns = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, []]));
    filtered.forEach((c) => { if (map[c.stage]) map[c.stage].push(c); });
    return map;
  }, [filtered]);

  const onDropToStage = async (candidateId, targetStage) => {
    const prev = items;
    const optimistic = items.map((c) => c.id === candidateId ? { ...c, stage: targetStage } : c);
    setItems(optimistic);
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      addToast({ type: "success", message: "Stage updated" });
    } catch (e) {
      setError(e.message || "Failed to update stage");
      addToast({ type: "error", message: e.message || "Failed to update stage" });
      setItems(prev);
    }
  };

  // Inline Add Candidate (List)
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStage, setNewStage] = useState(STAGES[0]);
  const [newJobId, setNewJobId] = useState("");
  const [creating, setCreating] = useState(false);
  const addCandidate = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), stage: newStage, jobId: newJobId || jobId || undefined }),
      });
      if (!res.ok) throw new Error("Failed to create candidate");
      const created = await res.json();
      const n = normalize(created);
      if (n.id) setItems((prev) => [n, ...prev]);
      setNewName("");
      setNewEmail("");
      setNewStage(STAGES[0]);
      addToast({ type: "success", message: "Candidate added" });
    } catch (e) {
      setError(e.message || "Failed to create candidate");
      addToast({ type: "error", message: e.message || "Failed to create candidate" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-800/70"}`}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${view === "kanban" ? "bg-blue-600 text-white" : "bg-gray-800/70"}`}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="mt-4 flex flex-col sm:flex-row gap-2 items-center">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="flex-1" />
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Stage (any)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="any">Any</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by Job (any)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="any">Any</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="button" variant="destructive" onClick={() => { setSearch(""); setStage("any"); setJobId("any"); }}>Clear</Button>
      </form>

      {loading && view === "list" && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 border-b border-gray-800 h-[72px] bg-gray-900/40 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
      {loading && view === "kanban" && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {STAGES.map((s) => (
            <div key={s} className="min-w-[320px] max-w-[320px] flex-shrink-0 rounded-lg bg-gray-900/30 border border-gray-700 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                <div className="text-sm font-semibold capitalize">{s}</div>
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-700/70">…</div>
              </div>
              <div className="p-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[60px] w-full" />
                ))}
              </div>
              <div className="px-3 py-2 text-xs opacity-60">Add new</div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-6 text-red-400">{error}</div>}

      {/* Tabs content */}
      {!loading && view === "list" && (
        <div className="mt-6">
          {/* Add Candidate (List) */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className="flex-1" />
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="flex-1" />
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent><SelectGroup>{STAGES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectGroup></SelectContent>
            </Select>
            <Select value={newJobId} onValueChange={setNewJobId}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Job (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {jobs.map((j) => (<SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button disabled={creating} onClick={addCandidate}>Add</Button>
          </div>
          <VirtualList
            items={filtered}
            itemHeight={72}
            height={520}
            getKey={(c) => String(c.id)}
            renderItem={(c) => (
            <div className="flex items-center justify-between px-4 border-b border-gray-800 h-[72px] bg-gray-900/40">
              <div className="py-3">
                <div className="font-medium">{c.name}</div>
                <div className="opacity-70 text-sm">{c.email} • <span className="capitalize">{c.stage}</span>{c.jobId ? ` • ${c.jobId}` : ""}</div>
              </div>
              <Link to={`/candidates/${c.id || ''}`} className="underline text-sm transition-colors hover:text-blue-300">Open →</Link>
            </div>
          )}
          />
        </div>
      )}

      {!loading && view === "kanban" && (
        <div className="mt-6">
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={({ active }) => {
              const cid = active?.data?.current?.candidateId;
              setActiveId(cid || null);
            }}
            onDragEnd={({ active, over }) => {
              if (over && over.id && active?.data?.current?.candidateId) {
                onDropToStage(active.data.current.candidateId, String(over.id));
              }
              setActiveId(null);
            }}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex gap-4 overflow-x-auto pb-2">
              {STAGES.map((s) => (
                <KanbanColumn key={s} id={s} title={s} items={columns[s]} />
              ))}
            </div>
            <DragOverlay>
              {activeId ? (
                <KanbanCard candidate={items.find((c) => c.id === activeId) || filtered.find((c) => c.id === activeId) || { name: "", email: "", stage: "" }} dragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ id, title, items }) {
  const { add: addToast } = useToast();
  const { setNodeRef, isOver } = useDroppable({ id });
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobId, setJobId] = useState("");
  const [saving, setSaving] = useState(false);

  const createInColumn = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), stage: id, jobId: jobId || undefined }),
      });
      if (!res.ok) throw new Error("Failed to create candidate");
      const created = await res.json();
      setName("");
      setEmail("");
      setAdding(false);
      // notify parent with created candidate to avoid refetch
      window.dispatchEvent(new CustomEvent("candidates:refresh", { detail: { candidate: created } }));
      addToast({ type: "success", message: "Candidate added" });
    } catch (e) {
      // surface errors via console for now
      console.error(e);
      addToast({ type: "error", message: e.message || "Failed to create candidate" });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div ref={setNodeRef} className={`min-w-[320px] max-w-[320px] flex-shrink-0 rounded-lg bg-gray-900/30 border border-gray-700 shadow-sm ${isOver ? "ring-2 ring-blue-500/60" : ""}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="text-sm font-semibold capitalize">{title}</div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-gray-700/70">{items.length}</div>
      </div>
      <div className="p-2 space-y-2 min-h-[80px] max-h-[520px] overflow-auto">
        {items.map((c) => (
          <KanbanCard key={c.id} candidate={c} />
        ))}
      </div>
      {/* Inline add in Kanban removed as it is non-functional for now */}
    </div>
  );
}

function KanbanCard({ candidate, dragging = false }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({ id: `cand-${candidate.id}`, data: { candidateId: candidate.id } });
  const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition, zIndex: transform ? 50 : "auto" };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!dragging ? { ...attributes, ...listeners } : {})}
      className={`p-3 rounded-md bg-gray-800 text-sm shadow border border-gray-700 ${dragging ? "opacity-90" : "hover:border-gray-600 cursor-move"}`}
    >
      <div className="font-medium">{candidate.name}</div>
      <div className="opacity-70 text-xs">{candidate.email}</div>
      {candidate.jobId && (
        <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 inline-block">{`${candidate.jobId}`}</div>
      )}
      <div className="mt-2 flex gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 capitalize">{candidate.stage}</span>
      </div>
    </div>
  );
}

// Lightweight virtualization without external deps
function VirtualList({ items, itemHeight, height, renderItem, getKey }) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const onScroll = (e) => setScrollTop(e.currentTarget.scrollTop);
  const total = items.length;
  const visibleCount = Math.ceil(height / itemHeight) + 4; // overscan
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(total, startIndex + visibleCount);
  const topSpacer = startIndex * itemHeight;
  const bottomSpacer = (total - endIndex) * itemHeight;
  return (
    <div className="border border-gray-700 rounded-md overflow-auto" style={{ height }} onScroll={onScroll}>
      <div style={{ height: topSpacer }} />
      {items.slice(startIndex, endIndex).map((it, i) => (
        <React.Fragment key={getKey ? getKey(it) : (it?.id ?? `${startIndex + i}`)}>
          {renderItem(it)}
        </React.Fragment>
      ))}
      <div style={{ height: bottomSpacer }} />
    </div>
  );
}

export default CandidatesPage;
