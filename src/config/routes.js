import Home from '@/components/pages/Home'

export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'Home',
    component: Home
  }
}

export const routeArray = Object.values(routes)
export default routes