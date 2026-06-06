import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { setupAnimations } from './animations.js'

export default {
  extends: DefaultTheme,
  setup() {
    if (typeof window !== 'undefined') {
      setupAnimations()
    }
  }
}