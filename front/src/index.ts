import { createApp, h as createElement } from 'vue'
import { store } from './store'
import App from './App.vue'

const container = document.createElement('div')
const app = createApp({
  render: () => createElement(App),
})
app.use(store)
app.mount(container)

document.body.appendChild(container)
