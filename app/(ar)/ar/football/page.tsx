import AcademyPage from '../../../components/pages/AcademyPage'
import { pageMetadata } from '../../../components/pages/meta'

export const revalidate = 60

export const generateMetadata = () => pageMetadata('ar', '/football')

export default function ArabicFootballPage() {
  return <AcademyPage academy="football" lang="ar" />
}
