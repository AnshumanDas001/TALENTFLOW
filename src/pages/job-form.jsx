import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";

function JobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    tags: "",
    description: "",
    location: "",
    company_id: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Load companies for select
  useEffect(() => {
    (async () => {
      try {
        setLoadingCompanies(true);
        const res = await fetch("/api/companies");
        const list = await res.json();
        setCompanies(list.map((c) => ({ id: String(c.id || c._id || c.name), name: c.name })));
      } catch (e) {
        // non-fatal
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);

  // Load job when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed to load job");
        const job = await res.json();
        setForm({
          title: job.title || "",
          slug: job.slug || "",
          tags: (job.tags || []).join(", "),
          description: job.description || "",
          location: job.location || "",
          company_id: job.company_id ? String(job.company_id) : "",
          requirements: job.requirements || "",
        });
      } catch (e) {
        setError(e.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.location.trim()) return "Select a location";
    if (!form.company_id.trim()) return "Select a company";
    if (!form.requirements || !String(form.requirements).trim()) return "Requirements are required";
    return "";
  };

  const handleSave = async () => {
    const v = validate();
    if (v) {
      setSaveError(v);
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.trim().toLowerCase().replace(/\s+/g, "-"),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        description: form.description,
        location: form.location,
        company_id: form.company_id,
        requirements: form.requirements,
      };
      const url = isEdit ? `/api/jobs/${id}` : "/api/jobs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || "Save failed");
      }
      navigate("/jobs");
    } catch (e) {
      setSaveError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        {isEdit ? "Edit Job" : "Create Job"}
      </h1>
      {error && <div className="text-red-400 text-center">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-4 p-4 pb-0 max-w-3xl mx-auto">
        <Input placeholder="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <Textarea placeholder="Job Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="flex gap-4 items-center">
          <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
            <SelectTrigger className="bg-gray-900 text-white border border-gray-700">
              <SelectValue placeholder="Job Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {State.getStatesOfCountry("IN").map(({ name }) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
            <SelectTrigger className="bg-gray-900 text-white border border-gray-700">
              <SelectValue placeholder="Company">
                {form.company_id
                  ? companies.find((c) => String(c.id) === String(form.company_id))?.name
                  : "Company"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {companies.map(({ id, name }) => (
                  <SelectItem key={id} value={String(id)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md overflow-hidden bg-transparent text-white border border-gray-700">
          <MDEditor
            value={form.requirements}
            onChange={(val) => setForm({ ...form, requirements: val || "" })}
            previewOptions={{
              style: { color: "#fff", backgroundColor: "transparent" },
            }}
            className="bg-transparent text-white"
          />
        </div>

        <Input placeholder="Slug (auto if empty)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />

        {saveError && <p className="text-red-500">{saveError}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} variant="blue" size="lg" className="mt-2">
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="mt-2" onClick={() => navigate("/jobs")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JobFormPage;
