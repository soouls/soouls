declare module 'react-force-graph-3d' {
  import type { ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface ForceGraph3DProps {
    width?: number;
    height?: number;
    graphData?: {
      nodes: any[];
      links: any[];
    };
    backgroundColor?: string;
    nodeRelSize?: number;
    nodeId?: string;
    nodeLabel?: string | ((node: any) => string);
    nodeVal?: string | ((node: any) => number);
    nodeColor?: string | ((node: any) => string);
    nodeAutoColorBy?: string | ((node: any) => string);
    onNodeClick?: (node: any, event: any) => void;
    onNodeRightClick?: (node: any, event: any) => void;
    onNodeHover?: (node: any, prevNode: any) => void;
    onNodeDrag?: (node: any, translate: { x: number; y: number; z: number }) => void;
    onNodeDragEnd?: (node: any, translate: { x: number; y: number; z: number }) => void;
    linkSource?: string;
    linkTarget?: string;
    linkLabel?: string | ((link: any) => string);
    linkVisibility?: boolean | ((link: any) => boolean);
    linkColor?: string | ((link: any) => string);
    linkAutoColorBy?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkOpacity?: number;
    linkCell?: string | ((link: any) => string); // Added missing prop
    forceEngine?: 'd3' | 'ngraph';
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    warmupTicks?: number;
    cooldownTicks?: number;
    cooldownTime?: number;
    enableNodeDrag?: boolean;
    enableNavigationControls?: boolean;
    enablePointerInteraction?: boolean;
    controlType?: 'trackball' | 'orbit' | 'fly';
    rendererConfig?: any;
    extraRenderers?: any[];
    nodeThreeObject?: (node: any) => any;
    nodeThreeObjectExtend?: boolean | ((node: any) => boolean);
  }

  const ForceGraph3D: ForwardRefExoticComponent<ForceGraph3DProps & RefAttributes<any>>;

  export default ForceGraph3D;
}
