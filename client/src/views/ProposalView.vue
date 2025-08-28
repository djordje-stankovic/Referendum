<template>
  <v-container class="py-6">
    <v-row v-if="proposal">
      <!-- Leva kolona - Proposal detalji (manja širina) -->
      <v-col cols="12" md="7">
        <v-card class="mb-6">
                     <!-- Header sa naslovom i statusom -->
           <div class="d-flex justify-space-between align-center mb-2">
             <v-card-title class="text-h4 font-weight-bold pb-0">
               {{ proposal.title }}
             </v-card-title>
             <v-btn 
               color="primary" 
               variant="outlined" 
               prepend-icon="mdi-pencil"
               @click="editProposal"
               class="ml-4"
             >
               Edit Proposal
             </v-btn>
           </div>
           <v-card-subtitle class="text-subtitle-1 pb-4">
             <v-chip :color="statusColor" size="large" class="mr-3">{{ proposal.status }}</v-chip>
             <span class="text-medium-emphasis">{{ proposal.municipality || 'Novi Sad' }} • {{ proposal.category || 'Sports & Recreation' }} • {{ proposal.author || 'User123' }} • {{ proposal.created_at || '2025-08-25' }}</span>
           </v-card-subtitle>

          <!-- Proposal detalji po stavkama -->
          <v-card-text class="pt-0">
            <!-- Summary -->
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium mb-2 text-primary">Summary</h3>
              <p class="text-body-1">{{ proposal.summary }}</p>
            </div>

            <!-- Problem -->
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium mb-2 text-error">Problem</h3>
              <p class="text-body-1">{{ proposal.details?.problem || 'Problem description not available' }}</p>
            </div>

            <!-- Solution -->
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium mb-2 text-success">Solution</h3>
              <p class="text-body-1">{{ proposal.details?.solution || 'Solution description not available' }}</p>
            </div>

            <!-- Cost & Impact -->
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium mb-2 text-info">Cost & Impact</h3>
              <div class="d-flex align-center mb-2">
                <v-icon color="info" class="mr-2">mdi-currency-eur</v-icon>
                <span class="text-body-1 font-weight-medium">{{ proposal.details?.cost || 'Cost not specified' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon color="success" class="mr-2">mdi-target</v-icon>
                <span class="text-body-1">{{ proposal.details?.impact || 'Expected impact not specified' }}</span>
              </div>
            </div>

                         <!-- Documents -->
             <div class="mb-4">
               <h3 class="text-h6 font-weight-medium mb-2 text-warning">Documents</h3>
               <div v-if="proposal.attachments && proposal.attachments.length > 0">
                 <v-chip-group>
                   <v-chip 
                     v-for="(file, index) in proposal.attachments" 
                     :key="index"
                     variant="outlined"
                     color="warning"
                     prepend-icon="mdi-file-document"
                     class="ma-1"
                   >
                     {{ file.name }}
                   </v-chip>
                 </v-chip-group>
               </div>
               <div v-else class="text-medium-emphasis">
                 No documents attached
               </div>
             </div>

            <!-- Dugmići za glasanje -->
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium mb-3 text-primary">Vote for this proposal</h3>
              <div v-if="!userVote" class="d-flex gap-3">
                <v-btn 
                  color="success" 
                  size="large" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('for')"
                  prepend-icon="mdi-thumb-up"
                  class="px-6"
                >
                  Vote For
                </v-btn>
                <v-btn 
                  color="error" 
                  size="large" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('against')"
                  prepend-icon="mdi-thumb-down"
                  class="px-6"
                >
                  Vote Against
                </v-btn>
                <v-btn 
                  color="warning" 
                  size="large" 
                  variant="elevated"
                  :disabled="loading" 
                  @click="openVote('abstain')"
                  prepend-icon="mdi-hand"
                  class="px-6"
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
          </v-card-title>
          <v-card-text>
            <PendingEdits :proposal-id="parseInt(route.params.id)" />
          </v-card-text>
        </v-card>

        <!-- Kontributori -->
        <v-card class="mb-6">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
            Contributors
          </v-card-title>
          <v-card-text>
            <v-row>
                             <v-col 
                 v-for="c in contributors" 
                 :key="c.id" 
                 cols="12" 
                 sm="6" 
                 md="4"
                 class="mb-3"
               >
                                                      <v-card 
                     variant="outlined" 
                     class="text-center pa-3 h-100 cursor-pointer contributor-card"
                     @click="showContributorChanges(c)"
                   >
                                         <div 
                       class="avatar-container"
                       @mouseenter="showContributorTooltip = true; selectedContributorForTooltip = c"
                       @mousemove="updateContributorTooltipPosition"
                       @mouseleave="showContributorTooltip = false"
                     >
                       <v-avatar size="45" class="mb-2">
                         <v-img :src="c.avatar"></v-img>
                       </v-avatar>
                     </div>
                    <div class="text-subtitle-1 font-weight-medium mb-1">{{ c.name }}</div>
                    <div class="text-body-2 text-medium-emphasis mb-2">{{ c.role }}</div>
                                         <v-chip :color="getContributionShareColor(c.share)" size="small">
                       {{ c.share }}%
                     </v-chip>
                  </v-card>
               </v-col>
            </v-row>
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
         <!-- Glasovi - Moderna tabela -->
         <v-card class="mb-6">
           <v-card-title class="text-h5 font-weight-medium">
             <v-icon class="mr-2" color="success">mdi-vote</v-icon>
             Votes
           </v-card-title>
           <v-card-text>
             <!-- Tab-ovi za različite opcije glasanja -->
             <v-tabs v-model="activeVoteTab" class="mb-4">
               <v-tab value="for" class="text-success">
                 <v-icon class="mr-2">mdi-thumb-up</v-icon>
                 ZA ({{ voteCounts.for }})
               </v-tab>
               <v-tab value="against" class="text-error">
                 <v-icon class="mr-2">mdi-thumb-down</v-icon>
                 PROTIV ({{ voteCounts.against }})
               </v-tab>
               <v-tab value="abstain" class="text-warning">
                 <v-icon class="mr-2">mdi-hand</v-icon>
                 UZDRŽAN ({{ voteCounts.abstain }})
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
                                     <div v-if="usersForVote.for.length > 0" class="d-flex flex-wrap gap-3 justify-center">
                    <v-card 
                      v-for="user in usersForVote.for" 
                      :key="user.id"
                      variant="outlined" 
                      class="text-center pa-3 cursor-pointer user-card"
                      width="120"
                    >
                      <div 
                        class="avatar-container"
                        @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                        @mousemove="updateTooltipPosition"
                        @mouseleave="showUserTooltip = false"
                      >
                        <v-avatar size="50" class="mb-2">
                          <v-img :src="getUserAvatar(user.id)"></v-img>
                        </v-avatar>
                      </div>
                      <div class="text-body-2 font-weight-medium">{{ user.first_name }} {{ user.last_name }}</div>
                    </v-card>
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
                                     <div v-if="usersForVote.against.length > 0" class="d-flex flex-wrap gap-3 justify-center">
                    <v-card 
                      v-for="user in usersForVote.against" 
                      :key="user.id"
                      variant="outlined" 
                      class="text-center pa-3 cursor-pointer user-card"
                      width="120"
                    >
                      <div 
                        class="avatar-container"
                        @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                        @mousemove="updateTooltipPosition"
                        @mouseleave="showUserTooltip = false"
                      >
                        <v-avatar size="50" class="mb-2">
                          <v-img :src="getUserAvatar(user.id)"></v-img>
                        </v-avatar>
                      </div>
                      <div class="text-body-2 font-weight-medium">{{ user.first_name }} {{ user.last_name }}</div>
                    </v-card>
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
                                      <div v-if="usersForVote.abstain.length > 0" class="d-flex flex-wrap gap-3 justify-center">
                    <v-card 
                      v-for="user in usersForVote.abstain" 
                      :key="user.id"
                      variant="outlined" 
                      class="text-center pa-3 cursor-pointer user-card"
                      width="120"
                    >
                                              <div 
                          class="avatar-container"
                          @mouseenter="showUserTooltip = true; selectedUserForTooltip = user"
                          @mousemove="updateTooltipPosition"
                          @mouseleave="showUserTooltip = false"
                        >
                        <v-avatar size="50" class="mb-2">
                          <v-img :src="getUserAvatar(user.id)"></v-img>
                        </v-avatar>
                      </div>
                      <div class="text-body-2 font-weight-medium">{{ user.first_name }} {{ user.last_name }}</div>
                    </v-card>
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

                   <!-- Pending Contributions (Author Only) -->
          <v-card v-if="isAuthor" class="mb-6">
            <v-card-title class="text-h5 font-weight-medium">
              <v-icon class="mr-2" color="warning">mdi-clock-outline</v-icon>
              Pending Changes
              <v-spacer></v-spacer>
              <v-btn 
                icon 
                variant="text" 
                @click="fetchPendingContributions"
                color="warning"
                size="small"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="pendingContributions.length > 0">
                <v-alert type="warning" variant="tonal" class="mb-4">
                  <v-icon class="mr-2">mdi-alert-circle</v-icon>
                  You have {{ pendingContributions.length }} pending change(s) to review
                </v-alert>
                
                <v-timeline density="compact" align="start">
                  <v-timeline-item
                    v-for="contribution in pendingContributions"
                    :key="contribution.id"
                    dot-color="warning"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatDate(contribution.created_at) }}
                      </div>
                    </template>
                    
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center mb-3">
                        <v-avatar size="40" class="mr-3">
                          <v-img :src="getUserAvatar(contribution.user_id)"></v-img>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-1 font-weight-medium">
                            {{ contribution.first_name }} {{ contribution.last_name }}
                          </div>
                          <v-chip 
                            color="warning" 
                            size="small"
                            variant="tonal"
                          >
                            Pending Review
                          </v-chip>
                        </div>
                      </div>
                      
                      <div v-if="contribution.field_name" class="mb-3">
                        <div class="text-subtitle-2 font-weight-medium mb-2">Field: {{ contribution.field_name }}</div>
                        <v-card variant="tonal" class="pa-3 mb-2">
                          <div class="text-caption text-medium-emphasis mb-1">Current value:</div>
                          <div class="text-body-2">{{ contribution.old_value || 'Empty' }}</div>
                        </v-card>
                        <v-card variant="tonal" class="pa-3" color="success">
                          <div class="text-caption text-medium-emphasis mb-1">Proposed change:</div>
                          <div class="text-body-2">{{ contribution.new_value }}</div>
                        </v-card>
                      </div>
                      
                      <div v-if="contribution.edit_summary" class="mb-3">
                        <div class="text-caption text-medium-emphasis mb-1">Reason for change:</div>
                        <div class="text-body-2">{{ contribution.edit_summary }}</div>
                      </div>
                      
                      <div class="d-flex gap-2 mt-4">
                        <v-btn 
                          color="success" 
                          size="small"
                          prepend-icon="mdi-check"
                          @click="approveContribution(contribution.id)"
                          :loading="loading"
                        >
                          Approve
                        </v-btn>
                        <v-btn 
                          color="error" 
                          size="small"
                          prepend-icon="mdi-close"
                          @click="rejectContribution(contribution.id)"
                          :loading="loading"
                        >
                          Reject
                        </v-btn>
                      </div>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </div>
              <div v-else class="text-center text-medium-emphasis py-8">
                <v-icon size="48" color="grey-lighten-1">mdi-check-circle</v-icon>
                <div class="mt-2">No pending changes</div>
              </div>
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
                 @click="fetchContributors"
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
                          <v-chip 
                            :color="getContributionColor(contribution.contribution_type)" 
                            size="x-small"
                            variant="tonal"
                          >
                            {{ contribution.contribution_type }}
                          </v-chip>
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

    <!-- Contributor Changes Modal -->
    <v-dialog v-model="showContributorModal" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h4 font-weight-bold pa-6 pb-4">
          <v-icon class="mr-3" color="primary" size="32">mdi-account-edit</v-icon>
          Changes by {{ selectedContributor?.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showContributorModal = false" variant="text" size="large">
            <v-icon size="28">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0">
          <div v-if="contributorChanges.length > 0">
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="change in contributorChanges"
                :key="change.id"
                :dot-color="getContributionColor(change.contribution_type)"
                size="small"
              >
                <template v-slot:opposite>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDate(change.created_at) }}
                  </div>
                </template>
                
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex align-center mb-3">
                    <v-avatar size="40" class="mr-3">
                      <v-img :src="selectedContributor?.avatar"></v-img>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-medium">
                        {{ change.field_name }}
                      </div>
                      <v-chip 
                        :color="getContributionColor(change.contribution_type)" 
                        size="small"
                        variant="tonal"
                      >
                        {{ change.contribution_type }}
                      </v-chip>
                    </div>
                  </div>
                  
                  <div v-if="change.field_name" class="mb-3">
                    <div class="text-subtitle-2 font-weight-medium mb-2">Field: {{ change.field_name }}</div>
                    <v-card variant="tonal" class="pa-3 mb-2">
                      <div class="text-caption text-medium-emphasis mb-1">Previous value:</div>
                      <div class="text-body-2">{{ change.old_value || 'Empty' }}</div>
                    </v-card>
                    <v-card variant="tonal" class="pa-3" color="success">
                      <div class="text-caption text-medium-emphasis mb-1">New value:</div>
                      <div class="text-body-2">{{ change.new_value }}</div>
                    </v-card>
                  </div>
                  
                  <div v-if="change.edit_summary" class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">Reason for change:</div>
                    <div class="text-body-2">{{ change.edit_summary }}</div>
                  </div>
                  
                  <div v-if="change.files_added && change.files_added.length > 0" class="mb-2">
                    <div class="text-caption text-medium-emphasis">Files added:</div>
                    <v-chip-group>
                      <v-chip 
                        v-for="file in change.files_added" 
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
            <v-icon size="48" color="grey-lighten-1">mdi-information</v-icon>
            <div class="mt-2">No changes found for this contributor</div>
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
import PendingEdits from '@/components/PendingEdits.vue';



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

