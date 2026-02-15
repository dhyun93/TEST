import React from "react"

export type OrgNode = {
  id: number | string
  title: string
  name?: string
  position?: string
  children?: OrgNode[]
  level?: number
}

interface OrganizationTreeProps {
  data: OrgNode | OrgNode[]
  supervisors?: OrgNode[]
}

const OrgCard: React.FC<{ node: OrgNode; size?: "default" | "small" | "mini" }> = ({ node, size = "default" }) => {
  const sizeClasses = {
    default: "w-[130px] sm:w-[150px] p-2.5 sm:p-3",
    small: "w-[100px] sm:w-[120px] p-2 sm:p-2.5",
    mini: "w-[85px] sm:w-[100px] p-1.5 sm:p-2",
  }

  const titleClasses = {
    default: "text-[10px] sm:text-xs",
    small: "text-[9px] sm:text-[11px]",
    mini: "text-[8px] sm:text-[10px]",
  }

  const nameClasses = {
    default: "text-xs sm:text-base",
    small: "text-[11px] sm:text-sm",
    mini: "text-[10px] sm:text-xs",
  }

  const posClasses = {
    default: "text-[9px] sm:text-xs",
    small: "text-[8px] sm:text-[11px]",
    mini: "text-[7px] sm:text-[10px]",
  }

  return (
    <div className={`${sizeClasses[size]} bg-white border border-[#DFDFDF] rounded-lg text-center flex-shrink-0`}>
      <div className={`${titleClasses[size]} font-medium text-gray-500 mb-0.5 sm:mb-1`}>{node.title}</div>
      {node.name && <div className={`${nameClasses[size]} font-semibold text-gray-900`}>{node.name}</div>}
      {node.position && <div className={`${posClasses[size]} text-gray-400 mt-0.5`}>{node.position}</div>}
    </div>
  )
}

const ManagerGroup: React.FC<{ title: string; managers: OrgNode[] }> = ({ title, managers }) => {
  if (managers.length === 0) return null

  if (managers.length === 1) {
    return <OrgCard node={managers[0]} size="small" />
  }

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-[#F8F9FA] rounded-lg border border-dashed border-gray-200">
      <div className="text-[9px] sm:text-xs text-gray-500 font-medium">
        {title} ({managers.length}명)
      </div>
      <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center max-w-[220px] sm:max-w-[380px]">
        {managers.map(manager => (
          <OrgCard key={manager.id} node={manager} size="small" />
        ))}
      </div>
    </div>
  )
}

const OrganizationTree: React.FC<OrganizationTreeProps> = ({ data, supervisors = [] }) => {
  const rootNode = Array.isArray(data) ? data[0] : data
  if (!rootNode) return null

  const safetyManager = rootNode.children?.[0]
  const managers = safetyManager?.children || []

  const safetyManagers = managers.filter(m => m.title === "안전관리자")
  const healthManagers = managers.filter(m => m.title === "보건관리자")

  const supervisorRows: OrgNode[][] = []
  for (let i = 0; i < supervisors.length; i += 5) {
    supervisorRows.push(supervisors.slice(i, i + 5))
  }

  const hasBothManagers = safetyManagers.length > 0 && healthManagers.length > 0

  return (
    <div className="w-full p-4 sm:p-6 bg-[#FAFAFA] rounded-xl border border-gray-200 overflow-x-auto">
      <div className="flex flex-col items-center min-w-fit">
        <OrgCard node={rootNode} />

        {safetyManager && (
          <>
            <div className="w-px h-5 bg-[#DFDFDF]" />
            <OrgCard node={safetyManager} />
          </>
        )}

        {managers.length > 0 && (
          <>
            {hasBothManagers ? (
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-px bg-[#DFDFDF]" />
                <div className="flex pt-5">
                  <div className="relative flex flex-col items-center">
                    <div className="absolute top-0 right-0 w-1/2 h-px bg-[#DFDFDF]" />
                    <div className="absolute top-0 -right-2 sm:-right-3 w-2 sm:w-3 h-px bg-[#DFDFDF]" />
                    <div className="w-px h-4 bg-[#DFDFDF]" />
                    <ManagerGroup title="안전관리자" managers={safetyManagers} />
                  </div>
                  <div className="w-4 sm:w-6" />
                  <div className="relative flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-1/2 h-px bg-[#DFDFDF]" />
                    <div className="absolute top-0 -left-2 sm:-left-3 w-2 sm:w-3 h-px bg-[#DFDFDF]" />
                    <div className="w-px h-4 bg-[#DFDFDF]" />
                    <ManagerGroup title="보건관리자" managers={healthManagers} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-px h-5 bg-[#DFDFDF]" />
                <div className="flex flex-col items-center">
                  {safetyManagers.length > 0 && <ManagerGroup title="안전관리자" managers={safetyManagers} />}
                  {healthManagers.length > 0 && <ManagerGroup title="보건관리자" managers={healthManagers} />}
                </div>
              </>
            )}
          </>
        )}

        {supervisors.length > 0 && (
          <>
            <div className="w-px h-5 bg-[#DFDFDF]" />
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-[#F8F9FA] rounded-lg border border-dashed border-gray-200 max-w-full">
              <div className="text-[10px] sm:text-xs text-gray-500 font-medium">관리감독자 ({supervisors.length}명)</div>
              {supervisorRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 sm:gap-1.5 flex-wrap justify-center">
                  {row.map(supervisor => (
                    <OrgCard key={supervisor.id} node={supervisor} size="mini" />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrganizationTree
