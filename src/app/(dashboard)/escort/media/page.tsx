import MediaManager from '../../../dashboard-escort/medias/MediaManager'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function EscortMediaPage() {
  return (
    <DashboardLayout 
      title="Gestion des Médias" 
      subtitle="Organisez vos photos et vidéos selon leur visibilité"
    >
      <MediaManager />
    </DashboardLayout>
  )
}
