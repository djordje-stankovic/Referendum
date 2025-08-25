const express = require('express');
const app = express();
app.use(express.json());

// Helper to random pick unique users
function pickRandomIds(count, maxId) {
  const set = new Set();
  while (set.size < count) set.add(Math.floor(Math.random() * maxId) + 1);
  return Array.from(set);
}

const proposals = [
  {
    proposalId: 1,
    title: "Build a Skate Park in Novi Sad",
    municipality: "Novi Sad",
    author: "User123",
    category: "Sports & Recreation",
    summary: "A skate park to engage youth and promote outdoor activities.",
    details: {
      problem: "Lack of recreational spaces for teens.",
      solution: "Construct a 500m² skate park near the city center.",
      cost: "€50,000",
      impact: "Increase youth engagement, reduce vandalism.",
    },
    media: ["park-sketch.jpg"],
    votes: { for: 75, against: 10, abstain: 20 },
    voters: {
      for: pickRandomIds(50, 100),
      against: pickRandomIds(20, 100),
      abstain: pickRandomIds(10, 100),
      video: pickRandomIds(5, 100),
    },
    voteHistory: [
      { ts: '2025-08-20T10:00:00Z', for: 60, against: 8, abstain: 15 },
      { ts: '2025-08-23T10:00:00Z', for: 70, against: 9, abstain: 18 },
      { ts: '2025-08-25T10:00:00Z', for: 75, against: 10, abstain: 20 },
    ],
    status: "Pending",
    createdAt: "2025-08-25T10:00:00Z",
    contributors: [
      { id: 1, name: 'User123', role: 'Author' },
      { id: 3, name: 'ReviewerA', role: 'Reviewer' },
    ],
  },
  {
    proposalId: 2,
    title: "Improve Bus Stops in Belgrade",
    municipality: "Belgrade",
    author: "Citizen456",
    category: "Transportation",
    summary: "Install shelters and digital displays at bus stops.",
    details: {
      problem: "Bus stops lack weather protection.",
      solution: "Add shelters and real-time schedule displays.",
      cost: "€100,000",
      impact: "Better public transport experience.",
    },
    media: ["bus-stop-design.png"],
    votes: { for: 120, against: 5, abstain: 15 },
    voters: {
      for: pickRandomIds(60, 100),
      against: pickRandomIds(5, 100),
      abstain: pickRandomIds(15, 100),
      video: pickRandomIds(3, 100),
    },
    voteHistory: [
      { ts: '2025-08-18T09:00:00Z', for: 100, against: 4, abstain: 12 },
      { ts: '2025-08-19T09:00:00Z', for: 110, against: 5, abstain: 14 },
      { ts: '2025-08-20T09:00:00Z', for: 120, against: 5, abstain: 15 },
    ],
    status: "Approved",
    createdAt: "2025-08-20T09:00:00Z",
    contributors: [
      { id: 2, name: 'Citizen456', role: 'Author' },
      { id: 4, name: 'AnalystB', role: 'Analyst' },
    ],
  },
];

app.get('/api/proposals', (req, res) => {
  res.json(proposals);
});

app.post('/api/proposals', (req, res) => {
  const newProposal = {
    proposalId: proposals.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    votes: { for: 0, against: 0, abstain: 0 },
    status: "Pending",
  };
  proposals.push(newProposal);
  res.status(201).json(newProposal);
});

app.put('/api/proposals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = proposals.findIndex(p => p.proposalId === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proposal not found' });
  }
  const updated = {
    ...proposals[index],
    ...req.body,
    proposalId: id,
  };
  proposals[index] = updated;
  res.json(updated);
});

