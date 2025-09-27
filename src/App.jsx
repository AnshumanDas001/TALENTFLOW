import React from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "./layouts/app-layout";
import ProtectedRoute from "./components/protected-route";
import { ThemeProvider } from "./components/theme-provider";

import LandingPage from "./pages/landing";
import Onboarding from "./pages/onboarding";
import PostJob from "./pages/post-job";
import JobListing from "./pages/jobListing";
import MyJobs from "./pages/my-jobs";
import SavedJobs from "./pages/saved-jobs";
import { JobPageAuthed, JobPagePublic } from "./pages/job";
import CandidatesPage from "./pages/candidates";
import CandidateProfilePage from "./pages/candidate-profile";
import AssessmentBuilderPage from "./pages/assessments";
import JobsAdminPage from "./pages/jobs-admin";
import PublicJobsPage from "./pages/public-jobs";
import JobFormPage from "./pages/job-form";
import AssessmentsIndexPage from "./pages/assessments-index";

import "./App.css";

function App({ authEnabled = true }) {
  const Guard = authEnabled ? ProtectedRoute : React.Fragment;

  const router = createBrowserRouter([
    {
      element: <AppLayout authEnabled={authEnabled} />,
      children: [
        {
          path: "/",
          element: <LandingPage />,
        },
        {
          path: "/onboarding",
          element: (
            <Guard>
              <Onboarding />
            </Guard>
          ),
        },
        {
          path: "/post-job",
          element: (
            <Guard>
              <PostJob />
            </Guard>
          ),
        },
        {
          path: "/my-jobs",
          element: (
            <Guard>
              <MyJobs />
            </Guard>
          ),
        },
        {
          path: "/saved-jobs",
          element: (
            <Guard>
              <SavedJobs />
            </Guard>
          ),
        },
        {
          path: "/jobs",
          element: <PublicJobsPage />,
        },
        {
          path: "/jobs-admin",
          element: (
            <Guard>
              <JobsAdminPage />
            </Guard>
          ),
        },
        {
          path: "/browse-jobs",
          element: authEnabled ? (
            <Guard>
              <JobListing />
            </Guard>
          ) : (
            <Navigate to="/jobs" replace />
          ),
        },
        {
          path: "/jobs/create",
          element: (
            <Guard>
              <JobFormPage />
            </Guard>
          ),
        },
        {
          path: "/jobs/:id/edit",
          element: (
            <Guard>
              <JobFormPage />
            </Guard>
          ),
        },
        {
          path: "/candidates",
          element: (
            <Guard>
              <CandidatesPage />
            </Guard>
          ),
        },
        {
          path: "/candidates/:id",
          element: (
            <Guard>
              <CandidateProfilePage />
            </Guard>
          ),
        },
        {
          path: "/assessments/:jobId",
          element: (
            <Guard>
              <AssessmentBuilderPage />
            </Guard>
          ),
        },
        {
          path: "/assessments",
          element: (
            <Guard>
              <AssessmentsIndexPage />
            </Guard>
          ),
        },
        {
          path: "/job/:id",
          element: (
            <Guard>
              <JobPageAuthed />
            </Guard>
          ),
        },
        {
          path: "/jobs/:id",
          element: <JobPagePublic />,
        },
      ],
    },
  ]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
