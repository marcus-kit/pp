export default defineAppConfig({
  ui: {
    colors: {
      // PayPal Modern Blue - primary brand color
      primary: 'blue',
      // Neutral color for text, borders, backgrounds
      neutral: 'gray'
    }
  },
  colorMode: {
    // Auto mode: respects system preference (prefers-color-scheme)
    preference: 'system',
    // Fallback to light mode if system preference is not available
    fallback: 'light',
    // Store preference in localStorage
    classSuffix: ''
  }
})
