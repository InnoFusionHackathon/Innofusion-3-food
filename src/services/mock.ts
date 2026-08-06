import type {
  DashboardStats,
  OrganiserCode,
  Participant,
  ReportData,
  ScanLog,
} from "./types";

const colleges = [
  "IIT Bombay",
  "NIT Trichy",
  "VIT Vellore",
  "BITS Pilani",
  "Anna University",
];
const teams = ["ByteForce", "NullPointer", "Quantum Owls", "Stack Surfers", "DeepFry"];
const names = [
  "Aarav Sharma",
  "Diya Nair",
  "Rohan Iyer",
  "Meera Kapoor",
  "Kabir Menon",
  "Ananya Rao",
  "Vihaan Gupta",
  "Ishita Bose",
  "Arjun Pillai",
  "Sara Khan",
  "Nikhil Verma",
  "Tara Joshi",
];

const pad = (n: number) => String(n).padStart(3, "0");

export const mockParticipants: Participant[] = names.map((name, i) => {
  const goodies = i % 2 === 0 ? "collected" : "pending";
  const day1_snacks = i % 3 === 0 ? "collected" : "pending";
  const day1_lunch = i % 4 === 0 ? "collected" : "pending";
  const day1_evening_snacks = i % 5 === 0 ? "collected" : "pending";
  const day1_dinner = i % 6 === 0 ? "collected" : "pending";
  const day2_breakfast = i % 7 === 0 ? "collected" : "pending";
  const day2_lunch = i % 8 === 0 ? "collected" : "pending";
  return {
    id: `p_${i + 1}`,
    name,
    registrationId: `HACK25-${pad(i + 1)}`,
    qrId: `QR-${pad(i + 1)}-${(i * 7919) % 9999}`,
    college: colleges[i % colleges.length],
    team: teams[i % teams.length],
    phone: `+91 98${pad(i + 10)}${pad((i * 31) % 999)}0`,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@campus.edu`,
    photo: `https://i.pravatar.cc/160?img=${i + 5}`,
    meals: { goodies, day1_snacks, day1_lunch, day1_evening_snacks, day1_dinner, day2_breakfast, day2_lunch } as Participant["meals"],
    mealHistory: [
      ...(goodies === "collected"
        ? [{ meal: "goodies" as const, time: "08:2" + (i % 10) + " AM", organiser: "Riya S." }]
        : []),
      ...(day1_snacks === "collected"
        ? [{ meal: "day1_snacks" as const, time: "11:1" + (i % 10) + " AM", organiser: "Aman K." }]
        : []),
      ...(day1_lunch === "collected"
        ? [{ meal: "day1_lunch" as const, time: "01:1" + (i % 10) + " PM", organiser: "Neha T." }]
        : []),
    ],
  };
});

export const mockScans: ScanLog[] = Array.from({ length: 24 }).map((_, i) => {
  const p = mockParticipants[i % mockParticipants.length];
  const status = i % 7 === 3 ? "duplicate" : i % 11 === 5 ? "invalid" : "success";
  const meal = (["goodies", "day1_snacks", "day1_lunch", "day1_evening_snacks", "day1_dinner", "day2_breakfast", "day2_lunch"] as const)[i % 7];
  return {
    id: `s_${i + 1}`,
    time: `2026-07-30 ${pad(8 + (i % 12)).slice(1)}:${pad((i * 13) % 60).slice(1)}`,
    participant: p.name,
    registrationId: p.registrationId,
    meal,
    organiser: ["Riya S.", "Aman K.", "Neha T."][i % 3],
    status,
    device: i % 2 === 0 ? "Android · Chrome" : "iOS · Safari",
  };
});

export const mockDashboard: DashboardStats = {
  totalParticipants: 480,
  goodiesClaimed: 412,
  day1SnacksClaimed: 366,
  day1LunchClaimed: 208,
  day1EveningSnacksClaimed: 150,
  day1DinnerClaimed: 100,
  day2BreakfastClaimed: 80,
  day2LunchClaimed: 50,
  todayScans: 986,
  duplicateAttempts: 37,
  activeOrganisers: 12,
  pendingMeals: 454,
  mealDistribution: [
    { name: "Goodies", value: 412 },
    { name: "Day-1 Snacks", value: 366 },
    { name: "Day-1 Lunch", value: 208 },
    { name: "Day-1 Eve Snacks", value: 150 },
    { name: "Day-1 Dinner", value: 100 },
    { name: "Day-2 Breakfast", value: 80 },
    { name: "Day-2 Lunch", value: 50 },
  ],
  hourlyActivity: [
    "07",
    "08",
    "09",
    "10",
    "12",
    "13",
    "14",
    "18",
    "19",
    "20",
    "21",
    "22",
  ].map((hour, i) => ({ hour: `${hour}:00`, scans: [40, 190, 150, 60, 120, 210, 90, 70, 180, 140, 60, 25][i] })),
  mealTrend: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((day, i) => ({
    day,
    goodies: [120, 180, 240, 300, 412][i],
    day1_snacks: [90, 160, 220, 290, 366][i],
    day1_lunch: [40, 80, 130, 170, 208][i],
    day1_evening_snacks: [30, 60, 90, 120, 150][i],
    day1_dinner: [20, 40, 60, 80, 100][i],
    day2_breakfast: [10, 20, 30, 40, 80][i],
    day2_lunch: [5, 10, 15, 20, 50][i],
  })),
  recentScans: mockScans.filter((s) => s.status === "success").slice(0, 5),
  recentDuplicates: mockScans.filter((s) => s.status !== "success").slice(0, 4),
};

export const mockCodes: OrganiserCode[] = [
  {
    id: "c_1",
    code: "ORG-7F2K9A",
    organiser: "Riya Sharma",
    createdAt: "2026-07-30 07:10",
    expiresAt: "2026-07-30 19:10",
    status: "active",
  },
  {
    id: "c_2",
    code: "ORG-2M8QX4",
    organiser: "Aman Khurana",
    createdAt: "2026-07-30 06:40",
    expiresAt: "2026-07-30 11:40",
    status: "expired",
  },
  {
    id: "c_3",
    code: "ORG-9P4LZ1",
    organiser: "Neha Tiwari",
    createdAt: "2026-07-30 09:05",
    expiresAt: "2026-07-31 09:05",
    status: "active",
  },
];

export const mockReports: ReportData = {
  totals: [
    { label: "Total Scans", value: 986, hint: "across 3 meals" },
    { label: "Unique Participants", value: 480, hint: "registered" },
    { label: "Duplicate Attempts", value: 37, hint: "blocked by system" },
    { label: "Meals Served", value: 986, hint: "verified via QR" },
  ],
  mealWise: mockDashboard.mealDistribution,
  collegeWise: colleges.map((name, i) => ({ name, value: [210, 178, 145, 120, 96][i] })),
  hourly: mockDashboard.hourlyActivity,
  daily: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((day, i) => ({
    day,
    scans: [250, 420, 590, 760, 986][i],
  })),
};
