import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDailyCheckins from "./tools/list-daily-checkins";
import listMeniereRecords from "./tools/list-meniere-records";
import listDiabetesRecords from "./tools/list-diabetes-records";
import listMedications from "./tools/list-medications";
import getLatestWeeklyReport from "./tools/get-latest-weekly-report";

// Issuer MUST be the direct supabase.co host, built from the project ref
// (never SUPABASE_URL, which may be a proxied .lovable.cloud host).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "health-pal-mcp",
  title: "Health Pal",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in Health Pal user: read daily check-ins, Meniere symptom logs, diabetes records, active medications, and the latest AI weekly health report. All tools are read-only and scoped to the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listDailyCheckins,
    listMeniereRecords,
    listDiabetesRecords,
    listMedications,
    getLatestWeeklyReport,
  ],
});
