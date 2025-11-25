import CategoryManagement from '../../components/Admin/CategoryManagement'
import { useAuth } from '../../hooks/useAuth'

export default function CategoryManagementPage() {
  const { user } = useAuth()
  return <CategoryManagement user={user} />
}
