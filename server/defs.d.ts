declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}

/** Firebase configuration object (from WebpackDefinePlugin) */
declare const FIREBASE_CONFIG: string
