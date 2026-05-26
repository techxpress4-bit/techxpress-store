import { useState } from "react";
import {
  useDocumentOperation,
  useClient,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from "sanity";

const API_VERSION = "2024-01-01";

function isoDateUTC(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

type ProductDoc = {
  _id?: string;
  _type?: string;
  nom?: string;
  prix?: number;
  enStock?: boolean;
  slug?: { current?: string };
};

export const MarkOutOfStockAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const { id, type, draft, published, onComplete } = props;
  const { patch, publish } = useDocumentOperation(id, type) as {
    patch: { execute: (ops: unknown[]) => void };
    publish: { execute: () => void; disabled: false | string };
  };
  const current = (draft || published) as ProductDoc | null;
  const alreadyOut = current?.enStock === false;

  return {
    label: alreadyOut ? "❌ Déjà en rupture" : "❌ Marquer en rupture",
    tone: "critical",
    disabled: alreadyOut,
    onHandle: () => {
      patch.execute([{ set: { enStock: false } }]);
      if (!publish.disabled) publish.execute();
      onComplete();
    },
  };
};

export const ActivatePromo10Action: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription | null => {
  const { id, type, draft, published, onComplete } = props;
  const { patch, publish } = useDocumentOperation(id, type) as {
    patch: { execute: (ops: unknown[]) => void };
    publish: { execute: () => void; disabled: false | string };
  };
  const current = (draft || published) as ProductDoc | null;
  const prix = current?.prix;
  const canRun = typeof prix === "number" && prix > 0;

  return {
    label: canRun
      ? `🏷️ Activer promo -10% (30 jours)`
      : "🏷️ Promo -10% (prix manquant)",
    tone: "primary",
    disabled: !canRun,
    onHandle: () => {
      if (!canRun) {
        onComplete();
        return;
      }
      const prixPromo = Math.round((prix as number) * 0.9);
      const dateDebutPromo = isoDateUTC(0);
      const dateFinPromo = isoDateUTC(30);
      patch.execute([{ set: { prixPromo, dateDebutPromo, dateFinPromo } }]);
      if (!publish.disabled) publish.execute();
      onComplete();
    },
  };
};

export const DuplicateProductAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const { draft, published, onComplete } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const [busy, setBusy] = useState(false);

  const source = (draft || published) as ProductDoc | null;
  const canRun = !!source;

  return {
    label: busy ? "📋 Duplication…" : "📋 Dupliquer ce produit",
    disabled: !canRun || busy,
    onHandle: async () => {
      if (!source) {
        onComplete();
        return;
      }
      setBusy(true);
      try {
        const {
          _id: _ignored,
          _rev: _ignoredRev,
          _createdAt: _ignoredCreated,
          _updatedAt: _ignoredUpdated,
          ...rest
        } = source as Record<string, unknown> as {
          _id?: string;
          _rev?: string;
          _createdAt?: string;
          _updatedAt?: string;
          slug?: { current?: string };
          nom?: string;
        };

        const baseSlug = rest.slug?.current || "produit";
        const newSlug = `${baseSlug}-copie-${Date.now().toString(36)}`;
        const newName = `${rest.nom || "Produit"} (copie)`;

        const newDocId = `drafts.${crypto.randomUUID()}`;
        await client.create({
          ...(rest as Record<string, unknown>),
          _id: newDocId,
          _type: "product",
          nom: newName,
          slug: { _type: "slug", current: newSlug },
          featured: false,
          nouveaute: false,
        });
      } finally {
        setBusy(false);
        onComplete();
      }
    },
  };
};

export const productActions: DocumentActionComponent[] = [
  MarkOutOfStockAction,
  ActivatePromo10Action,
  DuplicateProductAction,
];
