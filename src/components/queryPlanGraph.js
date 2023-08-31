import React, { useEffect, useRef } from 'react';
import dagre from 'dagre';
import './queryPlanGraph.css'

class Node {
    constructor(node) {
      this.id = node.id;
      this.label = node.label;
      this.x = node.x;
      this.y = node.y;
      this.class = node.class
      this.type = node.type
      this.info = node.info ? node.info: []
    }
  
    build() {
      const rootElement = createElement('g');

      rootElement.setAttribute('class', this.class ? 'node ' + this.class : 'node');
      rootElement.setAttribute('id', this.id);
  
      const isTableNode = (this.type === "table" ? true : false);
      const element = createElement('g');
      rootElement.appendChild(element);
      const xPadding = 20;
      const yPadding = 7;
      const classList = ['qplan-node-item'];
      element.setAttribute('class', classList.join(''));
  
      const pathElement = createElement('path');
      const textElement = createElement('text');
      element.appendChild(pathElement);
      element.appendChild(textElement);
      textElement.setAttribute('x', xPadding);
      textElement.setAttribute('y', '22');

      let width, height;
      //table node
      if (isTableNode) {
        const tableImgElement = createElement('image');
        const imgURL = require('../static/table.png');
        tableImgElement.setAttributeNS(null, 'height', '20');   
        tableImgElement.setAttributeNS(null, 'width', '20');   
        tableImgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgURL);
        tableImgElement.setAttributeNS(null, 'x', xPadding);   
        tableImgElement.setAttributeNS(null, 'y', yPadding);   
        element.appendChild(tableImgElement);
        textElement.setAttribute('x', xPadding + 25);  //offset for image

        const textSubElement = createElement('tspan');
        textElement.appendChild(textSubElement);
        textSubElement.textContent = this.label;

        width = 100;
        height = 40;
        pathElement.setAttribute('d', Node.roundedRect(0, 0, width, height, true, true, true, true));
      } else { //op node
        let opTitle;
        let offset = 0;
        if (this.label === 'GROUPBY') {
            opTitle = '\u0393\u2003GROUPBY';
            width = 200;
            height = 100;
            offset = 40;
        } else if (this.label === 'PROJECTION') {
            opTitle = 'PROJECTION';
            width = 150;
            height = 100;
            offset = 20;
        } else if (this.label === 'SELECT') {
            opTitle = '\u03C3\u2003SELECT';
            width = 150;
            height = 80;
            offset = 20;
        }
        const textTitleElement = createElement('tspan');
        textElement.appendChild(textTitleElement);
        textElement.setAttribute('x', 25 + offset);
        textTitleElement.textContent = opTitle;

        for (let line = 0; line < this.info.length; line++) {
          const lineTextElement = createElement('text');
          lineTextElement.setAttribute('xml:space', 'preserve');
          element.appendChild(lineTextElement);
          lineTextElement.setAttribute('x', xPadding-10);
          lineTextElement.setAttribute('y', 30 + (line+1) * 12);

          const lineTextSubElement = createElement('tspan');
          lineTextElement.appendChild(lineTextSubElement);
          lineTextSubElement.textContent = this.info[line];
        }
        
        pathElement.setAttribute('d', Node.roundedRect(0, 0, width, height, false, false, false, false));
      }
  
      rootElement.setAttribute('transform', `translate(${this.x-width/2},${this.y})`);
      this._width = width;
      this._height = height;
      return rootElement;
    }
  
    static roundedRect(x, y, width, height, r1, r2, r3, r4) {
      const radius = 12;
      r1 = r1 ? radius : 0;
      r2 = r2 ? radius : 0;
      r3 = r3 ? radius : 0;
      r4 = r4 ? radius : 0;
      return "M" + (x + r1) + "," + y +
        "h" + (width - r1 - r2) +
        "a" + r2 + "," + r2 + " 0 0 1 " + r2 + "," + r2 +
        "v" + (height - r2 - r3) +
        "a" + r3 + "," + r3 + " 0 0 1 " + -r3 + "," + r3 +
        "h" + (r3 + r4 - width) +
        "a" + r4 + "," + r4 + " 0 0 1 " + -r4 + "," + -r4 +
        'v' + (-height + r4 + r1) +
        "a" + r1 + "," + r1 + " 0 0 1 " + r1 + "," + -r1 +
        "z";
    }
  }

const createElement = (name) => {
return document.createElementNS('http://www.w3.org/2000/svg', name);
}

class Edge {
    constructor({ id, source, target }) {
      this.id = id;
      this.source = source;
      this.target = target;
    }
  
    build() {
      const v = this.source;
      const w = this.target;
      const path = createElement('path');
      path.setAttribute('class', 'edge-path');
      path.setAttribute('marker-end', 'url(#arrow)');
      path.setAttribute('d', `M${v.x} ${v.y} L${w.x} ${w.y+w.boxHeight}`);
      return path;
    }
  }

const QueryPlanGraph = ({ nodesData, edgesData}) => {
    const svgRef = useRef();
  
    useEffect(() => {
      const g = new dagre.graphlib.Graph();
      g.setGraph({
        rankdir: 'LR',  
      });

      g.setDefaultEdgeLabel(() => ({}));

      nodesData.sort((a, b) => a.id.localeCompare(b.id));
      nodesData.forEach((nodeData) => {
        g.setNode(nodeData.id, {
          label: nodeData.name,
          class: nodeData.class,
          type: nodeData.type,
          width: nodeData.width,
          height: nodeData.height,
          info: nodeData.info
        });
      });
  
  
      dagre.layout(g);
      const svg = svgRef.current;
      const nodesGroup = svg.getElementById('nodes');
      const edgesGroup = svg.getElementById('edge-paths');
  
      while (nodesGroup.firstChild) {
        nodesGroup.removeChild(nodesGroup.firstChild);
      }
  
      g.nodes().forEach((id) => {
        const node = g.node(id);
        const nodeElement = new Node(node);
        const createdElement = nodeElement.build();
        node.boxWidth = nodeElement._width;
        node.boxHeight = nodeElement._height;
        nodesGroup.appendChild(createdElement);
      });
  
      edgesData.forEach(edge => {
        const source = g.node(edge.source);
        const target = g.node(edge.target);
        const edgeElement = new Edge({
          id: edge.id,
          source,
          target
        });
      
        edgesGroup.appendChild(edgeElement.build());
      })
  
    }, [nodesData, edgesData]);
  
    return (
      <svg id="canvas" className="canvas" ref={svgRef} preserveAspectRatio="xMidYMid meet" viewBox="0 0 800 600">
        <rect id="background" fill="#e7e6e6" width="100%" height="100%"></rect>
        <g id="origin" transform="translate(350, 10) scale(1)">
          <g id="clusters" className="clusters"></g>
          <g id="nodes" className="nodes"></g>
          <g id="edge-paths" className='edge-paths'></g>
        </g>
      </svg>
    );
  };

export default QueryPlanGraph;