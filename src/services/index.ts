import { http, withFallback } from "./http";
import { mockDashboard, mockParticipants, mockScans, mockCodes, mockReports } from "./mock";
import type {
  DashboardStats,
  MealType,
  OrganiserCode,
  Participant,
  ReportData,
  ScanLog,
  ScanResult,
} from "./types";

/* ---------------------------------- auth --------------------------------- */

export const authApi = {
  /** POST /api/admin/login */
  adminLogin: (payload: { email: string; password: string }) =>
    withFallback(
      async () => (await http.post("/admin/login", payload)).data as { token: string; name: string },
      { token: "demo-token", name: "Admin" },
    ),

  /** POST /api/organiser/validate */
  validateOrganiser: (payload: { code: string }) =>
    withFallback(
      async () =>
        (await http.post("/organiser/validate", payload)).data as {
          token: string;
          organiser: string;
        },
      { token: "demo-token", organiser: "Riya Sharma" },
    ),
};

/* -------------------------------- dashboard ------------------------------- */

export const dashboardApi = {
  /** GET /api/dashboard */
  get: () =>
    withFallback(
      async () => (await http.get("/dashboard")).data as DashboardStats,
      mockDashboard,
    ),
};

/* ------------------------------- participants ----------------------------- */

export const participantsApi = {
  /** GET /api/participants */
  list: (params?: { search?: string; college?: string; team?: string; status?: string }) =>
    withFallback(
      async () => (await http.get("/participants", { params })).data as Participant[],
      mockParticipants,
    ),

  /** POST /api/participants */
  create: (payload: Partial<Participant>) =>
    withFallback(
      async () => (await http.post("/participants", payload)).data as Participant,
      { ...mockParticipants[0], ...payload, id: `SFQR-${Math.random().toString(36).slice(2, 8).toUpperCase()}` } as Participant,
    ),

  /** POST /api/participants/import */
  importExcel: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return withFallback(
      async () =>
        (
          await http.post("/participants/import", form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data as { imported: number },
      { imported: 0 },
    );
  },

  /** GET /api/participants/export */
  exportCsv: () =>
    withFallback(
      async () => (await http.get("/participants/export", { responseType: "blob" })).data as Blob,
      new Blob([""], { type: "text/csv" }),
    ),

  /** GET /api/participants/export-excel */
  exportExcel: async () => {
    const res = await http.get("/participants/export-excel", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "participants_export.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** POST /api/qr/generate */
  generateQr: (ids: string[]) =>
    withFallback(
      async () => (await http.post("/qr/generate", { ids })).data as { generated: number },
      { generated: ids.length },
    ),

  /** DELETE /api/participants/:id */
  remove: (id: string) =>
    withFallback(async () => (await http.delete(`/participants/${id}`)).data as unknown, {
      ok: true,
    }),

  /** DELETE /api/participants */
  deleteAll: () =>
    withFallback(
      async () =>
        (
          await http.delete(`/participants`, {
            data: { confirm: "DELETE_ALL" },
          })
        ).data as { deleted_count: number },
      { deleted_count: 0 },
    ),

  /** POST /api/participants/:id/regenerate-qr */
  regenerateQr: (id: string) =>
    withFallback(
      async () =>
        (await http.post(`/participants/${id}/regenerate-qr`)).data as Participant,
      mockParticipants[0],
    ),

  /** GET /api/participants/:id/download-qr */
  downloadSingleQr: async (id: string) => {
    const res = await http.get(`/participants/${id}/download-qr`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${id}.png`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** GET /api/participants/download-all-pdf */
  downloadAllQrPdf: async () => {
    const res = await http.get(`/participants/download-all-pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "all_qr_codes.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** PUT /api/participants/:id */
  update: (id: string, payload: Partial<Participant>) =>
    withFallback(
      async () => (await http.put(`/participants/${id}`, payload)).data as Participant,
      { ...mockParticipants[0], ...payload, id } as Participant,
    ),

  /** PUT /api/participants/:id/meals */
  updateMeals: (id: string, meals: Record<string, boolean>) =>
    withFallback(
      async () => (await http.put(`/participants/${id}/meals`, meals)).data as Participant,
      { ...mockParticipants[0], id } as Participant,
    ),

  /** POST /api/participants/bulk-action  — reset one or more meal columns for ALL participants */
  resetAllMeals: (meals: string[]) =>
    withFallback(
      async () =>
        (
          await http.post(`/participants/bulk-action`, {
            action: "reset_meals",
            ids: "__all__",
            meals,
          })
        ).data as { affected: number },
      { affected: 0 },
    ),
};

/* ---------------------------------- scans --------------------------------- */

export const scansApi = {
  /** POST /api/scan */
  scan: (payload: { qrId: string; meal: MealType; organiserCode?: string }) =>
    withFallback(
      async () => (await http.post("/scan", payload)).data as ScanResult,
      buildDemoScan(payload.qrId, payload.meal),
    ),

  /** GET /api/scans */
  list: (params?: { search?: string; date?: string; meal?: string; status?: string }) =>
    withFallback(async () => (await http.get("/scans", { params })).data as ScanLog[], mockScans),
};

function buildDemoScan(qrId: string, meal: MealType): ScanResult {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const participant = mockParticipants.find((p) => p.qrId === qrId || p.registrationId === qrId);
  if (!participant) return { status: "invalid", meal, time, message: "Participant not found" };
  if (participant.meals[meal] === "collected")
    return {
      status: "duplicate",
      meal,
      time,
      participant,
      collectedAt: participant.mealHistory.find((m) => m.meal === meal)?.time ?? time,
      collectedBy: participant.mealHistory.find((m) => m.meal === meal)?.organiser ?? "Organiser",
    };
  return { status: "success", meal, time, participant };
}

/* -------------------------------- organisers ------------------------------ */

export const organiserApi = {
  /** POST /api/organiser/create-code */
  createCode: (payload: { organiser: string; expiryHours: number }) =>
    withFallback(
      async () => (await http.post("/organiser/create-code", payload)).data as OrganiserCode,
      {
        id: `c_${Date.now()}`,
        code: `ORG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        organiser: payload.organiser,
        createdAt: new Date().toLocaleString(),
        expiresAt: new Date(Date.now() + payload.expiryHours * 3600_000).toLocaleString(),
        status: "active",
      } satisfies OrganiserCode,
    ),

  /** GET /api/organiser/codes */
  listCodes: () =>
    withFallback(
      async () => (await http.get("/organiser/codes")).data as OrganiserCode[],
      mockCodes,
    ),

  /** DELETE /api/organiser/code/:id */
  deleteCode: (id: string) =>
    withFallback(async () => (await http.delete(`/organiser/code/${id}`)).data as unknown, {
      ok: true,
    }),

  /** PATCH /api/organiser/code/:id/deactivate */
  deactivateCode: (id: string) =>
    withFallback(
      async () => (await http.patch(`/organiser/code/${id}/deactivate`)).data as unknown,
      { ok: true },
    ),
};

/* --------------------------------- reports -------------------------------- */

export const reportsApi = {
  /** GET /api/reports */
  get: () => withFallback(async () => (await http.get("/reports")).data as ReportData, mockReports),

  /** GET /api/reports/download?format=csv|excel|pdf */
  download: (format: "csv" | "excel" | "pdf") =>
    withFallback(
      async () =>
        (await http.get("/reports/download", { params: { format }, responseType: "blob" }))
          .data as Blob,
      new Blob([""], { type: "application/octet-stream" }),
    ),
};

/* --------------------------------- entry ---------------------------------- */

export const entryApi = {
  /** GET /api/entry/stats */
  getStats: () =>
    withFallback(
      async () => (await http.get("/entry/stats")).data as any,
      {
        totalParticipants: 80,
        checkedIn: 67,
        notCheckedIn: 13,
        attendancePercentage: 83.75,
        duplicateAttempts: 4,
        firstCheckIn: "08:12 AM",
        lastCheckIn: "11:34 AM",
        peakHour: "09:00",
        averageTime: "09:45 AM",
        hourlyActivity: [
          { hour: "08:00", scans: 10 },
          { hour: "09:00", scans: 45 },
          { hour: "10:00", scans: 12 },
        ],
      },
    ),

  /** GET /api/entry/export */
  exportExcel: async () => {
    const res = await http.get("/entry/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Innofusion_3.0_Entry_Attendance.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** POST /api/participants/:id/reset-entry */
  resetEntry: (id: string) =>
    withFallback(
      async () => (await http.post(`/participants/${id}/reset-entry`)).data as Participant,
      { ...mockParticipants[0], id } as Participant,
    ),

  /** POST /api/entry/reset-all — reset entry check-in for ALL participants */
  resetAllEntry: () =>
    withFallback(
      async () =>
        (await http.post(`/entry/reset-all`)).data as { reset_count: number },
      { reset_count: 0 },
    ),
};
