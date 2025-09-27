import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Heart, PenBox } from "lucide-react";

function HeaderAuthed() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [search, setSearch] = useSearchParams();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);
    }
  }, [search]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowSignIn(false);
      setSearch({});
    }
  };
  return (
    <>
      <nav className="py-4 flex justify-between items-center px-3 sm:px-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold tracking-wide opacity-90 text-2xl sm:text-4xl">TALENTFLOW</span>
        </Link>

        <div className="flex gap-2 sm:gap-3 items-center text-sm sm:text-lg overflow-x-auto whitespace-nowrap">
          <Link to="/candidates" className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors">
            Candidates
          </Link>
          <Link to="/assessments" className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors">
            Assessments
          </Link>
          <Link
            to="/#instructions"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                const el = document.getElementById("instructions");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                // navigate to landing with hash; AppLayout will handle scroll
                e.preventDefault();
                navigate("/#instructions");
              }
            }}
            className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors"
          >
            Instructions
          </Link>
          <SignedOut>
            <Button variant="outline" size="sm" onClick={() => setShowSignIn(true)}>
              Login
            </Button>
          </SignedOut>
          <SignedIn>
            {user?.unsafeMetadata?.role === "recruiter" && (
              <Link to="/jobs/create">
                <Button variant="destructive" size="sm" className="rounded-full">
                  <PenBox size={20} className="mr-2" />
                  Post a Job
                </Button>
              </Link>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Jobs"
                  labelIcon={<BriefcaseBusiness size={15} />}
                  href="/my-jobs"
                />
                <UserButton.Link
                  label="Saved Jobs"
                  labelIcon={<Heart size={15} />}
                  href="/saved-jobs"
                />
                <UserButton.Action label="manageAccount" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </nav>

      {showSignIn && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <SignIn
            signUpForceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      )}
    </>
  );
}

function HeaderDev() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="py-4 flex justify-between items-center px-3 sm:px-0">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-semibold tracking-wide opacity-90 text-2xl sm:text-3xl">TALENTFLOW</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg overflow-x-auto whitespace-nowrap">
        <Link to="/candidates" className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors">Candidates</Link>
        <Link to="/assessments" className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors">Assessments</Link>
        <Link
          to="/#instructions"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              const el = document.getElementById("instructions");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              e.preventDefault();
              navigate("/#instructions");
            }
          }}
          className="opacity-90 hover:opacity-100 hover:text-blue-300 hover:bg-white/10 rounded-md px-3 py-1 transition-colors"
        >
          Instructions
        </Link>
      </div>
    </nav>
  );
}

const Header = ({ authEnabled = true }) => {
  return authEnabled ? <HeaderAuthed /> : <HeaderDev />;
};

export default Header;
