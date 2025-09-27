import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";

function PublicJobPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed to load job");
        const j = await res.json();
        setJob(j);
      } catch (e) {
        setError(e.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!job) return null;

  return (
    <div className="flex flex-col gap-8 mt-5">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">
          {job.title}
        </h1>
      </div>

      <div className="flex justify-between ">
        <div className="flex gap-2">
          <span>📍</span> {job.location}
        </div>
        <div className="flex gap-2">
          <span>🏷️</span> {(job.tags || []).join(", ")}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <p className="sm:text-lg">{job.description}</p>

      <h2 className="text-2xl sm:text-3xl font-bold">What we are looking for</h2>
      <MDEditor.Markdown source={job.requirements} className="bg-transparent sm:text-lg" />

      <div>
        <Link to="/public-jobs" className="underline">← Back to jobs</Link>
      </div>
    </div>
  );
}

export default PublicJobPage;
