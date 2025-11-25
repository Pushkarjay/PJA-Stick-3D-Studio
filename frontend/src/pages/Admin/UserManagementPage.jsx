import UserManagementPanel from '../../components/Admin/UserManagementPanel'
import { useAuth } from '../../hooks/useAuth'

export default function UserManagementPage() {
  const { user } = useAuth()
  return <UserManagementPanel user={user} />
}
