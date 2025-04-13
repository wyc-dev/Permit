<script>
    import { onMount } from "svelte";
    import { fade , slide , blur } from "svelte/transition";
    import { ethers } from "ethers";
    import { main_address , refer_address , BASE , Provider, lang,
             TOKENContractAddress, TOKENABI} from '../../store.js';
    import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
    import axios from "axios"; // 安裝 axios: npm install axios
    import EVMs from "../pages/components/chains/eth.png";
    import Guide from "./components/Guide.svelte";
    import TOKEN from "./components/token_op/TOKEN.svelte";
    // import ASSETS from "./components/token_op/ASSETS.svelte";
    import TOKEN_logo from "./components/tokens/TOKEN.png";
    import CB_wallet from "./components/coinbase_wallet.png";
    import Bg from "./components/assets/ton_invest_power_bg.mp4";
    // import ETH from "./components/assets/ETH.png";
    // import WBTC from "./components/assets/BTC.png";
    // import USDC from "./components/assets/USDC.png";
    // import USDT from "./components/assets/USDT.png";
    import Copy from "./components/assets/Copy_icon.svelte";

      let isApplePlatform = false;
      // if (typeof window !== 'undefined') {
      //   const userAgent = window.navigator.userAgent;
      //   isApplePlatform = /iPhone|iPad|iPod/.test(userAgent);
      // }
    
    // 狀態變量
    let coinbase = false;
    let evmWalletAddress = null; // 用於存儲 EVM 地址
    let lp_balance;
    let eth_price;
    let ton_price;
    let sol_price;
    let signer; // EVM 錢包相關
    let error = null;
    let guide = false;
    let tx;


    /**
     * **🚀 從 Coingecko API 獲取 ETH, TON, SOL 的價格**
     */
    const fetchCryptoPrices = async () => {
        try {
            const response = await axios.get(
                "https://api.coingecko.com/api/v3/simple/price",
                {
                    params: {
                        ids: "ethereum,the-open-network,solana",
                        vs_currencies: "usd",
                    },
                }
            );

            const prices = response.data;
            eth_price = prices.ethereum.usd || 3200; // 如果 API 失敗則使用預設值
            ton_price = prices["the-open-network"].usd || 2; // TON 預設 2 USD
            sol_price = prices.solana.usd || 100; // SOL 預設 100 USD

            // console.log(`📢 最新價格: ETH: $${eth_price}, TON: $${ton_price}, SOL: $${sol_price}`);
        } catch (error) {
            // console.error("🚨 獲取加密貨幣價格失敗:", error);
        }
    };



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

  $: walletDisplayOrder = [
      { name: "EVMs", address: evmWalletAddress, display: evms_display, copyFn: () => copyFullAddress(evmWalletAddress) },
      // { name: "TON", address: $main_address, display: ton_display, copyFn: () => copyFullAddress($main_address) },
      // { name: "SOL", address: solanaWalletAddress, display: sol_display, copyFn: () => copyFullAddress(solanaWalletAddress) }
  ].sort((a, b) => (b.address ? 1 : 0) - (a.address ? 1 : 0)); // Sort connected wallets to the top

  // Shortened wallet address
  $: evms_display = evmWalletAddress && coinbase
    ? `Coinbase Wallet - ${evmWalletAddress.slice(0, 6)} ... ${evmWalletAddress.slice(-4)}`
    : evmWalletAddress
    ? `EVMs Wallet - ${evmWalletAddress.slice(0, 6)} ... ${evmWalletAddress.slice(-4)}`
    : "EVMs - Disconnected";

  // Temporary message state
  let tempMessage = null;

  // Token data with placeholders for real values
  let evm_tokens = [
    // {
    //   icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
    //   chain: "https://w7.pngwing.com/pngs/1007/775/png-transparent-bnb-cryptocurrencies-icon.png",
    //   name: "USD-Coin",
    //   chain_name: "BSC",
    //   amount: 0,
    //   valueUSD: 0,
    //   blockchain: "bsc",
    //   contract: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    // },
    // {
    //     icon: M9_logo,
    //     chain: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.jpg",
    //     name: "M9",
    //     chain_name: "BASE",
    //     amount: 0,
    //     valueUSD: 0,
    //     blockchain: "base",
    //     contract: $M9ContractAddress,
    // },
    {
        icon: TOKEN_logo,
        chain: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.jpg",
        name: "TOKEN",
        chain_name: "BASE",
        amount: 0,
        blockchain:  "Gasless",
        contract: $TOKENContractAddress,
    },
  ];
    
    // 新增狀態變量
    let currentWallet = null; // 'metamask' | 'coinbase' | null

    const connectCoinbase = async () => {
        try {
            if (currentWallet && currentWallet !== 'coinbase') {
                await disconnectWallet();
            }
            const sdk = new CoinbaseWalletSDK({/*...*/});
            Provider.set(sdk.makeWeb3Provider());
            const addressList = await $Provider.request({ method: "eth_requestAccounts" });
            evmWalletAddress = addressList[0].toString();
            currentWallet = 'coinbase';
            coinbase = true;
            await fetchTokenData();
        } catch (err) {
            // 錯誤處理
        }
    };

    const connectEVMWallet = async () => {
        try {
            if (currentWallet && currentWallet !== 'metamask') {
                await disconnectWallet();
            }
            Provider.set(new ethers.BrowserProvider(window.ethereum));
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            evmWalletAddress = accounts[0];
            currentWallet = 'metamask';
            coinbase = false;
        } catch (err) {
            // 錯誤處理
        }
    };

    // 新增斷開連接函數
    const disconnectWallet = async () => {
        evmWalletAddress = null;
        Provider.set(null);
        signer = null;
        currentWallet = null;
        coinbase = false;
        evm_tokens = evm_tokens.map(t => ({...t, amount: 0}));
    };

    // 新增切換函數
    const toggleWallet = async () => {
        if (currentWallet === 'metamask') {
            await disconnectWallet();
            await connectCoinbase();
        } else if (currentWallet === 'coinbase') {
            await disconnectWallet();
            await connectEVMWallet();
        } else {
            await connectEVMWallet();
            await connectCoinbase();
        }
        await fetchTokenData();
    };

      // 新增：TOKEN 合约实例化
      const TOKEN_contract = new $BASE.eth.Contract($TOKENABI, $TOKENContractAddress);

