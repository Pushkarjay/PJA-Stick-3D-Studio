import SettingsPanel from '../../components/Admin/SettingsPanel'
import { useAuth } from '../../hooks/useAuth'

export default function SiteSettingsPage() {
  const { user } = useAuth()
  return <SettingsPanel user={user} />
}
