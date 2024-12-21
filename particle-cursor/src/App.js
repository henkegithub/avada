import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import './PictureModal.css'; // Add styles for the picture and modal


const App = () => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
  });
  const [cardData, setCardData] = useState({
    text: "Make things float in the air",
    imageUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.CQ8N1YSnK_8MlKqdqAFixQHaE9%26pid%3DApi&f=1&ipt=bf01d1ca9ccb1766df93e91f86acf64b2328f52dad052b0cfc2fb6cf0bf70b7e&ipo=images",
    hoverText: "Hover over this card to unleash the power of CSS perspective",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleMouseOrTouchMove = (e) => {
    // Determine whether the event is a touch or mouse event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
  
    const deltaX = (clientX - centerX) / centerX;
    const deltaY = (clientY - centerY) / centerY;
  
    setRotation({
      x: deltaY * 15,
      y: deltaX * 15,
    });
  };

  useEffect(() => {
    // Attach both mousemove and touchmove event listeners
    const handleEvent = (e) => {
      if (e.type === "mousemove" || e.type === "touchmove") {
        handleMouseOrTouchMove(e);
      }
    };
  
    window.addEventListener("mousemove", handleEvent);
    window.addEventListener("touchmove", handleEvent, { passive: false });
  
    return () => {
      window.removeEventListener("mousemove", handleEvent);
      window.removeEventListener("touchmove", handleEvent);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--rotateX", `${rotation.x}deg`);
    root.style.setProperty("--rotateY", `${rotation.y}deg`);
  }, [rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const nodes = [];
    const nodeCount = 150;
    let maxDistance = 300;
    let mouseRadius = 100;
    let mouseForce = 0.05;
    const friction = 0.98;
    const mouse = { x: null, y: null };
    let defaultSpeed = 1;

    const handleResize = () => {
      const scaleFactor = Math.sqrt(window.innerWidth * window.innerHeight) / 1000;
    
      // Dynamische Skalierung der Anzahl der Nodes
      let adjustedNodeCount = Math.round(nodeCount * scaleFactor * 0.5); // 0.5 um die Anzahl bei größeren Auflösungen zu verringern

      // Ensure at least 50 nodes for small screens
      if (window.innerWidth <= 600) { // Example threshold for small screens (e.g., mobile devices)
        adjustedNodeCount = Math.max(adjustedNodeCount, 50); // Set a minimum of 50 nodes
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    
      defaultSpeed = 1 * scaleFactor;
      mouseRadius = 100 * scaleFactor;
      mouseForce = 0.05 * scaleFactor;
      maxDistance = 200 * scaleFactor;
    
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
        ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fill();

        nodes.forEach((node) => {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `rgba(255, 0, 0, ${1 - distance / maxDistance})`;
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

    // Handle touch events for mobile devices
    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent default touch actions (e.g., scrolling)
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
      }
    };
  
    const handleTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Add touch event listeners for mobile devices
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.birthDate) {
      if (formData.firstName === "Michael" && formData.lastName === "Henke" && formData.birthDate === "1995-09-14") {
        setCardData({
          text: `Willkommen ${formData.firstName} ${formData.lastName}!`,
          imageUrl: "https://assets.bigcartel.com/product_images/393831483/IMG_20240829_155352.jpg",
          hoverText: "Frohe Weihnachten Michi!",
        });
      } else if (formData.firstName === "Andreas" && formData.lastName === "Henke" && formData.birthDate === "1997-06-23") {
        setCardData({
          text: `Willkommen ${formData.firstName} ${formData.lastName}!`,
          imageUrl: "https://assets.bigcartel.com/product_images/393829974/IMG_20241111_150454.jpg",
          hoverText: "Frohe Weihnachten Andi!",
        });
      } else if (formData.firstName === "Jitka" && formData.lastName === "Henke" && formData.birthDate === "1966-10-23") {
        setCardData({
          text: `Willkommen ${formData.firstName} ${formData.lastName}!`,
          imageUrl: "https://assets.bigcartel.com/product_images/393827799/IMG_20240805_183857.jpg",
          hoverText: "Frohe Weihnachten Mamco!",
        });
      } else if (formData.firstName === "Stefan" && formData.lastName === "Henke" && formData.birthDate === "1999-09-23") {
        setCardData({
          text: `Willkommen ${formData.firstName} ${formData.lastName}!`,
          imageUrl: "https://assets.bigcartel.com/product_images/368998165/Untitled+design+-+2023-09-20T143306.698.png",
          hoverText: "Frohe Weihnachten Steff!",
        });
      } else if (formData.firstName === "Patricia" && formData.lastName === "Weiss" && formData.birthDate === "1993-09-30") {
        setCardData({
          text: `Willkommen ${formData.firstName} ${formData.lastName}!`,
          imageUrl: "https://assets.bigcartel.com/product_images/393831915/IMG_20240824_150625.jpg",
          hoverText: "Frohe Weihnachten Schatz! I love you xoxo",
        });
      }
      setIsLoggedIn(true);
    }
  };

  // Define the modal content for each user
  const userModalContent = {
    PatriciaWeiss: {
     title: "Original Watercolor Illustration of a Leaf Insect.",
      dimensions: "It measures 8 x 11 inches.",
      description: "Painted on cold press cotton paper with high quality watercolors",
     link: "https://nussaywatercolor.bigcartel.com/product/green-leaf-insect-original-artwork"
   },
   MichaelHenke: {
      title: "Original Watercolor Illustration of a Goliath Beetle.",
      dimensions: "It measures 10.5 x 12 inches.",
      description: "Painted on cold press cotton paper with high quality watercolors",
      link: "https://nussaywatercolor.bigcartel.com/product/goliath-beetle-original-artwork"
    },
    AndreasHenke: {
     title: "Original Watercolor Illustration of a Hercules Beetle.",
     dimensions: "It measures 8 x 10.5 inches.",
      description: "Painted on cold press cotton paper with high quality watercolors",
     link: "https://nussaywatercolor.bigcartel.com/product/hercules-beetle-brown-original-artwork"
    },
    JitkaHenke: {
      title: "Original Watercolor Illustration of a Mecynorrina also known as African Fruit Beetle.",
      dimensions: "It measures 12 x 11 inches.",
      description: "Painted on cold press cotton paper with high quality watercolors",
     link: "https://nussaywatercolor.bigcartel.com/product/african-fruit-beetle-original-artwork"
   },
   StefanHenke: {
     title: "Original Watercolor Illustration of a Blue Longhorn Beetle.",
     dimensions: "It measures 9 x 11 inches.",
      description: "Painted on cold press cotton paper with high quality watercolors",
     link: "https://nussaywatercolor.bigcartel.com/product/blue-longhorn-beetle-original-artwork"
   },
  };

  const getModalContent = () => {
    const userKey = `${formData.firstName}${formData.lastName}`;
    const userContent = userModalContent[userKey];

    if (userContent) {
     return (
       <>
          <h3>{userContent.title}</h3>
          <p>{userContent.dimensions}</p>
          <p>{userContent.description}</p>
          <p>
           <a href={userContent.link} target="_blank" rel="noopener noreferrer" className="modal-link">
             More Info
           </a>
         </p>
       </>
      );
   } else {
     return (
       <>
         <h3>Modal Title</h3>
         <p>This is the modal content inside the picture.</p>
         <p>
            <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
              More Info
            </a>
         </p>
        </>
      );
    }
  };



  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="login-form-container">
          <form onSubmit={handleLoginSubmit} className="login-form">
            <input
              type="text"
              placeholder="Vorname"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Nachname"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Geburtstag"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div className="card-container">
          <div
            className="card-body"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            <div className="card-item" style={{ fontWeight: 'bold' }}>{cardData.text}</div>
            <div className="card-item">{cardData.hoverText}</div>
            <div className="card-item">
              <img src={cardData.imageUrl} alt="thumbnail" className="card-item-img"/>
              <div className="info-icon" onClick={openModal}>
                <img src="info_icon.png" alt="infoicon" className="info-icon-image" />
              </div>
              {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={closeModal}>
                      &times;
                    </button>
                    {getModalContent()} {/* Render dynamic content here */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="network-canvas" />
    </div>
  );
};

export default App;
