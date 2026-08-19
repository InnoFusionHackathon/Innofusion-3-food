export type MealType = "entry" | "goodies" | "day1_snacks" | "day1_lunch" | "day1_evening_snacks" | "day1_dinner" | "day2_breakfast" | "day2_lunch" | "day2_snacks";

export type MealStatus = "collected" | "pending";

export type ScanStatus = "success" | "duplicate" | "invalid";

export interface Participant {
  id: string;
  name: string;
  registrationId: string;
  qrId: string;
  college: string;
  team: string;
  phone: string;
  email: string;
  photo: string;
  meals: Record<MealType, MealStatus>;
  mealHistory: { meal: MealType; time: string; organiser: string }[];
  entry?: {
    checkedIn: boolean;
    checkedInAt: string | null;
    checkedInBy: string | null;
  };
}

export interface DashboardStats {
  totalParticipants: number;
  goodiesClaimed: number;
  day1SnacksClaimed: number;
  day1LunchClaimed: number;
  day1EveningSnacksClaimed: number;
  day1DinnerClaimed: number;
  day2BreakfastClaimed: number;
  day2LunchClaimed: number;
  entryCheckedIn: number;
  entryNotCheckedIn: number;
  todayScans: number;
  duplicateAttempts: number;
  activeOrganisers: number;
  pendingMeals: number;
  mealDistribution: { name: string; value: number }[];
  hourlyActivity: { hour: string; scans: number }[];
  mealTrend: { day: string; goodies: number; day1_snacks: number; day1_lunch: number; day1_evening_snacks: number; day1_dinner: number; day2_breakfast: number; day2_lunch: number; day2_snacks: number }[];
  recentScans: ScanLog[];
  recentDuplicates: ScanLog[];
}

export interface ScanLog {
  id: string;
  time: string;
  participant: string;
  registrationId: string;
  meal: MealType;
  organiser: string;
  status: ScanStatus;
  device: string;
}

export interface OrganiserCode {
  id: string;
  code: string;
  organiser: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired" | "disabled";
}

export interface ReportData {
  totals: { label: string; value: number; hint: string }[];
  mealWise: { name: string; value: number }[];
  collegeWise: { name: string; value: number }[];
  hourly: { hour: string; scans: number }[];
  daily: { day: string; scans: number }[];
}

export interface EntryStats {
  totalParticipants: number;
  checkedIn: number;
  notCheckedIn: number;
  attendancePercentage: number;
  duplicateAttempts: number;
  firstCheckIn: string;
  lastCheckIn: string;
  peakHour: string;
  averageTime: string;
  hourlyActivity: { hour: string; scans: number }[];
}

export interface ScanResult {
  status: ScanStatus;
  meal: MealType;
  time: string;
  participant?: Participant;
  collectedAt?: string;
  collectedBy?: string;
  message?: string;
}
