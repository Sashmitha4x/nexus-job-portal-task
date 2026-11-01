export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", rate: 1, label: "USD ($)" },
  LKR: { code: "LKR", symbol: "Rs. ", rate: 302, label: "LKR (Rs.)" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, label: "EUR (€)" },
  GBP: { code: "GBP", symbol: "£", rate: 0.79, label: "GBP (£)" },
};

export const formatSalaryBand = (minUSD = 120000, maxUSD = 145000, currency = "USD", compact = false) => {
  const cur = CURRENCIES[currency] || CURRENCIES.USD;
  const minVal = Math.round(Number(minUSD) * cur.rate);
  const maxVal = Math.round(Number(maxUSD) * cur.rate);

  if (compact) {
    const fmtK = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
    return `${cur.symbol}${fmtK(minVal)} – ${cur.symbol}${fmtK(maxVal)}`;
  }
  return `${cur.symbol}${minVal.toLocaleString()} – ${cur.symbol}${maxVal.toLocaleString()} / yr`;
};

export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return "Posted recently";
  const diffHours = Math.max(1, Math.round((Date.now() - new Date(isoDate).getTime()) / 3600000));
  if (diffHours < 24) return `Posted ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(diffHours / 24);
  return `Posted ${days} ${days === 1 ? "day" : "days"} ago`;
};

export const WORK_MODES = [
  { id: "ALL", label: "All Modes" },
  { id: "Remote", label: "Remote Only", icon: "public" },
  { id: "Hybrid", label: "Hybrid", icon: "apartment" },
  { id: "On-Site", label: "On-Site", icon: "location_on" },
];

export const JOB_CATEGORIES = [
  { value: "ALL", label: "All Engineering & Product Domains" },
  { value: "Engineering, Systems & AI", label: "Engineering, Systems & AI" },
  { value: "Frontend & Full-Stack", label: "Frontend & Full-Stack" },
  { value: "Cloud, DevOps & SRE", label: "Cloud, DevOps & SRE" },
  { value: "Product & Design Systems", label: "Product & Design Systems" },
  { value: "Data Science & ML", label: "Data Science & ML" },
];

export const JOB_TYPES = [
  { value: "ALL", label: "All Employment Types" },
  { value: "Full-Time", label: "Full-Time Requisition" },
  { value: "Contract", label: "Contract (12 Mo)" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Internship", label: "Internship Cohort" },
];

export const SALARY_BANDS = [
  { value: "0", label: "Any Base Compensation" },
  { value: "70000", label: "$70k+ / yr Base" },
  { value: "110000", label: "$110k+ / yr Base" },
  { value: "140000", label: "$140k+ / yr Base" },
  { value: "160000", label: "$160k+ / yr Base" },
];

export const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest Requisitions First" },
  { value: "SALARY_DESC", label: "Highest Base Compensation" },
  { value: "FAST_REVIEW", label: "Fast Review (48h SLA)" },
];

export const FALLBACK_COMPANIES = [
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

export const FALLBACK_JOBS = [
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
    status: "Active",
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
    skills: ["Go 1.23", "Kubernetes", "gRPC", "Kafka", "Terraform"],
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
    status: "Active",
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
    skills: ["Figma Config", "Design Tokens", "WCAG 2.2", "React UI"],
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
    status: "Active",
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
    skills: ["PyTorch", "CUDA", "Distributed GPU", "Python", "vLLM"],
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
    status: "Active",
    applicantsCount: 5,
    createdAt: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
  },
];