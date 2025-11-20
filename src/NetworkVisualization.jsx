import React, { useEffect, useRef, useState } from 'react';

export default function NetworkVisualization({ deeds, highlightedDeedId = null }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // NEW: State to track where the mouse is for the tooltip
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Build nodes and edges
  useEffect(() => {
    if (!deeds || deeds.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const nodeMap = new Map();
    const edgeList = [];

    deeds.forEach((deed, idx) => {
      nodeMap.set(deed.id, {
        id: deed.id,
        deed,
        x: 0,
        y: 0,
        radius: 14,
        color: `hsl(${(idx * 137.5) % 360}, 70%, 65%)`,
      });

      if (deed.inspired_by) {
        edgeList.push({ source: deed.inspired_by, target: deed.id });
      }
    });

    const nodeArray = Array.from(nodeMap.values());
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Unlinked nodes in a circle
    const unlinkedNodes = nodeArray.filter(n => !n.deed.inspired_by);
    unlinkedNodes.forEach((node, i) => {
      const angle = (i / unlinkedNodes.length) * 2 * Math.PI;
      node.x = centerX + Math.cos(angle) * (Math.min(width, height) * 0.35);
      node.y = centerY + Math.sin(angle) * (Math.min(width, height) * 0.35);
    });

    // Linked nodes near their parent
    nodeArray.forEach(node => {
      if (node.deed.inspired_by) {
        const parent = nodeMap.get(node.deed.inspired_by);
        if (parent) {
          const offsetAngle = Math.random() * 2 * Math.PI;
          const offsetRadius = 80 + Math.random() * 40;
          node.x = parent.x + Math.cos(offsetAngle) * offsetRadius;
          node.y = parent.y + Math.sin(offsetAngle) * offsetRadius;
        }
      }
    });

    setNodes(nodeArray);
    setEdges(edgeList);
  }, [deeds]);

  // Draw nodes and edges
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      ctx.strokeStyle = 'rgba(139,92,246,0.3)';
      ctx.lineWidth = 2;
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Inspired counts
      const inspiredCounts = {};
      edges.forEach(edge => {
        inspiredCounts[edge.source] = (inspiredCounts[edge.source] || 0) + 1;
      });

      // Draw nodes
      nodes.forEach(node => {
        const isHighlighted = highlightedDeedId === node.id;
        const nodeRadius = isHighlighted ? 18 : 14;

        if (isHighlighted) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 3);
          gradient.addColorStop(0, node.color + '80');
          gradient.addColorStop(1, node.color + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = isHighlighted ? 3 : 2;
        ctx.stroke();

        // Inspired badge
        const count = inspiredCounts[node.id] || 0;
        if (count > 0) {
          const badgeX = node.x + nodeRadius - 4;
          const badgeY = node.y - nodeRadius + 4;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(count, badgeX, badgeY);
        }
      });
    };

    draw();
  }, [nodes, edges, highlightedDeedId]);

  // Hover detection
  const handleMouseMove = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // NEW: Update tooltip position state
    // We add +15px so the tooltip doesn't cover the mouse cursor
    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });

    const hovered = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius + 4;
    });

    setHoveredNode(hovered ? hovered.id : null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="w-full h-full block"
      />

      {/* NEW: Dynamic Tooltip following the mouse */}
      {hoveredNode && (
        <div
          className="fixed z-50 bg-black/90 text-white px-4 py-2 rounded-lg text-sm border border-purple-500/30 backdrop-blur-sm pointer-events-none shadow-xl transition-opacity duration-200"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <div className="font-bold text-purple-300 text-xs mb-1">Deed</div>
          {nodes.find(n => n.id === hoveredNode)?.deed.description}
        </div>
      )}
    </div>
  );
}