// Voting endpoint
app.post('/api/proposals/:id/vote', (req, res) => {
  const id = parseInt(req.params.id);
  const { type } = req.body; // 'for' | 'against' | 'abstain'
  const proposal = proposals.find(p => p.proposalId === id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  if (!proposal.votes) proposal.votes = { for: 0, against: 0, abstain: 0 };
  if (!['for', 'against', 'abstain'].includes(type)) return res.status(400).json({ message: 'Invalid vote type' });
  proposal.votes[type] += 1;
  const last = proposal.voteHistory?.[proposal.voteHistory.length - 1] || { for: 0, against: 0, abstain: 0 };
  const point = { ts: new Date().toISOString(), for: proposal.votes.for, against: proposal.votes.against, abstain: proposal.votes.abstain };
  proposal.voteHistory = [...(proposal.voteHistory || []), point];
  res.json({ ok: true, votes: proposal.votes, voteHistory: proposal.voteHistory });
});

// AI helper stubs
app.post('/api/ai/suggest', (req, res) => {
  const { problem } = req.body || {};
  const base = problem || 'Describe the municipal problem briefly.';
  res.json({
    summary: `${base} Proposed solution: outline 3-5 concrete steps to address it.`,
    goals: [
      'Reduce negative impact by 20% within 6 months',
      'Engage local stakeholders and NGOs',
      'Ensure budget transparency and milestones',
    ],
    steps: [
      'Assess current state and collect data',
      'Draft solution with cost/benefit analysis',
      'Pilot in a small area',
      'Iterate and scale city-wide',
    ],
    kpis: [
      'Citizen satisfaction score',
      'Number of reported incidents/month',
      'On-time milestone completion %',
    ],
    risks: [
      'Regulatory delays',
      'Insufficient funding',
      'Low community adoption',
    ],
  });
});

app.post('/api/ai/validate', (req, res) => {
  const { proposal } = req.body || {};
  const missing = [];
  if (!proposal?.title) missing.push('Title');
  if (!proposal?.summary) missing.push('Summary');
  if (!proposal?.details?.problem) missing.push('Problem');
  if (!proposal?.details?.solution) missing.push('Solution');
  if (!proposal?.details?.cost) missing.push('Estimated Cost');
  if (!proposal?.details?.impact) missing.push('Impact');
  res.json({
    ok: missing.length === 0,
    missing,
    tips: [
      'Add measurable goals (KPI) to evaluate success',
      'Attach supporting documents or references',
      'Specify timeline and responsible parties',
    ],
  });
});
// Simple users list
// Generate 100 random users
const firstNames = ['Ana','Marko','Ivana','Nikola','Mila','Đorđe','Sara','Luka','Jovana','Stefan','Petar','Katarina','Milan','Marija','Filip','Tijana','Vuk','Andrija','Teodora','Matea'];
const lastNames = ['Petrović','Marković','Jovanović','Savić','Ilić','Kovač','Stanković','Pavlović','Nikolić','Janković','Stojanović','Milošević','Lukić','Đurić','Matić'];
const users = Array.from({ length: 100 }, (_, i) => {
  const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { id: i + 1, name: `${fn} ${ln}` };
});

// Edit requests (PR-like)
const edits = [];

app.get('/api/users', (req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

app.get('/api/proposals/:id/edits', (req, res) => {
  const id = parseInt(req.params.id);
  res.json(edits.filter(e => e.proposalId === id));
});

app.post('/api/proposals/:id/edits', (req, res) => {
  const id = parseInt(req.params.id);
  const edit = {
    id: edits.length + 1,
    proposalId: id,
    authorId: req.body.authorId ?? 5,
    summary: req.body.summary ?? 'Edit summary',
    changes: req.body.changes ?? {},
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  edits.push(edit);
  res.status(201).json(edit);
});

app.post('/api/proposals/:id/edits/:editId/merge', (req, res) => {
  const id = parseInt(req.params.id);
  const editId = parseInt(req.params.editId);
  const edit = edits.find(e => e.id === editId && e.proposalId === id);
  if (!edit) return res.status(404).json({ message: 'Edit not found' });
  edit.status = 'merged';
  const idx = proposals.findIndex(p => p.proposalId === id);
  if (idx !== -1) {
    proposals[idx] = { ...proposals[idx], ...edit.changes };
  }
  res.json({ merged: true, proposal: proposals[idx] });
});

app.listen(3000, () => console.log('Server running on port 3000'));