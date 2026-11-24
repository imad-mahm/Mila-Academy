import AcademyPage from '../../components/pages/AcademyPage'
import { pageMetadata } from '../../components/pages/meta'

export const revalidate = 60

export const generateMetadata = () => pageMetadata('en', '/basketball')

export default function BasketballPage() {
  return <AcademyPage academy="basketball" lang="en" />
}