onMounted(async () => {
  await Promise.all([
    store.fetchProposals(),
    store.fetchUsers(),
    store.fetchMunicipalities(),
    store.fetchCategories(),
  ]);
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
    console.log('🎯 [AVATAR] Refreshing contributors list');
    await fetchContributors();
  }
  
  // Update proposal author avatar if the updated user is the author
  if (proposal.value.author_id === userId) {
    console.log('🎯 [AVATAR] User is the author, updating author avatar');
    proposal.value.author_avatar = avatarUrl;
  }
  
  console.log('🎯 [AVATAR] Avatar update completed');
};

const proposal = computed(() => store.proposals.find(p => p.proposalId === parseInt(route.params.id)) || {});
const statusColor = computed(() => proposal.value.status === 'Approved' ? 'success' : 'warning');
const voteCounts = computed(() => ({
  for: usersForVote.value.for.length,
  against: usersForVote.value.against.length,
  abstain: usersForVote.value.abstain.length
}));

// Check if current user is the author
const isAuthor = computed(() => {
  if (!authStore.currentUser || !proposal.value) return false;
  return authStore.currentUser.id === proposal.value.authorId;
});

// Check if current user is the proposal author (for notifications and pending edits)
const isProposalAuthor = computed(() => {
  if (!authStore.currentUser || !proposal.value) return false;
  return authStore.currentUser.id === proposal.value.author_id;
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

// Funkcija za edit proposal
const editProposal = () => {
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
    console.log('🚀 [FRONTEND] fetchContributions called for proposal:', route.params.id);
    console.log('🚀 [FRONTEND] Calling URL:', `${authStore.baseUrl}/api/proposals/${route.params.id}/contributions`);
    
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions`);
    console.log('📡 [FRONTEND] Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ [FRONTEND] Error fetching contributions:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('📊 [FRONTEND] Received data:', data);
    contributions.value = data || [];
    console.log('✅ [FRONTEND] Set contributions.value to:', contributions.value);
  } catch (error) {
    console.error('❌ [FRONTEND] Error fetching contributions:', error);
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
        authorId: authStore.currentUser?.id
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
        authorId: authStore.currentUser?.id
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
</style>