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
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#6B7280', // Svetlija siva
          'primary-darken-1': '#4B5563',
          secondary: '#9CA3AF', // Svetlija neutralna siva
          'secondary-darken-1': '#6B7280',
          accent: '#A78BFA', // Svetlija ljubičasta
          'accent-darken-1': '#8B5CF6',
          error: '#EF4444',
          info: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          surface: '#FFFFFF',
          background: '#FAFAFA',
          'on-surface': '#374151',
          'on-background': '#6B7280',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#E5E7EB',
          'primary-darken-1': '#D1D5DB',
          secondary: '#D1D5DB',
          'secondary-darken-1': '#9CA3AF',
          accent: '#DDD6FE',
          'accent-darken-1': '#C4B5FD',
          error: '#FECACA',
          info: '#BFDBFE',
          success: '#A7F3D0',
          warning: '#FED7AA',
          surface: '#1F2937',
          background: '#111827',
          'on-surface': '#F9FAFB',
          'on-background': '#F3F4F6',
        },
      },
    },
  },
  defaults: {
    VCard: {
      variant: 'elevated',
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
      elevation: 1,
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'lg',
    },
  },
});