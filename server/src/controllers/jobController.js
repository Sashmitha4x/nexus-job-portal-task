import Job from "../models/Job.js";
import CompanyProfile from "../models/CompanyProfile.js";
import Application from "../models/Application.js";
import { isDbConnected } from "../config/db.js";
import { memoryApplications } from "./applicationController.js";

export const INITIAL_COMPANIES = [
  {
    companyId: "CMP-2026-001",
    employerEmail: "employer@auspify.com",
    companyName: "Auspify Cloud Labs",
    initials: "ACL",
    logoUrl: "",
    badgeColor: "indigo",
    industry: "Enterprise Cloud & SaaS",
    location: "Colombo 07 & San Francisco",
    website: "https://auspify.com",
    companySize: "140+ Engineers",
    fundingStage: "Series B",
    rating: "4.9 / 5.0",
    description:
      "Auspify Cloud Labs delivers mission-critical distributed cloud primitives, scalable API orchestration frameworks, and high-performance developer tooling platforms for Fortune 500 engineering organizations.",
    verified: true,
  },
  {
    companyId: "CMP-2026-002",
    employerEmail: "careers@stratumdata.io",
    companyName: "Stratum Data Systems",
    initials: "STR",
    logoUrl: "",
    badgeColor: "slate",
    industry: "Distributed Storage & Streaming",
    location: "Singapore & Global Remote",
    website: "https://stratumdata.io",
    companySize: "85+ Engineers",
    fundingStage: "Series C",
    rating: "4.8 / 5.0",
    description:
      "Stratum Data Systems builds zero-latency event streaming engines and cloud-native Kubernetes storage fabrics processing over 40 billion events per day.",
    verified: true,
  },
  {
    companyId: "CMP-2026-003",
    employerEmail: "talent@nexusfoundry.design",
    companyName: "Nexus Design Foundry",
    initials: "NEX",
    logoUrl: "",
    badgeColor: "teal",
    industry: "Design Systems & UI Tooling",
    location: "San Francisco, CA & Remote",
    website: "https://nexusfoundry.design",
    companySize: "45+ Designers & Engineers",
    fundingStage: "Series A",
    rating: "4.9 / 5.0",
    description:
      "Nexus Design Foundry crafts multi-brand design token compilers, accessible component primitives, and collaborative canvas interfaces for modern product teams.",
    verified: true,
  },
  {
    companyId: "CMP-2026-004",
    employerEmail: "hiring@vertexquantum.ai",
    companyName: "Vertex Quantum AI",
    initials: "VRT",
    logoUrl: "",
    badgeColor: "violet",
    industry: "Applied AI & Foundation Models",
    location: "Austin, TX & London, UK",
    website: "https://vertexquantum.ai",
    companySize: "110+ Researchers",
    fundingStage: "Series B",
    rating: "4.8 / 5.0",
    description:
      "Vertex Quantum AI researches low-latency inference kernels, distributed GPU cluster scheduling, and domain-specific reasoning models for scientific computing.",
    verified: true,
  },
  {
    companyId: "CMP-2026-005",
    employerEmail: "people@heliospay.fin",
    companyName: "Helios FinTech Core",
    initials: "HFC",
    logoUrl: "",
    badgeColor: "indigo",
    industry: "Global Payment Infrastructure",
    location: "Colombo & Zurich, CH",
    website: "https://heliospay.io",
    companySize: "210+ Engineers",
    fundingStage: "Series C",
    rating: "4.7 / 5.0",
    description:
      "Helios FinTech Core powers real-time cross-border treasury settlement, ISO-20022 ledger reconciliation, and cryptographic fraud detection APIs.",
    verified: true,
  },
  {
    companyId: "CMP-2026-006",
    employerEmail: "jobs@kronoscyber.sec",
    companyName: "Kronos Zero-Trust Security",
    initials: "KZS",
    logoUrl: "",
    badgeColor: "teal",
    industry: "Cloud Security & Identity",
    location: "Remote Worldwide",
    website: "https://kronossecurity.dev",
    companySize: "65+ Security Engineers",
    fundingStage: "Series A",
    rating: "4.9 / 5.0",
    description:
      "Kronos builds hardware-backed WebAuthn identity proxies, eBPF runtime threat sensors, and automated zero-trust mesh networks for cloud-native teams.",
    verified: true,
  },
];

