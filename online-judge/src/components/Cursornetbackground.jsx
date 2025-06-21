import { useEffect, useRef } from "react";

const CursorNetBackground = ({
  color = '0, 150, 255',      // RGB of the net
  pointDensity = 0.00012,     // points per pixel
  maxDistance = 120,
  drift = 0.4,
  minAlpha = 0.1,
  hoverRadius = 80,           // radius to highlight net
  hoverIntensity = 0.7        // additional alpha boost near cursor
}) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const pointsRef = useRef([]);
  const cursorRef = useRef({ x: null, y: null });

  // Initialize points based on canvas size
  const initPoints = (w, h) => {
    const total = Math.ceil(w * h * pointDensity);
    const pts = [];
    for (let i = 0; i < total; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * drift,
        vy: (Math.random() - 0.5) * drift
      });
    }
    pointsRef.current = pts;
  };

  // Resize canvas and regenerate points
  const resizeCanvas = (canvas) => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPoints(canvas.width, canvas.height);
  };

  // Track mouse position
  const handleMouseMove = (e) => {
    cursorRef.current = { x: e.clientX, y: e.clientY };
  };

  // Main animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const pts = pointsRef.current;
    const cursor = cursorRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Move & wrap points
    pts.forEach(p => {
      p.x = (p.x + p.vx + width) % width;
      p.y = (p.y + p.vy + height) % height;
    });

    // Draw lines with hover highlight
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const p1 = pts[i], p2 = pts[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          // base alpha
          let alpha = Math.max(minAlpha, 1 - dist / maxDistance);
          // boost alpha near cursor
          if (cursor.x != null) {
            const midX = 0.5 * (p1.x + p2.x);
            const midY = 0.5 * (p1.y + p2.y);
            const dc = Math.hypot(midX - cursor.x, midY - cursor.y);
            if (dc < hoverRadius) {
              alpha = Math.min(1, alpha + hoverIntensity * (1 - dc / hoverRadius));
            }
          }
          ctx.strokeStyle = `rgba(${color}, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Draw dots with hover highlight
    pts.forEach(p => {
      let alpha = minAlpha + 0.3;
      if (cursor.x != null) {
        const dc = Math.hypot(p.x - cursor.x, p.y - cursor.y);
        if (dc < hoverRadius) {
          alpha = Math.min(1, alpha + hoverIntensity * (1 - dc / hoverRadius));
        }
      }
      ctx.fillStyle = `rgba(${color}, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));
    window.addEventListener('mousemove', handleMouseMove);
    animRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', () => resizeCanvas(canvas));
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }} />;
};

export default CursorNetBackground;
