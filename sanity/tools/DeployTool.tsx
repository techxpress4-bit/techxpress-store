import { useState } from "react";
import { Card, Stack, Button, Text, Box, Heading, Inline, Badge } from "@sanity/ui";
import { RocketIcon, CheckmarkCircleIcon, WarningOutlineIcon } from "@sanity/icons";

const HOOK_URL: string = (process.env.SANITY_STUDIO_CF_DEPLOY_HOOK as string) || "";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; at: Date }
  | { kind: "error"; message: string };

export function DeployTool() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const triggerDeploy = async () => {
    if (!HOOK_URL) {
      setStatus({
        kind: "error",
        message:
          "Hook URL manquant. Définis SANITY_STUDIO_CF_DEPLOY_HOOK dans .env.local puis redéploie le Studio.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch(HOOK_URL, { method: "POST" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`.trim());
      }
      setStatus({ kind: "success", at: new Date() });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Échec inconnu lors du déclenchement du build.",
      });
    }
  };

  const busy = status.kind === "loading";
  const hookConfigured = !!HOOK_URL;

  return (
    <Box padding={5} style={{ maxWidth: 720, margin: "0 auto" }}>
      <Stack space={5}>
        <Stack space={3}>
          <Inline space={2}>
            <RocketIcon style={{ fontSize: 32 }} />
            <Heading size={3}>Déployer le site</Heading>
          </Inline>
          <Text size={2} muted>
            Le site <strong>techxpressdz.com</strong> est généré au build (static export).
            Pour qu'un nouveau produit, catégorie ou modification de prix apparaisse en
            ligne, il faut relancer un build.
          </Text>
        </Stack>

        <Card padding={4} radius={3} tone="primary" border>
          <Stack space={4}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Quand cliquer ?
              </Text>
              <Text size={1} muted>
                • Après avoir publié un nouveau produit ou une nouvelle catégorie.
                <br />• Après avoir modifié des photos, prix, descriptions, stock.
                <br />• Après avoir réordonné les Best Sellers (l'accueil n'est rafraîchi qu'au build pour la liste des catégories).
              </Text>
            </Stack>

            <Box>
              <Button
                text={busy ? "Déclenchement en cours…" : "Lancer le rebuild & deploy"}
                tone="primary"
                icon={RocketIcon}
                disabled={busy || !hookConfigured}
                onClick={triggerDeploy}
                fontSize={2}
                padding={4}
              />
            </Box>

            {status.kind === "success" && (
              <Card padding={3} radius={2} tone="positive" border>
                <Inline space={2}>
                  <CheckmarkCircleIcon />
                  <Text size={1} weight="semibold">
                    Build déclenché à {status.at.toLocaleTimeString("fr-FR")}
                  </Text>
                </Inline>
                <Box marginTop={2}>
                  <Text size={1} muted>
                    Le site sera mis à jour dans ~3-5 minutes. Recharge ensuite
                    techxpressdz.com (Ctrl+Shift+R).
                  </Text>
                </Box>
              </Card>
            )}

            {status.kind === "error" && (
              <Card padding={3} radius={2} tone="critical" border>
                <Inline space={2}>
                  <WarningOutlineIcon />
                  <Text size={1} weight="semibold">
                    Erreur
                  </Text>
                </Inline>
                <Box marginTop={2}>
                  <Text size={1}>{status.message}</Text>
                </Box>
              </Card>
            )}
          </Stack>
        </Card>

        {!hookConfigured && (
          <Card padding={4} radius={3} tone="caution" border>
            <Stack space={3}>
              <Inline space={2}>
                <WarningOutlineIcon />
                <Heading size={1}>Configuration requise</Heading>
              </Inline>
              <Text size={1}>
                Le bouton est inactif tant que la variable{" "}
                <code style={{ background: "#0001", padding: "2px 6px", borderRadius: 4 }}>
                  SANITY_STUDIO_CF_DEPLOY_HOOK
                </code>{" "}
                n'est pas définie. Voir la doc d'installation pour récupérer
                l'URL depuis Cloudflare Pages.
              </Text>
            </Stack>
          </Card>
        )}

        <Stack space={2}>
          <Inline space={2}>
            <Text size={1} weight="semibold" muted>
              Statut du hook :
            </Text>
            <Badge tone={hookConfigured ? "positive" : "caution"} fontSize={1}>
              {hookConfigured ? "Configuré" : "Non configuré"}
            </Badge>
          </Inline>
        </Stack>
      </Stack>
    </Box>
  );
}
