import React, { useState, useEffect, useRef } from "react";
import { useResize } from "./useResize";

import * as d3 from "d3";
import { scaleLinear } from "d3-scale";

import "./App.css";

const generateDemoData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let prevClose = Math.random() * 100 + 50;

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const open = prevClose;
    const close = open + Math.random() * 20 - 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    data.push({
      date,
      open,
      high,
      low,
      close
    });

    prevClose = close;
  }

  return data;
};

const Candlestick = ({
  data,
  index,
  yScale,
  chartWidth,
  isAnswerChecked,
  animationComplete
}) => {
  const candlestickRef = useRef(null);

  useEffect(() => {
    if (candlestickRef.current && yScale) {
      if (!animationComplete) {
        d3.select(candlestickRef.current)
          .attr("opacity", 0)
          .transition()
          .delay(index * 20)
          .duration(20)
          .attr("opacity", 1);
      } else {
        d3.select(candlestickRef.current).attr("opacity", index < 70 ? 1 : 0);
      }
    }
  }, [animationComplete, index, yScale]);

  useEffect(() => {
    if (candlestickRef.current && yScale) {
      if (isAnswerChecked && index >= 70) {
        d3.select(candlestickRef.current)
          .transition()
          .delay((index - 70) * 20)
          .duration(20)
          .attr("opacity", 1);
      }
    }
  }, [isAnswerChecked, index, yScale]);

  const xSpacing = (chartWidth - 100) / 100; // Subtract 100 to account for the left padding
  const rectWidth = ((chartWidth - 100) / 100) * 0.8; // Adjust this factor (0.8) to change the width of the rectangles

  return (
    <g className="candlestick" ref={candlestickRef}>
      <line
        x1={index * xSpacing + rectWidth / 2}
        x2={index * xSpacing + rectWidth / 2}
        y1={yScale(data.high)}
        y2={yScale(data.low)}
        stroke={data.close > data.open ? "green" : "red"}
      />
      <rect
        x={index * xSpacing}
        y={yScale(Math.max(data.open, data.close))}
        width={rectWidth}
        height={Math.abs(yScale(data.open) - yScale(data.close))}
        fill={data.close > data.open ? "green" : "red"}
      />
    </g>
  );
};
const App = () => {
  const [stockData, setStockData] = useState(generateDemoData());

  const [lastThirtyCandles, setLastThirtyCandles] = useState([]);
  const containerRef = useRef(null);

  const containerDimensions = useResize(containerRef);
  const chartWidth = containerDimensions.width;
  const chartHeight = containerDimensions.height;

  const allData = stockData.concat(lastThirtyCandles);
  const rawYMin = Math.min(...allData.map((d) => d.low));
  const rawYMax = Math.max(...allData.map((d) => d.high));

  const V = stockData[69].close;

  const yMin = Math.min(rawYMin, V - (rawYMax - V));
  const yMax = Math.max(rawYMax, V + (V - rawYMin));

  const yBuffer = 20;
  const yScale = scaleLinear()
    .domain([yMin - yBuffer, yMax])
    .range([chartHeight - 50, 50]);

  useEffect(() => {
    const newMin = Math.min(...stockData.map((d) => d.low)) - 10;
    const newMax = Math.max(...stockData.map((d) => d.high)) + 10;
    yScale.domain([newMin, newMax]);
  }, [stockData, yScale]);

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFirst70Animated, setIsFirst70Animated] = useState(false);

  useEffect(() => {
    const data = generateDemoData();
    setStockData(data.slice(0, 70));
    setLastThirtyCandles(data.slice(70));
  }, []);

  const [animationComplete, setAnimationComplete] = useState(false);

  const handleNewGame = () => {
    const data = generateDemoData();
    setStockData(data.slice(0, 70));
    setLastThirtyCandles(data.slice(70));
    setIsAnswerChecked(false);
    setIsPaused(false);
    setAnimationComplete(false);
  };

  const handleCheckAnswer = () => {
    if (!isAnswerChecked) {
      setIsPaused(true);
      setIsAnswerChecked(true);
      setIsFirst70Animated(false);
      setAnimationComplete(true);
    } else {
      setIsPaused(!isPaused);
    }
  };

  return (
    <div className="App">
      <h2>ChartGuesser{}</h2>
      <div className="chart-container" ref={containerRef}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <g transform={`translate(50,0)`}>
            {yScale.ticks().map((tick, i) => (
              <g key={i} transform={`translate(0,${yScale(tick)})`}>
                <line
                  x1={0}
                  x2={chartWidth - 50}
                  stroke="#ccc"
                  strokeDasharray="2"
                />

                <text x={-50} y={5} style={{ fontSize: "0.8rem" }}>
                  {tick}
                </text>
              </g>
            ))}
            {stockData.map((d, i) => (
              <Candlestick
                key={i}
                data={d}
                index={i}
                yScale={yScale}
                chartWidth={chartWidth}
                isAnswerChecked={isAnswerChecked}
                animationComplete={animationComplete}
              />
            ))}
            {isAnswerChecked &&
              lastThirtyCandles.map((d, i) => (
                <Candlestick
                  key={i}
                  data={d}
                  index={i + 70}
                  yScale={yScale}
                  chartWidth={chartWidth}
                  isAnswerChecked={isAnswerChecked}
                  animationComplete={animationComplete}
                />
              ))}
          </g>
        </svg>
        <div class="centered-div">
          {!isAnswerChecked && (
            <button onClick={handleCheckAnswer}>Check Answer</button>
          )}
          <button onClick={handleNewGame}>New Game</button>
        </div>
      </div>
    </div>
  );
};

export default App;
