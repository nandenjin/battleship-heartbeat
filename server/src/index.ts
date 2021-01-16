import { createApp, h as createElement } from 'vue'
import { store, key } from './store'
import { router } from './router'
import App from './App.vue'
import WebFont from 'webfontloader'
import 'normalize.css'
import './style.scss'

WebFont.load({
  google: {
    families: ['Material Icons', 'Roboto:wght@300;500'],
  },
})

const container = document.createElement('div')
const app = createApp({
  render: () => createElement(App),
})
app.use(store, key)
app.use(router)
app.mount(container)

document.body.appendChild(container)
