import React, { useEffect, useRef } from 'react';
import dagre from 'dagre';
import './opGraph.css'
class Node {
  constructor(node) {
    this.id = node.id;
    this.label = node.label;
    this.x = node.x;
    this.y = node.y;
    this.class = node.class
    this.type = node.type
    this.children = node.children
  }

  build() {
    const rootElement = createElement('g');

    rootElement.setAttribute('class', this.class ? 'node ' + this.class : 'node');
    rootElement.setAttribute('id', this.id);

    const isTableNode = (this.type === "table");
     
    const element = createElement('g');
    rootElement.appendChild(element);
    const xPadding = 20;
    const yPadding = 11;
    const classList = ['opnode-item'];
    element.setAttribute('class', classList.join(''));

    const pathElement = createElement('path');
    const textElement = createElement('text');
    element.appendChild(pathElement);
    element.appendChild(textElement);
    textElement.setAttribute('x', xPadding);
    textElement.setAttribute('y', yPadding * 2);

    let label_len = this.label.length;
    let width = label_len * 6 + 2 * xPadding + isTableNode * 20;
    let height = 20 + 2 * yPadding;
     
    if (isTableNode) {
      const tableImgElement = Node.generateTableElement(xPadding, yPadding-2);
      element.appendChild(tableImgElement);
      textElement.setAttribute('x', xPadding + 25);  //offset for image
    } else if (this.type === "fused_op") {
      textElement.setAttribute('x', xPadding + 50); 
      element.classList.add('fused');
      let offset = height;
      width = label_len * 6 + 6 * xPadding;
      height = height * 3.5;
      this.children.forEach((childNode)=> {
        let childElement = createElement('g');
        childElement.setAttribute('class','opnode-child-item');
        element.appendChild(childElement);
        let childPathElement = createElement('path');
        childElement.appendChild(childPathElement);
        let childTextElement = createElement('text');
        childElement.appendChild(childTextElement);
        childTextElement.setAttribute('x', 35);
        childTextElement.setAttribute('y', yPadding * 2);
        
        let tableTag = (childNode.type === "table");
        if (tableTag) {
          let childTableImgElement = Node.generateTableElement(20, 8);
          childElement.appendChild(childTableImgElement);
          childTextElement.setAttribute('x', 20 + 25);
        }
        let childTextSpanElement = createElement('tspan');
        childTextElement.appendChild(childTextSpanElement);
        childTextSpanElement.textContent = childNode.text;
        
        let childWidth = 120 + tableTag * 20;
        let childHeight = 35;
        childPathElement.setAttribute('d', Node.roundedRect(0, 0, childWidth, childHeight, tableTag, tableTag, tableTag, tableTag));
        childElement.setAttribute('transform', `translate(${width/2 - childWidth/2}, ${offset-5})`);
        offset += childHeight + 20;
      })

    }

     
    const textSubElement = createElement('tspan');
    textElement.appendChild(textSubElement);
    textSubElement.textContent = this.label;

    let roundTag = isTableNode || (this.type === "fused_op");
    pathElement.setAttribute('d', Node.roundedRect(0, 0, width, height, roundTag, roundTag, roundTag, roundTag))
    rootElement.setAttribute('transform', `translate(${this.x-width/2},${this.y-height/2})`);
    this._width = width;
    this._height = height;
    return rootElement;
  }

  static generateTableElement(xPadding, yPadding) {
    const tableImgElement = createElement('image');
    const imgURL = require('../static/table.png');
    tableImgElement.setAttributeNS(null, 'height', '20');   
    tableImgElement.setAttributeNS(null, 'width', '20');   
    tableImgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgURL);
    tableImgElement.setAttributeNS(null, 'x', xPadding);   
    tableImgElement.setAttributeNS(null, 'y', yPadding);   
    return tableImgElement;
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

class Edge {
  constructor({ id, source, target, annotation }) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.annotation = annotation;
  }

  build() {
    const v = this.source;
    const w = this.target;
    const groupElement = createElement('g');

    const path = createElement('path');
    groupElement.appendChild(path);
    path.setAttribute('class', 'edge-path');
    path.setAttribute('d', `M${v.x} ${v.y-v.boxHeight/2} L${w.x} ${w.y+w.boxHeight/2}`);
    path.setAttribute('marker-end', 'url(#arrow)');

    if (this.annotation === 'mul') {
      const symbolElement = createElement('image');
      groupElement.appendChild(symbolElement);
      const imgURL = require('../static/matrix-mul.png');
      symbolElement.setAttributeNS(null, 'height', '15');   
      symbolElement.setAttributeNS(null, 'width', '20');   
      symbolElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgURL);
      symbolElement.setAttribute('x', v.x + 10);
      symbolElement.setAttribute('y', (v.y -v.boxHeight/2 + w.y+w.boxHeight/2) / 2 - 15/2);

      const arrow = createElement('polygon');
      groupElement.appendChild(arrow);
      arrow.setAttribute('points', '0,0 -3,6 3,6 0,0');
      arrow.setAttribute('fill', 'black');
      arrow.setAttribute('transform', `translate(${w.x},${w.y+w.boxHeight/2})`);
    }

    return groupElement;
  }
}

 
const createElement = (name) => {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

const OPGraph = ({ nodesData, edgesData}) => {
  const svgRef = useRef();

  useEffect(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'LR',  
    });
    g.setDefaultEdgeLabel(() => ({}));

    nodesData.forEach((nodeData) => {
      g.setNode(nodeData.id, {
        label: nodeData.text,
        class: nodeData.class,
        type: nodeData.type,
        width: nodeData.width,
        height: nodeData.height,
        children: nodeData.children
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
      const annotation = edge.annotation;
      const edgeElement = new Edge({
        id: edge.id,
        source,
        target,
        annotation
      });
    
      edgesGroup.appendChild(edgeElement.build());
    })

  }, [nodesData, edgesData]);

  return (
    <svg id="canvas" className="canvas" ref={svgRef} preserveAspectRatio="xMidYMid meet" viewBox="0 0 280 2000">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="balck"/>
        </marker>
      </defs>
      <rect id="background" fill="#e7e6e6" width="100%" height="100%"></rect>
      <g id="origin" transform="translate(100, 40) scale(1)">
        <g id="clusters" className="clusters"></g>
        <g id="nodes" className="nodes"></g>
        <g id="edge-paths" className='edge-paths'></g>
      </g>
    </svg>
  );
};

export default OPGraph;