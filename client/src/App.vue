<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" dark>
      <v-app-bar-title>Municipal Proposals</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" :to="'/'">Home</v-btn>
      <v-btn color="secondary" :to="'/create'">Create</v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-account-circle" variant="text"></v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/profile'" title="Profile" prepend-icon="mdi-account" />
          <v-list-item :to="'/settings'" title="Settings" prepend-icon="mdi-cog" />
          <v-divider />
          <v-list-item title="Logout" prepend-icon="mdi-logout" @click="onLogout" />
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
  
</template>

<script>
export default {
  name: 'App',
  methods: {
    onLogout() {
      // Placeholder logout
      console.log('Logout clicked');
    },
  },
};
</script>

<style>
html, body, #app {
  height: 100%;
}
</style>
