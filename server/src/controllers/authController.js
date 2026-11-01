import bcrypt from "bcryptjs";
import User from "../models/User.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { isDbConnected } from "../config/db.js";
import { signToken } from "../middleware/authMiddleware.js";
import { memoryCompanies } from "./jobController.js";

export let memoryUsers = [
  {
    _id: "admin-nexus-001",
    name: "Sashmitha N.",
    email: "admin@auspify.com",
    passwordHash: bcrypt.hashSync("Admin@2026!", 10),
    role: "admin",
    status: "Active",
    headline: "Platform Administrator • Superuser #001",
    phone: "+94 77 123 4567",
    location: "Colombo 07, LK",
    skills: ["Platform Security", "RBAC Governance", "Zero-Trust IAM"],
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  // 3 Seeded Job Seekers
  {
    _id: "seek-nexus-001",
    name: "Sashmitha Nanayakkara",
    email: "seeker@auspify.com",
    passwordHash: bcrypt.hashSync("Seeker@2026!", 10),
    role: "seeker",
    status: "Active",
    headline: "Full-Stack Engineer • React & Node.js",
    phone: "+94 77 123 4567",
    location: "Colombo, Sri Lanka (Open to Remote & Relocation)",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS ECS", "Tailwind CSS"],
    defaultResume: {
      fileName: "Sashmitha_CV_2026.pdf",
      fileType: "application/pdf",
      fileSizeKB: 420,
      fileDataUrl: "",
      uploadedAt: new Date().toISOString(),
    },
    savedJobs: ["JOB-2026-001"],
    createdAt: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
  },
  {
    _id: "seek-nexus-002",
    name: "Dmitri Rostov",
    email: "dmitri.rostov@systemscale.org",
    passwordHash: bcrypt.hashSync("Seeker@2026!", 10),
    role: "seeker",
    status: "Active",
    headline: "Distributed Systems Architect (Go / K8s / Rust Core)",
    phone: "+41 44 580 1290",
    location: "Zurich, CH / Global Remote",
    skills: ["Go 1.23", "Kubernetes", "gRPC", "Rust", "Kafka"],
    defaultResume: {
      fileName: "Dmitri_Rostov_Systems_CV.pdf",
      fileType: "application/pdf",
      fileSizeKB: 510,
      fileDataUrl: "",
      uploadedAt: new Date().toISOString(),
    },
    savedJobs: ["JOB-2026-002"],
    createdAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
  },
  {
    _id: "seek-nexus-003",
    name: "Kavindi Perera",
    email: "kavindi.perera@gmail.com",
    passwordHash: bcrypt.hashSync("Seeker@2026!", 10),
    role: "seeker",
    status: "Active",
    headline: "Staff Design Systems & Frontend Engineer",
    phone: "+94 71 445 9981",
    location: "Colombo 03, Sri Lanka",
    skills: ["Figma Tokens", "React 19", "WCAG 2.2", "Tailwind CSS"],
    defaultResume: {
      fileName: "Kavindi_Perera_DesignSystems.pdf",
      fileType: "application/pdf",
      fileSizeKB: 390,
      fileDataUrl: "",
      uploadedAt: new Date().toISOString(),
    },
    savedJobs: ["JOB-2026-003"],
    createdAt: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
  },
  // 6 Seeded Employer Accounts (1-to-1 Match with the 6 Company Profiles)
  {
    _id: "emp-nexus-001",
    name: "Elena Vance",
    email: "employer@auspify.com",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Auspify Cloud Labs",
    headline: "VP of Engineering • Auspify Cloud Labs",
    phone: "+94 77 987 6543",
    location: "Colombo 07 & San Francisco",
    skills: ["Distributed Systems", "Cloud Architecture"],
    createdAt: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
  },
  {
    _id: "emp-nexus-002",
    name: "Marcus Chen",
    email: "careers@stratumdata.io",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Stratum Data Systems",
    headline: "Head of Platform Infrastructure • Stratum Data",
    phone: "+65 6789 1120",
    location: "Singapore & Global Remote",
    skills: ["Golang", "Kubernetes", "Kafka"],
    createdAt: new Date(Date.now() - 18 * 86400 * 1000).toISOString(),
  },
  {
    _id: "emp-nexus-003",
    name: "Aria Lindqvist",
    email: "talent@nexusfoundry.design",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Nexus Design Foundry",
    headline: "Design Systems Director • Nexus Foundry",
    phone: "+1 415 890 2210",
    location: "San Francisco, CA & Remote",
    skills: ["Figma Tokens", "Design Systems", "React UI"],
    createdAt: new Date(Date.now() - 16 * 86400 * 1000).toISOString(),
  },
  {
    _id: "emp-nexus-004",
    name: "Dr. Aris Thorne",
    email: "hiring@vertexquantum.ai",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Vertex Quantum AI",
    headline: "Chief AI Scientist • Vertex Quantum AI",
    phone: "+1 512 440 8890",
    location: "Austin, TX & London, UK",
    skills: ["PyTorch", "CUDA", "Distributed GPU"],
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  },
  {
    _id: "emp-nexus-005",
    name: "Lukas Weber",
    email: "people@heliospay.fin",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Helios FinTech Core",
    headline: "VP Core Settlement • Helios FinTech",
    phone: "+41 44 210 9900",
    location: "Colombo & Zurich, CH",
    skills: ["Rust", "Node.js", "ISO-20022"],
    createdAt: new Date(Date.now() - 12 * 86400 * 1000).toISOString(),
  },
  {
    _id: "emp-nexus-006",
    name: "Nadia Al-Mansoor",
    email: "jobs@kronoscyber.sec",
    passwordHash: bcrypt.hashSync("Employer@2026!", 10),
    role: "employer",
    status: "Active",
    companyName: "Kronos Zero-Trust Security",
    headline: "Principal Security Architect • Kronos",
    phone: "+44 20 7946 0192",
    location: "Remote Worldwide",
    skills: ["WebAuthn", "Linux eBPF", "Zero-Trust IAM"],
    createdAt: new Date(Date.now() - 9 * 86400 * 1000).toISOString(),
  },
];

export const formatUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role || "seeker",
  status: u.status || "Active",
  headline: u.headline || "",
  phone: u.phone || "",
  location: u.location || "",
  portfolioUrl: u.portfolioUrl || "",
  companyName: u.companyName || "",
  skills: u.skills || [],
  defaultResume: u.defaultResume || { fileName: "" },
  savedJobs: u.savedJobs || [],
  createdAt: u.createdAt,
});

