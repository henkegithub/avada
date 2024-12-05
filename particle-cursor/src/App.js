import React, { useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const nodes = [];
    const nodeCount = 150;
    const maxDistance = 200;
    const mouseRadius = 100; // Interaction radius
    const defaultSpeed = 1; // Default velocity magnitude
    const mouseForce = 0.05; // Force applied by the mouse
    const friction = 0.98; // Friction to gradually reduce excess velocity
    const mouse = { x: null, y: null }; // Mouse position tracker

    // Function to dynamically resize the canvas
    const handleResize = () => {
      const scaleFactor = Math.sqrt(window.innerWidth * window.innerHeight) / 1000; // Dynamic scaling factor
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Adjust nodes dynamically based on screen size
      const adjustedNodeCount = Math.round(nodeCount * scaleFactor); // Proportional scaling of the node count
      if (nodes.length !== adjustedNodeCount) {
        nodes.length = 0; // Reset nodes
        for (let i = 0; i < adjustedNodeCount; i++) {
          const angle = Math.random() * 2 * Math.PI; // Random direction
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * defaultSpeed,
            vy: Math.sin(angle) * defaultSpeed,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Adjust velocity: Apply friction and restore to default speed
    const adjustVelocity = (node) => {
      const speed = Math.sqrt(node.vx ** 2 + node.vy ** 2);
      if (speed > defaultSpeed) {
        node.vx *= friction;
        node.vy *= friction;
      } else if (speed < defaultSpeed) {
        const angle = Math.atan2(node.vy, node.vx);
        node.vx = Math.cos(angle) * defaultSpeed;
        node.vy = Math.sin(angle) * defaultSpeed;
      }
    };

    // Draw nodes and connections
    const drawNodes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
        // Mouse interaction: Apply force to nearby nodes
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouseRadius - distance) * mouseForce;
            node.vx += Math.cos(angle) * force;
            node.vy += Math.sin(angle) * force;
          }
        }

        // Update node position and velocity
        node.x += node.vx;
        node.y += node.vy;
        adjustVelocity(node);

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

        // Draw connections to nearby nodes
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

      // Draw mouse cursor as a distinct node
      if (mouse.x !== null && mouse.y !== null) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI); // Larger size for cursor node
        ctx.fillStyle = "rgba(255, 255, 0, 1)"; // Bright yellow for the cursor
        ctx.fill();

        // Connect mouse cursor to nearby nodes
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

    // Animation loop
    const animate = () => {
      drawNodes();
      requestAnimationFrame(animate);
    };

    animate();

    // Update mouse position on movement
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // Reset mouse position on leave
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas"></canvas>;
};

export default App;
