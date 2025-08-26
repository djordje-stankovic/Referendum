<template>
  <v-container>
    <v-card class="mx-auto" max-width="400">
      <v-card-title class="headline">Login</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="[v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[v => !!v || 'Password is required']"
            required
          ></v-text-field>
          <v-btn
            :disabled="!valid"
            color="primary"
            type="submit"
            block
          >Login</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const store = useAuthStore();
const router = useRouter();
const form = ref(null);
const valid = ref(false);
const email = ref('');
const password = ref('');

const login = async () => {
  if (!form.value.validate()) return;
  try {
    await store.loginUser({
      email: email.value,
      password: password.value,
    });
    await router.push('/'); // Preusmeri na početnu stranicu
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please check your credentials.');
  }
};
</script>