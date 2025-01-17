import * as d3 from "d3";
import { hexToBW } from "~/lib/utils";

export default function SmallBarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  const minWidth = 150;
  const minHeight = 100;
  const marginTop = 20;
  const marginLeft = 20;
  const marginRight = 0;

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, 100])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)!])
    .range([100, 0]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-bold">{title}</p>
      <div
        className="relative h-full w-full"
        style={{
          minWidth,
          minHeight,
        }}
      >
        {/* X axis */}
        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px)`,
            width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          <line
            x1="0"
            x2="100%"
            y1="100%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
          />
          <g className="font-medium text-neutral-300">
            {data.map((d, i) => (
              <text
                key={i}
                x={`${xScale(d.label)! + xScale.bandwidth() / 2}%`}
                y="125%"
                textAnchor="middle"
                style={{ fill: d.color }}
              >
                {d.label}
              </text>
            ))}
          </g>
        </svg>

        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px)`,
            width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          {data.map((d, i) => {
            const x = xScale(d.label)!;
            const y = yScale(d.value);

            return (
              <g key={d.label}>
                <rect
                  key={i}
                  x={`${x}%`}
                  y={`${y}%`}
                  width={`${xScale.bandwidth()}%`}
                  height={`${100 - y}%`}
                  fill={d.color}
                  opacity={0.8}
                />
                <text
                  x={`${x + xScale.bandwidth() / 2}%`}
                  y={`${y + (100 - y) / 2 + 5}%`}
                  textAnchor="middle"
                  className="text-sm"
                  fill={hexToBW(d.color)}
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
