"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function GameTabsList({ gameId }: { gameId: string }) {
  const tab = useSelectedLayoutSegment("gameTabs");

  return (
    <Tabs
      value={tab ?? undefined}
      defaultValue="box-score"
      className="flex w-full justify-center md:justify-start"
    >
      <TabsList>
        <TabsTrigger value="(boxScore)" asChild>
          <Link href={`/games/${gameId}`}>Box Score</Link>
        </TabsTrigger>
        <TabsTrigger value="shotchart" asChild>
          <Link href={`/games/${gameId}/shotchart`}>Shotchart</Link>
        </TabsTrigger>
        <TabsTrigger value="runs" asChild>
          <Link href={`/games/${gameId}/runs`}>Runs</Link>
        </TabsTrigger>
        <TabsTrigger value="rotations" asChild>
          <Link href={`/games/${gameId}/rotations`}>Rotations</Link>
        </TabsTrigger>
        <TabsTrigger value="game-charts" asChild>
          <Link href={`/games/${gameId}/game-charts`}>Game Charts</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
