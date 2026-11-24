import AcademyPage from '../../../components/pages/AcademyPage'
import { pageMetadata } from '../../../components/pages/meta'

export const revalidate = 60

export const generateMetadata = () => pageMetadata('ar', '/basketball')

export default function ArabicBasketballPage() {
  return <AcademyPage academy="basketball" lang="ar" />
}
