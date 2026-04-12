const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, '..', 'data', 'applications.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function ensureDataFile() {
  const dataDir = path.dirname(dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
  }
}

function readApplications() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function writeApplications(applications) {
  fs.writeFileSync(dataFile, JSON.stringify(applications, null, 2));
}

async function sendToPowerAutomate(application) {
  const webhook = process.env.POWER_AUTOMATE_WEBHOOK_URL;

  if (!webhook) {
    return { skipped: true, reason: 'POWER_AUTOMATE_WEBHOOK_URL is not configured' };
  }

  const payload = {
    eventType: 'JOB_APPLICATION_SUBMITTED',
    submittedAt: application.createdAt,
    source: 'AI-Operations-Copilot-Frontend',
    candidate: {
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      roleApplied: application.roleApplied,
      resumeText: application.resumeText,
      coverLetter: application.coverLetter,
      yearsOfExperience: application.yearsOfExperience
    },
    applicationId: application.id
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  if (process.env.POWER_AUTOMATE_SHARED_SECRET) {
    headers['x-shared-secret'] = process.env.POWER_AUTOMATE_SHARED_SECRET;
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Power Automate call failed with ${response.status}: ${body}`);
  }

  return { skipped: false };
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/applications', async (req, res) => {
  const {
    fullName,
    email,
    phone,
    roleApplied,
    yearsOfExperience,
    resumeText,
    coverLetter
  } = req.body;

  if (!fullName || !email || !roleApplied || !resumeText) {
    return res.status(400).json({
      message: 'fullName, email, roleApplied, and resumeText are required'
    });
  }

  const application = {
    id: `APP-${Date.now()}`,
    fullName,
    email,
    phone: phone || '',
    roleApplied,
    yearsOfExperience: Number.isFinite(Number(yearsOfExperience)) ? Number(yearsOfExperience) : 0,
    resumeText,
    coverLetter: coverLetter || '',
    createdAt: new Date().toISOString()
  };

  try {
    const existing = readApplications();
    existing.push(application);
    writeApplications(existing);

    const powerAutomateResult = await sendToPowerAutomate(application);

    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
      powerAutomate: powerAutomateResult
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

app.get('/api/applications', (_, res) => {
  try {
    const applications = readApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Could not read applications', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
