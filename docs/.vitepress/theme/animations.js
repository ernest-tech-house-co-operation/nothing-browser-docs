export function setupAnimations() {
  if (typeof window === 'undefined') return

  // ── Dark mode circle transition ──────────────────────────────
  const toggle = () => document.querySelector('.VPNavBarAppearance button, .VPNavScreenAppearance button')

  const applyDarkTransition = (e) => {
    if (!document.startViewTransition) return // fallback: no animation

    const x = window.innerWidth / 2
    const y = window.innerHeight / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const isDark = document.documentElement.classList.contains('dark')

    document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark', !isDark)
    }).ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })

    e.preventDefault()
    e.stopPropagation()
  }

  const bindToggle = () => {
    const btn = toggle()
    if (btn && !btn._darkBound) {
      btn.addEventListener('click', applyDarkTransition, true)
      btn._darkBound = true
    }
  }

  // Bind on load and after nav
  setTimeout(bindToggle, 500)
  window.addEventListener('vitepress:routeChanged', () => setTimeout(bindToggle, 300))

  // ── Scroll reveal (your existing code) ──────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('is-visible')
        observer.unobserve(el.target)
      }
    })
  }, { threshold: 0.1 })

  const observe = () => {
    document.querySelectorAll(
      '.VPFeature, .seo-card, .github-card, .stat, .support-section'
    ).forEach(el => {
      el.classList.add('scroll-reveal')
      observer.observe(el)
    })
  }

  observe()
  window.addEventListener('vitepress:routeChanged', observe)
}