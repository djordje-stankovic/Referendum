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

async function voteProposal(proposalId, userId, voteType) {
  console.log(`Voting in service: proposalId=${proposalId}, userId=${userId}, voteType=${voteType}`); // Debug
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
  const { data, error } = await supabase.from('proposals').insert(proposal).select();
  if (error) throw error;
  return data[0];
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

module.exports = { getAllProposals, createProposal, updateProposal, voteProposal, getEdits, createEdit, mergeEdit };