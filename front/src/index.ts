import Vue from 'vue'
import App from './App.vue'

const app = new Vue({
  render: h => h(App),
})
app.$mount()

document.body.appendChild(app.$el)
