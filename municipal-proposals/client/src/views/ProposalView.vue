<template>
  <v-container class="py-6">
    <!-- Edit Proposal Button - Always Visible -->
    <div class="d-flex justify-end mb-4">
      <v-btn 
        color="primary" 
        variant="elevated" 
        prepend-icon="mdi-pencil"
        @click="editProposal"
        size="large"
      >
        Edit Proposal
      </v-btn>
    </div>

    <v-row v-if="proposal">
      <!-- Leva kolona - Proposal detalji (manja širina) -->
      <v-col cols="12" md="7">
        <v-card class="mb-6">
                               <!-- Header sa naslovom i statusom -->
          <div class="mb-2">
            <v-card-title class="text-h4 font-weight-bold pb-0 title-wrap">
              {{ proposal.title }}
            </v-card-title>
          </div>
           <v-card-subtitle class="text-subtitle-1 pb-4">
             <v-chip :color="statusColor" size="large" class="mr-3">{{ proposal.status }}</v-chip>
             <span class="text-medium-emphasis">{{ proposal.municipality || 'Novi Sad' }} • {{ proposal.category || 'Sports & Recreation' }} • {{ proposal.author || 'User123' }} • {{ proposal.created_at || '2025-08-25' }}</span>
           </v-card-subtitle>

          <!-- Proposal detalji po stavkama -->
          <v-card-text class="pt-0">
            <!-- Summary -->
            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Summary</h3>
              <p class="text-body-2">{{ proposal.summary }}</p>
            </div>

            <!-- Problem -->
            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2 text-error">Problem</h3>
              <p class="text-body-2">{{ proposal.details?.problem || 'Problem description not available' }}</p>
            </div>

            <!-- Solution -->
            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2 text-success">Solution</h3>
              <p class="text-body-2">{{ proposal.details?.solution || 'Solution description not available' }}</p>
            </div>

            <!-- Cost & Impact -->
            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2 text-info">Cost & Impact</h3>
              <div class="d-flex align-center mb-2">
                <v-icon color="info" class="mr-2" size="16">mdi-currency-eur</v-icon>
                <span class="text-body-2 font-weight-medium">{{ proposal.details?.cost || 'Cost not specified' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon color="success" class="mr-2" size="16">mdi-target</v-icon>
                <span class="text-body-2">{{ proposal.details?.impact || 'Expected impact not specified' }}</span>
              </div>
            </div>

                         <!-- Documents -->
             <div class="mb-4">
               <h3 class="text-subtitle-1 font-weight-medium mb-2 text-warning">Documents</h3>
               <div v-if="proposal.attachments && proposal.attachments.length > 0">
                 <v-chip-group>
                   <v-chip 
                     v-for="(file, index) in proposal.attachments" 
                     :key="index"
                     variant="outlined"
                     color="warning"
                     prepend-icon="mdi-file-document"
                     class="ma-1"
                     size="small"
                   >
                     {{ file.name }}
                   </v-chip>
                 </v-chip-group>
               </div>
               <div v-else class="text-caption text-medium-emphasis">
                 No documents attached
               </div>
             </div>

            <!-- Dugmići za glasanje -->
            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-medium mb-3 text-primary">Vote for this proposal</h3>
              <div v-if="!userVote" class="d-flex gap-2">
                <v-btn 
                  color="success" 
                  size="default" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('for')"
                  prepend-icon="mdi-thumb-up"
                  class="px-4"
                >
                  Vote For
                </v-btn>
                <v-btn 
                  color="error" 
                  size="default" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('against')"
                  prepend-icon="mdi-thumb-down"
                  class="px-4"
                >
                  Vote Against
                </v-btn>
                <v-btn 
                  color="warning" 
                  size="default" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('abstain')"
                  prepend-icon="mdi-minus"
                  class="px-4"
                >
                  Abstain
                </v-btn>
              </div>
              <div v-else class="text-center">
                <v-chip color="info" size="large" class="px-4 py-2">
                  <v-icon class="mr-2">mdi-check-circle</v-icon>
                  You have voted {{ userVote }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>



        <!-- Pending Edits for proposal author -->
        <v-card v-if="isProposalAuthor" class="mb-6">
          <v-card-title class="text-h6 font-weight-bold">
            <v-icon class="mr-2" color="info">mdi-pencil-clock</v-icon>
            Pending Edits
            <v-spacer></v-spacer>
            <v-btn 
              icon 
              variant="text" 
              @click="fetchPendingContributions"
              color="info"
              size="small"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="pendingContributions.length > 0">
              <v-alert type="info" variant="tonal" class="mb-4">
                <v-icon class="mr-2">mdi-information</v-icon>
                You have {{ pendingContributions.length }} pending change(s) to review
              </v-alert>
              
              <!-- Organized Profile Cards -->
              <div class="pending-edits-grid">
                <div 
                  v-for="contribution in pendingContributions"
                  :key="contribution.id"
                  class="pending-edit-card"
                  @click="navigateToContributionReview(contribution)"
                >
                  <div class="user-avatar-section">
                    <v-avatar size="56" class="mr-3">
                      <v-img :src="getUserAvatar(contribution.user_id)"></v-img>
                    </v-avatar>
                  </div>
                  
                  <div class="contribution-info">
                    <div class="user-name">{{ contribution.first_name }} {{ contribution.last_name }}</div>
                    <div class="contribution-meta">
                      <v-chip 
                        v-if="contribution.field_name === 'multiple_fields'"
                        color="warning" 
                        size="small"
                        variant="tonal"
                        class="mr-2"
                      >
                        Multiple fields
                      </v-chip>
                      <v-chip 
                        v-else
                        color="info" 
                        size="small"
                        variant="tonal"
                        class="mr-2"
                      >
                        {{ contribution.field_name }}
                      </v-chip>
                      <span class="text-caption text-medium-emphasis">
                        {{ formatDate(contribution.created_at) }}
                      </span>
                    </div>
                    <div class="edit-summary">{{ contribution.edit_summary }}</div>
                  </div>
                  
                  <div class="action-section">
                    <v-btn 
                      color="info" 
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-eye"
                    >
                      Review
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-check-circle</v-icon>
              <p class="text-h6 text-medium-emphasis mt-4">No pending edits</p>
              <p class="text-body-2 text-medium-emphasis">All contributions have been reviewed</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Contributors - Modern Layout -->
        <v-card class="mb-6" elevation="4" rounded="xl">
          <v-card-title class="text-h5 font-weight-bold d-flex align-center pa-6 pb-4">
            <v-icon class="mr-3" color="primary" size="28">mdi-account-group</v-icon>
            Contributors
            <v-spacer />
            <v-chip color="primary" variant="flat" size="small">
              {{ contributors.length }} contributors
            </v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6 pt-4">
            <div v-if="contributors.length > 0" class="contributors-grid">
              <div 
                v-for="c in contributors" 
                :key="c.id" 
                class="contributor-item"
                @click="showContributorChanges(c)"
              >
                <div class="contributor-avatar">
                  <v-avatar size="56" class="contributor-avatar-img">
                    <v-img :src="c.avatar" cover></v-img>
                  </v-avatar>
                  <div class="contribution-badge">
                    {{ c.share }}%
                  </div>
                </div>
                <div class="contributor-info">
                  <h4 class="contributor-name">{{ c.name }}</h4>
                  <p class="contributor-role">{{ c.role }}</p>
                  <div class="contribution-bar">
                    <div 
                      class="contribution-fill"
                      :style="{ width: c.share + '%', backgroundColor: getContributionShareColor(c.share) }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
              <p class="text-h6 text-medium-emphasis mt-4">No contributors yet</p>
              <p class="text-body-2 text-medium-emphasis">Be the first to contribute to this proposal!</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Komentari -->
        <v-card>
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon class="mr-2" color="primary">mdi-comment</v-icon>
            Comments
          </v-card-title>
          <v-card-text>
            <!-- Dodavanje komentara -->
            <div class="mb-4">
              <v-text-field 
                v-model="newComment" 
                label="Add a comment" 
                @keyup.enter="postComment"
                variant="outlined"
                prepend-inner-icon="mdi-comment-plus"
                hide-details
              ></v-text-field>
            </div>
            
            <!-- Lista komentara -->
            <v-list class="bg-grey-lighten-5 rounded-lg">
              <v-list-item 
                v-for="c in comments" 
                :key="c.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-img :src="getUserAvatar(c.userId)"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ userName(c.userId) }}</v-list-item-title>
                <v-list-item-subtitle class="text-body-1">{{ c.text }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="comments.length === 0" class="text-center text-medium-emphasis">
                No comments yet
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

             <!-- Desna kolona - Glasovi i procenati (manja širina) -->
       <v-col cols="12" md="5">
         <!-- Votes - Modern Layout -->
         <v-card class="mb-6" elevation="2" rounded="lg">
           <v-card-title class="text-h6 font-weight-bold d-flex align-center pa-4 pb-3">
             <v-icon class="mr-2" color="success" size="20">mdi-vote</v-icon>
             Voting Results
             <v-spacer />
             <v-chip color="success" variant="flat" size="x-small">
               {{ totalVotes }} total votes
             </v-chip>
           </v-card-title>
           <v-divider />
           <v-card-text class="pa-4 pt-3">
             <!-- Vote Summary Cards -->
             <div class="votes-summary mb-4">
               <div class="vote-summary-grid">
                 <div class="vote-summary-card for-votes">
                   <div class="vote-icon">
                     <v-icon size="24" color="success">mdi-thumb-up</v-icon>
                   </div>
                   <div class="vote-text-group">
                     <div class="vote-count">{{ voteCounts.for }}</div>
                     <div class="vote-label">FOR</div>
                   </div>
                   <div class="vote-percentage">{{ votePercentage.for }}%</div>
                 </div>
                 
                 <div class="vote-summary-card against-votes">
                   <div class="vote-icon">
                     <v-icon size="24" color="error">mdi-thumb-down</v-icon>
                   </div>
                   <div class="vote-text-group">
                     <div class="vote-count">{{ voteCounts.against }}</div>
                     <div class="vote-label">AGAINST</div>
                   </div>
                   <div class="vote-percentage">{{ votePercentage.against }}%</div>
                 </div>
                 
                 <div class="vote-summary-card abstain-votes">
                   <div class="vote-icon">
                     <v-icon size="24" color="warning">mdi-minus</v-icon>
                   </div>
                   <div class="vote-text-group">
                     <div class="vote-count">{{ voteCounts.abstain }}</div>
                     <div class="vote-label">ABSTAIN</div>
                   </div>
                   <div class="vote-percentage">{{ votePercentage.abstain }}%</div>
                 </div>
               </div>
             </div>

             <!-- Tab-ovi za različite opcije glasanja -->
             <v-tabs v-model="activeVoteTab" class="mb-3" color="primary" density="compact">
               <v-tab value="for" class="text-success">
                 <v-icon class="mr-1" size="16">mdi-thumb-up</v-icon>
                 FOR ({{ voteCounts.for }})
               </v-tab>
               <v-tab value="against" class="text-error">
                 <v-icon class="mr-1" size="16">mdi-thumb-down</v-icon>
                 AGAINST ({{ voteCounts.against }})
               </v-tab>
               <v-tab value="abstain" class="text-warning">
                 <v-icon class="mr-1" size="16">mdi-minus</v-icon>
                 ABSTAIN ({{ voteCounts.abstain }})
               </v-tab>
             </v-tabs>

             <!-- Sadržaj za svaki tab -->
             <v-window v-model="activeVoteTab">
                                               <!-- ZA tab -->
                 <v-window-item value="for">
                   <div class="text-center mb-4">
                     <div class="text-h3 font-weight-bold text-success mb-1">{{ voteCounts.for }}</div>
                     <div class="text-h6 text-success font-weight-medium">ZA</div>
                   </div>
                  <div v-if="usersForVote.for.length > 0" class="users-vote-list">
                    <div 
                      v-for="user in usersForVote.for" 
                      :key="user.id"
                      class="user-vote-item"
                      @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                      @mousemove="updateTooltipPosition"
                      @mouseleave="showUserTooltip = false"
                    >
                      <div class="user-vote-avatar">
                        <v-avatar size="48" class="user-avatar-img">
                          <v-img :src="getUserAvatar(user.id)" cover></v-img>
                        </v-avatar>
                        <div class="vote-indicator for">
                          <v-icon size="16" color="white">mdi-thumb-up</v-icon>
                        </div>
                      </div>
                      <div class="user-vote-info">
                        <h5 class="user-vote-name">{{ user.first_name }} {{ user.last_name }}</h5>
                        <p class="user-vote-time">Voted recently</p>
                      </div>
                    </div>
                  </div>
                 <div v-else class="text-center text-medium-emphasis py-8">
                   <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
                   <div class="mt-2">No votes yet</div>
                 </div>
               </v-window-item>

                                                               <!-- PROTIV tab -->
                 <v-window-item value="against">
                   <div class="text-center mb-4">
                     <div class="text-h3 font-weight-bold text-error mb-1">{{ voteCounts.against }}</div>
                     <div class="text-h6 text-error font-weight-medium">PROTIV</div>
                   </div>
                  <div v-if="usersForVote.against.length > 0" class="users-vote-list">
                    <div 
                      v-for="user in usersForVote.against" 
                      :key="user.id"
                      class="user-vote-item"
                      @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                      @mousemove="updateTooltipPosition"
                      @mouseleave="showUserTooltip = false"
                    >
                      <div class="user-vote-avatar">
                        <v-avatar size="48" class="user-avatar-img">
                          <v-img :src="getUserAvatar(user.id)" cover></v-img>
                        </v-avatar>
                        <div class="vote-indicator against">
                          <v-icon size="16" color="white">mdi-thumb-down</v-icon>
                        </div>
                      </div>
                      <div class="user-vote-info">
                        <h5 class="user-vote-name">{{ user.first_name }} {{ user.last_name }}</h5>
                        <p class="user-vote-time">Voted recently</p>
                      </div>
                    </div>
                  </div>
                 <div v-else class="text-center text-medium-emphasis py-8">
                   <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
                   <div class="mt-2">No votes yet</div>
                 </div>
               </v-window-item>

                                                                                               <!-- UZDRŽAN tab -->
                  <v-window-item value="abstain">
                    <div class="text-center mb-4">
                      <div class="text-h3 font-weight-bold text-warning mb-1">{{ voteCounts.abstain }}</div>
                      <div class="text-h6 text-warning font-weight-medium">UZDRŽAN</div>
                    </div>
                  <div v-if="usersForVote.abstain.length > 0" class="users-vote-list">
                    <div 
                      v-for="user in usersForVote.abstain" 
                      :key="user.id"
                      class="user-vote-item"
                      @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                      @mousemove="updateTooltipPosition"
                      @mouseleave="showUserTooltip = false"
                    >
                      <div class="user-vote-avatar">
                        <v-avatar size="48" class="user-avatar-img">
                          <v-img :src="getUserAvatar(user.id)" cover></v-img>
                        </v-avatar>
                        <div class="vote-indicator abstain">
                          <v-icon size="16" color="white">mdi-hand</v-icon>
                        </div>
                      </div>
                      <div class="user-vote-info">
                        <h5 class="user-vote-name">{{ user.first_name }} {{ user.last_name }}</h5>
                        <p class="user-vote-time">Voted recently</p>
                      </div>
                    </div>
                  </div>
                 <div v-else class="text-center text-medium-emphasis py-8">
                   <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
                   <div class="mt-2">No votes yet</div>
                 </div>
               </v-window-item>
             </v-window>
           </v-card-text>
         </v-card>

                 <!-- Graf sa raspodelom glasova -->
         <v-card class="mb-6">
           <v-card-title class="text-h5 font-weight-medium">
             <v-icon class="mr-2" color="info">mdi-chart-donut</v-icon>
             Votes Share
           </v-card-title>
           <v-card-text>
             <canvas ref="chartCanvas" style="max-height: 250px;"></canvas>
           </v-card-text>
                    </v-card>
  
           <!-- Contribution History -->
          <v-card class="mb-6">
            <v-card-title class="text-h5 font-weight-medium">
              <v-icon class="mr-2" color="primary">mdi-history</v-icon>
              Contribution History
              <v-spacer></v-spacer>
                             <v-btn 
                 icon 
                 variant="text" 
                 @click="fetchContributions"
                 color="primary"
                 size="small"
               >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="contributions.length > 0">
                <v-timeline density="compact" align="start">
                  <v-timeline-item
                    v-for="contribution in contributions"
                    :key="contribution.id"
                    :dot-color="getContributionColor(contribution.contribution_type)"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatDate(contribution.created_at) }}
                      </div>
                    </template>
                    
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-avatar size="32" class="mr-3">
                          <v-img :src="getUserAvatar(contribution.user_id)"></v-img>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-medium">
                            {{ contribution.first_name }} {{ contribution.last_name }}
                          </div>
                          <div class="d-flex gap-2 align-center">
                            <v-chip 
                              :color="getContributionColor(contribution.contribution_type)" 
                              size="x-small"
                              variant="tonal"
                            >
                              {{ contribution.contribution_type }}
                            </v-chip>
                            <v-chip 
                              :color="contribution.status === 'approved' ? 'success' : 'error'" 
                              size="x-small"
                              variant="tonal"
                            >
                              {{ contribution.status === 'approved' ? 'Approved' : 'Rejected' }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="contribution.field_name" class="mb-2">
                        <div class="text-caption text-medium-emphasis">Field: {{ contribution.field_name }}</div>
                      </div>
                      
                      <div v-if="contribution.edit_summary" class="mb-2">
                        <div class="text-body-2">{{ contribution.edit_summary }}</div>
                      </div>
                      
                      <div v-if="contribution.files_added && contribution.files_added.length > 0" class="mb-2">
                        <div class="text-caption text-medium-emphasis">Files added:</div>
                        <v-chip-group>
                          <v-chip 
                            v-for="file in contribution.files_added" 
                            :key="file"
                            size="x-small"
                            variant="outlined"
                            color="success"
                          >
                            {{ file }}
                          </v-chip>
                        </v-chip-group>
                      </div>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </div>
              <div v-else class="text-center text-medium-emphasis py-8">
                <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
                <div class="mt-2">No contributions yet</div>
              </div>
            </v-card-text>
          </v-card>

         </v-col>
    </v-row>

         <!-- Dialog za potvrdu glasanja -->
     <v-dialog v-model="voteDialog" max-width="400">
       <v-card>
         <v-card-title>Confirm Vote</v-card-title>
         <v-card-text>Are you sure you want to vote <strong>{{ voteLabel(votePending) }}</strong>?</v-card-text>
         <v-card-actions>
           <v-btn @click="voteDialog = false">Cancel</v-btn>
           <v-btn color="primary" :loading="loading" @click="confirmVote">Confirm</v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>

           <!-- Custom tooltip za prikaz uvećane slike korisnika -->
      <div 
        v-if="showUserTooltip && selectedUserForTooltip"
        class="custom-tooltip"
        :style="tooltipStyle"
      >
        <v-card class="pa-3" elevation="8">
          <v-avatar size="120" class="mb-2">
            <v-img :src="getUserAvatar(selectedUserForTooltip.id)"></v-img>
          </v-avatar>
          <div class="text-h6 font-weight-bold text-center">
            {{ selectedUserForTooltip.first_name }} {{ selectedUserForTooltip.last_name }}
          </div>
        </v-card>
      </div>

             <!-- Custom tooltip za prikaz uvećane slike contributora -->
       <div 
         v-if="showContributorTooltip && selectedContributorForTooltip"
         class="custom-tooltip"
         :style="contributorTooltipStyle"
       >
         <v-card class="pa-3" elevation="8">
           <v-avatar size="120" class="mb-2">
             <v-img :src="selectedContributorForTooltip.avatar"></v-img>
           </v-avatar>
           <div class="text-h6 font-weight-bold text-center mb-2">
             {{ selectedContributorForTooltip.name }}
           </div>
           <div class="text-body-1 text-center mb-1">
             {{ selectedContributorForTooltip.role }}
           </div>
                        <v-chip :color="getContributionShareColor(selectedContributorForTooltip.share)" size="small">
               {{ selectedContributorForTooltip.share }}%
             </v-chip>
         </v-card>
       </div>

    <!-- Contribution Details Modal -->
    <v-dialog v-model="showContributorModal" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h4 font-weight-bold pa-6 pb-4">
          <v-icon class="mr-3" color="info" size="32">mdi-pencil-clock</v-icon>
          Review Changes by {{ selectedContributor?.first_name }} {{ selectedContributor?.last_name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showContributorModal = false" variant="text" size="large">
            <v-icon size="28">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0">
          <div v-if="selectedContributor">
            <!-- User Info -->
            <div class="d-flex align-center mb-6">
              <v-avatar size="64" class="mr-4">
                <v-img :src="getUserAvatar(selectedContributor.user_id)"></v-img>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-medium">
                  {{ selectedContributor.first_name }} {{ selectedContributor.last_name }}
                </div>
                <v-chip 
                  color="warning" 
                  size="small"
                  variant="tonal"
                  class="mt-2"
                >
                  Pending Review
                </v-chip>
              </div>
            </div>

            <!-- Field Changes -->
            <div v-if="selectedContributor.field_name" class="mb-6">
              <div class="text-subtitle-1 font-weight-medium mb-3">
                Field: {{ selectedContributor.field_name === 'multiple_fields' ? 'Multiple Fields' : selectedContributor.field_name }}
              </div>
              
              <v-card variant="tonal" class="pa-4 mb-3" color="grey-lighten-4">
                <div class="text-subtitle-2 font-weight-medium mb-2 text-grey-darken-1">Current Value:</div>
                <div class="text-body-1">{{ selectedContributor.old_value || 'Empty' }}</div>
              </v-card>
              
              <v-card variant="tonal" class="pa-4" color="success-lighten-5">
                <div class="text-subtitle-2 font-weight-medium mb-2 text-success-darken-2">Proposed Change:</div>
                <div class="text-body-1">
                  <pre v-if="selectedContributor.field_name === 'multiple_fields'" class="json-display">{{ formatJson(selectedContributor.new_value) }}</pre>
                  <span v-else>{{ selectedContributor.new_value }}</span>
                </div>
              </v-card>
            </div>
            
            <!-- Reason for Change -->
            <div v-if="selectedContributor.edit_summary" class="mb-6">
              <div class="text-subtitle-1 font-weight-medium mb-2">Reason for Change:</div>
              <div class="text-body-1">{{ selectedContributor.edit_summary }}</div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-3 justify-end pt-4">
              <v-btn 
                color="error" 
                size="large"
                prepend-icon="mdi-close"
                @click="rejectContribution(selectedContributor.id)"
                :loading="loading"
                variant="outlined"
              >
                REJECT
              </v-btn>
              <v-btn 
                color="success" 
                size="large"
                prepend-icon="mdi-check"
                @click="approveContribution(selectedContributor.id)"
                :loading="loading"
              >
                APPROVE
              </v-btn>
            </div>
          </div>
          <div v-else class="text-center text-medium-emphasis py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-information</v-icon>
            <div class="mt-2">No contribution details available</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

     </v-container>
   </template>

<script setup>
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';



Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const store = useProposalStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const chartCanvas = ref(null);
const activeTab = ref('for');
const voteDialog = ref(false);
const votePending = ref('for');
const newComment = ref('');
const comments = ref([]);
const loading = ref(false);
let _chart = null;

const userVote = ref(null);

const activeVoteTab = ref('for'); // Default tab je "ZA"
const showUserTooltip = ref(false);
const selectedUserForTooltip = ref(null);
const tooltipStyle = ref({});
const showContributorTooltip = ref(false);
const selectedContributorForTooltip = ref(null);
const contributorTooltipStyle = ref({});

const contributions = ref([]);
const pendingContributions = ref([]);
const showContributorModal = ref(false);
const selectedContributor = ref(null);
const contributorChanges = ref([]);

// Add ref for directly fetched proposal
const directProposal = ref(null);


// Funkcija za dohvatanje korisnika koji su glasali za određenu opciju
const usersForVote = ref({
  for: [],
  against: [],
  abstain: []
});

// Dohvati korisnike za svaki tip glasanja
const fetchUsersForVoteType = async (voteType) => {
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/votes/${voteType}/users`);
    if (!response.ok) {
      console.error('Error fetching users for vote type:', response.statusText);
      usersForVote.value[voteType] = [];
      return;
    }
    
    const users = await response.json();
    usersForVote.value[voteType] = users || [];
  } catch (error) {
    console.error('Error fetching users for vote type:', error);
    usersForVote.value[voteType] = [];
  }
};

// Dohvati sve glasove kada se komponenta učita
const fetchAllVotes = async () => {
  await Promise.all([
    fetchUsersForVoteType('for'),
    fetchUsersForVoteType('against'),
    fetchUsersForVoteType('abstain')
  ]);
};

// Funkcija za proveru da li je korisnik već glasao
const checkUserVote = async () => {
  if (!authStore.currentUser) {
    userVote.value = null;
    return;
  }
  
  try {
    const userId = authStore.currentUser.id;
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/user-vote?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Error checking user vote:', response.statusText);
      userVote.value = null;
      return;
    }
    
    const data = await response.json();
    
    if (data.vote_type) {
      userVote.value = data.vote_type === 'for' ? 'FOR' : 
                      data.vote_type === 'against' ? 'AGAINST' : 'ABSTAIN';
    } else {
      userVote.value = null;
    }
  } catch (error) {
    console.error('Error checking user vote:', error);
    userVote.value = null;
  }
};

// Function to fetch proposal directly from backend
const fetchProposalDirectly = async (proposalId) => {
  try {
    console.log('🔄 [DIRECT] Fetching proposal directly from backend:', proposalId);
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${proposalId}`);
    
    if (response.ok) {
      const proposalData = await response.json();
      console.log('✅ [DIRECT] Proposal fetched successfully:', proposalData);
      directProposal.value = proposalData;
    } else {
      console.error('❌ [DIRECT] Failed to fetch proposal:', response.statusText);
    }
  } catch (error) {
    console.error('❌ [DIRECT] Error fetching proposal:', error);
  }
};

// Move onMounted to the end, after all functions are defined
onMounted(async () => {
  console.log('🚀 [MOUNT] ProposalView mounted, starting data fetch...');
  console.log('🚀 [MOUNT] Current store state:', {
    proposalsCount: store.proposals.length,
    proposals: store.proposals
  });
  
  await Promise.all([
    store.fetchProposals(),
    store.fetchUsers(),
    store.fetchMunicipalities(),
    store.fetchCategories(),
  ]);
  
  console.log('✅ [MOUNT] Data fetch completed. Store state:', {
    proposalsCount: store.proposals.length,
    proposals: store.proposals,
    proposalIds: store.proposals.map(p => p.id)
  });
  
  // Try to fetch proposal directly if not in store
  const routeId = parseInt(route.params.id);
  if (routeId && !isNaN(routeId)) {
    const proposalInStore = store.proposals.find(p => p.id === routeId);
    if (!proposalInStore) {
      console.log('⚠️ [MOUNT] Proposal not found in store, fetching directly...');
      await fetchProposalDirectly(routeId);
    }
  }
  
  await fetchAllVotes(); // Dohvati sve glasove prvo
  renderChart(); // Zatim renderuj graf
  checkUserVote(); // Proveri da li je korisnik već glasao
  fetchContributors(); // Učitaj contributore
  fetchContributions(); // Učitaj sve doprinose
  fetchPendingContributions(); // Učitaj pending doprinose
  
  // Add event listener for refreshing notifications
  window.addEventListener('refreshNotifications', async () => {
    await fetchPendingContributions();
  });
  
  // Add event listeners for edit approval/rejection
  window.addEventListener('edit-approved', async (event) => {
    await Promise.all([
      fetchContributors(),
      fetchContributions(),
      fetchPendingContributions()
    ]);
  });
  
  window.addEventListener('edit-rejected', async (event) => {
    await Promise.all([
      fetchContributors(),
      fetchContributions(),
      fetchPendingContributions()
    ]);
  });
  
  // Listen for avatar updates
  window.addEventListener('avatarUpdated', handleAvatarUpdate);
});

// Handle avatar updates from other components
const handleAvatarUpdate = async (event) => {
  console.log('🎯 [AVATAR] handleAvatarUpdate called with event:', event.detail);
  const { userId, avatarUrl } = event.detail;
  
  console.log('🎯 [AVATAR] Updating avatar for user:', userId, 'to:', avatarUrl);
  
  // Update contributor avatars if the updated user is a contributor
  if (contributors.value.some(c => c.id === userId)) {
    console.log('🎯 [AVATAR] User is a contributor, updating avatar');
    // Update the specific contributor's avatar
    const contributor = contributors.value.find(c => c.id === userId);
    if (contributor) {
      contributor.avatar = avatarUrl;
      console.log('🎯 [AVATAR] Updated contributor avatar to:', avatarUrl);
    }
    
    // Also refresh the entire contributors list to get updated avatars
    await fetchContributors();
  }
};

const proposal = computed(() => {
  const routeId = parseInt(route.params.id);
  const allProposals = store.proposals;
  
  console.log('🔍 [DEBUG] Proposal lookup details:', { 
    routeId: route.params.id,
    parsedRouteId: routeId,
    isNaN: isNaN(routeId),
    allProposalsLength: allProposals.length,
    allProposals: allProposals,
    allProposalIds: allProposals.map(p => ({ id: p.id, type: typeof p.id, author_id: p.author_id, authorId: p.authorId, user_id: p.user_id })),
    directProposal: directProposal.value
  });
  
  // First try to find in store
  let foundProposal = allProposals.find(p => p.id === routeId);
  
  // If not found in store, use directly fetched proposal
  if (!foundProposal && directProposal.value && directProposal.value.id === routeId) {
    foundProposal = directProposal.value;
    console.log('✅ [DEBUG] Using directly fetched proposal');
  }
  
  foundProposal = foundProposal || {};
  
  console.log('🔍 [DEBUG] Proposal lookup result:', { 
    routeId: route.params.id,
    parsedRouteId: routeId,
    allProposals: allProposals,
    foundProposal: foundProposal,
    authorId: foundProposal.author_id,
    proposalKeys: Object.keys(foundProposal),
    fullProposal: JSON.stringify(foundProposal, null, 2),
    searchResult: allProposals.find(p => p.id === routeId),
    usingDirectProposal: foundProposal === directProposal.value
  });
  
  return foundProposal;
});
const statusColor = computed(() => proposal.value.status === 'Approved' ? 'success' : 'warning');
const voteCounts = computed(() => ({
  for: usersForVote.value.for.length,
  against: usersForVote.value.against.length,
  abstain: usersForVote.value.abstain.length
}));

const totalVotes = computed(() => 
  voteCounts.value.for + voteCounts.value.against + voteCounts.value.abstain
);

const votePercentage = computed(() => {
  const total = totalVotes.value;
  if (total === 0) return { for: 0, against: 0, abstain: 0 };
  
  return {
    for: Math.round((voteCounts.value.for / total) * 100),
    against: Math.round((voteCounts.value.against / total) * 100),
    abstain: Math.round((voteCounts.value.abstain / total) * 100)
  };
});

// Check if current user is the author
const isAuthor = computed(() => {
  if (!authStore.currentUser || !proposal.value) {
    console.log('🔍 [DEBUG] isAuthor check failed:', { 
      hasUser: !!authStore.currentUser, 
      hasProposal: !!proposal.value,
      userId: authStore.currentUser?.id,
      proposalAuthorId: proposal.value?.author_id,
      proposalAuthorIdAlt: proposal.value?.authorId,
      proposalUserId: proposal.value?.user_id
    });
    return false;
  }
  
  // Try different possible field names for author ID
  const authorId = proposal.value.author_id || proposal.value.authorId || proposal.value.user_id;
  const isAuthorResult = authStore.currentUser.id === authorId;
  
  console.log('🔍 [DEBUG] isAuthor check:', { 
    userId: authStore.currentUser.id, 
    proposalAuthorId: authorId,
    author_id: proposal.value.author_id,
    authorId: proposal.value.authorId,
    user_id: proposal.value.user_id,
    result: isAuthorResult
  });
  
  return isAuthorResult;
});

// Check if current user is the proposal author (for notifications and pending edits)
const isProposalAuthor = computed(() => {
  if (!authStore.currentUser || !proposal.value) return false;
  const authorId = proposal.value.author_id || proposal.value.authorId || proposal.value.user_id;
  return authStore.currentUser.id === authorId;
});
const contributors = ref([]);

const renderChart = async () => {
  await nextTick();
  const canvas = chartCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (_chart) {
    try { _chart.destroy(); } catch {}
    _chart = null;
  }
  const data = [voteCounts.value.for, voteCounts.value.against, voteCounts.value.abstain];
  _chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['For', 'Against', 'Abstain'],
      datasets: [{
        data,
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
        borderWidth: 2,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  });
};

watch(proposal, () => renderChart(), { deep: true });

const userName = (id) => {
  const u = store.users.find(u => u.id === id);
  return u ? `${u.first_name} ${u.last_name}` : `User ${id}`;
};
const getUserAvatar = (id) => `https://i.pravatar.cc/32?img=${(id % 70) + 1}`;
const getContributionShareColor = (share) => (share >= 50 ? 'success' : share >= 25 ? 'primary' : 'warning');
const extractFileName = (path) => (path ? path.split('/').pop() : '');
const openVote = (type) => {
  if (userVote.value) return; // Onemogući otvaranje dijaloga ako je već glasano
  votePending.value = type;
  voteDialog.value = true;
};
const voteLabel = (type) => (type === 'for' ? 'Za' : type === 'against' ? 'Protiv' : 'Uzdržan');
const confirmVote = async () => {
  if (userVote.value || !authStore.currentUser) return; // Provera userVote.value
  loading.value = true;
  try {
    await store.voteProposal(parseInt(route.params.id), votePending.value);
    voteDialog.value = false;
    await store.fetchProposals();
    renderChart();
    checkUserVote(); // Ponovo proveri glas nakon glasanja
    fetchAllVotes(); // Osveži glasove nakon glasanja
  } catch (error) {
    console.error('Voting error:', error.message);
  } finally {
    loading.value = false;
  }
};
const postComment = () => {
  const text = newComment.value.trim();
  if (!text) return;
  comments.value.unshift({ id: Date.now(), userId: authStore.currentUser?.id || 1, text });
  newComment.value = '';
};

// Funkcija za edit proposal (kontribucija)
const editProposal = () => {
  // Navigate to edit route for all users (will be used for contributions)
  router.push(`/proposal/${route.params.id}/edit`);
};

// Ažuriraj poziciju tooltip-a na osnovu pozicije miša
const updateTooltipPosition = (event) => {
  if (showUserTooltip.value) {
    tooltipStyle.value = {
      position: 'fixed',
      left: event.clientX + 20 + 'px',
      top: event.clientY - 150 + 'px',
      zIndex: 9999
    };
  }
};

// Ažuriraj poziciju contributor tooltip-a na osnovu pozicije miša
const updateContributorTooltipPosition = (event) => {
  if (showContributorTooltip.value) {
    contributorTooltipStyle.value = {
      position: 'fixed',
      left: event.clientX + 20 + 'px',
      top: event.clientY - 150 + 'px',
      zIndex: 9999
    };
  }
};

// Handle edit saved event
const handleEditSaved = () => {
  // Refresh proposal data
  store.fetchProposals();
  // Show success message
  console.log('Edit request submitted successfully!');
};

// Fetch contributors (for Contributors section)
const fetchContributors = async () => {
  try {
    // Check if route.params.id is valid
    const proposalId = parseInt(route.params.id);
    if (isNaN(proposalId)) {
      console.error('Invalid proposal ID:', route.params.id);
      return;
    }
    
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${proposalId}/contributors`);
    if (!response.ok) {
      console.error('Error fetching contributors:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    // Start with the author
    const authorContributor = {
      id: proposal.value.author_id || 1,
      name: proposal.value.author || 'Unknown Author',
      role: 'Author',
      share: 60, // Author gets the highest share
      avatar: `https://i.pravatar.cc/40?img=${(proposal.value.author_id || 1) % 70 + 1}`
    };
    
    // Transform contributor data with real avatars
    const contributorsList = await Promise.all(data.map(async (contributor) => {
      // Check if contributor.id is valid
      if (!contributor.id || isNaN(contributor.id)) {
        console.error('Invalid contributor ID:', contributor.id);
        return {
          id: 0,
          name: contributor.full_name || 'Unknown',
          role: 'Contributor',
          share: 15,
          avatar: `https://i.pravatar.cc/40?img=1`
        };
      }
      
      // Try to get real avatar from database
      let avatarUrl = `https://i.pravatar.cc/40?img=${contributor.id % 70 + 1}`; // fallback
      
      try {
        const avatarResponse = await fetch(`${authStore.baseUrl}/api/users/${contributor.id}/avatar`);
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          avatarUrl = avatarData.avatarUrl;
        }
      } catch (error) {
        console.log('Using fallback avatar for user:', contributor.id);
      }
      
      return {
        id: contributor.id,
        name: contributor.full_name,
        role: 'Contributor',
        share: 15, // Default share for contributors
        avatar: avatarUrl
      };
    }));
    
    // Filter out invalid contributors and combine with author
    const validContributors = contributorsList.filter(c => c.id !== 0);
    contributors.value = [authorContributor, ...validContributors];
  } catch (error) {
    console.error('Error fetching contributors:', error);
  }
};

// Fetch all contributions (for Contribution History section)
const fetchContributions = async () => {
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions`);
    
    if (!response.ok) {
      console.error('Error fetching contributions:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    // Filter out pending contributions - only show approved/rejected in history
    const nonPendingContributions = data.filter(c => c.status !== 'pending');
    contributions.value = nonPendingContributions || [];
  } catch (error) {
    console.error('Error fetching contributions:', error);
  }
};

// Fetch pending contributions
const fetchPendingContributions = async () => {
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/pending-contributions`);
    if (!response.ok) {
      console.error('Error fetching pending contributions:', response.statusText);
      return;
    }
    
    const data = await response.json();
    pendingContributions.value = data || [];
  } catch (error) {
    console.error('Error fetching pending contributions:', error);
  }
};

