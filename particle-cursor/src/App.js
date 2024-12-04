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
    const nodeCount = 150;
    const maxDistance = 200;
    const mouseRadius = 100;
    const maxVelocity = 2;

    const mouse = { x: null, y: null };

    const createNodes = () => {
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1, // Set initial velocity
          vy: (Math.random() - 0.5) * 1,
        });
      }
    };

    const limitVelocity = (node) => {
      const speed = Math.sqrt(node.vx ** 2 + node.vy ** 2);
      if (speed > maxVelocity) {
        node.vx *= maxVelocity / speed;
        node.vy *= maxVelocity / speed;
      }
    };

    const drawNodes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouseRadius - distance) * 0.05;
            node.vx += Math.cos(angle) * force * 0.1;
            node.vy += Math.sin(angle) * force * 0.1;
          }
        }

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Limit velocity to prevent gradual acceleration
        limitVelocity(node);

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxDistance})`;
            ctx.stroke();
          }
        });
      });

      // Draw mouse as distinct node
      if (mouse.x !== null && mouse.y !== null) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 0, 1)";
        ctx.fill();

        // Connect mouse to nearby nodes
        nodes.forEach((node) => {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `rgba(255, 255, 0, ${1 - distance / maxDistance})`;
            ctx.stroke();
          }
        });
      }
    };

    const animate = () => {
      drawNodes();
      requestAnimationFrame(animate);
    };

    createNodes();
    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas"></canvas>;
};

export default App;
