/**
 * Manual Azure Translator smoke test (development only).
 *
 * Run:
 *   npm run smoke:azure-translator
 *
 * Uses the same env vars as the server adapter but does not import server-only modules.
 */
type SmokeConfig = {
  endpoint: string;
  region: string;
  subscriptionKey: string;
};

function readSmokeConfig(): SmokeConfig {
  const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY?.trim();
  const region = process.env.AZURE_TRANSLATOR_REGION?.trim();
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT?.trim()?.replace(/\/+$/, "");

  if (!subscriptionKey || !region || !endpoint) {
    throw new Error(
      "Missing AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION, or AZURE_TRANSLATOR_ENDPOINT",
    );
  }

  return { subscriptionKey, region, endpoint };
}

async function postAzure(
  config: SmokeConfig,
  path: "/translate" | "/transliterate",
  query: Record<string, string>,
  body: unknown,
): Promise<unknown> {
  const url = new URL(`${config.endpoint}${path}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Ocp-Apim-Subscription-Region": config.region,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Azure ${path} failed with status ${response.status}`);
  }

  return response.json();
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run Azure smoke test in production.");
    process.exit(1);
  }

  const config = readSmokeConfig();

  const translatePayload = (await postAzure(
    config,
    "/translate",
    { "api-version": "3.0", from: "en", to: "it" },
    [{ Text: "Hello" }],
  )) as Array<{ translations?: Array<{ text?: string }> }>;

  const italian = translatePayload[0]?.translations?.[0]?.text?.trim() ?? "";
  const italianLower = italian.toLowerCase();
  if (!italianLower.includes("ciao") && !italianLower.includes("salve")) {
    throw new Error(`Unexpected Italian translation for Hello: ${italian}`);
  }
  console.log("translate en→it:", italian);

  const jaPayload = (await postAzure(
    config,
    "/translate",
    { "api-version": "3.0", from: "en", to: "ja" },
    [{ Text: "Hello" }],
  )) as Array<{ translations?: Array<{ text?: string }> }>;

  const jaText = jaPayload[0]?.translations?.[0]?.text?.trim();
  if (!jaText) {
    throw new Error("Missing Japanese translation");
  }
  console.log("translate en→ja:", jaText);

  const transliteratePayload = (await postAzure(
    config,
    "/transliterate",
    { "api-version": "3.0", language: "ja", fromScript: "Jpan", toScript: "Latn" },
    [{ Text: jaText }],
  )) as Array<{ text?: string }>;

  console.log("transliterate ja→Latn:", transliteratePayload[0]?.text ?? "(none)");
  console.log("Azure smoke test passed.");
}

main().catch((error) => {
  console.error("Azure smoke test failed.");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
