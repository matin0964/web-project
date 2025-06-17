import React, { useState,useRef, use, alert } from 'react';
import './App.css';

function DrawingApp() {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [title, setTitle] = useState("Untitled Drawing");
  const [skipNextClick, setSkipNextClick] = useState(0);
  const clickTimeout = useRef(null);
  const canvasRef = useRef(null);
  const sidebarRef = useRef(null);
  const footerRef = useRef(null);
  const [previousShapes, setPreviousShapes] = useState([]);

  const handleDragStart = (e, shapeType) => {
    e.dataTransfer.setData('text/plain', shapeType);
    setSelectedShape(shapeType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current.getBoundingClientRect();

    const newShape = {
      id: Date.now(),
      type: shapeType,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setPreviousShapes(previousShapes => shapes);
    setShapes(prev => [...prev, newShape]);

    if (newShape.x + 40 > sidebarRef.current.getBoundingClientRect().left) {
      setShapes(prev => prev.filter(shape => shape.id !== newShape.id));
    }
    if(newShape.y - 40 > footerRef.current.getBoundingClientRect().top) {
      setShapes(prev => prev.filter(shape => shape.id !== newShape.id));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e) => {
    if (clickTimeout.current) return;

    clickTimeout.current = setTimeout(() => {
      clickTimeout.current = null;

      if (!selectedShape) return;
      
      const rect = canvasRef.current.getBoundingClientRect();

      const newShape = {
        id: Date.now(),
        type: selectedShape,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      setPreviousShapes(previousShapes => shapes);
      setShapes(prevShapes => [...prevShapes, newShape]);

      if (newShape.x + 30 > sidebarRef.current.getBoundingClientRect().left) {
        setShapes(prevShapes => prevShapes.filter(shape => shape.id !== newShape.id));
      }
      if(newShape.y - 40 > footerRef.current.getBoundingClientRect().top) {
        setShapes(prevShapes => prevShapes.filter(shape => shape.id !== newShape.id));
      }
    }, 250);

  };

  const handleShapeDoubleClick = (id) => {
    
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    setPreviousShapes(previousShapes => shapes);
    setShapes(prevShapes => prevShapes.filter(shape => shape.id !== id));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shapes, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = title +".json";
    a.click();
  };

  const handleImport = (e) => {
    setPreviousShapes(previousShapes => shapes);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const importedShapes = JSON.parse(fileReader.result);
        setShapes(importedShapes);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    fileReader.readAsText(e.target.files[0]);

  };

  const shapeCounts = shapes.reduce((acc, shape) => {
    acc[shape.type] = (acc[shape.type] || 0) + 1;
    return acc;
  }, {});

  const handleClear = () => {
    setPreviousShapes(previousShapes => shapes);
    setShapes(prevShapes => []);
  };

  const handleUndo = () => {
    const dummy = previousShapes;
    setPreviousShapes(previousShapes => shapes);
    setShapes(shapes => dummy);
  }

  
  return (
    <div className="app">
      <header className="header">
        <div className='button-group'>
        <button onClick={handleExport}>Export</button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <div className="button-group">
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="import-input"
          />
        </div>
      </header>

      <div className="main">
        <div 
          className="canvas" 
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          ref={canvasRef}
          >
          {shapes.map((shape) => (
            <div
            key={shape.id}
            className={`shape ${shape.type}`}
              style={{ left: shape.x, top: shape.y }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (clickTimeout.current) {
                  clearTimeout(clickTimeout.current);
                  clickTimeout.current = null;
                }
                handleShapeDoubleClick(shape.id);
              }}
              title={`Double-click to delete this ${shape.type}`}
              />
            ))}
        </div>
        <div className="sidebar"
        ref={sidebarRef}>
          <h3>Shapes</h3>
          <div
            className="shape-menu-item shape circle"
            draggable
            onDragStart={e => handleDragStart(e, 'circle')}
            onClick={() => setSelectedShape('circle')}
            title="Circle"
            />
          <div
            className="shape-menu-item shape square"
            draggable
            onDragStart={e => handleDragStart(e, 'square')}
            onClick={() => setSelectedShape('square')}
            title="Square"
          />
          <div
            className="shape-menu-item shape triangle"
            draggable
            onDragStart={e => handleDragStart(e, 'triangle')}
            onClick={() => setSelectedShape('triangle')}
            title="Triangle"
          />
          <div
            className="shape-menu-item shape hsegment"
            draggable
            onDragStart={e => handleDragStart(e, 'hsegment')}
            onClick={() => setSelectedShape('hsegment')}
            title="HorizontalSegment"
          />
          <div
            className="shape-menu-item shape vsegment"
            draggable
            onDragStart={e => handleDragStart(e, 'vsegment')}
            onClick={() => setSelectedShape('vsegment')}
            title="VerticalSegment"
          />
          <div>
          <button onClick={handleUndo}>
            Undo
          </button> 
          </div>
          <button onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      <footer className="footer"
      ref={footerRef}>
        <p>Circle: {shapeCounts.circle || 0} | Square: {shapeCounts.square || 0} | Triangle: {shapeCounts.triangle || 0} | Horizontal Segment: {shapeCounts.hsegment || 0} | Vertical Segment: {shapeCounts.vsegment || 0}</p>
      </footer>
    </div>
  );
}

export default DrawingApp;
