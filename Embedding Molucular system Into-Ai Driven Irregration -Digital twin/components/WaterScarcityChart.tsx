import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const WaterScarcityChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Fake Data: Supply vs Demand over years
    const data = [
      { year: 2020, supply: 100, demand: 80 },
      { year: 2025, supply: 95, demand: 88 },
      { year: 2030, supply: 85, demand: 95 }, // Crossing point
      { year: 2035, supply: 75, demand: 105 },
      { year: 2040, supply: 60, demand: 120 },
    ];

    const x = d3.scaleLinear()
      .domain([2020, 2040])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 130])
      .range([height - margin.bottom, margin.top]);

    // Area Generator for Gap
    const area = d3.area<{ year: number; supply: number; demand: number }>()
      .x(d => x(d.year))
      .y0(d => y(d.supply))
      .y1(d => y(d.demand))
      .curve(d3.curveMonotoneX);

    // Line Generators
    const lineSupply = d3.line<{ year: number; supply: number }>()
      .x(d => x(d.year))
      .y(d => y(d.supply))
      .curve(d3.curveMonotoneX);

    const lineDemand = d3.line<{ year: number; demand: number }>()
      .x(d => x(d.year))
      .y(d => y(d.demand))
      .curve(d3.curveMonotoneX);

    // Defs for Gradients
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "scarcityGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "transparent");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#EF4444").attr("stop-opacity", "0.1"); // Red tint where demand > supply
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#EF4444").attr("stop-opacity", "0.5");

    // Clip path (initially hiding everything for animation)
    const clipPath = defs.append("clipPath").attr("id", "chart-clip")
      .append("rect")
      .attr("width", 0)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);
    
    // Animate Clip Path
    clipPath.transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("width", width);

    const chartGroup = svg.append("g").attr("clip-path", "url(#chart-clip)");

    // Draw Area (The Gap)
    chartGroup.append("path")
      .datum(data)
      .attr("fill", "url(#scarcityGradient)")
      .attr("d", area);

    // Draw Supply Line (Blue/Green)
    chartGroup.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4CAF50")
      .attr("stroke-width", 3)
      .attr("d", lineSupply);

    // Draw Demand Line (Red/Orange)
    chartGroup.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("d", lineDemand);

    // Circles
    chartGroup.selectAll(".dot-supply")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.supply))
      .attr("r", 4)
      .attr("fill", "#1E5631");
    
    chartGroup.selectAll(".dot-demand")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.demand))
      .attr("r", 4)
      .attr("fill", "#B45309");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
      .attr("color", "#A5D6A7");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("fill", "#A5D6A7")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text("Projected Water Gap");

  }, []);

  return (
    <div className="w-full flex justify-center py-8">
      <svg ref={svgRef} viewBox="0 0 600 300" className="w-full max-w-2xl bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"></svg>
    </div>
  );
};