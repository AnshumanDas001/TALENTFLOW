import { Button } from "@/components/ui/button";
import { CardSpotlightDemo } from "@/components/ui/card-spotlight-demo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import companies from "../data/companies.json";
import faqs from "../data/faq.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
const LandingPage = () => {
  // Build logo stream with ENTNT twice (start and middle)
  const entnt = companies.find((c) => String(c.name).toLowerCase() === "entnt");
  let logos = companies.slice();
  if (entnt) {
    // Ensure ENTNT is first
    logos = [entnt, ...companies.filter((c, i) => i !== companies.indexOf(entnt))];
    // Insert ENTNT again in the middle
    const mid = Math.floor(logos.length / 2);
    logos.splice(mid + 1, 0, entnt);
  }

  return (
    <main className="flex flex-col gap-8 sm:gap-16 py-10 sm:py-20">
      <section className="text-center ">
        <h1 className="flex flex-col items-center justify-center gradient-title font-extrabold text-4xl sm:text-6xl lg:text-8xl tracking-tighter py-4 text-center">
          <span className="block">Hire Smarter. Move Faster.</span>
          <span className="block tracking-tight">TALENTFLOW</span>
        </h1>
        <p className="text-gray-300 sm:mt-4 text-xs sm:text-xl max-w-3xl mx-auto text-center">
          An HR platform for job boards, kanban-style candidate tracking, and interactive assessments.
        </p>
      </section>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center px-4">
        <Link to={"/jobs"}>
          <Button variant="blue" size="xl" className="w-full sm:w-auto">
            Find Jobs
          </Button>
        </Link>
        <Link to={"/jobs/create"}>
          <Button variant="destructive" size="xl" className="w-full sm:w-auto">
            Post a Job
          </Button>
        </Link>
      </div>
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full py-6 sm:py-10"
      >
        <CarouselContent className="flex gap-4 sm:gap-12 items-center">
          {logos.map(({ name, id, path }, idx) => (
            <CarouselItem key={`${id}-${idx}`} className="basis-1/2 sm:basis-1/3 lg:basis-1/6 ">
              {String(name).toLowerCase() === "entnt" ? (
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                  <span className="text-xs sm:text-sm font-semibold opacity-90">ENTNT</span>
                  <img src={path} alt={name} className="h-10 sm:h-12 lg:h-16 object-contain" />
                </div>
              ) : (
                <img src={path} alt={name} className="h-8 sm:h-12 lg:h-14 object-contain mx-auto" />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Feature hero: image left, animated bullets right */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center px-4">
        <div className="rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <motion.img
            src="/Talentflow.png"
            alt="Talentflow overview"
            className="w-full max-h-[34rem] object-contain bg-black/10"
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Why Talentflow?</h2>
          <ul className="mt-4 space-y-4">
            {[
              "Create and post jobs in minutes with a clean form and instant publishing.",
              "Manage applicants in Kanban or List views, and move stages with drag‑and‑drop.",
              "Build role‑specific assessments and attach them to jobs in one click.",
              "Powerful search and filters on Jobs to help candidates find the right fit.",
              "Save roles to review later and apply seamlessly from job pages.",
            ].map((text, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 * i, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.4 }}
                className="flex items-start gap-3 text-sm sm:text-base lg:text-lg"
              >
                <span className="mt-[7px] inline-block h-2.5 w-2.5 rounded-full bg-blue-400 shrink-0" />
                <span className="opacity-90">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section id="instructions" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 place-items-stretch px-4">
        {/* 1. How to create and find jobs */}
        <CardSpotlightDemo>
          {/* Override content when children passed */}
          <div className="relative z-20">
            <p className="text-xl font-bold mt-2 text-white">How to create and find jobs</p>
            <div className="text-neutral-200 mt-4">
              <ol className="list-decimal ml-5 space-y-2">
                <li>Go to <a href="/jobs" className="underline">Browse Jobs</a> to search and filter.</li>
                <li>Employers can <a href="/jobs/create" className="underline">Post a Job</a> with title, location and description.</li>
                <li>Use search and filters to quickly find relevant openings.</li>
              </ol>
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="blue"><a href="/jobs">Browse jobs</a></Button>
              <Button asChild variant="secondary"><a href="/jobs/create">Post a job</a></Button>
            </div>
          </div>
        </CardSpotlightDemo>

        {/* 2. How to manage candidates in kanban and list */}
        <CardSpotlightDemo>
          <div className="relative z-20">
            <p className="text-xl font-bold mt-2 text-white">How to manage candidates in kanban and list</p>
            <div className="text-neutral-200 mt-4">
              <ol className="list-decimal ml-5 space-y-2">
                <li>Open <a href="/candidates" className="underline">Candidates</a>.</li>
                <li>Toggle between Kanban and List views to track stages.</li>
                <li>Drag candidates across stages or update details inline.</li>
              </ol>
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="secondary"><a href="/candidates">Manage candidates</a></Button>
            </div>
          </div>
        </CardSpotlightDemo>

        {/* 3. How to create assessments for a job */}
        <CardSpotlightDemo>
          <div className="relative z-20">
            <p className="text-xl font-bold mt-2 text-white">How to create assessments for a job</p>
            <div className="text-neutral-200 mt-4">
              <ol className="list-decimal ml-5 space-y-2">
                <li>Open the job you want to assess from <a href="/jobs" className="underline">Jobs</a>.</li>
                <li>Click the “Assessment” link from the job card or job page.</li>
                <li>Use the builder to add sections and questions, then save.</li>
              </ol>
            </div>
            <div className="mt-4">
              <Button asChild variant="secondary"><a href="/assessments">Go to assessments</a></Button>
            </div>
          </div>
        </CardSpotlightDemo>
      </section>

      <Accordion type="multiple" className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
};

export default LandingPage;
