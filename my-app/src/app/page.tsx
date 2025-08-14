'use client'

import React from "react";
import {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import { Button, TextField } from "@mui/material";

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type GraphNode = {
    id: string;
    name: string;
    val: number;
};

type GraphLink = {
    source: string;
    target: string;
};

type GraphData = {
    nodes: GraphNode[];
    links: GraphLink[];
};


export default function Home() {
    const [targetGraph, setTargetGraph] = useState<string>(`v0,
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
    const [patternGraph, setPatternGraph] = useState<string>(`v0,
v0,v5
v0,v6
v0,v7
v0,v8
v1,`);
    const [targetGraphData, setTargetGraphData] = useState<GraphData | undefined>({nodes: [], links: []});
    const [patternGraphData, setPatternGraphData] = useState<GraphData | undefined>({nodes: [], links: []});
    const [showTargetGraph, setShowTargetGraph] = useState(true);

    function parseLadGraph(graph: string): GraphData {
        const lines = graph.split("\n").map(line => line.trim()).filter(Boolean);

        const nodeCount = parseInt(lines[0], 10);
        const links: { source: string; target: string }[] = [];
        const nodes = Array.from({length: nodeCount}, (_, i) => ({
            id: `v${i}`,
            name: `v${i}`,
            val: 1
        }));

        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/\s+/).map(Number);
            const neighbors = parts.slice(1);

            for (const neighbor of neighbors) {
                links.push({
                    source: `v${i - 1}`,
                    target: `v${neighbor}`
                });
            }
        }

        return {nodes, links};
    }

    function parseGraph(graph: string) {
        const edges: string[] = graph.split("\n").filter(Boolean);

        if (!edges.some(line => line.includes(","))) {
            return parseLadGraph(graph);
        }

        const nodeSet = new Set<string>();
        const links: { source: string; target: string }[] = [];

        for (const edge of edges) {
            const [source, target] = edge.split(",");

            if (source) nodeSet.add(source);
            if (target) nodeSet.add(target);

            if (source && target) {
                links.push({source, target});
            }
        }

        const nodes = Array.from(nodeSet).map((id) => ({
            id,
            name: id,
            val: 1,
        }));

        return {nodes, links};
    }

    useEffect(() => {
        setTargetGraphData(parseGraph(targetGraph));
        setPatternGraphData(parseGraph(patternGraph));
    }, [targetGraph, patternGraph]);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            {showTargetGraph ?
                <ForceGraph2D
                    graphData={targetGraphData}
                    onNodeDragEnd={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                /> :
                <ForceGraph2D
                    graphData={patternGraphData}
                    onNodeDragEnd={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                />
            }

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 2,
                    pointerEvents: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1em",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "13rem",
                        pointerEvents: "auto",
                        background: "rgba(255,255,255,0.85)",
                        padding: "0.5em",
                        borderRadius: "0.5em",
                    }}
                >
                    <TextField
                        label="Target Graph Input"
                        multiline
                        rows={20}
                        variant="outlined"
                        value={targetGraph}
                        onChange={(e) => setTargetGraph(e.target.value)}
                    />
                </div>

                <div
                    style={{display: "flex", flexDirection: "column", width: "13rem", pointerEvents: "auto", background: "rgba(255,255,255,0.85)", padding: "0.5em", borderRadius: "0.5em", alignSelf: "flex-end"}}
                >
                    <Button
                        variant='outlined'
                        onClick={() => {setShowTargetGraph(!showTargetGraph)}}
                    >
                        Switch to {showTargetGraph ? "Pattern" : "Target"} Graph
                    </Button>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "13rem",
                        pointerEvents: "auto",
                        background: "rgba(255,255,255,0.85)",
                        padding: "0.5em",
                        borderRadius: "0.5em",
                    }}
                >
                    <TextField
                        label="Pattern Graph Input"
                        multiline
                        variant="outlined"
                        rows={20}
                        value={patternGraph}
                        onChange={(e) => setPatternGraph(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
