import { createApp, h as createElement } from 'vue'
import App from './App.vue'

const container = document.createElement('div')
const app = createApp({
  render: () => createElement(App),
})
app.mount(container)

document.body.appendChild(container)
