import { ScenarioCallView, getScenarioCallRouteKey } from '@features/scenario-training'
import { getValidAccessToken } from '@features/auth'
import { useLocation, useParams } from 'react-router-dom'
import type { ScenarioRouteState } from '@entities/scenario'

/** 전체 화면 시나리오 통화 라우트를 제공합니다. */
export const ScenarioCallPage = () => {
  const { scenarioId } = useParams()
  const { state, key } = useLocation()
  const callKey = getScenarioCallRouteKey(state as ScenarioRouteState | null, key)
  return <ScenarioCallView key={`${scenarioId}-${callKey}`} getToken={getValidAccessToken} />
}
