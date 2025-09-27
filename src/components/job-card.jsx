/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteJob, saveJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

// Split into authed and public variants to avoid Clerk hooks in preview mode
function JobCard({ job, savedInit = false, onJobAction = () => {}, isMyJob = false }) {
  const [saved, setSaved] = useState(savedInit);
  const { user } = useUser();

  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, { job_id: job.id });
  const { loading: loadingSavedJob, data: savedJob, fn: fnSavedJob } = useFetch(saveJob);

  const handleSaveJob = async () => {
    await fnSavedJob({ user_id: user.id, job_id: job.id });
    onJobAction();
  };

  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  useEffect(() => {
    if (savedJob !== undefined) setSaved(savedJob?.length > 0);
  }, [savedJob]);

  return (
    <div className="group relative border border-gray-700 rounded-md p-4 flex flex-col transition-transform duration-150 ease-out hover:scale-[1.015]">
      <div className="flex-1">
        <div className="text-lg font-semibold flex justify-between">
          <span>{job.title}</span>
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </div>
        <div className="mt-2 opacity-80 text-sm flex items-center gap-2">
          <MapPinIcon size={15} /> {job.location}
        </div>
        <div className="mt-2 opacity-80 text-sm">{(job.tags || []).join(", ")}</div>
        <div className="mt-3 text-sm">{(job.description || "").split(".")[0]}.</div>
      </div>
      <div className="mt-4 pt-3 pb-1 border-t border-gray-700 flex items-center gap-3">
        <Link className="underline transition-colors hover:text-blue-300" to={`/jobs/${job.id}`}>More details →</Link>
        <Link to={`/assessments/${job.id}`} className="underline transition-colors hover:text-blue-300">Assessment →</Link>
        {!isMyJob && user && (
          <Button variant="outline" className="w-15" onClick={handleSaveJob} disabled={loadingSavedJob}>
            {saved ? <Heart size={20} fill="red" stroke="red" /> : <Heart size={20} />}
          </Button>
        )}
      </div>
    </div>
  );
}

export default JobCard;
