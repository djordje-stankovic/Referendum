<template>
  <v-container>
    <v-card>
      <v-card-title>User Profile</v-card-title>
      <v-card-text>
        <div class="text-h6">{{ user?.name }}</div>
        <div class="text-caption">ID: {{ user?.id }}</div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return { user: null };
  },
  async created() {
    const res = await fetch(`/users/${this.$route.params.id}`);
    this.user = await res.json();
  },
};
</script>


