import { redirect } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MesCommandesClient from "./MesCommandesClient";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mes commandes",
};

export default async function MesCommandesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("commandes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <MesCommandesClient orders={(orders as Order[]) || []} />;
}
