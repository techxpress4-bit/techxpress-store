import { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = { title: "Mon Compte" };

export default function AccountPage() {
  return <AccountClient />;
}
