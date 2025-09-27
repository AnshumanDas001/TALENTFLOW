import { createServer, Model, Response, Factory } from "miragejs";

// Simulated network latency and error rate
const randomDelay = () => 200 + Math.floor(Math.random() * 1000); // 200–1200ms
const shouldFail = (rate = 0.08) => Math.random() < rate; // 8% default

export function makeServer({ environment = "development" } = {}) {
  const server = createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
      response: Model,
      timeline: Model,
      company: Model,
    },

    factories: {
      job: Factory.extend({
        title(i) {
          const titles = [
            "Frontend Developer",
            "Backend Engineer", 
            "Full Stack Developer",
            "React Developer",
            "Node.js Developer",
            "Python Developer",
            "DevOps Engineer",
            "UI/UX Designer",
            "Product Manager",
            "Data Scientist",
            "Software Engineer",
            "Mobile Developer",
            "QA Engineer",
            "Technical Lead",
            "Senior Developer"
          ];
          return titles[i % titles.length];
        },
        slug(i) {
          return `job-${i + 1}`;
        },
        status() {
          return Math.random() > 0.3 ? "active" : "archived";
        },
        tags() {
          return ["react", "frontend", "ui"].filter(() => Math.random() > 0.5);
        },
        description() {
          return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        },
        location() {
          const states = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Gujarat", "Telangana"];
          return states[Math.floor(Math.random() * states.length)];
        },
        requirements() {
          return "- Strong React skills\n- Familiar with hooks and state management";
        },
        order(i) {
          return i + 1;
        },
      }),
      candidate: Factory.extend({
        name(i) {
          const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Chris", "Amanda", "James", "Lisa", "Robert", "Michelle", "William", "Jennifer", "Richard", "Maria"];
          const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"];
          const firstName = firstNames[i % firstNames.length];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          return `${firstName} ${lastName}`;
        },
        email(i) {
          return `candidate${i + 1}@example.com`;
        },
        stage() {
          const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
          return stages[Math.floor(Math.random() * stages.length)];
        },
        jobId() {
          return String(1 + Math.floor(Math.random() * 25));
        },
      }),
      company: Factory.extend({
        name(i) {
          const names = [
            "Acme Corp",
            "Globex",
            "Initech",
            "Hooli",
            "Umbrella",
            "Wayne Enterprises",
          ];
          return names[i % names.length];
        },
      }),
    },

    seeds(s) {
      // Attempt to load persisted DB from localStorage (dev-only persistence)
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem("mirage-db") : null;
        if (raw) {
          const data = JSON.parse(raw || "{}");
          (data.companies || []).forEach((c) => s.db.companies.insert(c));
          (data.jobs || []).forEach((j) => s.db.jobs.insert(j));
          (data.candidates || []).forEach((c) => s.db.candidates.insert(c));
          (data.assessments || []).forEach((a) => s.db.assessments.insert(a));
          return; // skip default seeding if persisted data exists
        }
      } catch (_) {
        // fall back to default seeds on any error
      }

      // Default seeds (keep small so localStorage persistence stays under quota)
      s.createList("job", 25);
      s.createList("candidate", 100);
      s.createList("company", 10);
      [1, 2, 3].forEach((jobId) => {
        s.db.assessments.insert({
          id: String(jobId),
          jobId: String(jobId),
          sections: [
            {
              id: "sec-1",
              title: "General",
              questions: [
                { id: "q1", type: "single", label: "Have you worked with React?", options: ["Yes", "No"], required: true },
                { id: "q2", type: "short", label: "Years of experience", required: true },
                { id: "q3", type: "long", label: "Tell us about a project" },
              ],
            },
          ],
        });
      });
    },

    routes() {
      this.namespace = "/api";

      const persist = (schema) => {
        try {
          // Trim large collections to avoid exceeding localStorage quota
          const maxJobs = 200;
          const maxCandidates = 300;
          const snapshot = {
            jobs: (schema.db.jobs || []).slice(-maxJobs),
            companies: schema.db.companies || [],
            candidates: (schema.db.candidates || []).slice(-maxCandidates),
            assessments: schema.db.assessments || [],
          };
          if (typeof window !== "undefined") {
            window.localStorage.setItem("mirage-db", JSON.stringify(snapshot));
          }
        } catch (_) {
          // ignore persistence errors in dev
        }
      };

      // Jobs
      this.get("/jobs/:id", (schema, request) => {
        const id = request.params.id;
        const job = schema.find("job", id);
        if (!job) return new Response(404, {}, { message: "Job not found" });
        return new Promise((resolve) => setTimeout(() => resolve(job.attrs), randomDelay()));
      });
      this.get("/companies", (schema) => {
        const items = schema.all("company").models.map((m) => m.attrs);
        return new Promise((resolve) => setTimeout(() => resolve(items), randomDelay()));
      });

      this.get("/jobs", (schema, request) => {
        const search = (request.queryParams.search || "").toLowerCase();
        const status = request.queryParams.status || "";
        const page = Number(request.queryParams.page || 1);
        const pageSize = Number(request.queryParams.pageSize || 10);
        const sort = request.queryParams.sort || "order";

        let jobs = schema.all("job").models;
        if (search) jobs = jobs.filter((j) => j.title.toLowerCase().includes(search));
        if (status) jobs = jobs.filter((j) => j.status === status);
        jobs = jobs.sort((a, b) => (a[sort] > b[sort] ? 1 : -1));

        const total = jobs.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const items = jobs.slice(start, end);

        return new Promise((resolve) =>
          setTimeout(() => resolve({ items, total, page, pageSize }), randomDelay())
        );
      });

      this.post("/jobs", (schema, request) => {
        if (shouldFail()) return new Response(500, {}, { message: "Failed to create job" });
        const attrs = JSON.parse(request.requestBody);
        // naive uniqueness check for slug
        const exists = schema.db.jobs.findBy({ slug: attrs.slug });
        if (exists) return new Response(400, {}, { message: "Slug must be unique" });
        const order = schema.db.jobs.length + 1;
        const job = schema.create("job", { ...attrs, status: "active", order });
        // persist db after creation
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve(job), randomDelay()));
      });

      this.patch("/jobs/:id", (schema, request) => {
        if (shouldFail()) return new Response(500, {}, { message: "Failed to update job" });
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const job = schema.find("job", id);
        if (!job) return new Response(404);
        job.update(attrs);
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve(job), randomDelay()));
      });

      this.delete("/jobs/:id", (schema, request) => {
        if (shouldFail(0.05)) return new Response(500, {}, { message: "Failed to delete job" });
        const id = request.params.id;
        const job = schema.find("job", id);
        if (!job) return new Response(404);
        job.destroy();
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), randomDelay()));
      });

      this.patch("/jobs/:id/reorder", (schema, request) => {
        const id = request.params.id;
        const { fromOrder, toOrder } = JSON.parse(request.requestBody || "{}");
        if (shouldFail(0.1)) return new Response(500, {}, { message: "Reorder failed" });
        // naive reorder in memory
        const jobs = schema.all("job").models.sort((a, b) => a.order - b.order);
        const moving = jobs.find((j) => j.id === id);
        if (!moving) return new Response(404);
        jobs.splice(fromOrder - 1, 1);
        jobs.splice(toOrder - 1, 0, moving);
        jobs.forEach((j, idx) => j.update({ order: idx + 1 }));
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), randomDelay()))
      });

      // Candidates
      this.get("/candidates/:id", (schema, request) => {
        const id = request.params.id;
        const c = schema.find("candidate", id);
        if (!c) return new Response(404, {}, { message: "Candidate not found" });
        return new Promise((resolve) => setTimeout(() => resolve(c.attrs), randomDelay()));
      });
      this.get("/candidates", (schema, request) => {
        const search = (request.queryParams.search || "").toLowerCase();
        const stage = request.queryParams.stage || "";
        const jobId = request.queryParams.jobId || "";
        const page = Number(request.queryParams.page || 1);
        const pageSize = Number(request.queryParams.pageSize || 50);

        let items = schema.all("candidate").models;
        if (search) items = items.filter((c) => `${c.attrs.name} ${c.attrs.email}`.toLowerCase().includes(search));
        if (stage) items = items.filter((c) => c.attrs.stage === stage);
        if (jobId) items = items.filter((c) => String(c.attrs.jobId || "") === String(jobId));

        const total = items.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageItems = items.slice(start, end).map((m) => m.attrs);

        return new Promise((resolve) =>
          setTimeout(() => resolve({ items: pageItems, total, page, pageSize }), randomDelay())
        );
      });

      this.post("/candidates", (schema, request) => {
        if (shouldFail()) return new Response(500, {}, { message: "Failed to create candidate" });
        const attrs = JSON.parse(request.requestBody);
        const candidate = schema.create("candidate", attrs);
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve(candidate.attrs), randomDelay()));
      });

      this.patch("/candidates/:id", (schema, request) => {
        if (shouldFail()) return new Response(500, {}, { message: "Failed to update candidate" });
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const candidate = schema.find("candidate", id);
        if (!candidate) return new Response(404);
        candidate.update(attrs);
        persist(schema);
        return new Promise((resolve) => setTimeout(() => resolve(candidate.attrs), randomDelay()));
      });

      this.get("/candidates/:id/timeline", (schema, request) => {
        const id = request.params.id;
        // basic timeline
        const entries = [
          { at: Date.now() - 1000 * 60 * 60 * 24 * 7, action: "applied" },
          { at: Date.now() - 1000 * 60 * 60 * 24 * 5, action: "screen" },
        ];
        return new Promise((resolve) => setTimeout(() => resolve({ items: entries }), randomDelay()));
      });

      // Assessments
      this.get("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const found = schema.db.assessments.findBy({ jobId });
        return new Promise((resolve) => setTimeout(() => resolve(found || null), randomDelay()));
      });

      this.put("/assessments/:jobId", (schema, request) => {
        if (shouldFail()) return new Response(500, {}, { message: "Failed to save assessment" });
        const jobId = request.params.jobId;
        const body = JSON.parse(request.requestBody || "{}");
        const existing = schema.db.assessments.findBy({ jobId });
        if (existing) {
          schema.db.assessments.update(existing.id, body);
          return new Promise((resolve) => setTimeout(() => resolve(body), randomDelay()));
        }
        const created = schema.db.assessments.insert({ id: jobId, jobId, ...body });
        return new Promise((resolve) => setTimeout(() => resolve(created), randomDelay()));
      });

      this.post("/assessments/:jobId/submit", (schema, request) => {
        const jobId = request.params.jobId;
        const payload = JSON.parse(request.requestBody || "{}");
        schema.db.responses.insert({ id: String(Date.now()), jobId, ...payload });
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), randomDelay()));
      });
    },
  });

  return server;
}