const futureDate = (days) => new Date(Date.now() + days * 86400 * 1000).toISOString();

export const INITIAL_JOBS = [
  {
    jobId: "JOB-2026-001",
    companyId: "CMP-2026-001",
    employerEmail: "employer@auspify.com",
    companyName: "Auspify Cloud Labs",
    companyInitials: "ACL",
    companyBadgeColor: "indigo",
    title: "Senior Full-Stack Engineer (React / Node.js)",
    department: "Core Infrastructure Team",
    category: "Frontend & Full-Stack",
    jobType: "Full-Time",
    workMode: "Remote",
    location: "Colombo / Remote",
    experienceLevel: "Senior (5+ Yrs)",
    salaryMin: 120000,
    salaryMax: 145000,
    skills: ["React 19", "Node.js", "TypeScript", "MongoDB Atlas", "AWS ECS", "Tailwind CSS"],
    overview:
      "Auspify Cloud Labs is seeking a Senior Full-Stack Engineer to lead development of our distributed control plane interface and backend microservice orchestration. In this role, you will construct sub-millisecond real-time dashboards, abstract complex multi-cloud resources into unified API endpoints, and ensure 99.99% system availability under peak developer workloads.",
    responsibilities: [
      "Architect scalable React 19 micro-frontend interfaces with modular state caching and zero layout shift.",
      "Engineer high-throughput Node.js microservices interfacing with MongoDB Atlas clusters and Redis memory tiers.",
      "Deploy robust continuous integration pipelines targeting AWS ECS Fargate and containerized microservice fabrics.",
      "Mentor mid-level platform engineers through systematic code reviews and design architecture RFCs.",
    ],
    requirements: [
      "5+ years building production full-stack web platforms using React, TypeScript, and Node.js.",
      "Deep understanding of MongoDB schema design, compound indexing, and REST API security.",
    ],
    benefits: [
      "$2,500 Home Ergonomics & Hardware Budget",
      "Flexible Time Off & Async Working Cadence",
      "Comprehensive Health & Global Travel Insurance",
      "$1,500 Annual Research & Conference Stipend",
    ],
    fastReview: true,
    highlightNote: "Fast Review (48h)",
    expiresAt: futureDate(30),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 3,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    jobId: "JOB-2026-002",
    companyId: "CMP-2026-002",
    employerEmail: "careers@stratumdata.io",
    companyName: "Stratum Data Systems",
    companyInitials: "STR",
    companyBadgeColor: "slate",
    title: "Backend Cloud Architect (Golang & Kubernetes)",
    department: "Distributed Systems Group",
    category: "Cloud, DevOps & SRE",
    jobType: "Full-Time",
    workMode: "Hybrid",
    location: "Singapore / Remote",
    experienceLevel: "Staff (6+ Yrs)",
    salaryMin: 150000,
    salaryMax: 175000,
    skills: ["Go 1.23", "Kubernetes", "gRPC", "Kafka", "Terraform", "Prometheus"],
    overview:
      "Stratum Data Systems is looking for a Backend Cloud Architect to design fault-tolerant data ingestion pipelines and multi-region Kubernetes operators capable of handling petabyte-scale telemetry streams.",
    responsibilities: [
      "Design and implement low-latency gRPC microservices in Go with strict memory and concurrency guarantees.",
      "Build custom Kubernetes controllers and Helm operators for automated multi-region cluster failover.",
      "Optimize Apache Kafka partition throughput and zero-copy serialization pathways.",
    ],
    requirements: [
      "6+ years in backend systems engineering with strong production Golang and Kubernetes mastery.",
    ],
    benefits: [
      "$3,000 Workstation & Lab Setup Allowance",
      "Annual Global Engineering Summit Retreat",
      "Comprehensive Family Medical & Dental Coverage",
      "Competitive Series C Equity Grant",
    ],
    fastReview: false,
    highlightNote: "4 Applicants",
    expiresAt: futureDate(25),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 4,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    jobId: "JOB-2026-003",
    companyId: "CMP-2026-003",
    employerEmail: "talent@nexusfoundry.design",
    companyName: "Nexus Design Foundry",
    companyInitials: "NEX",
    companyBadgeColor: "teal",
    title: "Staff Product Designer — Design Systems",
    department: "Design Architecture Studio",
    category: "Product & Design Systems",
    jobType: "Contract",
    workMode: "Remote",
    location: "San Francisco, CA / Remote",
    experienceLevel: "Staff (5+ Yrs)",
    salaryMin: 130000,
    salaryMax: 155000,
    skills: ["Figma Tokens", "Design Systems", "WCAG 2.2", "React UI", "CSS Architecture"],
    overview:
      "Lead the evolution of the Nexus Editorial Design System across web and desktop engineering tools. You will bridge the gap between Figma token primitives and production React component libraries.",
    responsibilities: [
      "Own the end-to-end architecture of our multi-theme design token pipeline and Figma component library.",
      "Collaborate directly with frontend engineers to enforce WCAG 2.2 AA accessibility and keyboard navigation.",
    ],
    requirements: [
      "5+ years crafting complex B2B SaaS or developer-tool interfaces and scalable design systems.",
    ],
    benefits: [
      "$2,500 Apple Studio Display & MacBook Pro Setup",
      "100% Remote Work from Anywhere",
      "Quarterly Design Book & Tooling Stipend",
      "Paid Sabbatical Renewal Program",
    ],
    fastReview: true,
    highlightNote: "Top Tier Compensation",
    expiresAt: futureDate(21),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 2,
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
  },
  {
    jobId: "JOB-2026-004",
    companyId: "CMP-2026-004",
    employerEmail: "hiring@vertexquantum.ai",
    companyName: "Vertex Quantum AI",
    companyInitials: "VRT",
    companyBadgeColor: "violet",
    title: "Lead Machine Learning Engineer (LLMs / PyTorch)",
    department: "Foundation Inference Lab",
    category: "Data Science & ML",
    jobType: "Full-Time",
    workMode: "On-Site",
    location: "Austin, TX / London",
    experienceLevel: "Lead (5+ Yrs)",
    salaryMin: 160000,
    salaryMax: 190000,
    skills: ["PyTorch", "CUDA", "Distributed GPU", "Python", "vLLM", "TensorRT"],
    overview:
      "Lead our Foundation Inference Lab in optimizing transformer quantization, speculative decoding, and multi-node H100 GPU cluster utilization for real-time code generation models.",
    responsibilities: [
      "Profile and optimize custom CUDA kernels and PyTorch inference pipelines to cut token latency by 40%.",
      "Orchestrate multi-node training and fine-tuning runs across distributed GPU clusters.",
    ],
    requirements: [
      "5+ years in deep learning infrastructure, PyTorch model optimization, and GPU systems.",
    ],
    benefits: [
      "Dedicated H100 Compute Cluster Allocation",
      "H1-B Visa Sponsorship & Relocation Package",
      "Full Executive Healthcare & 401(k) Match",
      "$3,000 NeurIPS / ICML Conference Travel Budget",
    ],
    fastReview: false,
    highlightNote: "H1-B Sponsorship Eligible",
    expiresAt: futureDate(35),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 5,
    createdAt: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
  },
  {
    jobId: "JOB-2026-005",
    companyId: "CMP-2026-005",
    employerEmail: "people@heliospay.fin",
    companyName: "Helios FinTech Core",
    companyInitials: "HFC",
    companyBadgeColor: "indigo",
    title: "Principal Distributed Ledger & API Engineer",
    department: "Settlement Core",
    category: "Engineering, Systems & AI",
    jobType: "Full-Time",
    workMode: "Hybrid",
    location: "Colombo 07 / Zurich",
    experienceLevel: "Principal (7+ Yrs)",
    salaryMin: 140000,
    salaryMax: 170000,
    skills: ["Node.js", "PostgreSQL", "Rust", "Kafka", "ISO-20022", "Cryptography"],
    overview:
      "Architect deterministic double-entry settlement engines and high-availability payment gateways processing multi-currency institutional transfers across 40+ countries.",
    responsibilities: [
      "Guarantee idempotent transaction processing and cryptographic auditability across distributed ledgers.",
      "Lead architecture reviews for PCI-DSS Level 1 compliant microservice APIs.",
    ],
    requirements: [
      "7+ years building high-reliability FinTech, banking, or mission-critical backend systems.",
    ],
    benefits: [
      "Annual Zurich Engineering Exchange Program",
      "Executive Performance Bonus & Equity Pool",
      "Private Medical Insurance for Family",
      "$2,000 Ergonomic Workspace Grant",
    ],
    fastReview: true,
    highlightNote: "Fast Review (48h)",
    expiresAt: futureDate(28),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 2,
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
  },
  {
    jobId: "JOB-2026-006",
    companyId: "CMP-2026-006",
    employerEmail: "jobs@kronoscyber.sec",
    companyName: "Kronos Zero-Trust Security",
    companyInitials: "KZS",
    companyBadgeColor: "teal",
    title: "Cloud Security & Identity Platform Engineer",
    department: "Zero-Trust Mesh Team",
    category: "Cloud, DevOps & SRE",
    jobType: "Full-Time",
    workMode: "Remote",
    location: "Remote Worldwide",
    experienceLevel: "Mid-Senior (4+ Yrs)",
    salaryMin: 115000,
    salaryMax: 140000,
    skills: ["WebAuthn", "OAuth 2.1", "Node.js", "Docker", "Linux eBPF", "TLS 1.3"],
    overview:
      "Build next-generation passwordless authentication proxies, FIDO2/WebAuthn passkey brokers, and automated mTLS certificate rotation engines for enterprise cloud fleets.",
    responsibilities: [
      "Implement OIDC, OAuth 2.1, and WebAuthn cryptographic verification flows in Node.js and Go.",
      "Develop real-time session anomaly detection and automated token revocation webhooks.",
    ],
    requirements: [
      "4+ years in application security, identity & access management (IAM), or cloud infrastructure.",
    ],
    benefits: [
      "$2,500 Security Lab & Hardware Key Allowance",
      "100% Remote Global Contract",
      "SANS / OSCP Certification Sponsorship",
      "32 Days Paid Annual Leave",
    ],
    fastReview: true,
    highlightNote: "100% Remote Worldwide",
    expiresAt: futureDate(40),
    status: "Active",
    removalReason: "",
    employerResolutionNote: "",
    applicantsCount: 3,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

export let memoryCompanies = [...INITIAL_COMPANIES];
export let memoryJobs = [...INITIAL_JOBS];

const ensureSeeded = async () => {
  if (!isDbConnected()) return;
  const companyCount = await CompanyProfile.countDocuments();
  if (companyCount === 0) {
    await CompanyProfile.insertMany(INITIAL_COMPANIES);
  }
  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    await Job.insertMany(INITIAL_JOBS);
  }
};

export const generateNextJobId = async () => {
  if (isDbConnected()) {
    const docs = await Job.find({}, { jobId: 1 }).lean();
    const max = docs.reduce((acc, d) => {
      const m = String(d.jobId || "").match(/JOB-\d{4}-(\d+)/i);
      const n = m ? parseInt(m[1], 10) : 0;
      return n > acc ? n : acc;
    }, 0);
    return `JOB-2026-${String(max + 1).padStart(3, "0")}`;
  }
  const maxMem = memoryJobs.reduce((acc, d) => {
    const m = String(d.jobId || "").match(/JOB-\d{4}-(\d+)/i);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > acc ? n : acc;
  }, 0);
  return `JOB-2026-${String(maxMem + 1).padStart(3, "0")}`;
};

// GET /api/v1/jobs (Computes real-time applicantsCount from Application records & ensures every job has expiresAt)
export const getJobs = async (req, res, next) => {
  try {
    await ensureSeeded();
    const {
      q = "",
      location = "",
      workMode = "ALL",
      category = "ALL",
      jobType = "ALL",
      minSalary = 0,
      companyId = "",
      includeAll = "false",
    } = req.query;

    const now = new Date();
    const defaultFutureExpiry = new Date(Date.now() + 30 * 86400 * 1000);

    let jobs = [];
    if (isDbConnected()) {
      // 1. Backfill expiresAt on any older seeded jobs that don't have one yet
      await Job.updateMany(
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }] },
        { $set: { expiresAt: defaultFutureExpiry } }
      );

      // 2. Auto-expire any Active job whose expiresAt date has passed
      await Job.updateMany(
        { status: "Active", expiresAt: { $ne: null, $lt: now } },
        { $set: { status: "Expired" } }
      );

      const filter = {};
      if (includeAll !== "true") {
        filter.status = "Active";
      }
      if (workMode && workMode !== "ALL") filter.workMode = workMode;
      if (category && category !== "ALL") filter.category = category;
      if (jobType && jobType !== "ALL") filter.jobType = jobType;
      if (Number(minSalary) > 0) filter.salaryMax = { $gte: Number(minSalary) };
      if (companyId) filter.companyId = companyId.toUpperCase();

      const rawJobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

      // 3. Compute exact real applicant count per jobId from Application collection
      const appCounts = await Application.aggregate([
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ]);
      const countMap = {};
      appCounts.forEach((item) => {
        if (item._id) countMap[String(item._id).toUpperCase()] = item.count;
      });

      jobs = rawJobs.map((j) => ({
        ...j,
        expiresAt: j.expiresAt || defaultFutureExpiry,
        applicantsCount: countMap[String(j.jobId).toUpperCase()] ?? 0,
      }));
    } else {
      memoryJobs = memoryJobs.map((j) => {
        const exp = j.expiresAt || defaultFutureExpiry.toISOString();
        const isPast = j.status === "Active" && new Date(exp) < now;
        const realCount = memoryApplications.filter(
          (a) => a.jobId === j.jobId
        ).length;
        return {
          ...j,
          expiresAt: exp,
          status: isPast ? "Expired" : j.status,
          applicantsCount: realCount,
        };
      });
      jobs = [...memoryJobs];
      if (includeAll !== "true") {
        jobs = jobs.filter((j) => j.status === "Active");
      }
      if (workMode && workMode !== "ALL")
        jobs = jobs.filter((j) => j.workMode === workMode);
      if (category && category !== "ALL")
        jobs = jobs.filter((j) => j.category === category);
      if (jobType && jobType !== "ALL")
        jobs = jobs.filter((j) => j.jobType === jobType);
      if (Number(minSalary) > 0)
        jobs = jobs.filter((j) => j.salaryMax >= Number(minSalary));
      if (companyId)
        jobs = jobs.filter((j) => j.companyId === companyId.toUpperCase());
    }

    const searchClean = q.toLowerCase().trim();
    const locClean = location.toLowerCase().trim();

    if (searchClean) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchClean) ||
          j.companyName.toLowerCase().includes(searchClean) ||
          j.jobId.toLowerCase().includes(searchClean) ||
          (j.skills || []).some((s) => s.toLowerCase().includes(searchClean))
      );
    }

    if (locClean) {
      jobs = jobs.filter(
        (j) =>
          j.location.toLowerCase().includes(locClean) ||
          j.workMode.toLowerCase().includes(locClean)
      );
    }

    res.status(200).json({
      success: true,
      dbConnected: isDbConnected(),
      count: jobs.length,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanies = async (_req, res, next) => {
  try {
    await ensureSeeded();
    if (isDbConnected()) {
      const companies = await CompanyProfile.find().sort({ companyId: 1 }).lean();
      return res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
      });
    }
    res.status(200).json({
      success: true,
      count: memoryCompanies.length,
      data: memoryCompanies,
    });
  } catch (err) {
    next(err);
  }
};

