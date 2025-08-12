'use client'

import React from "react";
import {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import { Button, TextField } from "@mui/material";
import {createTheme} from "@mui/material/styles";
import {padding} from "@mui/system";

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function Home() {
  const [generatedGraph, setGeneratedGraph] = useState<string>(`v0,
v0,v5
v0,v6
v0,v7
v0,v8
v1,
v1,v3
v1,v5
v1,v7
v2,
v2,v7
v2,v9
v2,v11
v3,
v3,v4
v3,v5
v3,v6
v3,v7
v4,
v4,v7
v4,v8
v4,v11
v5,
v6,
v6,v9
v6,v11
v7,
v7,v10
v8,
v9,
v9,v11
v10,
v11,`);
  const [myData, setMyData] = useState({});

  function parseLadGraph(graph: string) {
    const lines = graph.split("\n").map(line => line.trim()).filter(Boolean);

    const nodeCount = parseInt(lines[0], 10);
    let links: { source: string; target: string }[] = [];
    let nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `v${i}`,
      name: `v${i}`,
      val: 1
    }));

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/).map(Number);
      const neighborCount = parts[0];
      const neighbors = parts.slice(1);

      for (let neighbor of neighbors) {
        links.push({
          source: `v${i - 1}`,
          target: `v${neighbor}`
        });
      }
    }

    return { nodes, links };
  }

  function parseGraph(graph: string) {
    const edges: string[] = graph.split("\n").filter(Boolean);

    if (!edges.some(line => line.includes(","))) {
      return parseLadGraph(graph);
    }

    let nodeSet = new Set<string>();
    let links: { source: string; target: string }[] = [];

    for (let edge of edges) {
      const [source, target] = edge.split(",");

      if (source) nodeSet.add(source);
      if (target) nodeSet.add(target);

      if (source && target) {
        links.push({ source, target });
      }
    }

    const nodes = Array.from(nodeSet).map((id) => ({
      id,
      name: id,
      val: 1,
    }));

    return { nodes, links };
  }

  useEffect(() => {
    setMyData(parseGraph(generatedGraph));
  }, [generatedGraph]);

  return (
    <div>
      <div style={{ display: "flex", flexFlow: "column", alignContent: "center", justifyContent: "center", zIndex: 1, position: "absolute", marginLeft: 10, marginTop: 10, marginBottom: 10 }}>
        <TextField
            id="outlined-textarea"
            label="Graph Input"
            placeholder=""
            multiline
            rows={20}
            value={generatedGraph}
            onChange={(e) => setGeneratedGraph(e.target.value)}
        />
        <Button
          sx={{width: "inherit"}}
          variant="contained"
          onClick={() => {
            parseGraph(generatedGraph);
          }}
        >
          Load Graph
        </Button>
      </div>
      <ForceGraph2D
          graphData={myData}
          onNodeDragEnd={node => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
          }}
      />
    </div>
  );
}
