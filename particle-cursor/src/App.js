// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const getRandomPosition = (max) => Math.random() * max;

const getRandomPolygon = () => {
  const sides = Math.floor(Math.random() * 3) + 3; // zwischen 3 und 5 Seiten
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    points.push({
      x: Math.cos(angle) * Math.random() * 30 + 30, // zufällige Länge
      y: Math.sin(angle) * Math.random() * 30 + 30,
    });
  }
  return points;
};

function App() {
  const [polygons, setPolygons] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPolygons((prevPolygons) => [
        ...prevPolygons,
        {
          id: Date.now(),
          points: getRandomPolygon(),
          x: getRandomPosition(window.innerWidth),
          y: getRandomPosition(window.innerHeight),
          speedX: Math.random() * 2 + 1, // zufällige Geschwindigkeit
          speedY: Math.random() * 2 + 1,
          directionX: Math.random() < 0.5 ? 1 : -1, // zufällige Richtung
          directionY: Math.random() < 0.5 ? 1 : -1,
        },
      ]);
    }, 200); // Alle 200ms ein neues Polygon generieren

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const movePolygons = setInterval(() => {
      setPolygons((prevPolygons) =>
        prevPolygons.map((polygon) => {
          let newX = polygon.x + polygon.speedX * polygon.directionX;
          let newY = polygon.y + polygon.speedY * polygon.directionY;

          // Zufällige nicht-lineare Bewegungen (kurvenförmig)
          if (Math.random() < 0.05) polygon.directionX = Math.random() < 0.5 ? 1 : -1;
          if (Math.random() < 0.05) polygon.directionY = Math.random() < 0.5 ? 1 : -1;

          if (newX < 0 || newX > window.innerWidth) polygon.directionX *= -1;
          if (newY < 0 || newY > window.innerHeight) polygon.directionY *= -1;

          return { ...polygon, x: newX, y: newY };
        })
      );
    }, 30);

    return () => clearInterval(movePolygons);
  }, []);

  // Mausbewegung verfolgen
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="App">
      <div className="polygon-background">
        {/* Polygon, das der Maus folgt */}
        <svg
          className="mouse-polygon"
          width="100"
          height="100"
          style={{
            position: 'absolute',
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <polygon
            points={getRandomPolygon()
              .map((point) => `${point.x},${point.y}`)
              .join(' ')}
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* Andere Polygone im Hintergrund */}
        {polygons.map((polygon) => (
          <svg
            key={polygon.id}
            className="polygon"
            width="100"
            height="100"
            style={{
              position: 'absolute',
              left: `${polygon.x}px`,
              top: `${polygon.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <polygon
              points={polygon.points
                .map((point) => `${point.x},${point.y}`)
                .join(' ')}
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        ))}
      </div>
      <h1>Willkommen zur polygonalen Hintergrund-App!</h1>
    </div>
  );
}

export default App;
