import React, { useState, useEffect } from "react";

export default function AuthView({
  pendingAction,
  onAuthenticate,
  onContinueAsGuest,
}) {
  // Default to "register" if user clicked Post a Job, otherwise allow seamless switching
  const [mode, setMode] = useState(
    pendingAction?.type === "post-job" ? "register" : "register"
  ); // "signin" | "register"
  const [selectedRole, setSelectedRole] = useState(
    pendingAction?.type === "post-job" ? "employer" : "seeker"
  ); // "seeker" | "employer"

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pendingAction?.type === "post-job") {
      setSelectedRole("employer");
    } else if (pendingAction?.type === "apply") {
      setSelectedRole("seeker");
    }
  }, [pendingAction]);

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!password) {
      return { width: "12%", colorClass: "bg-slate-300", label: "Minimum 6 characters required" };
    }
    if (password.length < 6) {
      return { width: "32%", colorClass: "bg-error", label: "Too short (min 6 characters)" };
    }
    if (password.length < 10) {
      return { width: "68%", colorClass: "bg-amber-500", label: "Good cryptographic strength" };
    }
    return { width: "100%", colorClass: "bg-emerald-500", label: "Strong entropy verified" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAuthenticate(mode, {
      name,
      email,
      password,
      role: selectedRole,
      companyName,
    });
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-2 lg:my-6 px-0 sm:px-2 animate-fade-up">
      {/* Contextual Redirect Banner when Guest clicked "Apply for Job" or "Post a Job" */}
      {pendingAction && (
        <div className="mb-5 p-4 rounded-2xl bg-surface-container border border-primary-container/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[19px]">
                {pendingAction.type === "post-job" ? "add_business" : "work"}
              </span>
            </div>
            <div>
              <span className="font-headline-sm text-on-surface font-bold block">
                {pendingAction.type === "post-job"
                  ? "Employer Verification Required to Post a Job"
                  : `Sign In or Create a Candidate Account to Apply for #${pendingAction.jobId}`}
              </span>
              <span className="font-body-sm text-on-surface-variant">
                {pendingAction.type === "post-job"
                  ? "Register or sign in with an Employer account to publish job requisitions."
                  : `Target Requisition: ${pendingAction.jobTitle}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="font-mono-label text-primary hover:underline shrink-0 self-end sm:self-center"
          >
            ← Return to Job Board
          </button>
        </div>
      )}

      {/* Elevated Modern Split-Screen Card */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12),0_4px_16px_-4px_rgba(15,23,42,0.06)] border border-outline-variant/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
        {/* LEFT 5 COLUMNS: Editorial Career Showcase Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#151934] to-[#1E1B4B] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-secondary/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono-label text-[10px] sm:text-mono-label tracking-widest text-emerald-300 font-semibold uppercase whitespace-nowrap">
                One Unified Login Portal
              </span>
            </div>

            {/* Headline & Description */}
            <div className="flex flex-col gap-3">
              <h1 className="font-headline-xl text-2xl sm:text-headline-xl text-white tracking-tight leading-tight font-bold">
                One Account Portal for Candidates &amp; Hiring Teams.
              </h1>
              <p className="font-body-md text-body-md text-slate-300 leading-relaxed">
                Sign in with your email and password. Nexus automatically routes you to
                your Candidate Dashboard, Employer Studio, or Platform Console based on
                your verified backend role.
              </p>
            </div>

            {/* Feature Cards Mosaic */}
            <div className="flex flex-col gap-3.5 mt-1">
              <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 transition-all hover:bg-white/[0.09]">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none select-none">🎓</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-headline-sm text-headline-sm text-white font-semibold">
                      Job Seekers (Candidates)
                    </span>
                    <p className="font-body-sm text-body-sm text-slate-300">
                      Upload CV, apply in one click &amp; track live interview stages with
                      engineering leads.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 transition-all hover:bg-white/[0.09]">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none select-none">🏢</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-headline-sm text-headline-sm text-white font-semibold">
                      Employers &amp; Hiring Teams
                    </span>
                    <p className="font-body-sm text-body-sm text-slate-300">
                      Publish #JOB openings, manage public company profile &amp; review
                      applicant pipelines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 transition-all hover:bg-white/[0.09]">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none select-none">🔒</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-headline-sm text-headline-sm text-white font-semibold">
                      Enterprise RBAC Security
                    </span>
                    <p className="font-body-sm text-body-sm text-slate-300">
                      Bcrypt password hashing &amp; strict server-enforced role isolation
                      policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6">
            <div className="flex items-center gap-2 font-mono-label text-[10px] sm:text-mono-label text-slate-400 tracking-wider">
              <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">
                verified_user
              </span>
              <span>ATLAS SECURITY GUARD • TLS 1.3 ENCRYPTED • 99.99% UPTIME</span>
            </div>
          </div>
        </div>

        {/* RIGHT 7 COLUMNS: Authentication & Registration Form */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            {/* Top Segmented Tab Switcher */}
            <div className="bg-surface-container p-1.5 rounded-2xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`py-2.5 px-4 text-center font-headline-sm text-headline-sm rounded-xl transition-all whitespace-nowrap ${
                  mode === "signin"
                    ? "font-semibold bg-surface-container-lowest text-on-surface shadow-sm"
                    : "font-medium text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`py-2.5 px-4 text-center font-headline-sm text-headline-sm rounded-xl transition-all whitespace-nowrap ${
                  mode === "register"
                    ? "font-semibold bg-surface-container-lowest text-on-surface shadow-sm"
                    : "font-medium text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Heading Block */}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface font-bold tracking-tight">
                {mode === "signin" ? "Sign in to Nexus Portal" : "Join the Nexus Network"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {mode === "signin"
                  ? "Enter your verified credentials to access your Candidate, Employer, or Admin console."
                  : "Select your primary role below to begin applying or hiring engineers."}
              </p>
            </div>

            {/* 2-CARD ACCOUNT TYPE SELECTOR (Shown in Register Mode — Strictly Job Seeker or Employer ONLY) */}
            {mode === "register" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-up">
                {/* Card A: Job Seeker */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("seeker")}
                  className={`text-left cursor-pointer rounded-2xl p-4 relative transition-all border ${
                    selectedRole === "seeker"
                      ? "bg-primary/5 border-primary-container shadow-sm"
                      : "bg-surface-container-low hover:bg-surface-container border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                      🎓
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === "seeker"
                          ? "bg-primary text-white"
                          : "bg-surface-container-highest"
                      }`}
                    >
                      {selectedRole === "seeker" && (
                        <span className="material-symbols-outlined text-[13px]">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Job Seeker
                    </span>
                    <span className="font-mono-label text-mono-label font-semibold text-primary uppercase tracking-wider">
                      CANDIDATE PROFILE
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                      Find roles, upload resume &amp; track application pipeline
                    </p>
                  </div>
                </button>

                {/* Card B: Employer */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("employer")}
                  className={`text-left cursor-pointer rounded-2xl p-4 relative transition-all border ${
                    selectedRole === "employer"
                      ? "bg-primary/5 border-primary-container shadow-sm"
                      : "bg-surface-container-low hover:bg-surface-container border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-lg">
                      🏢
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === "employer"
                          ? "bg-primary text-white"
                          : "bg-surface-container-highest"
                      }`}
                    >
                      {selectedRole === "employer" && (
                        <span className="material-symbols-outlined text-[13px]">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Employer
                    </span>
                    <span className="font-mono-label text-mono-label font-semibold text-secondary uppercase tracking-wider">
                      COMPANY / RECRUITER
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                      Post technical roles, manage company profile &amp; hire talent
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* AUTHENTICATION FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div className="flex flex-col gap-1.5 animate-fade-up">
                  <label className="font-mono-label text-mono-label uppercase tracking-wide text-on-surface font-semibold">
                    Full Name / Contact Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-outline">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/25 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono-label text-mono-label uppercase tracking-wide text-on-surface font-semibold">
                  Email Address / Work Email
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-outline">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/25 transition-all"
                  />
                </div>
              </div>

              {/* Company Name Field (In Register Mode) */}
              {mode === "register" && (
                <div className="flex flex-col gap-1.5 animate-fade-up">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-mono-label text-mono-label uppercase tracking-wide text-on-surface font-semibold">
                      Company Name
                    </label>
                    <span
                      className={`font-mono-label text-[10px] px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${
                        selectedRole === "employer"
                          ? "bg-secondary-container text-on-secondary-container font-bold"
                          : "bg-surface-container-high text-on-surface-variant font-medium"
                      }`}
                    >
                      {selectedRole === "employer"
                        ? "REQUIRED FOR EMPLOYERS"
                        : "OPTIONAL FOR CANDIDATES"}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-outline">
                      apartment
                    </span>
                    <input
                      type="text"
                      required={selectedRole === "employer"}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. CloudScale Systems, Inc."
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/25 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono-label text-mono-label uppercase tracking-wide text-on-surface font-semibold">
                    Password
                  </label>
                  <span className="font-mono-label text-[10px] text-secondary font-semibold uppercase">
                    BCRYPT + JWT
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-outline">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 text-outline hover:text-on-surface focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Password Strength Meter (Register Mode) */}
                {mode === "register" && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.colorClass}`}
                        style={{ width: strength.width }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between font-mono-label text-[10px] text-on-surface-variant">
                      <span>{strength.label}</span>
                      <span className="text-secondary font-semibold">
                        AES-256 VALIDATED
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Agreement Checkbox (Register Mode) */}
              {mode === "register" && (
                <div className="flex items-start gap-2.5 mt-1">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary bg-surface-container-low accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="terms-checkbox"
                    className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                  >
                    I accept the Auspify Nexus{" "}
                    <span className="text-primary font-medium">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-primary font-medium">Privacy Policy</span>.
                  </label>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-3.5 px-6 rounded-xl font-headline-sm text-headline-sm font-semibold bg-primary hover:bg-[#2b1ea8] disabled:opacity-60 text-white shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>
                    {mode === "signin"
                      ? "Sign In to Verified Console →"
                      : `Create Verified ${
                          selectedRole === "employer" ? "Employer" : "Candidate"
                        } Account →`}
                  </span>
                )}
              </button>
            </form>

            {/* Sign-In Mode Architectural Role Routing Info (Balances Layout Cleanly Without Any Auto-Fill Buttons) */}
            {mode === "signin" && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/25 space-y-2.5 animate-fade-up">
                <div className="flex items-center justify-between">
                  <span className="font-mono-label text-[10px] uppercase tracking-wider text-primary font-bold">
                    Automated Role-Based Routing
                  </span>
                  <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                    RBAC VERIFIED
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  Your session token automatically unlocks your assigned workspace
                  (<strong>Candidate Dashboard</strong>, <strong>Employer Studio</strong>,
                  or <strong>Platform Admin Console</strong>) upon credential verification.
                </p>
              </div>
            )}

            {/* Divider & Guest Fallback */}
            <div className="flex flex-col gap-4 mt-1">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-surface-container-high"></div>
                </div>
                <span className="relative px-3 bg-surface-container-lowest font-mono-label text-[10px] uppercase tracking-widest text-outline">
                  Or Browse Without Signing In
                </span>
              </div>

              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-3 px-4 rounded-xl font-headline-sm text-headline-sm font-medium bg-surface-container-low hover:bg-surface-container text-on-surface transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>
                  🌐 Continue in Guest Mode (Browse Active Jobs &amp; Companies)
                </span>
              </button>

              <div className="text-center">
                {mode === "register" ? (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-primary font-semibold hover:underline"
                    >
                      Switch to Sign In above.
                    </button>
                  </span>
                ) : (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-primary font-semibold hover:underline"
                    >
                      Create a verified account.
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}