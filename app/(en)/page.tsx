import HomePage from '../components/pages/HomePage'
import { pageMetadata } from '../components/pages/meta'

// Re-fetch content at most once a minute. Saves from the dashboard also
// revalidate every page immediately (see lib/server/revalidate.ts).
export const revalidate = 60

export const generateMetadata = () => pageMetadata('en', '')

export default function Home() {
  return <HomePage lang="en" />
}
