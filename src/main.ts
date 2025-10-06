import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// Import global form styles
import './assets/styles/global-forms.css'           // For HTML forms
import './assets/styles/global-info-display.css'   // For info displays  
import './assets/styles/global-primevue-enhancements.css' // For PrimeVue components


// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// PrimeVue styles
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// main.ts (or App.vue <style src>)
import './assets/styles/global-forms.css';   // your existing file
import './assets/css/theme-five-colors.css';  // the new one

// import 'primeflex/primeflex.css'

// Custom Icons
// import '@fortawesome/fontawesome-free/css/all.css' // <- this loads FA icons

// Custom styles
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'
import Toast from 'primevue/toast'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Menubar from 'primevue/menubar'
import ProgressSpinner from 'primevue/progressspinner'

// main.ts updates
import { TeamColorsPlugin } from '../src/plug-ins/team-colors.plugin';

// Import global styles
import '../src/assets/styles/global-styles.css'


const app = createApp(App);
const pinia = createPinia();

app.use(pinia)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(ConfirmationService)
app.use(TeamColorsPlugin);
app.use(router)

app.directive('tooltip', Tooltip)

// Register PrimeVue components globally
app.component('Button', Button)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Calendar', Calendar)
app.component('ConfirmDialog', ConfirmDialog);
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Card', Card)
app.component('Panel', Panel)
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('Dialog', Dialog)
app.component('Toast', Toast)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Menubar', Menubar)

app.mount('#app')
