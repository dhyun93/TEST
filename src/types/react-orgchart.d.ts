declare module "react-orgchart" {
  import * as React from "react"
  export interface NodeProps {
    node: any
  }
  export interface OrgChartProps {
    tree: any
    NodeComponent?: React.FC<NodeProps>
  }
  const OrgChart: React.FC<OrgChartProps>
  export default OrgChart
}