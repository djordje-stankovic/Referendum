const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all drafts for a user
router.get('/drafts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: drafts, error } = await supabase
      .from('drafts')
      .select(`
        id,
        title,
        category_id,
        summary,
        details,
        attachments,
        created_at,
        updated_at,
        categories(name)
      `)
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch drafts' });
    }
    
    // Transform data to match expected format
    const transformedDrafts = drafts.map(draft => ({
      ...draft,
      category_name: draft.categories?.name || 'General'
    }));
    
    res.json(transformedDrafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Get a specific draft by ID
router.get('/drafts/:userId/:draftId', async (req, res) => {
  try {
    const { userId, draftId } = req.params;
    
    const { data: draft, error } = await supabase
      .from('drafts')
      .select(`
        id,
        title,
        category_id,
        summary,
        details,
        attachments,
        created_at,
        updated_at,
        categories(name)
      `)
      .eq('id', draftId)
      .eq('author_id', userId)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch draft' });
    }
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    // Transform data to match expected format
    const transformedDraft = {
      ...draft,
      category_name: draft.categories?.name || 'General'
    };
    
    res.json(transformedDraft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// Create or update a draft
router.post('/drafts', async (req, res) => {
  try {
    const { 
      author_id, 
      title, 
      category_id, 
      summary, 
      details, 
      attachments,
      draft_id 
    } = req.body;
    
    let result;
    
    if (draft_id) {
      // Update existing draft
      const { data: updatedDraft, error: updateError } = await supabase
        .from('drafts')
        .update({
          title: title,
          category_id: category_id,
          summary: summary,
          details: details,
          attachments: attachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', draft_id)
        .eq('author_id', author_id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        return res.status(500).json({ error: 'Failed to update draft' });
      }
      
      if (!updatedDraft) {
        return res.status(404).json({ error: 'Draft not found or unauthorized' });
      }
      result = updatedDraft;
    } else {
      // Create new draft
      const { data: newDraft, error: insertError } = await supabase
        .from('drafts')
        .insert({
          author_id: author_id,
          title: title,
          category_id: category_id,
          summary: summary,
          details: details,
          attachments: attachments
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return res.status(500).json({ error: 'Failed to save draft' });
      }
      result = newDraft;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Delete a draft
router.delete('/drafts/:userId/:draftId', async (req, res) => {
  try {
    const { userId, draftId } = req.params;
    
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)
      .eq('author_id', userId);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete draft' });
    }
    
    res.json({ message: 'Draft deleted successfully', id: draftId });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// Convert draft to proposal
router.post('/drafts/:userId/:draftId/convert', async (req, res) => {
  try {
    const { userId, draftId } = req.params;
    
    // Get draft data
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select(`
        id,
        title,
        category_id,
        summary,
        details,
        attachments,
        municipality_id,
        author_id
      `)
      .eq('id', draftId)
      .eq('author_id', userId)
      .single();
    
    if (draftError) {
      console.error('Supabase draft error:', draftError);
      return res.status(500).json({ error: 'Failed to fetch draft for conversion' });
    }
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found or unauthorized' });
    }
    
    // Create proposal from draft
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        title: draft.title,
        category_id: draft.category_id,
        municipality_id: draft.municipality_id || 1,
        summary: draft.summary,
        details: draft.details,
        attachments: draft.attachments,
        author_id: draft.author_id,
        status: 'active'
      })
      .select()
      .single();
    
    if (proposalError) {
      console.error('Supabase proposal error:', proposalError);
      return res.status(500).json({ error: 'Failed to convert draft to proposal' });
    }
    
    // Delete the draft after successful conversion
    const { error: deleteError } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId);
    
    if (deleteError) {
      console.error('Supabase delete draft error:', deleteError);
      // Continue with response even if draft deletion fails
    }
    
    res.json({
      message: 'Draft converted to proposal successfully',
      proposal: proposal
    });
    
  } catch (error) {
    console.error('Error converting draft to proposal:', error);
    res.status(500).json({ error: 'Failed to convert draft to proposal' });
  }
});

module.exports = router;
