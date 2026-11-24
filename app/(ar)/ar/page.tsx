import HomePage from '../../components/pages/HomePage'
import { pageMetadata } from '../../components/pages/meta'

export const revalidate = 60

export const generateMetadata = () => pageMetadata('ar', '')

export default function ArabicHome() {
  return <HomePage lang="ar" />
}
