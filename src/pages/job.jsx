import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplyJobDrawer } from "@/components/apply-job";
import ApplicationCard from "@/components/application-card";

import useFetch from "@/hooks/use-fetch";
import { getSingleJob, updateHiringStatus } from "@/api/apiJobs";

const AUTH_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function JobPageAuthed() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();

  const { loading: loadingJob, data: job, fn: fnJob } = useFetch(getSingleJob);

  useEffect(() => {
    if (isLoaded) fnJob({ job_id: id });
  }, [isLoaded]);

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(updateHiringStatus);

  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus({ job_id: id }, isOpen).then(() => fnJob({ job_id: id }));
  };

  if (!isLoaded || loadingJob) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }
  if (!job) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Job not found</h2>
        <p className="mb-4">We couldn't find the job you were looking for. It may have been removed.</p>
        <Link to="/jobs" className="underline text-blue-300">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-5">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">{job?.title}</h1>
        <img src={job?.company?.logo_url} className="h-12" alt={job?.title} />
      </div>

      <div className="flex">
        <div className="flex gap-2"><MapPinIcon /> {job?.location}</div>
      </div>

      {job?.recruiter_id === user?.id && (
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className={`w-full ${job?.isOpen ? "bg-green-950" : "bg-red-950"}`}>
            <SelectValue placeholder={"Hiring Status " + (job?.isOpen ? "( Open )" : "( Closed )")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <p className="sm:text-lg">{job?.description}</p>

      <h2 className="text-2xl sm:text-3xl font-bold">What we are looking for</h2>
      <MDEditor.Markdown source={job?.requirements} className="bg-transparent sm:text-lg" />
      {job?.recruiter_id !== user?.id && (
        <ApplyJobDrawer
          job={job}
          user={user}
          fetchJob={fnJob}
          applied={job?.applications?.find((ap) => ap.candidate_id === user.id)}
        />
      )}
      {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}
      {job?.applications?.length > 0 && job?.recruiter_id === user?.id && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold mb-4 text-xl ml-1">Applications</h2>
          {job?.applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JobPagePublic() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    fetch(`/api/jobs/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch job");
        const json = await res.json();
        if (isMounted) setJob(json || null);
      })
      .catch((e) => {
        if (isMounted) setError(e.message || "Error loading job");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !job) {
    if (loading) return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Job not found</h2>
        <p className="mb-4">We couldn't find the job you were looking for. It may have been removed.</p>
        <Link to="/jobs" className="underline text-blue-300">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-5">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">{job?.title}</h1>
        {job?.company?.logo_url && <img src={job?.company?.logo_url} className="h-12" alt={job?.title} />}
      </div>

      <div className="flex">
        <div className="flex gap-2"><MapPinIcon /> {job?.location}</div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <p className="sm:text-lg">{job?.description}</p>

      <h2 className="text-2xl sm:text-3xl font-bold">What we are looking for</h2>
      <MDEditor.Markdown source={job?.requirements} className="bg-transparent sm:text-lg" />
    </div>
  );
}

export default function JobPage() {
  return AUTH_ENABLED ? <JobPageAuthed /> : <JobPagePublic />;
}
