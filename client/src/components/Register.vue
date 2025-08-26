<template>
  <v-container>
    <v-card class="mx-auto" max-width="400">
      <v-card-title class="headline">Create Account</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="register">
          <v-text-field
            v-model="firstName"
            label="First Name"
            :rules="[v => !!v || 'First name is required']"
            required
          ></v-text-field>
          <v-text-field
            v-model="lastName"
            label="Last Name"
            :rules="[v => !!v || 'Last name is required']"
            required
          ></v-text-field>
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
            :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Password must be at least 6 characters']"
            required
          ></v-text-field>
          <v-select
            v-if="municipalities && municipalities.length > 0"
            v-model="municipalityId"
            :items="municipalities"
            item-title="name"
            item-value="id"
            label="Municipality"
            :rules="[v => !!v || 'Municipality is required']"
            required
          ></v-select>
          <div v-else>Loading municipalities... (Error: Check console)</div>
          <v-btn
            :disabled="!valid"
            color="primary"
            type="submit"
            block
          >Register</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

console.log('Register component loaded');

const store = useAuthStore();
const router = useRouter();
const form = ref(null);
const valid = ref(false);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref(''); // Dodaj ovo
const municipalityId = ref(null);

const municipalities = computed(() => store.municipalities || []);

onMounted(() => {
  store.fetchMunicipalities();
});

const register = async () => {
  if (!form.value.validate()) return;
  try {
    await store.registerUser({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value, // Dodaj ovo
      municipality_id: municipalityId.value,
    });
    alert('Registration successful! Please log in.');
    await router.push('/login');
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
};
</script>