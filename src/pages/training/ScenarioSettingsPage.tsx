import { ScenarioSettingsView } from '@features/scenario-training'
import { useLocation, useParams } from 'react-router-dom'

/** 훈련 설정 라우트를 제공합니다. */
export const ScenarioSettingsPage = () => {
  const { scenarioId } = useParams()
  const { key } = useLocation()
  return <ScenarioSettingsView key={`${scenarioId}-${key}`} />
}
