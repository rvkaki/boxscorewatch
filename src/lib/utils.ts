import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTeamLogoUrl(teamId: string | number) {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
}

export function getPlayerImageUrl(playerId: string | number) {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hexToLuminance(R8bit: number, G8bit: number, B8bit: number) {
  const RsRGB = R8bit / 255;
  const GsRGB = G8bit / 255;
  const BsRGB = B8bit / 255;

  const R =
    RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
  const G =
    GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
  const B =
    BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);

  // For the sRGB colorspace, the relative luminance of a color is defined as:
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return L;
}

export function hexToBW(color: string) {
  const luminance = hexToLuminance(
    parseInt(color?.substring(1, 3), 16),
    parseInt(color?.substring(3, 5), 16),
    parseInt(color?.substring(5, 7), 16),
  );
  return luminance > 0.5 ? "#14141f" : "#ffffff";
}
