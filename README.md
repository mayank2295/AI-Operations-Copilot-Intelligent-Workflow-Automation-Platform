# AI-Operations-Copilot-Intelligent-Workflow-Automation-Platform

A starter MVP for an **AI Job Application Automation System** with:
- Simple React frontend form
- Simple Node.js backend API
- Power Automate webhook integration

## Quick Start

```bash
npm install
cp .env.example .env
npm run start
```

Open `http://localhost:3000`.

## Power Automate Integration

1. Create a flow with trigger: **When an HTTP request is received**.
2. Copy the generated flow URL.
3. Set it in `.env`:

```env
POWER_AUTOMATE_WEBHOOK_URL=<your_flow_url>
POWER_AUTOMATE_SHARED_SECRET=<optional_shared_secret>
```

4. Restart server and submit an application from the UI.

Detailed beginner guide:
- `docs/POWER_AUTOMATE_GUIDED_PLAN.md`

## API Endpoints

- `GET /api/health`
- `POST /api/applications`
- `GET /api/applications`
