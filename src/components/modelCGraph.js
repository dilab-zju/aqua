import React, { useEffect, useRef } from 'react';
import dagre from 'dagre';
import './modelCGraph.css'

class Node {
  constructor(node) {
    this.id = node.id;
    this.label = node.label;
    this.x = node.x;
    this.y = node.y;
    this.class = node.class
    this.type = node.type
    this.arguments = node.arguments
  }

  build() {
    const rootElement = createElement('g');

    // set attribute
    rootElement.setAttribute('class', this.class ? 'node ' + this.class : 'node');
    // rootElement.setAttribute('transform', `translate(${this.x},${this.y})`); 
    rootElement.setAttribute('id', this.id);

    const element = createElement('g');
    rootElement.appendChild(element);
    const xPadding = 5;
    const yPadding = 5;
    const classList = ['node-item']
    if (this.class === 'graph-input') {
      classList.push('graph-item-input');
    } else {
      classList.push('node-item-type');
      classList.push(`node-item-type-${this.type}`);
    }

    element.setAttribute('class', classList.join(' '));
    const pathElement = createElement('path');
    const textElement = createElement('text');
    element.appendChild(pathElement);
    element.appendChild(textElement);
    textElement.setAttribute('x', '6');
    textElement.setAttribute('y', '16');
    textElement.textContent = this.label;

    let label_len = this.label.length
    let display_arg = this.arguments
    let display_arg_len = Object.keys(display_arg).length
    let width = label_len > 10? (label_len * 5.5 + 2 * xPadding) : (label_len * 6.5 + 2 * xPadding);
    let height = (display_arg_len + 1) * 15 + 2 * yPadding;

    if (display_arg_len === 0) {
      pathElement.setAttribute('d', Node.roundedRect(0, 0, width, height, true, true, true, true));
    } else {
      let dx = 6;
      let dy = 12;
      let max_arg_width = 0;
      const attrElement = createElement('g');
      attrElement.setAttribute('class', 'node-attribute');
      rootElement.appendChild(attrElement);
      attrElement.setAttribute('transform', `translate(0, ${15 + yPadding})`)

      const backgroundElement = createElement('path');
      attrElement.appendChild(backgroundElement);
      for (let key in display_arg) {
        const argElement = createElement('text');
        argElement.setAttribute('xml:space', 'preserve');
        attrElement.appendChild(argElement);

        const argKeyElement = createElement('tspan');
        argElement.appendChild(argKeyElement);
        argKeyElement.style.fontWeight = 'bold';
        argKeyElement.textContent = key;

        const argValueElement = createElement('tspan');
        argElement.appendChild(argValueElement);
        argValueElement.textContent = ' ' + display_arg[key];

        argElement.setAttribute('x', dx);
        argElement.setAttribute('y', dy);
        dy += 12;
        max_arg_width = Math.max(max_arg_width, key.length + display_arg[key].length);
      }
      width = Math.max(width, max_arg_width * 5.5 + 2 * xPadding);
      pathElement.setAttribute('d', Node.roundedRect(0, 0, width, 15 + yPadding, true, true, false, false));
      backgroundElement.setAttribute('d', Node.roundedRect(0, 0, width, display_arg_len * 15 + yPadding, false, false, true, true));
    }

    const borderElement = createElement('path');
    borderElement.setAttribute('class', ['node', 'border'].join(' '));
    borderElement.setAttribute('d', Node.roundedRect(0, 0, width, height, true, true, true, true));
    rootElement.appendChild(borderElement);


    rootElement.setAttribute('transform', `translate(${this.x},${this.y - height / 2 + 20})`);
    this._width = width;
    this._height = height;
    return rootElement;
  }

  static roundedRect(x, y, width, height, r1, r2, r3, r4) {
    const radius = 5;
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
  constructor({ id, source, target }) {
    this.id = id;
    this.source = source;
    this.target = target;
  }

  build() {
    const v = this.source;
    const w = this.target;
    const groupElement = createElement('g');

    const path = createElement('path');
    groupElement.appendChild(path);
    path.setAttribute('class', 'edge-path');
    path.setAttribute('marker-end', 'url(#arrow)');
    path.setAttribute('d', `M${v.x+v.boxWidth} ${v.y + 20} L${w.x} ${w.y + 20}`);

    const arrow = createElement('polygon');
    groupElement.appendChild(arrow);
    arrow.setAttribute('points', '0,0 -6,-3 -6,3 0,0');
    arrow.setAttribute('fill', 'black');
    arrow.setAttribute('transform', `translate(${w.x},${w.y + 20})`);
    
    return groupElement;
  }
}

const createElement = (name) => {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

const ModelGraph = ({ nodesData, edgesData }) => {
  const svgRef = useRef();

  useEffect(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(() => ({}));

    nodesData.forEach((nodeData) => {
      g.setNode(nodeData.id, {
        label: nodeData.text,
        class: nodeData.class,
        type: nodeData.type,
        width: nodeData.width,
        height: nodeData.height,
        arguments: nodeData.arguments ? nodeData.arguments : {}
      });
    });


    dagre.layout(g);
    const svg = svgRef.current;
    const nodesGroup = svg.getElementById('nodes');
    const edgesGroup = svg.getElementById('edge-paths');

    // delete nodes created before
    while (nodesGroup.firstChild) {
      nodesGroup.removeChild(nodesGroup.firstChild);
    }
    while (edgesGroup.firstChild) {
      edgesGroup.removeChild(edgesGroup.firstChild);
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
    <svg id="canvas" className="canvas" ref={svgRef} preserveAspectRatio="xMidYMid meet" viewBox="0 0 2000 150" style={{ width: 2000, height: '100%' }}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
        </marker>
      </defs>
      <rect id="background" fill="none" width="1000" height="150"></rect>
      <g id="origin" transform="translate(10, 10) scale(1)">
        <g id="clusters" className="clusters"></g>
        <g id="nodes" className="nodes"></g>
        <g id="edge-paths" className='edge-paths'></g>
      </g>
    </svg>
  );
};

export default ModelGraph;