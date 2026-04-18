import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Zap, Target, Search, ZoomIn, ZoomOut, RefreshCw, Hand, MousePointer2 } from 'lucide-react';

const ForensicMap = ({ data }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  
  const simulationAttr = useRef({
    alpha: 1,
    lastMouse: { x: 0, y: 0 }
  });

  // Scale data for visual impact
  useEffect(() => {
    if (!data || !data.nodes) return;

    const width = 800;
    const height = 650;

    // Identify "Hubs" (High risk approvers)
    const nodeOutDegree = {};
    data.links?.forEach(l => {
        const sid = l.source.id || l.source;
        nodeOutDegree[sid] = (nodeOutDegree[sid] || 0) + 1;
    });

    const newNodes = data.nodes.map((node, i) => ({
      ...node,
      x: width / 2 + (Math.random() - 0.5) * 600,
      y: height / 2 + (Math.random() - 0.5) * 600,
      vx: 0,
      vy: 0,
      radius: Math.max(8, Math.log10(node.val || 1) * 4),
      isHub: node.type === 'approver' && (nodeOutDegree[node.id] > 3)
    }));

    const newLinks = (data.links || []).map(link => ({
      ...link,
      source: newNodes.find(n => n.id === (link.source.id || link.source)),
      target: newNodes.find(n => n.id === (link.target.id || link.target))
    })).filter(l => l.source && l.target);

    setNodes(newNodes);
    setLinks(newLinks);
    simulationAttr.current.alpha = 1; // Restart physics
  }, [data]);

  // Simulation Loop
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationId;
    const repulsion = 8000;
    const attraction = 0.05;
    const friction = 0.8;

    const step = () => {
      if (simulationAttr.current.alpha > 0.005) {
          // 1. Repulsion
          for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
              const b = nodes[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx * dx + dy * dy || 1;
              const dist = Math.sqrt(distSq);
              
              // Standard repulsion
              const force = (repulsion * simulationAttr.current.alpha) / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              // Hard collision prevention
              const minDim = a.radius + b.radius + 12;
              if (dist < minDim) {
                const overlap = (minDim - dist) * 0.5;
                a.vx -= (dx / dist) * overlap;
                a.vy -= (dy / dist) * overlap;
                b.vx += (dx / dist) * overlap;
                b.vy += (dy / dist) * overlap;
              }

              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }

          // 2. Attraction
          links.forEach(l => {
            const dx = l.target.x - l.source.x;
            const dy = l.target.y - l.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 180) * attraction * simulationAttr.current.alpha;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            l.source.vx += fx;
            l.source.vy += fy;
            l.target.vx -= fx;
            l.target.vy -= fy;
          });

          // 3. Update Positions
          nodes.forEach(n => {
            if (n === draggedNode) return;
            n.x += n.vx;
            n.y += n.vy;
            n.vx *= friction;
            n.vy *= friction;
            
            // Soft centering
            n.vx += (400 - n.x) * 0.002;
            n.vy += (325 - n.y) * 0.002;
          });

          simulationAttr.current.alpha *= 0.994; // Cool down
      }

      draw();
      animationId = requestAnimationFrame(step);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Links
      links.forEach(l => {
        const isRelated = hoveredNode && (l.source.id === hoveredNode.id || l.target.id === hoveredNode.id);
        const opacity = isRelated ? 0.6 : 0.03;
        ctx.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
        ctx.lineWidth = isRelated ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach(n => {
        const isHovered = hoveredNode?.id === n.id;
        const color = n.type === 'vendor' ? '#818cf8' : '#f472b6';
        
        ctx.save();
        if (n.isHub) {
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 300) * 10;
            ctx.shadowColor = '#f43f5e';
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.shadowBlur = isHovered ? 30 : 15;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? n.radius + 6 : n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Label visibility logic
        const labelIsVisible = (transform.k > 1.2) || isHovered || n.isHub;
        if (labelIsVisible) {
          ctx.fillStyle = isHovered ? '#fff' : n.isHub ? '#ff8597' : 'rgba(255,255,255,0.8)';
          ctx.font = isHovered || n.isHub ? 'black 12px Inter' : '9px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(n.id, n.x, n.y + n.radius + (n.isHub ? 22 : 18));
        }
      });

      ctx.restore();
    };

    step();
    return () => cancelAnimationFrame(animationId);
  }, [nodes, links, hoveredNode, transform, draggedNode]);

  // Interaction Handlers
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.x) / transform.k,
      y: (e.clientY - rect.top - transform.y) / transform.k
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    const node = nodes.find(n => {
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 10;
    });

    if (node) {
      setDraggedNode(node);
      simulationAttr.current.alpha = 1; // Wake up physics
    } else {
      setIsPanning(true);
    }
    simulationAttr.current.lastMouse = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    
    if (draggedNode) {
      draggedNode.x = pos.x;
      draggedNode.y = pos.y;
      simulationAttr.current.alpha = Math.max(simulationAttr.current.alpha, 0.4);
    } else if (isPanning) {
      const dx = e.clientX - simulationAttr.current.lastMouse.x;
      const dy = e.clientY - simulationAttr.current.lastMouse.y;
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }

    const node = nodes.find(n => {
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 10;
    });
    setHoveredNode(node || null);
    simulationAttr.current.lastMouse = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({
      ...t,
      k: Math.max(0.1, Math.min(5, t.k * scale))
    }));
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="h-[650px] flex flex-col items-center justify-center space-y-4 opacity-50 bg-[#11141b]/20 rounded-3xl border border-white/5">
        <Network className="w-12 h-12 text-indigo-500/50" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Insufficient relational data to map gatekeepers</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-white flex items-center tracking-tighter uppercase">
                <Network className="w-6 h-6 mr-4 text-indigo-400" />
                Relational Risk Mapping
                </h3>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase opacity-70">Interactive Gatekeeper Analysis Module</p>
            </div>
            
            <div className="flex items-center space-x-8">
                <LegendItem label="External Vendor" color="#818cf8" />
                <LegendItem label="Internal Approver" color="#f472b6" />
                <LegendItem label="High Risk Hub" color="#f43f5e" border />
            </div>
      </div>

      <div className="bg-[#11141b]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden relative shadow-2xl h-[700px] group select-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={700}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full ${draggedNode ? 'cursor-grabbing' : isPanning ? 'cursor-move' : 'cursor-crosshair'}`}
        />

        {/* HUD Elements */}
        {hoveredNode && (
            <div className="absolute top-8 right-8 p-6 bg-black/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-72">
                <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-3.5 h-3.5 rounded-full ${hoveredNode.type === 'vendor' ? 'bg-indigo-400' : 'bg-pink-400'} shadow-[0_0_15px_currentColor]`} />
                    <p className="text-lg font-black text-white uppercase tracking-tight truncate">{hoveredNode.id}</p>
                </div>
                
                <div className="space-y-4">
                    <HUDStat label="Risk Status" value={hoveredNode.isHub ? 'CRITICAL HUB' : 'MONITORED'} color={hoveredNode.isHub ? 'text-red-400' : 'text-indigo-400'} />
                    <HUDStat label="Total Volume" value={`$${hoveredNode.val?.toLocaleString()}`} />
                    <HUDStat label="Entity Type" value={hoveredNode.type.toUpperCase()} />
                </div>

                {hoveredNode.isHub && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Risk Alert</p>
                        <p className="text-[11px] text-red-200/60 leading-tight">This entity connects to {nodes.length > 5 ? 'multiple' : 'various'} vendor pools. High potential for circular settlement logic.</p>
                    </div>
                )}
            </div>
        )}

        {/* Control HUD Overlay */}
        <div className="absolute bottom-8 left-8 flex items-center space-x-3">
            <div className="px-5 py-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center space-x-4">
                <div className="flex items-center space-x-2 border-r border-white/10 pr-4">
                    <MousePointer2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Interactive Engine</span>
                </div>
                <div className="flex items-center space-x-5 text-gray-500">
                   <ControlTip icon={<Hand className="w-3.5 h-3.5" />} label="Pan" />
                   <ControlTip icon={<RefreshCw className="w-3.5 h-3.5" />} label="Drag" />
                   <ControlTip icon={<Search className="w-3.5 h-3.5" />} label="Zoom" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, color, border }) => (
    <div className="flex items-center space-x-3">
        <div 
            className={`w-3 h-3 rounded-full ${border ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black' : ''} shadow-[0_0_10px_currentColor]`} 
            style={{ backgroundColor: color }} 
        />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[.15em]">{label}</span>
    </div>
);

const HUDStat = ({ label, value, color = 'text-white' }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-black ${color} tracking-tight`}>{value}</span>
    </div>
);

const ControlTip = ({ icon, label }) => (
    <div className="flex items-center space-x-1.5 grayscale opacity-50">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
);

export default ForensicMap;
