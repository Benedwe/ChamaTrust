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

  if (!cachedDeployment) {
    cachedDeployment = {
      network: "fuji",
      chainId: 43113,
      deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      MockStablecoin: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      ChamaTrust: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      deployedAt: new Date().toISOString(),
      rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
      blockExplorer: "https://testnet.snowtrace.io/",
    };
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
