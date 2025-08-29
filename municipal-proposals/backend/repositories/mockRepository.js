const AbstractRepository = require('./abstractRepository');

function pickRandomIds(count, maxId) {
  const set = new Set();
  while (set.size < count) set.add(Math.floor(Math.random() * maxId) + 1);
  return Array.from(set);
}

class MockRepository extends AbstractRepository {
  constructor() {
    super();
    this.proposals = [
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
    this.edits = [];
    this.users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    }));
  }

  async findAll() {
    return this.proposals;
  }

  async findById(id) {
    return this.proposals.find(p => p.proposalId === id) || null;
  }

  async create(data) {
    const newProposal = {
      proposalId: this.proposals.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
      votes: { for: 0, against: 0, abstain: 0 },
      voters: { for: [], against: [], abstain: [], video: [] },
      voteHistory: [],
      status: "Pending",
    };
    this.proposals.push(newProposal);
    return newProposal;
  }

  async update(id, data) {
    const index = this.proposals.findIndex(p => p.proposalId === id);
    if (index !== -1) {
      this.proposals[index] = { ...this.proposals[index], ...data, updated_at: new Date() };
      return this.proposals[index];
    }
    return null;
  }

  async delete(id) {
    const index = this.proposals.findIndex(p => p.proposalId === id);
    if (index !== -1) {
      return this.proposals.splice(index, 1)[0];
    }
    return null;
  }

  async vote(id, voteType) {
    const proposal = this.proposals.find(p => p.proposalId === id);
    if (!proposal) return null;
    if (!proposal.votes) proposal.votes = { for: 0, against: 0, abstain: 0 };
    if (!['for', 'against', 'abstain'].includes(voteType)) return null;
    proposal.votes[voteType] += 1;
    const last = proposal.voteHistory?.[proposal.voteHistory.length - 1] || { for: 0, against: 0, abstain: 0 };
    const point = { ts: new Date().toISOString(), for: proposal.votes.for, against: proposal.votes.against, abstain: proposal.votes.abstain };
    proposal.voteHistory = [...(proposal.voteHistory || []), point];
    return proposal;
  }

  async getEdits(id) {
    return this.edits.filter(e => e.proposalId === id);
  }

  async createEdit(id, data) {
    const edit = {
      id: this.edits.length + 1,
      proposalId: id,
      authorId: data.authorId || 5,
      summary: data.summary || 'Edit summary',
      changes: data.changes || {},
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    this.edits.push(edit);
    return edit;
  }

  async mergeEdit(proposalId, editId) {
    const edit = this.edits.find(e => e.id === editId && e.proposalId === proposalId);
    if (!edit) return null;
    edit.status = 'merged';
    const idx = this.proposals.findIndex(p => p.proposalId === proposalId);
    if (idx !== -1) {
      this.proposals[idx] = { ...this.proposals[idx], ...edit.changes };
    }
    return this.proposals[idx];
  }
}

const firstNames = ['Ana', 'Marko', 'Ivana', 'Nikola', 'Mila', 'Đorđe', 'Sara', 'Luka', 'Jovana', 'Stefan', 'Petar', 'Katarina', 'Milan', 'Marija', 'Filip', 'Tijana', 'Vuk', 'Andrija', 'Teodora', 'Matea'];
const lastNames = ['Petrović', 'Marković', 'Jovanović', 'Savić', 'Ilić', 'Kovač', 'Stanković', 'Pavlović', 'Nikolić', 'Janković', 'Stojanović', 'Milošević', 'Lukić', 'Đurić', 'Matić'];

module.exports = MockRepository;