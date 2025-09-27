import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";

function PublicJobsPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("order");

  const pageCount = useMemo(() => (pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1), [total, pageSize]);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        pageSize: String(pageSize),
        sort,
      });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const json = await res.json();
      setItems(json.items || []);
      setTotal(Number(json.total || 0));
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
    // reset to first page on new search
    setPage(1);
    fetchJobs();
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="py-6">
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">Find Jobs</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-center">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title" className="flex-1 min-w-[260px]" />
        <div className="flex gap-2 items-center">
          <label className="opacity-80 text-sm">Sort by</label>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
            className="bg-gray-900 text-white border border-gray-700 rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="order">Most relevant</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <Button type="submit" variant="blue">Search</Button>
      </form>

      {/* Header row with count and page size */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-700 bg-white/5 p-3">
        <div className="text-sm opacity-90">{`Showing ${start}-${end} of ${total} results`}</div>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Per page</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const nextSize = Number(e.target.value);
              setPage(1);
              setPageSize(nextSize);
            }}
            className="bg-gray-900 text-white border border-gray-700 rounded-md h-9 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-4 divide-y divide-gray-800 rounded-md border border-gray-700 bg-white/5">
          {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-6 w-2/3" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-6 text-red-400">{error}</div>}

      {!loading && (
        <div className="mt-4 divide-y divide-gray-800 rounded-md border border-gray-700 bg-white/5">
          {items.length ? (
            items.map((job) => (
              <div key={job.id} className="group relative p-4 transition-colors hover:bg-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <div className="mt-1 text-sm opacity-80 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Today</span>
                      {job.location && <span>{job.location}</span>}
                      {Array.isArray(job.tags) && job.tags.length > 0 && (
                        <span>{job.tags.join(", ")}</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm opacity-90 line-clamp-2">
                      {(job.description || "").split(".")[0]}.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <Link className="text-sm underline transition-colors hover:text-blue-300" to={`/jobs/${job.id}`}>
                      See details
                    </Link>
                    <Link className="text-sm underline transition-colors hover:text-blue-300" to={`/assessments/${job.id}`}>
                      Assessment
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">No Jobs Found 😢</div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm opacity-80">Page {page} of {pageCount}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PublicJobsPage;
