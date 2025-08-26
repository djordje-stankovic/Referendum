import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Uključi globalne stilove
import * as components from 'vuetify/components'; // Uključi sve komponente
import * as directives from 'vuetify/directives'; // Uključi sve direktive
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // Ikone
import '@mdi/font/css/materialdesignicons.css'; // CSS za MDI ikone

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1976D2', // Plava za dugmad
          secondary: '#4CAF50', // Zelena za glasanje
          accent: '#FF4081', // Roza za isticanje
        },
      },
    },
  },
});