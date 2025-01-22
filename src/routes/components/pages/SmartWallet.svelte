<script>
  import { onMount } from "svelte";
  import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
  import { main_address } from '../../store.js';
  import axios from "axios"; // 安裝 axios: npm install axios

  let walletAddresses = [];
  let error = null;

  function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }

  function formatVolume(value, float) {
    if (!value || isNaN(value) || value == null || value == 0 ) {
        return 0;
    } else if (value >= 1000000000000) {
        return `${(value / 1000000000000).toFixed(float)} T`;
    } else if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(float)} B`;
    } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(float)} M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(float)} K`;
    } else if (value){
        return round(value, float);
    }
  }

  // Function to open token details on relevant blockchain explorer
  const openTokenDetails = (coin, address) => {
    let url = "";

    switch (coin) {
      case "Ethereum":
        url = `https://wallet.coinbase.com/swap`;
        break;
      case "USD-Coin":
        url = `https://pancakeswap.finance/?outputCurrency=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`;
        break;
      case "Bitcoin":
        url = `https://sandbox.teleport.tg/app/auth`;
        break;
      default:
        console.warn(`No explorer configured for token: ${coin}`);
        return;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  // Shortened wallet address
  $: mod_address = walletAddresses[0]
    ? `${walletAddresses[0].slice(0, 8)} ... ${walletAddresses[0].slice(-6)}`
    : "Address not found.";

  // Temporary message state
  let tempMessage = null;

  // Reactive display for TON address connection
  $: ton_display = $main_address
    ? `Connected to: ${$main_address.slice(0, 8)} ... ${$main_address.slice(-6)}`
    : "Not yet bond to TON address.";

  // Token data with placeholders for real values
  let evm_tokens = [
    {
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025",
      chain: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.jpg",
      name: "Ethereum",
      chain_name: "BASE",
      amount: 0,
      valueUSD: 0,
      blockchain: "base",
      contract: null, // Ethereum native
    },
    {
      icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
      chain: "https://w7.pngwing.com/pngs/1007/775/png-transparent-bnb-cryptocurrencies-icon.png",
      name: "USD-Coin",
      chain_name: "BSC",
      amount: 0,
      valueUSD: 0,
      blockchain: "bsc",
      contract: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    },
  ];

  let ton_tokens = [
    {
      icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025",
      chain: "https://cryptologos.cc/logos/toncoin-ton-logo.png",
      name: "Bitcoin",
      chain_name: "TON",
      amount: 0,
      valueUSD: 0,
      blockchain: "ton",
      contract: null, // TON native
    },
    {
      icon: "https://power-network.fyi/favicon.png",
      chain: "https://cryptologos.cc/logos/toncoin-ton-logo.png",
      name: "Watt",
      chain_name: "TON",
      amount: 0,
      valueUSD: 0,
      blockchain: "ton",
      contract: null, // TON native
    },
  ];

  const blockchainAPIs = {
    base: {
      baseURL: "https://api.basescan.org/api",
      apiKey: "5IHYR92H2XEWMV44WI1HNIY9YSHFM4SA2B",
    },
    ethereum: {
      baseURL: "https://api.etherscan.io/api",
      apiKey: "GXV8KE6IRIF2678K24ZEVERU9FC1D9HJJQ",
    },
    bsc: {
      baseURL: "https://api.bscscan.com/api",
      apiKey: "5CUKN3GT8U8G6T2TUVYI733ZVUZJDP3EPK",
    },
    ton: {
      baseURL: "https://tonapi.io/v1", // Example API for TON
      apiKey: null, // If required
    },
  };

  // Initialize the wallet on component mount
  onMount(async () => {
    try {
      const sdk = new CoinbaseWalletSDK({
        appName: "Power Network",
        appChainIds: [84532], // Base Goerli testnet chain ID
      });

      const provider = sdk.makeWeb3Provider();
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      walletAddresses = accounts;

      // Fetch token data
      await fetchTokenData();
    } catch (err) {
      error = err.message;
    }
  }); 

  
 //walletAddresses[0]
  const fetchTokenData = async () => {
    try {
      // Fetch prices from Coingecko API
      const { data: prices } = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin,binancecoin&vs_currencies=usd"
      );

      // 使用臨時數組存儲更新後的 tokens
      const updatedTokens = [...tokens];

      for (let i = 0; i < updatedTokens.length; i++) {
        const token = updatedTokens[i];
        const blockchainAPI = blockchainAPIs[token.blockchain];
        if (!blockchainAPI) {
          console.warn(`No API configured for blockchain: ${token.blockchain}`);
          continue;
        }

        try {
          if (token.contract && token.blockchain !== "ton") {
            // Token balance query for ERC-20 tokens
            const balanceResponse = await axios.get(blockchainAPI.baseURL, {
              params: {
                module: "account",
                action: "tokenbalance",
                contractaddress: token.contract,
                address: walletAddresses[0],
                tag: "latest",
                apikey: blockchainAPI.apiKey,
              },
            });

            const rawBalance = balanceResponse.data.result;
            // console.log(`Raw balance for ${token.name}: ${rawBalance}`);

            // Convert balance to readable format using token.decimals
            const decimals = token.decimals || 18; // Default to 18 decimals if not specified
            updatedTokens[i].amount = parseFloat(rawBalance) / Math.pow(10, decimals);

            // Calculate value in USD
            updatedTokens[i].valueUSD =
              updatedTokens[i].amount * (prices[token.name.toLowerCase()]?.usd || 0);

          } else if (token.blockchain !== "ton") {
            // Native coin balance query (e.g., ETH, BNB)
            const nativeResponse = await axios.get(blockchainAPI.baseURL, {
              params: {
                module: "account",
                action: "balance",
                address: walletAddresses[0],
                tag: "latest",
                apikey: blockchainAPI.apiKey,
              },
            });

            const rawNativeBalance = nativeResponse.data.result;
            // console.log(`Raw native balance for ${token.name}: ${rawNativeBalance}`);

            // Convert balance to readable format (default 18 decimals for native tokens)
            updatedTokens[i].amount = parseFloat(rawNativeBalance) / Math.pow(10, 18);

            // Calculate value in USD
            updatedTokens[i].valueUSD =
              updatedTokens[i].amount * (prices[token.name.toLowerCase()]?.usd || 0);
          }
        } catch (apiError) {
          console.error(`Error fetching balance for ${token.name}:`, apiError.message);
          updatedTokens[i].amount = 0;
          updatedTokens[i].valueUSD = 0;
        }
      }

      // 重新分配 tokens 數組，觸發 Svelte 的響應式更新
      tokens = updatedTokens;
    } catch (err) {
      console.error("Error fetching token data:", err);
    }
  };

  // Function to copy the full wallet address
  const copyFullAddress = () => {
    if (walletAddresses[0]) {
      navigator.clipboard.writeText(walletAddresses[0]); // Copy to clipboard
      tempMessage = "Full address copied.";
      setTimeout(() => {
        tempMessage = null; // Reset message
      }, 2000);
    }
  };

  // Function to open a new tab
  const openCoinbaseAssets = () => {
    window.open("https://wallet.coinbase.com/assets", "_blank");
  };
</script>

<style>
  div::-webkit-scrollbar {
      display: none; /* 隐藏滚动条 */
    }

  .token-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 14px;
    font-weight: 500;
  }

  .token-icon {
    width: 24px;
    height: 24px;
    margin-right: -12px;
  }

  .chain-icon-small {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    margin-top: 8px;
  }

  .token-name {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    flex: 1;
  }

  .token-value {
    color: gold;
    font-weight: 700;
  }

  .token-amount {
    color: #ccc;
    font-size: 12px;
  }