// 修改：强化代币数据获取逻辑
const fetchTokenData = async () => {
    try {
            // console.log(evmWalletAddress);
            // 并行获取多个代币数据
        const updatedTokens = await Promise.all(
        evm_tokens.map(async (token) => {
                        try {
                            let tokenBalance;
                            if (evmWalletAddress === null){
                                await connectEVMWallet();
                            } else {
                                tokenBalance = await TOKEN_contract.methods.balanceOf(evmWalletAddress).call();
                                lp_balance = await TOKEN_contract.methods.balanceOf("0x498581fF718922c3f8e6A244956aF099B2652b2b").call();
                            }
                            const decimals = 18; // 假设 TOKEN 使用 18 位小数
                            token.amount = Number(tokenBalance) / 10 ** decimals;
                            lp_balance =  Number(lp_balance) / 10 ** decimals;
                            return token;
                        } catch (error) {
                            // console.error(`TOKEN 余额获取失败: ${error.message}`);
                            return { ...token, amount: 0, valueUSD: 0 }; // 返回安全值
                        }
                    })
                );
    
      evm_tokens = updatedTokens;
    } catch (err) {
      // console.error("全局代币数据获取失败:", err);
    }
};

  // Function to copy the full wallet address
  function copyFullAddress(address) {
      navigator.clipboard.writeText(address); // Copy to clipboard
      tempMessage = `Address copied`;
      setTimeout(() => {
        tempMessage = null; // Reset message
      }, 3000);
  };

    

      // 檢查並自動連接已存在的錢包
      onMount(async () => {
                await fetchTokenData();
              try {
                  await Promise.all([
                    // fetchTokenData(),
                    fetchCryptoPrices()
                  ]);
              } catch (error) {
                // console.error("初始化错误:", error);
              }
      });


    
</script>

<style>


  .spam {
    text-decoration: underline;
    color: inherit; /* 继承父级的文本颜色（如黑色） */
    font-size: 14px;
  }

  .spam:hover {
    color: gold; /* 鼠标悬停时文字变蓝色（可选） */
  }

  .token-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 16px;
    border-top: 1.5px solid #444444;
    border-radius:28px;
    height:56px;
    margin:12px;
    font-size: 14px;
    font-weight: 500;
  }

  .token-icon {
    width: 24px;
    height: 24px;
    margin-right: -12px;
  }

  .chain-icon-small {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    margin-top: 1px;
  }

  .token-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight:700;
    font-size:16px;
    color: white;
    flex: 1;
  }

  .token-value {
    color: #aaaaaa;
    margin-top:-2px;
    font-size: 16px;
    font-weight: 700;
  }


</style>





