import { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Mon panier",
};

export default function PanierPage() {
  return <CartPageClient />;
}
