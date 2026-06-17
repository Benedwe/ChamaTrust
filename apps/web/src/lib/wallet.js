import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = accounts[0];
  const message = `Sign in to ChamaTrust at ${new Date().toISOString()}`;
  const signature = await signer.signMessage(message);

  return { address, message, signature };
}