{#if guide}
    
        <div  transition:fade={{ duration: 100 }}>
            <button on:click={()=>{guide = false;}}
                style="position:fixed; width:20vw; height:50px;border:none; top:00px; left:5vw; z-index: 10000; background: transparent;
                       border:none;">
            </button>
            <Guide/>
        </div>
    
{:else if tx === "TOKEN" || tx === "通證幣"}

        <div  transition:fade={{ duration: 100 }}>
            <button on:click={()=>{tx = null; fetchTokenData();}}
                style="position:fixed; width:90vw; height:50px;border:none; top:00px; left:5vw; z-index: 10000; background: transparent;
                       border:1px solid black;">
                <p style="position:fixed; top:26px; z-index:1;color:gold; left: 0; width:100%; font-size: {$lang === "ZH" ? "20px" : "18px"}; font-weight: 700;
                            transform: translate(0%, -50%); animation: colorChange 3s infinite;">
                    {$lang === "ZH" ? "通證幣" : "TOKEN"} <span style="font-size: 16px;margin-left:4px; font-weight: 700;"> {$lang === "ZH" ? "收付操作" : "Operations"} </span>
                </p>
            </button>
            <TOKEN coin_name={"TOKEN"} {coinbase} {eth_price} {lp_balance} user_balance={evm_tokens[0].amount}
                user_address={evmWalletAddress}/>
        </div>

{/if}


<button 
    in:blur={{ duration: 500 }} 
    on:click={toggleWallet}
    style="border:none; position:fixed; width:34px; height:34px; border-radius:34px; top:8px; right:5vw; z-index: 30;">

    <img src={EVMs} alt="EVMs" style="height:34px;width:38px; opacity:{!evmWalletAddress ? '0.5' : '1'};"/>

    <div 
        style="position:absolute;
               background:{!currentWallet ? '#FF0000' : 
                       currentWallet === 'metamask' ? '#F6851B' : 
                       '#0052FF'};
               top:0; left:0; width:8px; height:8px; border-radius:15px;
               filter:{!currentWallet ? 'drop-shadow(0 0 3px rgba(255, 0, 0, 1))' : 
                       currentWallet === 'metamask' ? 'drop-shadow(0 0 4px rgba(246, 133, 27, 1))' :
                       'drop-shadow(0 0 4px rgba(0, 82, 255, 1))'}">
    </div>
</button>


{#if coinbase && evmWalletAddress}
    <img in:blur={{ duration: 500 }} src={CB_wallet} alt="CB_wallet" style="position:fixed; top:34px; right:calc(5vw + -6px); height:14px;z-index: 900;"/>
{:else if !evmWalletAddress}
    <div style=" position: fixed; background: #444444; 
        top:79px; right:calc(5vw + 20px);transform: rotate(45deg);
        height: 10px; width: 1px;"></div>
    <div style=" position: fixed; background: #444444; 
        top:79px; right:calc(5vw + 12px);transform: rotate(-45deg);
        height: 10px; width: 1px;"></div>
    <div style=" position: fixed; background: #444444;
                top:80px; right:calc(5vw + 16px);
                height: 200px; width: 1px;"></div>
    <div style=" position: fixed; background: #444444; 
        top:280px; left:{$lang === "ZH" ? "calc(10vw + 220px)" : "calc(10vw + 250px)"}; right:calc(5vw + 16px);
        height: 1px; width:auto;"></div>
{/if}


        {#if !tx && !guide}
            <div style="position:fixed; top:52px; right:5vw; width:95vw; z-index:1000;">

                <span style="position:absolute; right:0px; font-weight: 500;  color: #CCCCCC;
                    font-size: 12px;">${formatVolume(eth_price, 2) || "--"}</span>
                <span 
                    role="button" 
                    tabindex="0" 
                    on:click={() => { guide = true; }} 
                    on:keypress={(e) => { if (e.key === 'Enter' || e.key === ' ') guide = true; }} 
                    style="position:absolute; left:calc(5vw + 4px); font-weight: 500; color: #888888;
                           font-size: 12px; text-decoration: underline; cursor: pointer;">
                    {$lang === "ZH" ? "鏈上現實掛鉤資產收付插件" : "The RWA Payment Gateway"}
                </span>
            </div>
            
        {/if}






<!-- Token Data Display -->
{#if evmWalletAddress }  <!--|| solanaWalletAddress || $main_address}-->
      <div in:blur={{ duration: 500 }}
        style="position:fixed; width:90vw; min-width:240px;
            top:100px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 0;background: transparent;overflow-y: auto;cursor:pointer;"
      >
          {#each walletDisplayOrder as wallet}
              <button 
                  on:click={wallet.copyFn}
                  on:keydown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') { 
                          wallet.copyFn();
                      }
                  }}
                  class="token-row"
                  style="opacity:{!wallet.address ? '0.5' : '1'}; 
                         background: transparent;
                         height: 36px;
                         width:90vw;
                         display: flex; 
                         justify-content: center; 
                         align-items: center; 
                         border-radius:8px; border: none; margin:0; padding:0;
                         cursor: pointer;" 
                  aria-label="Copy {wallet.name} Wallet Address"
              >
                  <span 
                        style="font-weight: 700; 
                        color: white; 
                        font-size: 14px; 
                        margin-top: -2px; 
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.33));">
                            {tempMessage ? tempMessage : wallet.display} <Copy />
                  </span>
              </button>
      
              {#if wallet.address}
                  <div in:slide={{ duration: 500 }}>
                      {#if wallet.name === "EVMs"}
                          {#each evm_tokens as token}
                              <div
                                  class="token-row"
                                  style="opacity:{!evmWalletAddress ? '0.5' : '1'}; 
                                         border-color:none;
                                         background:linear-gradient(#111111, transparent);"
                                  on:click={async () => {
                                        tx = token.name;
                                        await fetchTokenData(); // Fetch balance for other ERC-20 tokens
                                  }}
                              >
                                  {#if token.name === "TOKEN" || coinbase}
                                      <video 
                                          autoplay 
                                          loop 
                                          muted 
                                          playsinline 
                                          style="
                                              position: absolute; 
                                              width: 80%; 
                                              height: 40px; 
                                              object-fit: cover;
                                              border-radius: 16px; 
                                              z-index: -1;
                                          "
                                      >
                                          <source src={Bg} type="video/mp4" />
                                      </video>
                                  {/if}
      
                                  <div class="token-name {token.name == 'M9' ? 'gold-text' : ''}">
                                      <img src={token.icon} alt={token.name} class="token-icon" />
                                      <img src={token.chain} alt={token.name} class="chain-icon-small" style="border-radius:8px;opacity:0.8; opacity:{token.chain === '' ? '0' : '1'};" />
                                      <span>{token.name}</span> <span style="font-size:9px;opacity:0.8;">( {token.blockchain} )</span>
                                  </div>
                                  <div class="token-value gold-text;" style="margin-right:8px;">{formatVolume(token.amount, 2)}</div>
                              </div>
                          {/each}
                      {/if}

                  </div>
              {/if}
          {/each}

          <p style="margin:24px;opacity:0.5;">{$lang === "ZH" ? "將增加更多現實掛鉤資產 ..." : "More RWA coming soon ..."}</p>
      </div>


    
{:else}                                
        <div transition:blur={{ duration: 150 }} style="position:fixed;  z-index:-1; 
            top:120px; right:5vw; left:5vw; bottom:120px;  width:90vw; height:auto; margin:auto; border-radius: 28px;background: transparent; overflow-y: auto;cursor:pointer;">
                        {#if !evmWalletAddress}
                                <p  on:click={()=>{guide = true;}}  style="margin: 18px; margin-top: 32px; margin-bottom: 28px; color:#FFFFFF; font-size: {$lang === "ZH" ? "18px" : "16px"}; font-weight: 700; text-align: left;"> 
                                        📚 {$lang === "ZH" ? "用戶指南" : "User Guide"}
                                </p>  <br style="height:8px;"/>
                                <p style="margin: 16px; font-size: 14px;text-align: left; font-weight: 500; font-size: 14px; padding:4px;"> 
                                    ▫️ <a on:click={()=> {connectCoinbase();}} target="_blank" class="spam" style="text-decoration-color: #224488;font-size: {$lang === "ZH" ? "16px" : "14px"}; font-weight: 700;margin-top: 0px;"> 
                                        {$lang === "ZH" ? "嵌接 Coinbase 托管錢包" : "Connect with Coinbase Wallet"}</a>
                                </p>
                                <p style="margin: 32px; margin-top:-16px; font-size: 14px;text-align: left; font-weight: 500; font-size: 14px; padding:4px;color:#888888;"> 
                                    {$lang === "ZH" ? "或使用以太坊虛擬機錢包插件" : "or link-up with EVM extension"}
                                </p>
                                <p style="margin: 16px;  margin-right:0; font-size: 14px;text-align: left; font-weight: 700; font-size: {$lang === "ZH" ? "16px" : "14px"}; padding:4px;"> 
                                    ▫️ {$lang === "ZH" ? "管理並操作高質現實掛鉤資產代幣" : "Manage premium RWA tokens"}
                                </p>
                        
                        {/if}
        </div>
{/if}