export const ensureCoreAccounts = async () => {
  if (!isDbConnected()) return;
  // Remove old fake bot account if it was previously seeded so company counts match 1-to-1
  await User.deleteOne({ email: "bot-lead@apexdigital-fake.net" }).catch(() => {});

  for (const seed of memoryUsers) {
    const exists = await User.findOne({ email: seed.email });
    if (!exists) {
      await User.create({
        name: seed.name,
        email: seed.email,
        password:
          seed.role === "admin"
            ? "Admin@2026!"
            : seed.role === "employer"
            ? "Employer@2026!"
            : "Seeker@2026!",
        role: seed.role,
        status: seed.status,
        companyName: seed.companyName || "",
        headline: seed.headline || "",
        phone: seed.phone || "",
        location: seed.location || "",
        skills: seed.skills || [],
        defaultResume: seed.defaultResume || { fileName: "" },
      });
    }
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address, and password are required.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Security Rule: Public registration strictly allows 'seeker' or 'employer' ONLY (Never 'admin'!)
    const assignedRole = role === "employer" ? "employer" : "seeker";
    if (assignedRole === "employer" && (!companyName || !companyName.trim())) {
      return res.status(400).json({
        success: false,
        message: "Company Name is required when registering an Employer account.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const exists = await User.findOne({ email: cleanEmail });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please Sign In.",
        });
      }

      const created = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: assignedRole,
        status: "Active",
        companyName: assignedRole === "employer" ? companyName.trim() : "",
        headline:
          assignedRole === "employer"
            ? `Hiring Lead • ${companyName.trim()}`
            : "Software Engineer • Full-Stack",
      });

      if (assignedRole === "employer") {
        const count = await CompanyProfile.countDocuments();
        const initials = companyName
          .trim()
          .split(/\s+/)
          .slice(0, 3)
          .map((w) => w[0]?.toUpperCase() || "")
          .join("");
        await CompanyProfile.create({
          companyId: `CMP-2026-${String(count + 1).padStart(3, "0")}`,
          employer: created._id,
          employerEmail: cleanEmail,
          companyName: companyName.trim(),
          initials: initials || "CO",
          industry: "Technology & Engineering",
          location: "Colombo / Remote",
          website: "https://auspify.com",
          verified: true,
        });
      }

      const token = signToken(created._id, created.role);
      return res.status(201).json({
        success: true,
        token,
        user: formatUser(created),
      });
    }

    const existsMem = memoryUsers.find((u) => u.email === cleanEmail);
    if (existsMem) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please Sign In.",
      });
    }

    const newMem = {
      _id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: assignedRole,
      status: "Active",
      companyName: assignedRole === "employer" ? companyName.trim() : "",
      headline:
        assignedRole === "employer"
          ? `Hiring Lead • ${companyName.trim()}`
          : "Software Engineer • Full-Stack",
      phone: "",
      location: "Colombo / Remote",
      skills: ["React", "Node.js", "TypeScript"],
      defaultResume: { fileName: "" },
      savedJobs: [],
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newMem);

    if (assignedRole === "employer") {
      memoryCompanies.push({
        companyId: `CMP-2026-${String(memoryCompanies.length + 1).padStart(3, "0")}`,
        employerEmail: cleanEmail,
        companyName: companyName.trim(),
        initials: companyName.trim().slice(0, 3).toUpperCase(),
        badgeColor: "indigo",
        industry: "Technology & Engineering",
        location: "Colombo / Remote",
        website: "https://auspify.com",
        companySize: "50+ Engineers",
        fundingStage: "Verified",
        rating: "4.9 / 5.0",
        description: `${companyName.trim()} engineering organization on Auspify Nexus.`,
        verified: true,
      });
    }

    const token = signToken(newMem._id, newMem.role);
    res.status(201).json({
      success: true,
      token,
      user: formatUser(newMem),
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      await ensureCoreAccounts();
      const user = await User.findOne({ email: cleanEmail }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password. Please verify your credentials.",
        });
      }
      if (user.status === "Suspended") {
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_SUSPENDED",
          message: "This account has been suspended by a Platform Administrator.",
        });
      }
      const token = signToken(user._id, user.role);
      return res.status(200).json({
        success: true,
        token,
        user: formatUser(user),
      });
    }

    const memUser = memoryUsers.find((u) => u.email === cleanEmail);
    if (!memUser || !(await bcrypt.compare(password, memUser.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }
    if (memUser.status === "Suspended") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: "This account has been suspended by a Platform Administrator.",
      });
    }

    const token = signToken(memUser._id, memUser.role);
    res.status(200).json({
      success: true,
      token,
      user: formatUser(memUser),
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: formatUser(req.user) });
};

export const updateProfile = async (req, res, next) => {
  try {
    const fields = [
      "name",
      "headline",
      "phone",
      "location",
      "portfolioUrl",
      "companyName",
      "skills",
      "defaultResume",
      "savedJobs",
    ];

    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      fields.forEach((f) => {
        if (req.body[f] !== undefined) user[f] = req.body[f];
      });
      await user.save();
      return res.status(200).json({ success: true, user: formatUser(user) });
    }

    fields.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    res.status(200).json({ success: true, user: formatUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    if (isDbConnected()) {
      const user = await User.findById(req.user._id).select("+password");
      if (!currentPassword || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
      user.password = newPassword;
      await user.save();
    } else {
      const valid = await bcrypt.compare(currentPassword || "", req.user.passwordHash);
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
      req.user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    res.status(200).json({
      success: true,
      message: "Password updated and re-encrypted successfully.",
    });
  } catch (err) {
    next(err);
  }
};