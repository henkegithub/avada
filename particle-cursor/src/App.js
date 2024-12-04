import React, { useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const nodes = [];
    const nodeCount = 100;
    const maxDistance = 150;

    const createNodes = () => {
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    };

    const drawNodes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
    
        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;
    
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "white"; // Set node color to white
        ctx.fill();
    
        // Draw connections
        nodes.forEach((target) => {
          const dx = node.x - target.x;
          const dy = node.y - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
    
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxDistance})`; // White with fading opacity
            ctx.stroke();
          }
        });
      });
    };
    

    const animate = () => {
      drawNodes();
      requestAnimationFrame(animate);
    };

    createNodes();
    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return <canvas ref={canvasRef} className="network-canvas"></canvas>;
};

export default App;
