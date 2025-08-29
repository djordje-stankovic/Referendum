// backend/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const proposalService = require('../services/proposalService');
const { supabase } = require('../config/supabase');
// Removed pg Pool - using only Supabase

router.get('/proposals', async (req, res) => {
  const proposals = await proposalService.getAllProposals();
  // console.log('Returning proposals:', proposals);
  res.json(proposals);
});

router.get('/proposals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const proposal = await proposalService.getProposalById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/proposals', async (req, res) => {
  try {
    // console.log('Creating proposal with body:', req.body);
    const newProposal = await proposalService.createProposal(req.body);
    // console.log('Proposal created successfully:', newProposal);
    res.status(201).json(newProposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/proposals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await proposalService.updateProposal(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Proposal not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/proposals/:id/vote', async (req, res) => {
  const id = parseInt(req.params.id);
  const { userId, voteType } = req.body;
  // console.log(`Vote request: id=${id}, userId=${userId}, voteType=${voteType}`); // Debug
  try {
    const result = await proposalService.voteProposal(id, userId, voteType);
    if (!result) return res.status(404).json({ message: 'Proposal not found' });
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Error in vote endpoint:', error); // Detaljan log
    res.status(500).json({ error: error.message });
  }
});

// Endpoint za proveru da li je korisnik već glasao
router.get('/proposals/:id/user-vote', async (req,res) => {
  const proposalId = parseInt(req.params.id);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('proposal_id', proposalId)
      .eq('user_id', parseInt(userId))
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user vote:', error);
      return res.status(500).json({ error: 'Failed to check user vote' });
    }
    
    // Ako nema glasa (PGRST116), vrati null
    if (error && error.code === 'PGRST116') {
      return res.json({ vote_type: null });
    }
    
    res.json({ vote_type: data.vote_type });
  } catch (error) {
    console.error('Error in user-vote endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint za dohvatanje korisnika koji su glasali za određenu opciju
router.get('/proposals/:id/votes/:voteType/users', async (req, res) => {
  const proposalId = parseInt(req.params.id);
  const voteType = req.params.voteType;
  
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('user_id')
      .eq('proposal_id', proposalId)
      .eq('vote_type', voteType);
      
    if (error) {
      console.error('Error fetching users for vote type:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    // Dohvati detalje o korisnicima
    if (data && data.length > 0) {
      const userIds = data.map(vote => vote.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
        
      if (usersError) {
        console.error('Error fetching user details:', usersError);
        return res.status(500).json({ error: 'Failed to fetch user details' });
      }
      
      res.json(users || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error in votes users endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/proposals/:id/edits', async (req, res) => {
  const id = parseInt(req.params.id);
  const edits = await proposalService.getEdits(id);
  res.json(edits);
});

router.post('/proposals/:id/edits', async (req, res) => {
  const id = parseInt(req.params.id);
  const edit = await proposalService.createEdit(id, req.body);
  res.status(201).json(edit);
});

router.post('/proposals/:id/edits/:editId/merge', async (req, res) => {
  const id = parseInt(req.params.id);
  const editId = parseInt(req.params.editId);
  const proposal = await proposalService.mergeEdit(id, editId);
  if (!proposal) return res.status(404).json({ message: 'Edit not found' });
  res.json({ merged: true, proposal });
});

// AI helper stubs
router.post('/ai/suggest', (req, res) => {
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

router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/municipalities', async (req, res) => {
  const { data, error } = await supabase.from('municipalities').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/categories', async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/ai/validate', (req, res) => {
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

// Track proposal contribution
router.post('/proposals/:id/contribute', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, contributionType, fieldName, oldValue, newValue, editSummary, filesAdded, filesRemoved } = req.body;
    
    const { data, error } = await supabase
      .from('proposal_contributions')
      .insert({
        proposal_id: parseInt(id),
        user_id: userId,
        contribution_type: contributionType,
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue,
        edit_summary: editSummary,
        files_added: filesAdded || [],
        files_removed: filesRemoved || [],
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error tracking contribution:', error);
    res.status(500).json({ error: 'Failed to track contribution' });
  }
});

// Get pending contributions for a proposal
router.get('/proposals/:id/pending-contributions', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('proposal_id', parseInt(id))
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (contributionsError) throw contributionsError;
    
    // Then get user details for each contribution
    if (contributions && contributions.length > 0) {
      const userIds = contributions.map(c => c.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      
      if (usersError) throw usersError;
      
      // Merge user data with contributions
      const enrichedContributions = contributions.map(contribution => {
        const user = users.find(u => u.id === contribution.user_id);
        return {
          ...contribution,
          user: user || { first_name: 'Unknown', last_name: 'User', email: 'unknown@example.com' }
        };
      });
      
      res.json(enrichedContributions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching pending contributions:', error);
    res.status(500).json({ error: 'Failed to fetch pending contributions' });
  }
});

// Approve or reject contribution
router.put('/proposals/:id/contributions/:contributionId/status', async (req, res) => {
  try {
    const { id, contributionId } = req.params;
    const { status, userId } = req.body; // status: 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
    }
    
    // First check if contribution exists
    const { data: contribution, error: fetchError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', parseInt(contributionId))
      .eq('proposal_id', parseInt(id))
      .single();
    
    if (fetchError || !contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    // Update contribution status
    const { data: updatedContribution, error: updateError } = await supabase
      .from('proposal_contributions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(contributionId))
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating contribution:', updateError);
      return res.status(500).json({ error: 'Failed to update contribution status' });
    }
    
    console.log(`✅ [BACKEND] Contribution ${contributionId} ${status} successfully`);
    res.json(updatedContribution);
    
  } catch (error) {
    console.error('Error updating contribution status:', error);
    res.status(500).json({ error: 'Failed to update contribution status' });
  }
});

// Get proposal contribution history
router.get('/proposals/:id/contributions', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ALL contributions (not just pending)
    const { data: contributions, error: contributionsError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('proposal_id', parseInt(id))
      .order('created_at', { ascending: false });
    
    if (contributionsError) throw contributionsError;
    
    // Then get user details for each contribution
    if (contributions && contributions.length > 0) {
      const userIds = contributions.map(c => c.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      
      if (usersError) throw usersError;
      
      // Merge user data with contributions
      const enrichedContributions = contributions.map(contribution => {
        const user = users.find(u => u.id === contribution.user_id);
        return {
          ...contribution,
          first_name: user?.first_name || 'Unknown',
          last_name: user?.last_name || 'User',
          email: user?.email || 'unknown@example.com'
        };
      });
      
      res.json(enrichedContributions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// Get single contribution by ID
router.get('/proposals/:id/contributions/:contributionId', async (req, res) => {
  try {
    const { id, contributionId } = req.params;
    
    // Get contribution
    const { data: contribution, error: contributionError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', parseInt(contributionId))
      .eq('proposal_id', parseInt(id))
      .single();
    
    if (contributionError || !contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', contribution.user_id)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      // Return contribution without user details if user fetch fails
      res.json(contribution);
      return;
    }
    
    // Merge user data with contribution
    const enrichedContribution = {
      ...contribution,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    };
    
    res.json(enrichedContribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
});

// Get user's contributions across all proposals
router.get('/user/:userId/contributions', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First get contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });
    
    if (contributionsError) throw contributionsError;
    
    // Then get proposal details for each contribution
    if (contributions && contributions.length > 0) {
      const proposalIds = contributions.map(c => c.proposal_id);
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('id, title, municipality_id')
        .in('id', proposalIds);
      
      if (proposalsError) throw proposalsError;
      
      // Get municipality names
      const municipalityIds = [...new Set(proposals.map(p => p.municipality_id))];
      const { data: municipalities, error: municipalitiesError } = await supabase
        .from('municipalities')
        .select('id, name')
        .in('id', municipalityIds);
      
      if (municipalitiesError) throw municipalitiesError;
      
      // Merge proposal data with contributions
      const enrichedContributions = contributions.map(contribution => {
        const proposal = proposals.find(p => p.id === contribution.proposal_id);
        const municipality = municipalities.find(m => m.id === proposal?.municipality_id);
        return {
          ...contribution,
          proposal: proposal ? {
            title: proposal.title,
            municipality: municipality?.name || 'Unknown'
          } : { title: 'Unknown', municipality: 'Unknown' }
        };
      });
      
      res.json(enrichedContributions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    res.status(500).json({ error: 'Failed to fetch user contributions' });
  }
});

// New routes for edit management
router.post('/proposals/:id/propose-edit', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const { userId, editData } = req.body;
    
    const result = await proposalService.proposeEdit(proposalId, userId, editData);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error proposing edit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/proposals/edits/:contributionId/approve', async (req, res) => {
  try {
    const contributionId = parseInt(req.params.contributionId);
    const { approverId } = req.body;
    
    const result = await proposalService.approveEdit(contributionId, approverId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error approving edit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/proposals/edits/:contributionId/reject', async (req, res) => {
  try {
    const contributionId = parseInt(req.params.contributionId);
    const { rejectorId } = req.body;
    
    const result = await proposalService.rejectEdit(contributionId, rejectorId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error rejecting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/proposals/:id/pending-edits', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const pendingEdits = await proposalService.getPendingEdits(proposalId);
    res.status(200).json(pendingEdits);
  } catch (error) {
    console.error('Error fetching pending edits:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const notifications = await proposalService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    const result = await proposalService.markNotificationAsRead(notificationId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get edit details for a specific contribution
router.get('/proposals/edit-details/:contributionId', async (req, res) => {
  try {
    const contributionId = parseInt(req.params.contributionId);
    const editDetails = await proposalService.getEditDetails(contributionId);
    res.status(200).json(editDetails);
  } catch (error) {
    console.error('Error fetching edit details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept an edit
router.post('/proposals/accept-edit/:contributionId', async (req, res) => {
  try {
    const contributionId = parseInt(req.params.contributionId);
    const { userId } = req.body;
    
    const result = await proposalService.acceptEdit(contributionId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error accepting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject an edit
router.post('/proposals/reject-edit/:contributionId', async (req, res) => {
  try {
    const contributionId = parseInt(req.params.contributionId);
    const { userId } = req.body;
    
    const result = await proposalService.rejectEdit(contributionId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error rejecting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contributors for a proposal
router.get('/proposals/:id/contributors', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const contributors = await proposalService.getProposalContributors(proposalId);
    res.status(200).json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all contributions for a proposal (for Contribution History)
router.get('/proposals/:id/contributions', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    console.log(`🚀 [ROUTE] /proposals/${proposalId}/contributions called`);
    console.log(`🔍 [ROUTE] About to call proposalService.getProposalHistory(${proposalId})`);
    
    const history = await proposalService.getProposalHistory(proposalId);
    
    console.log(`📊 [ROUTE] getProposalHistory returned:`, history);
    console.log(`📤 [ROUTE] Sending ${history?.length || 0} history records to frontend`);
    
    res.status(200).json(history);
  } catch (error) {
    console.error('❌ [ROUTE] Error fetching contributions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get proposal history (all actions on a proposal)
router.get('/proposals/:id/history', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const history = await proposalService.getProposalHistory(proposalId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching proposal history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new contribution for a proposal
router.post('/proposals/:id/contributions', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const contributionData = req.body;
    
    console.log(`🚀 [ROUTE] Creating contribution for proposal ${proposalId}:`, contributionData);
    
    // Validate required fields
    if (!contributionData.user_id || !contributionData.field_name || !contributionData.new_value) {
      return res.status(400).json({ error: 'Missing required fields: user_id, field_name, new_value' });
    }
    
    // Insert contribution into database
    const { data: contribution, error } = await supabase
      .from('proposal_contributions')
      .insert({
        proposal_id: proposalId,
        user_id: contributionData.user_id,
        field_name: contributionData.field_name,
        old_value: contributionData.old_value || null,
        new_value: contributionData.new_value,
        edit_summary: contributionData.edit_summary || 'User contribution',
        contribution_type: contributionData.contribution_type || 'edit',
        status: contributionData.status || 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [ROUTE] Error inserting contribution:', error);
      throw error;
    }
    
    console.log(`✅ [ROUTE] Contribution created successfully:`, contribution);
    res.status(201).json(contribution);
    
  } catch (error) {
    console.error('❌ [ROUTE] Error creating contribution:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;