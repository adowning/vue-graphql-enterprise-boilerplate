import { tryToLogIn, logout } from '@services/auth'

export default [
  {
    path: '/',
    name: 'home',
    component: () => lazyLoadView(import('@views/home')),
  },
  {
    path: '/login',
    name: 'login',
    component: () => lazyLoadView(import('@views/login')),
    beforeEnter: async (routeTo, routeFrom, next) => {
      const loggedIn = await tryToLogIn()

      // Redirect to home page if the user is
      // logged in or continue otherwise
      loggedIn ? next({ name: 'home' }) : next()
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => lazyLoadView(import('@views/profile')),
    meta: {
      authRequired: true,
    },
    // props: route => ({ user: store.state.auth.currentUser }), // TODO
  },
  {
    path: '/profile/:username',
    name: 'username-profile',
    component: () => lazyLoadView(import('@views/profile')),
    meta: {
      authRequired: true,
    },
    beforeEnter(routeTo, routeFrom, next) {
      next() // TODO
      // store
      //   // Try to fetch the user's information by their username
      //   .dispatch('users/fetchUser', { username: routeTo.params.username })
      //   .then(user => {
      //     // Add the user to the route params, so that it can
      //     // be provided as a prop for the view component below.
      //     routeTo.params.user = user
      //     // Continue to the route.
      //     next()
      //   })
      //   .catch(() => {
      //     // If a user with the provided username could not be
      //     // found, redirect to the 404 page.
      //     next({ name: '404', params: { resource: 'User' } })
      //   })
    },
    // Set the user from the route params, once it's set in the
    // beforeEnter route guard.
    props: route => ({ user: route.params.user }),
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      authRequired: true,
    },
    beforeEnter(routeTo, routeFrom, next) {
      logout()
      // next() // TODO
      // store.dispatch('auth/logOut')
      // const authRequiredOnPreviousRoute = routeFrom.matched.some(
      //   route => route.meta.authRequired
      // )
      // // Navigate back to previous page, or home as a fallback
      // next(authRequiredOnPreviousRoute ? { name: 'home' } : { ...routeFrom })
    },
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => lazyLoadView(import('@views/loading')),
  },
  {
    path: '/404',
    name: '404',
    component: require('@views/404').default,
    // Allows props to be passed to the 404 page through route
    // params, such as `resource` to define what wasn't found.
    props: true,
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: '*',
    redirect: '404',
  },
]

// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@views/my-view')
//
function lazyLoadView(AsyncView) {
  const AsyncHandler = () => ({
    component: AsyncView,
    // A component to use while the component is loading.
    loading: require('@views/loading').default,
    // A fallback component in case the timeout is exceeded
    // when loading the component.
    error: require('@views/timeout').default,
    // Delay before showing the loading component.
    // Default: 200 (milliseconds).
    delay: 400,
    // Time before giving up trying to load the component.
    // Default: Infinity (milliseconds).
    timeout: 10000,
  })

  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      // Transparently pass any props or children
      // to the view component.
      return h(AsyncHandler, data, children)
    },
  })
}
