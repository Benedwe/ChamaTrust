/** Load Fuji testnet deployment addresses from public/contracts/fuji.json */
let cachedDeployment = null;

export async function loadFujiDeployment() {
  if (cachedDeployment) return cachedDeployment;

  const candidates = ["/contracts/fuji.json"];
  if (import.meta.env.DEV) {
    candidates.push("/contracts/hardhat.json");
  }

  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        cachedDeployment = await response.json();
        break;
      }
    } catch {
      // Try the next deployment file.
    }
  }

  return cachedDeployment;
}

export async function getChamaTrustAddress() {
  const deployment = await loadFujiDeployment();
  return deployment?.ChamaTrust ?? null;
}

export async function getStablecoinAddress() {
  const deployment = await loadFujiDeployment();
  return deployment?.MockStablecoin ?? null;
}