</style>

<!-- Main Content -->
<div
  style="position:fixed; width:90vw; min-width:320px;
      top:48px; left:5vw; height:56px; margin:auto; border-radius: 28px;background: transparent;cursor:pointer;"
>
  <p
    style="position:absolute; top:-28px; color:#cccccc; margin-left:16px; line-height:20px; display: flex; align-items: center; font-size: 14px; font-weight: 500;"
  >
    {ton_display}
  </p>
  

  <p
    on:click={copyFullAddress}
    style="position:absolute; color:gold; margin-left:16px; line-height:20px; display: flex; align-items: center; font-size: 16px; font-weight: 700; animation: colorChange 1s infinite;
             transition: color 1s ease-in-out;"
  >
    ⚡ {tempMessage || mod_address}
  </p>

  <p
    on:click={openCoinbaseAssets}
    style="position:absolute; top:28px;  color:#cccccc; margin-left:16px; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 500;
           text-decoration: underline; cursor: pointer;"
  >
    Powered by CoinBase Wallet
  </p>
</div>

<!-- Token Data Display -->
<div
  style="position:fixed; width:90vw; min-width:240px; border: 1px solid #888888;
      top:120px; bottom:120px; left:5vw; height:auto; margin:auto; border-radius: 28px;background: transparent;overflow-y: auto;cursor:pointer;"