export const upsertCompanyProfile = async (req, res, next) => {
  try {
    const {
      companyId,
      companyName,
      logoUrl,
      industry,
      location,
      website,
      companySize,
      fundingStage,
      description,
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company Name is required.",
      });
    }

    const cleanName = companyName.trim();
    const initials = cleanName
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

    if (isDbConnected()) {
      let profile = await CompanyProfile.findOne({
        $or: [
          { employer: req.user._id },
          { employerEmail: req.user.email },
          ...(companyId ? [{ companyId: companyId.toUpperCase() }] : []),
        ],
      });

      const previousName = profile?.companyName || req.user.companyName || cleanName;

      if (!profile) {
        const count = await CompanyProfile.countDocuments();
        profile = await CompanyProfile.create({
          companyId: `CMP-2026-${String(count + 1).padStart(3, "0")}`,
          employer: req.user._id,
          employerEmail: req.user.email,
          companyName: cleanName,
          initials: initials || "CO",
          logoUrl: logoUrl ?? "",
          industry: industry || "Enterprise Cloud & SaaS",
          location: location || "Colombo / Remote",
          website: website || "https://auspify.com",
          companySize: companySize || "50+ Engineers",
          fundingStage: fundingStage || "Verified",
          description: description || "",
          verified: true,
        });
      } else {
        profile.companyName = cleanName;
        profile.initials = initials || profile.initials;
        if (logoUrl !== undefined) profile.logoUrl = logoUrl;
        if (industry !== undefined) profile.industry = industry;
        if (location !== undefined) profile.location = location;
        if (website !== undefined) profile.website = website;
        if (companySize !== undefined) profile.companySize = companySize;
        if (fundingStage !== undefined) profile.fundingStage = fundingStage;
        if (description !== undefined) profile.description = description;
        await profile.save();
      }

      await Job.updateMany(
        {
          $or: [
            { employerEmail: req.user.email },
            { companyId: profile.companyId },
            { companyName: previousName },
          ],
        },
        {
          $set: {
            companyName: profile.companyName,
            companyInitials: profile.initials,
            companyLogo: profile.logoUrl,
          },
        }
      );

      await Application.updateMany(
        {
          $or: [
            { employerEmail: req.user.email },
            { companyId: profile.companyId },
            { companyName: previousName },
          ],
        },
        {
          $set: {
            companyName: profile.companyName,
            companyInitials: profile.initials,
            companyLogo: profile.logoUrl,
          },
        }
      ).catch(() => {});

      return res.status(200).json({ success: true, data: profile });
    }

    let memProfile = memoryCompanies.find(
      (c) =>
        c.employerEmail === req.user.email ||
        (companyId && c.companyId === companyId)
    );
    if (!memProfile) {
      memProfile = {
        companyId: `CMP-2026-${String(memoryCompanies.length + 1).padStart(3, "0")}`,
        employerEmail: req.user.email,
        companyName: cleanName,
        initials: initials || "CO",
        logoUrl: logoUrl || "",
        badgeColor: "indigo",
        industry: industry || "Enterprise Cloud & SaaS",
        location: location || "Colombo / Remote",
        website: website || "https://auspify.com",
        companySize: companySize || "50+ Engineers",
        fundingStage: fundingStage || "Verified",
        rating: "4.9 / 5.0",
        description: description || "",
        verified: true,
      };
      memoryCompanies.push(memProfile);
    } else {
      Object.assign(memProfile, {
        companyName: cleanName,
        initials: initials || memProfile.initials,
        logoUrl: logoUrl ?? memProfile.logoUrl,
        industry: industry ?? memProfile.industry,
        location: location ?? memProfile.location,
        website: website ?? memProfile.website,
        companySize: companySize ?? memProfile.companySize,
        fundingStage: fundingStage ?? memProfile.fundingStage,
        description: description ?? memProfile.description,
      });
    }

    memoryJobs = memoryJobs.map((j) =>
      j.employerEmail === req.user.email || j.companyId === memProfile.companyId
        ? {
            ...j,
            companyName: memProfile.companyName,
            companyInitials: memProfile.initials,
            companyLogo: memProfile.logoUrl,
          }
        : j
    );

    res.status(200).json({ success: true, data: memProfile });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const jobId = await generateNextJobId();
    const companyName = req.body.companyName || req.user.companyName || "Auspify Cloud Labs";
    const companyInitials = companyName
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

    const defaultExpiry = new Date(Date.now() + 30 * 86400 * 1000);
    const parsedExpiry = req.body.expiresAt ? new Date(req.body.expiresAt) : defaultExpiry;

    const payload = {
      jobId,
      employer: req.user._id,
      employerEmail: req.user.email,
      companyId: req.body.companyId || "CMP-2026-001",
      companyName,
      companyInitials: companyInitials || "ACL",
      companyLogo: req.body.companyLogo || "",
      title: req.body.title,
      department: req.body.department || "Core Engineering",
      category: req.body.category || "Engineering, Systems & AI",
      jobType: req.body.jobType || "Full-Time",
      workMode: req.body.workMode || "Remote",
      location: req.body.location || "Colombo / Remote",
      experienceLevel: req.body.experienceLevel || "Senior (5+ Yrs)",
      salaryMin: Number(req.body.salaryMin || 110000),
      salaryMax: Number(req.body.salaryMax || 140000),
      skills: Array.isArray(req.body.skills)
        ? req.body.skills
        : String(req.body.skills || "React, Node.js, TypeScript")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      overview: req.body.overview || "High-impact technical role.",
      responsibilities: Array.isArray(req.body.responsibilities)
        ? req.body.responsibilities
        : String(req.body.responsibilities || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
      requirements: Array.isArray(req.body.requirements)
        ? req.body.requirements
        : String(req.body.requirements || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
      expiresAt: isNaN(parsedExpiry.getTime()) ? defaultExpiry : parsedExpiry,
      status: "Active",
      removalReason: "",
      employerResolutionNote: "",
      fastReview: true,
      highlightNote: "Direct Hiring Manager",
    };

    if (isDbConnected()) {
      const created = await Job.create(payload);
      return res.status(201).json({ success: true, data: created });
    }

    const memCreated = {
      ...payload,
      expiresAt: payload.expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      applicantsCount: 0,
    };
    memoryJobs = [memCreated, ...memoryJobs];
    res.status(201).json({ success: true, data: memCreated });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId.toUpperCase();
    if (isDbConnected()) {
      const existing = await Job.findOne({ jobId });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Job requisition not found." });
      }
      if (
        req.user.role !== "admin" &&
        existing.employerEmail &&
        existing.employerEmail !== req.user.email
      ) {
        return res.status(403).json({
          success: false,
          message: "Ownership check failed: You can only modify your own job listings.",
        });
      }

      // If the job was Hidden by Admin and the Employer edits & resolves it, transition to "Pending Review" for Admin to Approve & Unhide!
      if (existing.status === "Hidden" && req.user.role === "employer") {
        req.body.status = "Pending Review";
        req.body.employerResolutionNote =
          req.body.employerResolutionNote ||
          "Employer updated the requisition and submitted for Admin approval to unhide.";
      } else if (req.body.status === "Active" && req.user.role === "admin") {
        existing.removalReason = "";
        existing.employerResolutionNote = "";
      }

      Object.assign(existing, req.body);
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    memoryJobs = memoryJobs.map((j) => {
      if (j.jobId !== jobId) return j;
      const nextStatus =
        j.status === "Hidden" && req.user.role === "employer"
          ? "Pending Review"
          : req.body.status || j.status;
      return {
        ...j,
        ...req.body,
        status: nextStatus,
        employerResolutionNote:
          nextStatus === "Pending Review"
            ? req.body.employerResolutionNote ||
              "Employer updated the requisition and submitted for Admin review."
            : j.employerResolutionNote,
      };
    });
    const updated = memoryJobs.find((j) => j.jobId === jobId);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId.toUpperCase();
    if (isDbConnected()) {
      await Job.findOneAndDelete({ jobId });
      return res.status(200).json({ success: true, message: `Job #${jobId} removed.` });
    }
    memoryJobs = memoryJobs.filter((j) => j.jobId !== jobId);
    res.status(200).json({ success: true, message: `Job #${jobId} removed.` });
  } catch (err) {
    next(err);
  }
};