import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [transformStyle, setTransformStyle] = useState({});

  const imageUrl =
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.CQ8N1YSnK_8MlKqdqAFixQHaE9%26pid%3DApi&f=1&ipt=bf01d1ca9ccb1766df93e91f86acf64b2328f52dad052b0cfc2fb6cf0bf70b7e&ipo=images";

  const handleMouseMove = (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Berechne die Rotation basierend auf der Mausposition
    const deltaX = (e.clientX - centerX) / centerX;
    const deltaY = (e.clientY - centerY) / centerY;

    // Setze die Rotation für die Karte
    setRotation({
      x: deltaY * 15,  // 15 Grad nach oben oder unten
      y: deltaX * 15,  // 15 Grad nach links oder rechts
    });
  };

  useEffect(() => {
    // Event listener für Mausbewegung
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup des Eventlisteners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Dynamisch die Rotation im CSS anwenden
    const root = document.documentElement;
    root.style.setProperty("--rotateX", `${rotation.x}deg`);
    root.style.setProperty("--rotateY", `${rotation.y}deg`);
  }, [rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const nodes = [];
    const nodeCount = 150;
    let maxDistance = 200;
    let mouseRadius = 100;
    let mouseForce = 0.05;
    const friction = 0.98;
    const mouse = { x: null, y: null };
    let defaultSpeed = 1;

    const handleResize = () => {
      const scaleFactor = Math.sqrt(window.innerWidth * window.innerHeight) / 1000;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      defaultSpeed = 1 * scaleFactor;
      mouseRadius = 100 * scaleFactor;
      mouseForce = 0.05 * scaleFactor;
      maxDistance = 200 * scaleFactor;

      const adjustedNodeCount = Math.round(nodeCount * scaleFactor);
      if (nodes.length !== adjustedNodeCount) {
        nodes.length = 0;
        for (let i = 0; i < adjustedNodeCount; i++) {
          const angle = Math.random() * 2 * Math.PI;
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * defaultSpeed,
            vy: Math.sin(angle) * defaultSpeed,
          });
        }
      } else {
        nodes.forEach((node) => {
          const angle = Math.atan2(node.vy, node.vx);
          node.vx = Math.cos(angle) * defaultSpeed;
          node.vy = Math.sin(angle) * defaultSpeed;
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

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

    const drawNodes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
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

        node.x += node.vx;
        node.y += node.vy;
        adjustVelocity(node);

        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

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

      if (mouse.x !== null && mouse.y !== null) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 0, 1)";
        ctx.fill();

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
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="card-container">
        <div
          className="card-body group"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          <div className="card-item">
            Make things float in air
          </div>
          <div className="card-item">
            Hover over this card to unleash the power of CSS perspective
          </div>
          <div className="card-item">
            <img
              src={imageUrl}
              alt="thumbnail"
              height="200"
              width="200"
              className="h-60 w-full object-cover rounded-xl group-hover:shadow-xl"
            />
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="network-canvas" />
    </div>
  );
};

export default App;
