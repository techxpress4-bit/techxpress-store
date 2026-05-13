import Link from "next/link";

interface Props {
  texte: string;
  lien?: string;
}

export default function Banniere({ texte, lien }: Props) {
  const inner = <span className="text-xs font-medium tracking-wide">{texte}</span>;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-8 z-[60] flex items-center justify-center text-white"
      style={{ background: "linear-gradient(90deg, #4E2D7A, #6B3FA0)" }}
    >
      {lien ? (
        <Link href={lien} className="hover:underline">
          {inner}
        </Link>
      ) : inner}
    </div>
  );
}
