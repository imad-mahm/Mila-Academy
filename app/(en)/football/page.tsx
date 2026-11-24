import AcademyPage from '../../components/pages/AcademyPage'
import { pageMetadata } from '../../components/pages/meta'

export const revalidate = 60

export const generateMetadata = () => pageMetadata('en', '/football')

export default function FootballPage() {
  return <AcademyPage academy="football" lang="en" />
}
