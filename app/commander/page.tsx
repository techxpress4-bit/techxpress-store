import { Metadata } from "next";
import CommanderClient from "./CommanderClient";

export const metadata: Metadata = {
  title: "Passer la commande",
};

export default function CommanderPage() {
  return <CommanderClient />;
}
