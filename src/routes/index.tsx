import { createFileRoute } from "@tanstack/react-router";
import { SlotMachine } from "@/components/slot-machine";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SlotMachine />;
}
