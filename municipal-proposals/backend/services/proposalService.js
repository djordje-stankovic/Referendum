// backend/services/proposalService.js
const { supabase } = require('../config/supabase');

async function getAllProposals() {
  try {
    // Dohvatanje osnovnih podataka o predlozima
    const { data: proposals, error: proposalsError } = await supabase.from('proposals').select('*');
    if (proposalsError) throw proposalsError;

    // Dohvatanje svih glasova bez grupisanja, pa ručno agregiramo
    const proposalIds = proposals.map(p => p.id);
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('proposal_id, vote_type')
      .in('proposal_id', proposalIds); // Koristimo .in() umesto .eq('in', ...)
    if (votesError) throw votesError;

    // Ručno agregiranje glasova po predlogu i tipu glasa
    const voteCounts = votes.reduce((acc, v) => {
      if (!acc[v.proposal_id]) acc[v.proposal_id] = { for: 0, against: 0, abstain: 0 };
      if (v.vote_type === 'for') acc[v.proposal_id].for += 1;
      if (v.vote_type === 'against') acc[v.proposal_id].against += 1;
      if (v.vote_type === 'abstain') acc[v.proposal_id].abstain += 1;
      return acc;
    }, {});

    // Dodavanje broja glasova u svaki predlog
    return proposals.map(p => ({
      ...p,
      votes: voteCounts[p.id] || { for: 0, against: 0, abstain: 0 },
    }));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

async function getProposalById(id) {
  try {
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return proposal;
  } catch (error) {
    console.error('Error fetching proposal by ID:', error);
    throw error;
  }
}

async function voteProposal(proposalId, userId, voteType) {
      // console.log(`Voting in service: proposalId=${proposalId}, userId=${userId}, voteType=${voteType}`); // Debug
  try {
    // Provera da li je korisnik već glasao za ovaj predlog
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('user_id', userId)
      .single();
    if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 znači da nema rezultata
    if (existingVote) throw new Error('User has already voted for this proposal');

    // Unos novog glasa
    const { data, error: insertError } = await supabase
      .from('votes')
      .insert({ proposal_id: proposalId, user_id: userId, vote_type: voteType })
      .select();
    if (insertError) throw insertError;

    // Create proposal history record for the vote
    const { error: historyError } = await supabase
      .from('proposal_history')
      .insert({
        proposal_id: proposalId,
        user_id: userId,
        action_type: 'voted',
        action_summary: `User ${userId} voted ${voteType} on proposal ${proposalId}`
      });
    
    if (historyError) {
      console.error('Failed to create vote history:', historyError);
    }

    // Dobijanje ažuriranih glasova za predlog
    const { data: votes, error: countError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('proposal_id', proposalId);
    if (countError) throw countError;

    // Ručno agregiranje glasova
    const voteCounts = {
      for: 0,
      against: 0,
      abstain: 0,
    };
    votes.forEach(v => {
      if (v.vote_type === 'for') voteCounts.for += 1;
      if (v.vote_type === 'against') voteCounts.against += 1;
      if (v.vote_type === 'abstain') voteCounts.abstain += 1;
    });

    // Ažuriranje proposals tabele sa brojem glasova (opcionalno)
    const { error: updateError } = await supabase
      .from('proposals')
      .update({ votes: voteCounts })
      .eq('id', proposalId);
    if (updateError) throw updateError;

    return { voters: data[0], voteCounts };
  } catch (error) {
    console.error('Vote service error:', error.message, error); // Detaljan log
    throw error;
  }
}

async function createProposal(proposal) {
  try {
    // Validate required fields
    if (!proposal.title || !proposal.summary || !proposal.municipality_id || !proposal.category_id || !proposal.author_id) {
      throw new Error('Missing required fields: title, summary, municipality_id, category_id, and author_id are required');
    }

    // Transform data to match database schema
    const proposalData = {
      title: proposal.title,
      summary: proposal.summary,
      municipality_id: proposal.municipality_id || 1, // Use municipality_id instead of municipality
      category_id: proposal.category_id || 1, // Use category_id instead of category
      author_id: proposal.author_id, // Use author_id from frontend
      status: proposal.status || 'active', // Changed from 'pending' to 'active' to match database constraint
      problem_description: proposal.details?.problem || '',
      proposed_solution: proposal.details?.solution || '',
      estimated_cost: proposal.details?.cost || '',
      expected_impact: proposal.details?.impact || '',
      // attachments: proposal.attachments || [], // Removed - column doesn't exist in database
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // console.log('Attempting to create proposal with data:', proposalData);

    const { data, error } = await supabase.from('proposals').insert(proposalData).select();
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // Create proposal history record
    const { error: historyError } = await supabase
      .from('proposal_history')
      .insert({
        proposal_id: data[0].id,
        user_id: proposal.author_id,
        action_type: 'created',
        action_summary: `Proposal "${proposalData.title}" created by user ${proposal.author_id}`
      });
    
    if (historyError) {
      console.error('Failed to create proposal history:', historyError);
    }
    
    // console.log('Proposal created successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

async function updateProposal(id, proposal) {
  const { data, error } = await supabase.from('proposals').update(proposal).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function getEdits(id) {
  const { data, error } = await supabase.from('edits').select('*').eq('proposal_id', id);
  if (error) throw error;
  return data;
}

async function createEdit(id, edit) {
  const { data, error } = await supabase.from('edits').insert({ ...edit, proposal_id: id }).select();
  if (error) throw error;
  return data[0];
}

async function mergeEdit(id, editId) {
  const { data, error } = await supabase.from('proposals').select('*').eq('id', id).single();
  if (error) throw error;
  // Logika za merge
  return data;
}

// New functions for proposal edit management
async function proposeEdit(proposalId, userId, editData) {
  try {
    // Get current proposal data
    const { data: currentProposal, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();
    if (fetchError) throw fetchError;

    // Validate userId is a valid number (from our users table)
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid user ID format. Expected number.');
    }

    // Create contribution record for each changed field
    const contributions = [];
    const fields = ['title', 'summary', 'problem_description', 'proposed_solution', 'estimated_cost', 'expected_impact'];
    
    for (const field of fields) {
      if (editData[field] && editData[field] !== currentProposal[field]) {
        contributions.push({
          proposal_id: proposalId,
          user_id: userId, // Ovo sada mora biti UUID
          contribution_type: 'edit',
          field_name: field,
          old_value: currentProposal[field],
          new_value: editData[field],
          edit_summary: editData.edit_summary || 'Field updated',
          status: 'pending'
        });
      }
    }

    if (contributions.length === 0) {
      throw new Error('No changes detected');
    }

    // Insert contributions
    const { data: insertedContributions, error: insertError } = await supabase
      .from('proposal_contributions')
      .insert(contributions)
      .select();
    if (insertError) throw insertError;

    // Create notification for proposal author
    const notification = {
      user_id: currentProposal.author_id,
      proposal_id: proposalId,
      contribution_id: insertedContributions[0].id,
      type: 'edit_proposed',
      title: 'Proposal Edit Proposed',
      message: `User ${userId} has proposed changes to your proposal "${currentProposal.title}"`,
      is_read: false
    };

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notification);
    if (notifError) console.error('Notification creation failed:', notifError);

    return insertedContributions;
  } catch (error) {
    console.error('Error proposing edit:', error);
    throw error;
  }
}

async function approveEdit(contributionId, approverId) {
  try {
    // Get contribution details
    const { data: contribution, error: fetchError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', contributionId)
      .single();
    if (fetchError) throw fetchError;

    // Update proposal with new value
    const updateData = {};
    updateData[contribution.field_name] = contribution.new_value;
    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', contribution.proposal_id);
    if (updateError) throw updateError;

    // Mark contribution as approved
    const { error: approveError } = await supabase
      .from('proposal_contributions')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', contributionId);
    if (approveError) throw approveError;

    // Add user to contributors if not already there
    const { data: existingContributor, error: checkError } = await supabase
      .from('proposal_contributors')
      .select('id')
      .eq('proposal_id', contribution.proposal_id)
      .eq('user_id', contribution.user_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // User is not a contributor yet, add them
      const { error: contributorError } = await supabase
        .from('proposal_contributors')
        .insert({
          proposal_id: contribution.proposal_id,
          user_id: contribution.user_id,
          contribution_type: 'contributor',
          contribution_summary: `Contributed through approved edit on ${new Date().toLocaleDateString()}`,
          is_active: true
        });
      if (contributorError) console.error('Failed to add contributor:', contributorError);
    }

    // Create notification for the user who proposed the edit
    const notification = {
      user_id: contribution.user_id,
      proposal_id: contribution.proposal_id,
      contribution_id: contributionId,
      type: 'edit_approved',
      title: 'Edit Approved',
      message: `Your edit to proposal has been approved!`,
      is_read: false
    };

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notification);
    if (notifError) console.error('Notification creation failed:', notifError);

    return { success: true, message: 'Edit approved successfully' };
  } catch (error) {
    console.error('Error approving edit:', error);
    throw error;
  }
}

async function rejectEdit(contributionId, rejectorId) {
  try {
    // Mark contribution as rejected
    const { error: rejectError } = await supabase
      .from('proposal_contributions')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', contributionId);
    if (rejectError) throw rejectError;

    // Get contribution details for notification
    const { data: contribution, error: fetchError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', contributionId)
      .single();
    if (fetchError) throw fetchError;

    // Create notification for the user who proposed the edit
    const notification = {
      user_id: contribution.user_id,
      proposal_id: contribution.proposal_id,
      contribution_id: contributionId,
      type: 'edit_rejected',
      title: 'Edit Rejected',
      message: `Your edit to proposal has been rejected.`,
      is_read: false
    };

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notification);
    if (notifError) console.error('Notification creation failed:', notifError);

    // Remove the original edit notification
    await removeEditNotification(contribution.proposal_id, contribution.user_id, contributionId);

    return { success: true, message: 'Edit rejected successfully' };
  } catch (error) {
    console.error('Error rejecting edit:', error);
    throw error;
  }
}

// Helper function to remove edit notifications
async function removeEditNotification(proposalId, contributorUserId, contributionId) {
  try {
    // Find and remove ALL edit_proposed notifications for this proposal
    // We need to remove notifications where the proposal author is notified about edits
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('proposal_id', proposalId)
      .eq('type', 'edit_proposed');
    
    if (error) {
      console.error('Failed to remove edit notifications:', error);
    } else {
      // console.log(`Removed edit notifications for proposal ${proposalId}`);
    }
  } catch (error) {
    console.error('Error removing edit notifications:', error);
  }
}

async function getPendingEdits(proposalId) {
  try {
    // First get all pending edit contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('status', 'pending')
      .eq('contribution_type', 'edit')
      .order('created_at', { ascending: false });
    
    if (contributionsError) throw contributionsError;
    
    if (contributions && contributions.length > 0) {
      // Group contributions by user and creation time (within 1 minute = same edit session)
      const groupedContributions = [];
      const processedUsers = new Set();
      
      for (const contribution of contributions) {
        if (processedUsers.has(contribution.user_id)) continue;
        
        // Find all contributions from this user in the same edit session
        const userContributions = contributions.filter(c => 
          c.user_id === contribution.user_id && 
          Math.abs(new Date(c.created_at) - new Date(contribution.created_at)) < 60000 // Within 1 minute
        );
        
        if (userContributions.length > 0) {
          // Get user details
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username, first_name, last_name')
            .eq('id', contribution.user_id)
            .single();
          
          if (userError) continue;
          
          // Get proposal details
          const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .select('title')
            .eq('id', proposalId)
            .single();
          
          if (proposalError) continue;
          
          // Create grouped contribution with all field changes
          const groupedContribution = {
            id: contribution.id, // Use first contribution ID as main ID
            user_id: contribution.user_id,
            proposal_id: contribution.proposal_id,
            created_at: contribution.created_at,
            users: user ? { username: user.username, full_name: `${user.first_name} ${user.last_name}` } : { username: 'Unknown', full_name: 'Unknown User' },
            proposals: { title: proposal.title },
            field_changes: userContributions.map(c => ({
              field_name: c.field_name,
              old_value: c.old_value,
              new_value: c.new_value,
              edit_summary: c.edit_summary
            })),
            // Add summary of all changes
            change_summary: userContributions.map(c => `${c.field_name}: "${c.old_value || 'Empty'}" → "${c.new_value}"`).join(', ')
          };
          
          groupedContributions.push(groupedContribution);
          processedUsers.add(contribution.user_id);
        }
      }
      
      return groupedContributions;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching pending edits:', error);
    throw error;
  }
}

async function getUserNotifications(userId) {
  try {
    // First get notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (notificationsError) throw notificationsError;
    
    // Then get proposal details for each notification
    if (notifications && notifications.length > 0) {
      const proposalIds = notifications.map(n => n.proposal_id).filter(id => id);
      const contributionIds = notifications.map(n => n.contribution_id).filter(id => id);
      
      let proposals = [];
      let contributions = [];
      
      if (proposalIds.length > 0) {
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposals')
          .select('id, title')
          .in('id', proposalIds);
        
        if (proposalsError) throw proposalsError;
        proposals = proposalsData || [];
      }
      
             if (contributionIds.length > 0) {
         const { data: contributionsData, error: contributionsError } = await supabase
           .from('proposal_contributions')
           .select('id, field_name, old_value, new_value')
           .in('id', contributionIds);
         
         if (contributionsError) throw contributionsError;
         contributions = contributionsData || [];
       }
      
      // Merge data
      return notifications.map(notification => {
        const proposal = proposals.find(p => p.id === notification.proposal_id);
        const contribution = contributions.find(c => c.id === notification.contribution_id);
        
        return {
          ...notification,
          proposals: proposal ? { title: proposal.title } : null,
          proposal_contributions: contribution ? { 
            field_name: contribution.field_name, 
            old_value: contribution.old_value, 
            new_value: contribution.new_value 
          } : null
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

async function getEditDetails(contributionId) {
  try {
    // First get contribution details
    const { data: contribution, error: fetchError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', contributionId)
      .single();
    
    if (fetchError) throw fetchError;

    // Then get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, username')
      .eq('id', contribution.user_id)
      .single();
    
    if (userError) throw userError;

    // Then get current proposal details for comparison
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', contribution.proposal_id)
      .single();
    
    if (proposalError) throw proposalError;

    // Get all changes for this contribution
    const { data: changes, error: changesError } = await supabase
      .from('proposal_contributions')
      .select('field_name, old_value, new_value, edit_summary')
      .eq('id', contributionId);

    if (changesError) throw changesError;

    // Create enhanced changes with current values for comparison
    const enhancedChanges = changes.map(change => ({
      ...change,
      current_value: proposal[change.field_name] || '',
      has_changed: proposal[change.field_name] !== change.new_value
    }));

    return {
      user_name: `${user.first_name} ${user.last_name}` || user.username,
      proposal_title: proposal.title,
      changes: enhancedChanges,
      edit_summary: contribution.edit_summary,
      created_at: contribution.created_at,
      contribution_id: contribution.id,
      proposal_id: contribution.proposal_id
    };
  } catch (error) {
    console.error('Error fetching edit details:', error);
    throw error;
  }
}

async function acceptEdit(contributionId, userId) {
  try {
    // Get the main contribution to find the user and proposal
    const { data: mainContribution, error: fetchError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('id', contributionId)
      .single();
    if (fetchError) throw fetchError;

    const proposalId = mainContribution.proposal_id;
    const contributorUserId = mainContribution.user_id;

    // Find all pending contributions from this user for this proposal (same edit session)
    const { data: allPendingContributions, error: pendingError } = await supabase
      .from('proposal_contributions')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('user_id', contributorUserId)
      .eq('status', 'pending')
      .eq('contribution_type', 'edit');
    if (pendingError) throw pendingError;

    // console.log(`🔍 Found ${allPendingContributions?.length || 0} pending contributions for user ${contributorUserId} on proposal ${proposalId}`);
    // console.log('📝 Pending contributions:', allPendingContributions);

    if (!allPendingContributions || allPendingContributions.length === 0) {
      throw new Error('No pending contributions found');
    }

    // Prepare update data for all changed fields
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Add all changed fields to update data
    allPendingContributions.forEach(contribution => {
      if (contribution.field_name && contribution.new_value !== undefined) {
        updateData[contribution.field_name] = contribution.new_value;
      }
    });

    // Update proposal with all new values
    const { error: updateError } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', proposalId);
    if (updateError) throw updateError;

    // Create proposal history records for each change
    for (const contribution of allPendingContributions) {
      if (contribution.field_name && contribution.new_value !== undefined) {
        const { error: historyError } = await supabase
          .from('proposal_history')
          .insert({
            proposal_id: proposalId,
            user_id: contributorUserId,
            action_type: 'field_updated',
            field_name: contribution.field_name,
            old_value: contribution.old_value,
            new_value: contribution.new_value,
            action_summary: `Field "${contribution.field_name}" updated by user ${contributorUserId}`
          });
        
        if (historyError) {
          console.error('Failed to create history record:', historyError);
        }
      }
    }

    // Mark all pending contributions as approved
    // console.log(`✅ Approving ${allPendingContributions.length} contributions for user ${contributorUserId} on proposal ${proposalId}`);
    
    const { error: approveError } = await supabase
      .from('proposal_contributions')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('proposal_id', proposalId)
      .eq('user_id', contributorUserId)
      .eq('status', 'pending')
      .eq('contribution_type', 'edit');
    if (approveError) throw approveError;
    
    // console.log(`✅ Successfully approved all pending contributions`);

    // Add user to proposal_contributors table if not already there
    const { data: existingContributor, error: checkError } = await supabase
      .from('proposal_contributors')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('user_id', contributorUserId)
      .single();
    
    // console.log('Debug - existingContributor:', existingContributor);
    // console.log('Debug - checkError:', checkError);
    
    // Check if user is already a contributor
    if (existingContributor && existingContributor.id) {
      // User is already a contributor, update their record
      const { error: updateError } = await supabase
        .from('proposal_contributors')
        .update({
          contribution_date: new Date().toISOString(),
          contribution_summary: `Contributed through approved edit on ${new Date().toLocaleDateString()}`,
          is_active: true
        })
        .eq('id', existingContributor.id);
      
      if (updateError) {
        console.error('Failed to update contributor:', updateError);
      } else {
        // console.log(`Updated contributor record for user ${contributorUserId} on proposal ${proposalId}`);
      }
    } else {
      // User is not a contributor yet, add them
      const { error: contributorError } = await supabase
        .from('proposal_contributors')
        .insert({
          proposal_id: proposalId,
          user_id: contributorUserId,
          contribution_type: 'contributor',
          contribution_summary: `Contributed through approved edit on ${new Date().toLocaleDateString()}`,
          is_active: true
        });
      if (contributorError) {
        console.error('Failed to add contributor:', contributorError);
      } else {
        // console.log(`Successfully added user ${contributorUserId} as contributor for proposal ${proposalId}`);
      }
    }

    // Create notification for the user who proposed the edit
    const notification = {
      user_id: contributorUserId,
      proposal_id: proposalId,
      contribution_id: contributionId,
      type: 'edit_approved',
      title: 'Edit Approved',
      message: `Your edit to proposal has been approved!`,
      is_read: false
    };

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notification);
    if (notifError) console.error('Notification creation failed:', notifError);

    // Remove the original edit notification
    await removeEditNotification(proposalId, contributorUserId, contributionId);

    return { success: true, message: 'All edits approved successfully' };
  } catch (error) {
    console.error('Error accepting edit:', error);
    throw error;
  }
}

// New function to get contributors for a proposal
async function getProposalContributors(proposalId) {
  try {
    // Get contributors from proposal_contributors table
    const { data: contributors, error: contributorsError } = await supabase
      .from('proposal_contributors')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('is_active', true)
      .order('contribution_date', { ascending: false });
    
    if (contributorsError) throw contributorsError;
    
    // Then get user details for each contributor
    if (contributors && contributors.length > 0) {
      const userIds = contributors.map(c => c.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, first_name, last_name')
        .in('id', userIds);
      
      if (usersError) throw usersError;
      
      // Merge user data with contributors
      return contributors.map(contributor => {
        const user = users.find(u => u.id === contributor.user_id);
        return {
          id: user?.id || contributor.user_id,
          username: user?.username || 'Unknown',
          first_name: user?.first_name || 'Unknown',
          last_name: user?.last_name || 'User',
          full_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
          contribution_date: contributor.contribution_date,
          contribution_summary: contributor.contribution_summary
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching proposal contributors:', error);
    throw error;
  }
}

// Function to get all contributions for a proposal (for Contribution History)
async function getAllProposalContributions(proposalId) {
  try {
    console.log(`🔍 Fetching contributions for proposal ${proposalId}`);
    
    // Get only approved/rejected contributions (not pending)
    const { data: contributions, error: contributionsError } = await supabase
      .from('proposal_contributions')
      .select(`
        *,
        users(id, username, first_name, last_name)
      `)
      .eq('proposal_id', proposalId)
      .neq('status', 'pending') // Exclude pending contributions
      .order('updated_at', { ascending: false }); // Order by when it was approved/rejected
    
    if (contributionsError) throw contributionsError;
    
    console.log(`📊 Found ${contributions?.length || 0} contributions:`, contributions);
    
    // Transform the data to match frontend expectations
    const transformedContributions = contributions.map(contribution => {
      const user = contribution.users;
      return {
        id: contribution.id,
        user_id: contribution.user_id,
        first_name: user?.first_name || 'Unknown',
        last_name: user?.last_name || 'User',
        full_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
        contribution_type: contribution.contribution_type,
        field_name: contribution.field_name,
        old_value: contribution.old_value,
        new_value: contribution.new_value,
        edit_summary: contribution.edit_summary,
        status: contribution.status,
        created_at: contribution.created_at, // When the edit was proposed
        updated_at: contribution.updated_at, // When it was approved/rejected
        files_added: contribution.files_added
      };
    });
    
    console.log(`✅ Returning ${transformedContributions.length} transformed contributions`);
    return transformedContributions;
  } catch (error) {
    console.error('Error fetching all proposal contributions:', error);
    throw error;
  }
}

// Function to get proposal history (all actions on a proposal)
async function getProposalHistory(proposalId) {
  console.log(`🚨 [DEBUG] getProposalHistory function called with proposalId: ${proposalId}`);
  try {
    console.log(`🔍 [CONTRIBUTION HISTORY] Fetching history for proposal ${proposalId}`);
    
    const { data: history, error: historyError } = await supabase
      .from('proposal_history')
      .select(`
        *,
        users(id, username, first_name, last_name)
      `)
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });
    
    if (historyError) throw historyError;
    
    console.log(`📊 [CONTRIBUTION HISTORY] Found ${history?.length || 0} history records:`, history);
    
    // Transform the data to match frontend expectations
    const transformedHistory = history.map(record => {
      const user = record.users;
      return {
        id: record.id,
        user_id: record.user_id,
        first_name: user?.first_name || 'Unknown',
        last_name: user?.last_name || 'User',
        full_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
        contribution_type: record.action_type === 'field_updated' ? 'edit' : record.action_type,
        field_name: record.field_name,
        old_value: record.old_value,
        new_value: record.new_value,
        edit_summary: record.action_summary,
        created_at: record.created_at,
        updated_at: record.created_at // Frontend očekuje updated_at
      };
    });
    
    console.log(`✅ [CONTRIBUTION HISTORY] Returning ${transformedHistory.length} transformed history records`);
    return transformedHistory;
  } catch (error) {
    console.error('❌ [CONTRIBUTION HISTORY] Error fetching proposal history:', error);
    throw error;
  }
}

module.exports = { 
  getAllProposals, 
  getProposalById,
  createProposal, 
  updateProposal, 
  voteProposal, 
  getEdits, 
  createEdit, 
  mergeEdit,
  proposeEdit,
  approveEdit,
  rejectEdit,
  getPendingEdits,
  getUserNotifications,
  markNotificationAsRead,
  getEditDetails,
  acceptEdit,
  getProposalContributors,
  getAllProposalContributions,
  getProposalHistory
};