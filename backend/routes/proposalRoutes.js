// backend/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const proposalService = require('../services/proposalService');
const { supabase } = require('../config/supabase');

router.get('/api/proposals', async (req, res) => {
  const proposals = await proposalService.getAllProposals();
  console.log('Returning proposals:', proposals);
  res.json(proposals);
});

router.post('/api/proposals', async (req, res) => {
  const newProposal = await proposalService.createProposal(req.body);
  res.status(201).json(newProposal);
});

router.put('/api/proposals/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await proposalService.updateProposal(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Proposal not found' });
  res.json(updated);
});

router.post('/api/proposals/:id/vote', async (req, res) => {
  const id = parseInt(req.params.id);
  const { userId, voteType } = req.body;
  console.log(`Vote request: id=${id}, userId=${userId}, voteType=${voteType}`); // Debug
  try {
    const proposal = await proposalService.voteProposal(id, userId, voteType);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json({ ok: true, voters: proposal.voters });
  } catch (error) {
    console.error('Error in vote endpoint:', error); // Detaljan log greške
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/proposals/:id/edits', async (req, res) => {
  const id = parseInt(req.params.id);
  const edits = await proposalService.getEdits(id);
  res.json(edits);
});

router.post('/api/proposals/:id/edits', async (req, res) => {
  const id = parseInt(req.params.id);
  const edit = await proposalService.createEdit(id, req.body);
  res.status(201).json(edit);
});

router.post('/api/proposals/:id/edits/:editId/merge', async (req, res) => {
  const id = parseInt(req.params.id);
  const editId = parseInt(req.params.editId);
  const proposal = await proposalService.mergeEdit(id, editId);
  if (!proposal) return res.status(404).json({ message: 'Edit not found' });
  res.json({ merged: true, proposal });
});

// AI helper stubs
router.post('/api/ai/suggest', (req, res) => {
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

router.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/api/municipalities', async (req, res) => {
  const { data, error } = await supabase.from('municipalities').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/api/categories', async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/api/ai/validate', (req, res) => {
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

module.exports = router;