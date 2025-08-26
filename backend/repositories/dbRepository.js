// backend/repositories/dbRepository.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const AbstractRepository = require('./abstractRepository');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

class DbRepository extends AbstractRepository {
  async findAll() {
    const { data, error } = await supabase.from('proposals').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase.from('proposals').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data || null;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from('proposals')
      .insert({
        title: data.title,
        summary: data.summary,
        problem_description: data.problem_description,
        proposed_solution: data.proposed_solution,
        estimated_cost: data.estimated_cost,
        expected_impact: data.expected_impact,
        category_id: data.category_id,
        municipality_id: data.municipality_id,
        author_id: data.author_id,
        status: data.status || 'active',
      })
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('proposals')
      .update({
        title: data.title,
        summary: data.summary,
        problem_description: data.problem_description,
        proposed_solution: data.proposed_solution,
        estimated_cost: data.estimated_cost,
        expected_impact: data.expected_impact,
        category_id: data.category_id,
        municipality_id: data.municipality_id,
        author_id: data.author_id,
        status: data.status,
      })
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return result[0] || null;
  }

  async delete(id) {
    const { data, error } = await supabase.from('proposals').delete().eq('id', id).select();
    if (error) throw new Error(error.message);
    return data[0] || null;
  }

  async vote(id, voteType) {
    const proposal = await this.findById(id);
    if (!proposal) return null;
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert({ proposal_id: id, user_id: 1, vote_type: voteType })
      .select();
    if (voteError) throw new Error(voteError.message);
    return proposal; // Možeš proširiti sa ažuriranjem broja glasova kasnije
  }

  async getEdits(id) {
    const { data, error } = await supabase.from('contributions').select('*').eq('proposal_id', id);
    if (error) throw new Error(error.message);
    return data;
  }

  async createEdit(id, data) {
    const { data: result, error } = await supabase
      .from('contributions')
      .insert({
        proposal_id: id,
        contributor_id: data.authorId || 5,
        title: data.summary || 'Edit summary',
        description: data.description,
        content_changes: data.changes || {},
        status: 'pending',
      })
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  }

  async mergeEdit(proposalId, editId) {
    const { data: edit, error: editError } = await supabase
      .from('contributions')
      .select('*')
      .eq('id', editId)
      .eq('proposal_id', proposalId)
      .single();
    if (editError || !edit) return null;
    await supabase.from('contributions').update({ status: 'merged' }).eq('id', editId);
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();
    if (proposalError || !proposal) return null;
    const updated = { ...proposal, ...edit.content_changes };
    await this.update(proposalId, updated);
    return updated;
  }

  
}

module.exports = DbRepository;