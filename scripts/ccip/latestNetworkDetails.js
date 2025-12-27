const fs = require("fs");

async function main(environment) {
  try {
    // Validate environment parameter
    if (environment !== "testnet" && environment !== "mainnet") {
      throw new Error(`Invalid environment: ${environment}. Must be "testnet" or "mainnet"`);
    }

    // Call Endpoint #1: chains
    const chainsRes = await fetch(`https://docs.chain.link/api/ccip/v1/chains?environment=${environment}&outputKey=chainId&enrichFeeTokens=true`, { 
      headers: { Accept: "application/json" } 
    });
    if (!chainsRes.ok) {
      const body = await chainsRes.text();
      throw new Error(`Chains API HTTP ${chainsRes.status} ${chainsRes.statusText}\n${body}`);
    }
    const chainsData = await chainsRes.json();

    // Call Endpoint #2: tokens
    const tokensRes = await fetch(`https://docs.chain.link/api/ccip/v1/tokens?environment=${environment}&outputKey=chainId`, { 
      headers: { Accept: "application/json" } 
    });
    if (!tokensRes.ok) {
      const body = await tokensRes.text();
      throw new Error(`Tokens API HTTP ${tokensRes.status} ${tokensRes.statusText}\n${body}`);
    }
    const tokensData = await tokensRes.json();

    // Process the data
    const networkDetails = {};
    const evmChains = chainsData.data.evm || {};
    const ccipBnM = tokensData.data["CCIP-BnM"] || {};
    const ccipLnM = tokensData.data["CCIP-LnM"] || {};

    // Iterate through all EVM chains
    for (const [chainId, chainInfo] of Object.entries(evmChains)) {
      // Find LINK token and wrapped native token from feeTokens
      const linkToken = chainInfo.feeTokens?.find(token => token.symbol === "LINK");
      const wrappedNativeToken = chainInfo.feeTokens?.find(token => token.symbol !== "LINK");

      // Get CCIP token addresses from tokens endpoint
      const bnMInfo = ccipBnM[chainId];
      const lnMInfo = ccipLnM[chainId];

      // Only include chains that have all required data
      if (linkToken && wrappedNativeToken && chainInfo.router && chainInfo.rmn && 
          chainInfo.registryModule && chainInfo.tokenAdminRegistry) {
        networkDetails[chainId] = {
          name: chainInfo.displayName,
          chainSelector: chainInfo.selector,
          routerAddress: chainInfo.router,
          linkAddress: linkToken.address,
          wrappedNativeAddress: wrappedNativeToken.address,
          ccipBnMAddress: bnMInfo?.tokenAddress || "",
          ccipLnMAddress: lnMInfo?.tokenAddress || "",
          rmnProxyAddress: chainInfo.rmn,
          registryModuleOwnerCustomAddress: chainInfo.registryModule,
          tokenAdminRegistryAddress: chainInfo.tokenAdminRegistry
        };
      }
    }

    // Write to output file
    fs.writeFileSync("./src/ccip/input/networkDetails.json", JSON.stringify(networkDetails, null, 2));
    console.log(`Successfully generated networkDetails.json with ${Object.keys(networkDetails).length} chains for ${environment}`);
  } catch (err) {
    console.error("Request failed:", err.message);
    process.exitCode = 1;
  }
}

// Get environment from command line arguments or default to testnet
const environment = process.argv[2] || "testnet";

// Run the function
main(environment);