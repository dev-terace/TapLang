import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import { clerkPlugin } from '@clerk/vue'
import i18n from './i18n'

const app = createApp(App)

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
})


app.use(createPinia())
app.use(i18n)

app.mount('#app')