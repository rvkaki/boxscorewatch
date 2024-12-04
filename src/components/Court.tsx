import { type ShotZone } from "~/server/db/types";

function pctToColor(pct: number, avg: number) {
  const diff = pct - avg;

  if (diff > 10) {
    return "#15803d";
  }
  if (diff > 5) {
    return "#22c55e";
  }

  if (diff < -10) {
    return "#b91c1c";
  }

  if (diff < -5) {
    return "#ef4444";
  }

  return "#fde68a";
}

export default function Court({
  zonesData,
}: {
  zonesData?: Record<
    ShotZone,
    {
      made: number;
      attempted: number;
      pct: number;
      avg: number;
    }
  >;
}) {
  return (
    <svg viewBox="0,0,500,470" preserveAspectRatio="xMidYMid meet">
      <g id="court">
        <g id="zones">
          <path
            data-zone="Mid-Range"
            d="M30,140c32.8,82.8,119.6,148.5,219.8,147.7h0.4c100.2,0.8,187-64.8,219.8-147.7v-0.1v0V0H330v139.9v0V190H170v-50v0V0H30V140L30,140z"
            fill={
              zonesData && "Mid-Range" in zonesData
                ? pctToColor(
                    zonesData["Mid-Range"].pct,
                    zonesData["Mid-Range"].avg,
                  )
                : ""
            }
            fillOpacity={zonesData && "Mid-Range" in zonesData ? 0.3 : ""}
          ></path>
          <path
            data-zone="Restricted Area"
            d="M250,90c22.1,0,40-17.9,40-40V40h-80v10C210,72.1,227.9,90,250,90z"
            fill={
              zonesData && "Restricted Area" in zonesData
                ? pctToColor(
                    zonesData["Restricted Area"].pct,
                    zonesData["Restricted Area"].avg,
                  )
                : ""
            }
            fillOpacity={zonesData && "Restricted Area" in zonesData ? 0.3 : ""}
          ></path>
          <path
            data-zone="Above the Break 3"
            d="M250.2,287.7h-0.4C149.6,288.5,62.8,222.8,30,140H0v330h500V140h-30 C437.2,222.8,350.4,288.5,250.2,287.7z"
            fill={
              zonesData && "Above the Break 3" in zonesData
                ? pctToColor(
                    zonesData["Above the Break 3"].pct,
                    zonesData["Above the Break 3"].avg,
                  )
                : ""
            }
            fillOpacity={
              zonesData && "Above the Break 3" in zonesData ? 0.3 : ""
            }
          ></path>
          <path
            data-zone="In The Paint (Non-RA)"
            d="M170,140v50h160v-50.1v0V0H170V140L170,140z M210,40h80v10c0,22.1-17.9,40-40,40s-40-17.9-40-40V40z"
            fill={
              zonesData && "In The Paint (Non-RA)" in zonesData
                ? pctToColor(
                    zonesData["In The Paint (Non-RA)"].pct,
                    zonesData["In The Paint (Non-RA)"].avg,
                  )
                : ""
            }
            fillOpacity={
              zonesData && "In The Paint (Non-RA)" in zonesData ? 0.3 : ""
            }
          ></path>
          <path
            data-zone="Left Corner 3"
            d="M30,140L30 0 0 0 0 140 30 140z"
            fill={
              zonesData && "Left Corner 3" in zonesData
                ? pctToColor(
                    zonesData["Left Corner 3"].pct,
                    zonesData["Left Corner 3"].avg,
                  )
                : ""
            }
            fillOpacity={zonesData && "Left Corner 3" in zonesData ? 0.3 : ""}
          ></path>
          <path
            data-zone="Right Corner 3"
            d="M470,0L470 140 470 140 470 140 500 140 500 140 500 0z"
            fill={
              zonesData && "Right Corner 3" in zonesData
                ? pctToColor(
                    zonesData["Right Corner 3"].pct,
                    zonesData["Right Corner 3"].avg,
                  )
                : ""
            }
            fillOpacity={zonesData && "Right Corner 3" in zonesData ? 0.3 : ""}
          ></path>
        </g>
        <g id="markings">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M470,0v140"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M30,0v140"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M330,0v190"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M170,0v190"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M310,0v190"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M190,0v190"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M330,190H170"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M280,40h-60"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M250,40v2.5"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M290,40v10"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M210,40v10"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M250,42.5c4.1,0,7.5,3.4,7.5,7.5s-3.4,7.5-7.5,7.5s-7.5-3.4-7.5-7.5S245.9,42.5,250,42.5z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M0,0v470h190c0-33.1,26.9-60,60-60s60,26.9,60,60h190V0H0z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M250,410c-33.1,0-60,26.9-60,60h40c0-11,9-20,20-20s20,9,20,20h40C310,436.9,283.1,410,250,410z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M250,450c-11,0-20,9-20,20h40C270,459,261,450,250,450z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M310,190c0,33.1-26.9,60-60,60s-60-26.9-60-60c0,33.1,26.9,60,60,60S310,223.1,310,190z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M310,190c0-33.1-26.9-60-60-60s-60,26.9-60,60c0-33.1,26.9-60,60-60S310,156.9,310,190z"
            style={{ strokeDasharray: "5, 10" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M290,50c0,22.1-17.9,40-40,40s-40-17.9-40-40c0,22.1,17.9,40,40,40S290,72.1,290,50z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M469.8,139.9c-49.7,121.4-188.3,179.6-309.7,129.9c-59-24.1-105.8-70.9-129.9-129.9 c49.7,121.4,188.3,179.6,309.7,129.9C398.9,245.7,445.7,198.9,469.8,139.9z"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M140,0v5"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M359.9,0v5"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M470,281.6h30"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M0,286.7h30"
            style={{ strokeLinecap: "round" }}
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M170,69.8h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M170,79.9h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M170,109.9h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M170,140h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M340,69.8h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M340,79.9h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M340,109.9h-10"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M0,140h30"
          ></path>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            d="M470,139.9h30"
          ></path>
        </g>

        {zonesData && (
          <g id="stats">
            <g id="mid_range" transform="translate(215, 210)">
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["Mid-Range"].made}/{zonesData["Mid-Range"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["Mid-Range"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["Mid-Range"].avg}%
              </text> */}
            </g>
            <g
              id="restricted_area"
              transform="translate(215, 29.999999999999996)"
            >
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["Restricted Area"].made}/
                {zonesData["Restricted Area"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["Restricted Area"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["Restricted Area"].avg}%
              </text> */}
            </g>
            <g id="above_break" transform="translate(215, 300)">
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["Above the Break 3"].made}/
                {zonesData["Above the Break 3"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["Above the Break 3"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["Above the Break 3"].avg}%
              </text> */}
            </g>
            <g id="paint" transform="translate(215, 110)">
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["In The Paint (Non-RA)"].made}/
                {zonesData["In The Paint (Non-RA)"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["In The Paint (Non-RA)"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["In The Paint (Non-RA)"].avg}%
              </text> */}
            </g>
            <g id="left_corner" transform="translate(-15, 50)">
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["Left Corner 3"].made}/
                {zonesData["Left Corner 3"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["Left Corner 3"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["Left Corner 3"].avg}%
              </text> */}
            </g>
            <g id="right_corner" transform="translate(445, 50)">
              <rect
                fill="rgba(38, 38, 38, .9)"
                height="40"
                width="70"
                rx="3"
                ry="3"
              ></rect>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="16"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="16"
              >
                {zonesData["Right Corner 3"].made}/
                {zonesData["Right Corner 3"].attempted}
              </text>
              <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="32"
              >
                {zonesData["Right Corner 3"].pct}%
              </text>
              {/* <text
                dx="35"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fontFamily="Roboto Condensed, sans-serif"
                dy="48"
              >
                LA: {zonesData["Right Corner 3"].avg}%
              </text> */}
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}