>

  <div
    class="token-row"
    style="background: linear-gradient(#ffff00, #FFD700, transparent); height: 0px; display: flex; justify-content: center; align-items: center; border:none;"
  >
    <span style="font-weight: 700; color:black; font-size: 12px; margin-top:-2px;">EVMs tokens</span>
  </div>
  
  {#each evm_tokens as token}
    <div
      class="token-row"
      style="opacity:{token.blockchain === 'ton' && !$main_address ? '0.5' : '1'};"
      on:click={() => {
        if (token.blockchain === 'ton' && !$main_address) return; // Prevent click
        openTokenDetails(token.name, walletAddresses[0]);
      }}
    >
      <div class="token-name">
        <img src={token.icon} alt={token.name} class="token-icon" />
        <img src={token.chain} alt={token.name} class="chain-icon-small gold-border" style="border-radius:8px;opacity:0.8;" />
        {token.name} <span style="font-size:9px;opacity:0.8;">( {token.chain_name} )</span>
      </div>
      <div class="token-amount">{formatVolume(token.amount, 2)} =</div>
      <div class="token-value">${formatVolume(token.valueUSD, 2)}</div>
    </div>
  {/each}

  <div
    class="token-row"
    style="background: linear-gradient(#ffff00, #FFD700, transparent); height: 0px; display: flex; justify-content: center; align-items: center; border:none; margin-top:4px;"
  >
    <span style="font-weight: 700; color:black; font-size: 12px; margin-top:-2px;">TON tokens</span>
  </div>

  {#each ton_tokens as token}
    <div
      class="token-row"
      style="opacity:{token.blockchain === 'ton' && !$main_address ? '0.5' : '1'};"
      on:click={() => {
        if (token.blockchain === 'ton' && !$main_address) return; // Prevent click
        openTokenDetails(token.name, walletAddresses[0]);
      }}
    >
      <div class="token-name">
        <img src={token.icon} alt={token.name} class="token-icon" />
        <img src={token.chain} alt={token.name} class="chain-icon-small gold-border" style="border-radius:8px;opacity:0.8;" />
        {token.name} <span style="font-size:9px;opacity:0.8;">( {token.chain_name} )</span>
      </div>
      <div class="token-amount">{formatVolume(token.amount, 2)} =</div>
      <div class="token-value">${formatVolume(token.valueUSD, 2)}</div>
    </div>
  {/each}

  <div
    class="token-row"
    style="background: linear-gradient(#ffff00, #FFD700, transparent); height: 0px; display: flex; justify-content: center; align-items: center; border:none; margin-top:4px;"
  >
    <span style="font-weight: 700; color:black; font-size: 12px; margin-top:-2px;">SOL tokens</span>
  </div>

  
</div>