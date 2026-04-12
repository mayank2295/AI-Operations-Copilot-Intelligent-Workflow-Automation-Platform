# AI Job Application Automation System - Guided Plan

This guide gives you a **beginner-friendly implementation plan** and a clear split between:
- ✅ **What is already built in this repository**
- 👤 **What you need to do in Microsoft Power Automate**

---

## 1) Architecture (Simple Version)

1. Candidate fills out form on React frontend.
2. Backend API receives the data.
3. Backend stores application data (currently JSON file; you can later move to SQL/Snowflake).
4. Backend sends payload to a Power Automate HTTP trigger URL.
5. Power Automate performs workflow actions:
   - Send candidate confirmation email
   - Notify HR on Teams
   - Add follow-up reminder/task
   - Optional AI resume scoring/summary

---

## 2) What has been implemented now

### Frontend (React)
- A clean job application form with fields:
  - Full name, email, phone, role, years of experience, resume text, cover letter.
- Form submits to `POST /api/applications`.
- Shows status message for success/failure.

### Backend (Node.js + Express)
- API endpoints:
  - `GET /api/health`
  - `POST /api/applications`
  - `GET /api/applications`
- Validation for required fields.
- Local storage in `data/applications.json`.
- Integration hook for Power Automate:
  - Uses env var `POWER_AUTOMATE_WEBHOOK_URL`.
  - Sends structured JSON payload for each submission.
  - Optional shared secret header (`x-shared-secret`) with `POWER_AUTOMATE_SHARED_SECRET`.

---

## 3) What you need to do in Power Automate (Step by Step)

## Step A - Create the flow
1. Go to Power Automate: https://make.powerautomate.com
2. Click **Create**.
3. Choose **Instant cloud flow** OR **Automated cloud flow**.
4. Select trigger: **When an HTTP request is received**.

## Step B - Generate schema
1. In the trigger, click **Use sample payload to generate schema**.
2. Paste this sample JSON:

```json
{
  "eventType": "JOB_APPLICATION_SUBMITTED",
  "submittedAt": "2026-04-12T10:00:00.000Z",
  "source": "AI-Operations-Copilot-Frontend",
  "candidate": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "roleApplied": "AI Operations Engineer",
    "resumeText": "I have 4 years of automation experience...",
    "coverLetter": "I am excited to apply...",
    "yearsOfExperience": 4
  },
  "applicationId": "APP-1711111111111"
}
```

## Step C - Add actions in the flow
1. **Send confirmation email**
   - Action: Outlook "Send an email (V2)"
   - To: `candidate.email` from trigger dynamic content
   - Subject: Application received

2. **Notify HR in Teams**
   - Action: Microsoft Teams "Post message in a chat or channel"
   - Include candidate name, role, email, and application ID.

3. **Create follow-up task/reminder**
   - Action: Planner/To Do/Outlook Task (pick one)
   - Due date: e.g., 2 business days from now.

4. **Optional AI step**
   - Use AI Builder / Azure OpenAI connector (if available)
   - Input: `candidate.resumeText`
   - Output: Resume summary/fit score
   - Add result to Teams notification or save in data store.

## Step D - Add security (recommended)
1. Add a **Condition** in flow:
   - Check header secret equals your expected value.
2. In backend `.env`, set matching value in `POWER_AUTOMATE_SHARED_SECRET`.

## Step E - Copy flow URL
1. Save the flow.
2. Power Automate generates HTTP POST URL.
3. Copy this URL.

## Step F - connect backend
1. In your project root:
   - Copy `.env.example` to `.env`
2. Set:
   - `POWER_AUTOMATE_WEBHOOK_URL=<your_flow_http_url>`
   - `POWER_AUTOMATE_SHARED_SECRET=<same_secret_used_in_flow>`
3. Restart backend server.

---

## 4) How to run this project locally

```bash
npm install
cp .env.example .env
npm run start
```

Open:
- `http://localhost:3000`

---

## 5) Suggested next upgrades (after MVP)

1. Replace JSON storage with PostgreSQL/MySQL/SQL Server.
2. Add Snowflake pipeline for analytics/reporting.
3. Add authentication (admin dashboard).
4. Add file upload for resume PDF.
5. Add status workflow (Applied → Screening → Interview → Offer).

---

## 6) Troubleshooting

- If application submits but flow is not triggered:
  - Check backend response for `powerAutomate` status.
  - Verify webhook URL is correct.
  - Check flow run history in Power Automate.

- If flow receives request but dynamic fields are blank:
  - Re-open HTTP trigger schema.
  - Re-save flow and map fields again.

- If you get 401/403:
  - Ensure secret header and expected flow secret match exactly.

