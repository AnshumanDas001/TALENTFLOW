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
// Using full-page form routes instead of drawer for create/edit
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";

const PAGE_SIZES = [5, 10, 20, 30];

function JobsAdminPage() {
  const { add: addToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("any");
  const [sort, setSort] = useState("order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 });

  // Drawer state removed in favor of dedicated routes

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / pageSize)), [data.total, pageSize]);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const statusParam = status === "any" ? "" : status;
      const params = new URLSearchParams({ search, status: statusParam, page: String(page), pageSize: String(pageSize), sort });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort]);

  const onSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("any");
    setSort("order");
    setPage(1);
  };

  // Create/edit handled via routes: /jobs/create and /jobs/:id/edit

  const toggleArchive = async (job) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: job.status === "archived" ? "active" : "archived" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchJobs();
      addToast({ type: "success", message: job.status === "archived" ? "Job unarchived" : "Job archived" });
    } catch (e) {
      setError(e.message || "Failed to update status");
      addToast({ type: "error", message: e.message || "Failed to update status" });
    }
  };

  // Drag-and-drop reorder with optimistic update and rollback
  const onDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = data.items;
    const oldIndex = items.findIndex((i) => String(i.id) === String(active.id));
    const newIndex = items.findIndex((i) => String(i.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const optimistic = arrayMove(items, oldIndex, newIndex).map((j, idx) => ({ ...j, order: items[0].order + idx }));
    const prev = data.items;
    setData((d) => ({ ...d, items: optimistic }));
    try {
      const moved = items[oldIndex];
      const res = await fetch(`/api/jobs/${moved.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder: moved.order, toOrder: optimistic[newIndex].order }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      // refetch to sync pages
      await fetchJobs();
      addToast({ type: "success", message: "Jobs reordered" });
    } catch (e) {
      setError(e.message || "Reorder failed; reverted");
      setData((d) => ({ ...d, items: prev }));
      addToast({ type: "error", message: e.message || "Reorder failed" });
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jobs Admin</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm opacity-70">Server-like pagination & filtering</div>
          <Link to="/jobs/create"><Button>New Job</Button></Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="flex-1"
        />
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Status (any)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" variant="blue">Apply</Button>
        <Button type="button" variant="destructive" onClick={clearFilters}>Clear</Button>
      </form>

      <div className="mt-4 flex items-center gap-2">
        <span className="opacity-70 text-sm">Page size:</span>
        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="mt-6 border border-gray-700 rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Title</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="p-3 w-16"><Skeleton className="h-4 w-10" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-3"><Skeleton className="h-8 w-40" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <div className="mt-6 text-red-400">{error}</div>}

      {!loading && (
        <div className="mt-6 border border-gray-700 rounded-md overflow-hidden">
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={data.items.map((j) => String(j.id))} strategy={verticalListSortingStrategy}>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tags</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((j) => (
                    <SortableRow key={j.id} id={String(j.id)}>
                      <td className="p-3 w-16 cursor-grab">{j.order}</td>
                      <td className="p-3">{j.title}</td>
                      <td className="p-3">{j.slug}</td>
                      <td className="p-3 capitalize">{j.status}</td>
                      <td className="p-3">{(j.tags || []).join(", ")}</td>
                      <td className="p-3 flex gap-2">
                        <Link to={`/job/${j.id}`} className="underline">Open</Link>
                        <Button variant="outline" onClick={() => openEdit(j)}>Edit</Button>
                        <Button variant="destructive" onClick={() => toggleArchive(j)}>
                          {j.status === "archived" ? "Unarchive" : "Archive"}
                        </Button>
                        <Link to={`/assessments/${j.id}`} className="underline">Manage assessment</Link>
                      </td>
                    </SortableRow>
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="opacity-70 text-sm">
          Total: {data.total} • Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}

// Lightweight sortable row wrapper
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className="border-t border-gray-800 hover:bg-gray-900/50" >
      {children}
    </tr>
  );
}

export default JobsAdminPage;
