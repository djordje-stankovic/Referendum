<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Municipal Proposals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/"><v-icon>mdi-home</v-icon></v-btn>
      <v-btn icon to="/create"><v-icon>mdi-plus</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>