import { useEffect, useState } from "react";
import { activeIdentity } from "../config/activeIdentity";
import { agents } from "../data/mockData";
import {
  checkCaeStatus,
  fetchTribunalAgents,
  type CaeStatusDetail,
  type TribunalAgent
} from "../services/caeApi";
import { SectionCard } from "../ui/SectionCard";
import { getCaeStatusCopy } from "../utils/caeStatusUi";

export function AgentsPage() {
  const [caeDetail, setCaeDetail] = useState<CaeStatusDetail>("OFFLINE");
  const [roster, setRoster] = useState<TribunalAgent[]>(agents);
  const [usingLiveRoster, setUsingLiveRoster] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadAgentsPage = async () => {
      try {
        const status = await checkCaeStatus(controller.signal);

        if (active) {
          setCaeDetail(status.detail);
        }
      } catch {
        if (active && !controller.signal.aborted) {
          setCaeDetail("OFFLINE");
        }
      }

      try {
        const liveAgents = await fetchTribunalAgents(controller.signal);

        if (!active || controller.signal.aborted) {
          return;
        }

        if (liveAgents.length > 0) {
          setRoster(liveAgents);
          setUsingLiveRoster(true);
          return;
        }
      } catch {
        if (!active || controller.signal.aborted) {
          return;
        }
      }

      if (active) {
        setRoster(agents);
        setUsingLiveRoster(false);
      }
    };

    void loadAgentsPage();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const caeStatus = getCaeStatusCopy(caeDetail);

  return (
    <div className="page">
      <SectionCard
        title="Active Operator"
        subtitle="Identidad activa derivada del contexto local"
      >
        <div className="table-list">
          <div className="table-row">
            <div>
              <strong>{activeIdentity.name}</strong>
              <p>{activeIdentity.role}</p>
            </div>
            <div className={`tribunal-live-badge tribunal-live-${caeStatus.detail.toLowerCase()}`}>
              <span className="tribunal-live-dot" />
              {caeStatus.operatorState}
            </div>
            <span>{activeIdentity.origin}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Censo de agentes"
        subtitle={
          usingLiveRoster
            ? "Ciudadanos reales del Tribunal con tolerancia a esquema imperfecto"
            : "Registro mock de operadores soberanos"
        }
      >
        <div className="table-list">
          {roster.map((agent) => (
            <div key={agent.id} className="table-row">
              <div>
                <strong>
                  {agent.id} · {agent.name}
                </strong>
                <p>{agent.role}</p>
              </div>
              <div className={`badge badge-${agent.status}`}>{agent.status}</div>
              <span>{agent.lastPulse}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
