import { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = { title: "Admin · TechXpress" };

export default function AdminPage() {
  return <AdminClient />;
}
