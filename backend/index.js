const express = require('express');
const app = express();
app.use(express.json());

const proposals = [
  {
    proposalId: 1,
    title: "Build a Skate Park in Novi Sad",
    municipality: "Novi Sad",
    author: "User123",
    summary: "A skate park to engage youth and promote outdoor activities.",
    details: {
      problem: "Lack of recreational spaces for teens.",
      solution: "Construct a 500m² skate park near the city center.",
      cost: "€50,000",
      impact: "Increase youth engagement, reduce vandalism.",
    },
    media: ["park-sketch.jpg"],
    votes: { for: 75, against: 10, abstain: 20 },
    status: "Pending",
    createdAt: "2025-08-25T10:00:00Z",
  },
  {
    proposalId: 2,
    title: "Improve Bus Stops in Belgrade",
    municipality: "Belgrade",
    author: "Citizen456",
    summary: "Install shelters and digital displays at bus stops.",
    details: {
      problem: "Bus stops lack weather protection.",
      solution: "Add shelters and real-time schedule displays.",
      cost: "€100,000",
      impact: "Better public transport experience.",
    },
    media: ["bus-stop-design.png"],
    votes: { for: 120, against: 5, abstain: 15 },
    status: "Approved",
    createdAt: "2025-08-20T09:00:00Z",
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

app.listen(3000, () => console.log('Server running on port 3000'));