// Approve contribution
const approveContribution = async (contributionId) => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions/${contributionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'approved',
        userId: authStore.currentUser?.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to approve contribution');
    }

    // Refresh data
    await Promise.all([
      store.fetchProposals(),
      fetchPendingContributions(),
      fetchContributors(),
      fetchContributions()
    ]);

    alert('Contribution approved successfully!');
    showContributorModal.value = false; // Close modal after approval
  } catch (error) {
    console.error('Error approving contribution:', error);
    alert('Error approving contribution. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Reject contribution
const rejectContribution = async (contributionId) => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions/${contributionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'rejected',
        userId: authStore.currentUser?.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reject contribution');
    }

    // Refresh data
    await Promise.all([
      fetchPendingContributions(),
      fetchContributors(),
      fetchContributions()
    ]);

    alert('Contribution rejected successfully!');
    showContributorModal.value = false; // Close modal after rejection
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    alert('Error rejecting contribution. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Show contributor changes
const showContributorChanges = async (contributor) => {
  selectedContributor.value = contributor;
  showContributorModal.value = true;
  
  try {
    // Fetch changes for this contributor
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions`);
    if (!response.ok) {
      console.error('Error fetching contributions:', response.statusText);
      return;
    }
    
    const allContributions = await response.json();
    // Filter contributions by this contributor
    contributorChanges.value = allContributions.filter(c => 
      c.user_id === contributor.id && c.status === 'approved'
    );
  } catch (error) {
    console.error('Error fetching contributor changes:', error);
    contributorChanges.value = [];
  }
};

// Open contribution details in a modal
const openContributionDetails = (contribution) => {
  selectedContributor.value = contribution;
  showContributorModal.value = true;
};

// Navigate to contribution review page
const navigateToContributionReview = (contribution) => {
  router.push({ name: 'ContributionReview', params: { id: route.params.id, contributionId: contribution.id } });
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get contribution color
const getContributionColor = (type) => {
  const colors = {
    edit: 'primary',
    comment: 'info',
    vote: 'success',
    file_upload: 'warning'
  };
  return colors[type] || 'grey';
};

// Format JSON for display
const formatJson = (jsonString) => {
  if (!jsonString) return 'No JSON data';
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString; // Return original string if not valid JSON
  }
};
</script>

<style scoped>
.scroll-y { overflow-y: auto; }
.cursor-pointer { cursor: pointer; }

.custom-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.avatar-container {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

/* Contributors Section */
.contributors-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.contributor-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.contributor-avatar {
  position: relative;
  flex-shrink: 0;
}

.contributor-avatar-img {
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contribution-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.contributor-info {
  flex-grow: 1;
  min-width: 0;
}

.contributor-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.contributor-role {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.contribution-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.contribution-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Votes Section */
.votes-summary {
  margin-bottom: 24px;
}

.vote-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.vote-summary-card {
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.vote-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color) 0%, var(--color-light) 100%);
}

.vote-summary-card.for-votes {
  --color: #10B981;
  --color-light: #34D399;
}

.vote-summary-card.against-votes {
  --color: #EF4444;
  --color-light: #F87171;
}

.vote-summary-card.abstain-votes {
  --color: #F59E0B;
  --color-light: #FBBF24;
}

.vote-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.vote-icon {
  margin: 0;
  flex-shrink: 0;
}

.vote-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.vote-count {
  font-size: 16px;
  font-weight: 800;
  color: var(--color);
  margin: 0 0 1px 0;
  line-height: 1;
}

.vote-label {
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.vote-percentage {
  font-size: 12px;
  font-weight: 700;
  color: var(--color);
  flex-shrink: 0;
}

/* User Vote Items */
.users-vote-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.user-vote-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-vote-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.user-vote-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-avatar-img {
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vote-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.vote-indicator.for {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.vote-indicator.against {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.vote-indicator.abstain {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.user-vote-info {
  flex-grow: 1;
  min-width: 0;
}

.user-vote-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.user-vote-time {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
}

/* Pending Edits Section */
.pending-edits-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-edit-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.pending-edit-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
}

.pending-edit-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.user-avatar-section {
  flex-shrink: 0;
}

.contribution-info {
  flex-grow: 1;
  min-width: 0;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.contribution-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.edit-summary {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  max-width: 400px;
}

.action-section {
  flex-shrink: 0;
}

.action-section .v-btn {
  border-radius: 12px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.025em;
}

/* JSON Display */
.json-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #495057;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vote-summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .users-vote-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .contributor-item,
  .user-vote-item,
  .pending-edit-card {
    padding: 12px;
    gap: 12px;
  }
  
  .contributor-avatar-img {
    width: 48px !important;
    height: 48px !important;
  }
  
  .user-avatar-img {
    width: 40px !important;
    height: 40px !important;
  }
  
  .vote-count {
    font-size: 24px;
  }
  
  .vote-label {
    font-size: 12px;
  }
  
  .vote-percentage {
    font-size: 16px;
  }
}

/* Smooth animations */
* {
  transition: all 0.2s ease;
}

/* Title word-wrap */
.title-wrap {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.3;
}
</style>