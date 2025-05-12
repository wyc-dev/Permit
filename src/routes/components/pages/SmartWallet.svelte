<script>
    import { onMount } from "svelte";
    import { fade, slide, blur } from "svelte/transition";
    import { ethers } from "ethers";
    import { merchant, User_TOKEN, User_C01N, UserETH, TOKEN_UNISWAP_LP, TOKEN_LP_ADDRESS, BASE, Provider, lang, TOKENContractAddress, TOKENABI, C01NContractAddress, C01NABI } from '../../store.js';
    import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
    import axios from "axios";
    import EVMs from "../pages/components/chains/eth.png";
    import Guide from "./components/Guide.svelte";
    import TOKEN from "./components/token_op/TOKEN.svelte";
    import TOKEN_logo from "./components/tokens/TOKEN.png";
    import C01N from "./components/token_op/C01N.svelte";
    import C01N_logo from "./components/tokens/C01N.png";
    import CB_wallet from "./components/coinbase_wallet.png";
    import Bg from "./components/assets/ton_invest_power_bg.mp4";
    import Copy from "./components/assets/Copy_icon.svelte";

    let coinbase = false;
    let evmWalletAddress = null;
    let eth_price = 0;
    let signer;
    let error = null;
    let guide = false;
    let tx;
    let tempMessage = null;
    let currentWallet = null;

    // Initialize contract instances
    const C01N_contract = new $BASE.eth.Contract($C01NABI, $C01NContractAddress);
    const TOKEN_contract = new $BASE.eth.Contract($TOKENABI, $TOKENContractAddress);

    // Token data
    let evm_tokens = [
        {
            icon: C01N_logo,
            chain: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.jpg",
            name: "C01N",
            ZH_name: "疊加態幣",
            chain_name: "BASE",
            blockchain: "PoR Staking",
            contract: $C01NContractAddress,
        },
        {
            icon: TOKEN_logo,
            chain: "https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.jpg",
            name: "TOKEN",
            ZH_name: "通證幣",
            chain_name: "BASE",
            blockchain: "Gasless",
            contract: $TOKENContractAddress,
        },
    ];

    /**
     * Fetch ETH, TON, SOL prices from CoinGecko API
     */
    const fetchCryptoPrices = async () => {
        if (!eth_price) {
            try {
                const response = await callWithRetry(() =>
                    axios.get("https://api.coingecko.com/api/v3/simple/price", {
                        params: {
                            ids: "ethereum,the-open-network,solana",
                            vs_currencies: "usd",
                        },
                    })
                );
                const prices = response.data;
                eth_price = prices.ethereum?.usd || 0;
                return eth_price;
            } catch (error) {
                error = "Failed to fetch crypto prices";
            }
        }
    };

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0) {
            return 0;
        } else if (value >= 1000000000000) {
            return `${(value / 1000000000000).toFixed(float)} T`;
        } else if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(float)} B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(float)} K`;
        } else if (value) {
            return round(value, float);
        }
    }

    $: walletDisplay_type_and_address = [
        { name: "EVMs", address: evmWalletAddress, display: evms_display, copyFn: () => copyFullAddress(evmWalletAddress) },
    ].sort((a, b) => (b.address ? 1 : 0) - (a.address ? 1 : 0));

    $: evms_display = evmWalletAddress && coinbase
        ? `<span style="font-size:14px; drop-shadow(0 0 2px #0052FF); background: linear-gradient(to bottom, #0052FF, #FFFFFF); -webkit-background-clip: text; background-clip: text; color: transparent;">Coinbase Wallet</span> - ${evmWalletAddress.slice(0, 6)} ... ${evmWalletAddress.slice(-4)}`
        : evmWalletAddress
        ? `<span style="font-size:14px; drop-shadow(0 0 2px #F6851B); background: linear-gradient(to bottom, #F6851B, #FFFFFF); -webkit-background-clip: text; background-clip: text; color: transparent;">EVMs Wallet</span> - ${evmWalletAddress.slice(0, 6)} ... ${evmWalletAddress.slice(-4)}`
        : "EVMs - Disconnected";

    const connectCoinbase = async () => {
        User_TOKEN.set(0); User_C01N.set(0);
        try {
            if (currentWallet && currentWallet !== 'coinbase') {
                await disconnectWallet();
            }
            const sdk = new CoinbaseWalletSDK({
                appName: "Permit",
            });
            Provider.set(sdk.makeWeb3Provider());
            const addressList = await Promise.all([ $Provider.request({ method: "eth_requestAccounts" }), fetchTokenBalances() ]);
            evmWalletAddress = addressList[0].toString();
            currentWallet = 'coinbase';
            coinbase = true;
        } catch (err) {
            error = "Failed to connect Coinbase wallet";
        }
        await Promise.all([
            fetchMerchantOrNot(),
            fetchTokenBalances(),
            fetchUserETH()
        ]);
    };

    const connectEVMWallet = async () => {
        User_TOKEN.set(0); User_C01N.set(0);
        try {
            if (currentWallet && currentWallet !== 'metamask') {
                await disconnectWallet();
            }
            if (!window.ethereum) throw new Error("MetaMask not installed");
            Provider.set(new ethers.BrowserProvider(window.ethereum));
            const accounts = await Promise.all([ window.ethereum.request({ method: "eth_requestAccounts" }), fetchTokenBalances() ]);
            evmWalletAddress = accounts[0][0] ? accounts[0][0] : accounts[0];
            currentWallet = 'metamask';
            coinbase = false;
        } catch (err) {
            error = "Failed to connect MetaMask wallet";
        }
        await Promise.all([
            fetchMerchantOrNot(),
            fetchTokenBalances(),
            fetchUserETH()
        ]);
    };

    const disconnectWallet = async () => {
        evmWalletAddress = null;
        Provider.set(null);
        signer = null;
        currentWallet = null;
        coinbase = false;
        evm_tokens = evm_tokens.map(t => ({ ...t, amount: 0 }));
    };

    const toggleWallet = async () => {
        if (currentWallet === 'metamask') {
            await disconnectWallet();
            await connectCoinbase();
        } else if (currentWallet === 'coinbase') {
            await disconnectWallet();
            await connectEVMWallet();
        } else {
            if (window.ethereum) {
                try {
                    await connectEVMWallet();
                } catch (error) {
                    // console.error("Failed to connect EVM wallet:", error);
                    await connectCoinbase();
                }
            } else {
                await connectCoinbase();
            }
        }
        UserETH.set(0);
        await fetchUserETH();
        return;
    };

    // Retry logic for rate limit errors
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const callWithRetry = async (fn, retries = 3, delayMs = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if ((error.statusCode === 429 || error.code === -32005) && i < retries - 1) {
                    await delay(delayMs * (2 ** i));
                    continue;
                }
                throw error;
            }
        }
    };

    // Fetch token balances using direct balanceOf calls
    const fetchTokenBalances = async () => {
        try {
            if (!evmWalletAddress) {
                throw new Error("Wallet not connected");
            }

            const [c01nBalanceRaw , tokenBalanceRaw , lpBalanceRaw] 
                = await Promise.all([ 
                    C01N_contract.methods.balanceOf(evmWalletAddress).call(),
                    TOKEN_contract.methods.balanceOf(evmWalletAddress).call(),
                    TOKEN_contract.methods.balanceOf($TOKEN_LP_ADDRESS).call() ]);

            const c01nBalance = Number(c01nBalanceRaw) / 10 ** 18;
            User_C01N.set(isNaN(c01nBalance) ? 0 : c01nBalance);

            const tokenBalance = Number(tokenBalanceRaw) / 10 ** 18;
            User_TOKEN.set(isNaN(tokenBalance) ? 0 : tokenBalance);

            const lpBalance = Number(lpBalanceRaw) / 10 ** 18;
            TOKEN_UNISWAP_LP.set(isNaN(lpBalance) ? 0 : lpBalance);

            return;

        } catch (error) {

            return;
            // console.error("Error fetching token balances:", error);

        }
    };

    // Function to copy the full wallet address
    function copyFullAddress(address) {
        if (!address) return;
        navigator.clipboard.writeText(address);
        tempMessage = `Address copied`;
        setTimeout(() => {
            tempMessage = null;
        }, 3000);
    };

    // Function to fetch ETH balance
    const fetchUserETH = async () => {
        if ($UserETH !== 0){
            return;
        }
        try {
            const balance = await $Provider.getBalance(evmWalletAddress);
            UserETH.set(parseFloat(ethers.formatUnits(balance, 18)).toFixed(4));
            console.log($UserETH);
            return;
        } catch (error) {
            error = "Failed to fetch ETH balance";
            return;
        }
    };

    const fetchMerchantOrNot = async () => {
        try {
            if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
                throw new Error("Invalid user address");
            }
            const isWhitelisted = await TOKEN_contract.methods.isMerchant(user_address).call();
            merchant.set(Boolean(isWhitelisted));
            await fetchUserETH();
            return $merchant;
        } catch (error) {
            merchant.set(false);
            return false;
        }
    };

    onMount(async () => {

        try {
            // if (!evmWalletAddress) {
            //     await toggleWallet();
            // }
            await Promise.all([
                fetchCryptoPrices(),
                fetchUserETH()
            ]);
        } catch (error) {
            // error = "Failed to initialize data";
        }

        new Promise((resolve) => {
            setTimeout(() => resolve(fetchUserETH()), 1000);
        });
        

        new Promise((resolve) => {
            setTimeout(() => resolve(fetchTokenBalances()), 5000);
        });
    

        new Promise((resolve) => {
            setTimeout(() => resolve(fetchMerchantOrNot()), 10000);
        });
        
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
    
{:else if tx === "TOKEN"}

        <div  transition:fade={{ duration: 100 }}>
            <button on:click={()=>{tx = null;}}
                style="position:fixed; width:90vw; height:50px;border:none; top:0px; left:5vw; z-index: 10000; background: transparent;
                       border:1px solid black;">
                <p style="position:fixed; top:26px; z-index:1;color:gold; left: 0; width:100%; font-size: {$lang === "ZH" ? "20px" : "18px"}; font-weight: 700;
                            transform: translate(0%, -50%); animation: colorChange 3s infinite;">
                    {$lang === "ZH" ? "通證幣" : "TOKEN"} <span style="font-size: 16px;margin-left:4px; font-weight: 700;"> 
                        {$lang === "ZH" ? "收付操作" : "Operations"} </span>
                </p>
            </button>
            <TOKEN coin_name={"TOKEN"} user_address={evmWalletAddress}/>
        </div>
    
{:else if tx === "C01N"}

        <div  transition:fade={{ duration: 100 }}>
            <button on:click={()=>{tx = null;}}
                style="position:fixed; width:90vw; height:50px;border:none; top:0px; left:5vw; z-index: 10000; background: transparent;
                       border:1px solid black;">
                <p style="position:fixed; top:26px; z-index:1;color:gold; left: 0; width:100%; font-size: {$lang === "ZH" ? "20px" : "18px"}; font-weight: 700;
                            transform: translate(0%, -50%); animation: colorChange 3s infinite;">
                    {$lang === "ZH" ? "疊加態幣" : "C01N"} <span style="font-size: 16px;margin-left:4px; font-weight: 700;"> 
                        {$lang === "ZH" ? "資產認證挖礦" : "PoR-Staking"} </span>
                </p>
            </button>
            <C01N coin_name={"C01N"} user_address={evmWalletAddress}/>
        </div>

{/if}

        


        {#if coinbase && evmWalletAddress}
            
                <img in:blur={{ duration: 500 }} src={CB_wallet} alt="CB_wallet" style="position:fixed; top:36px; right:calc(8vw + -5px); height:14px;z-index: 1200;opacity:{guide ? 0 : 0.5};"/>
        
        {:else if !evmWalletAddress}
            
                <div style="position: fixed; background: #888800; 
                            top:82px; right:calc(8vw + 17px);transform: rotate(45deg);
                            height: 10px; width: 1px;"></div>
                <div style="position: fixed; background: #888800; 
                            top:82px; right:calc(8vw + 8px);transform: rotate(-45deg);
                            height: 10px; width: 1px;"></div>
                <div style="position: fixed; height:80px;  background:transparent; border: 1.5px solid #666600; border-bottom-right-radius: 16px; border-left:none; border-top:none;
                            top:82px; left:{$lang === "ZH" ? "calc(5vw + 234px)" : "calc(5vw + 264px)"}; right:calc(8vw + 12px);"></div>
            
        {/if}


        {#if !tx && !guide}
            
                <div style="position:fixed; top:52px; right:5vw; width:95vw; z-index:1000;">
    
                    <span in:blur={{ duration: 500 }} style="position:absolute; right:calc(3vw - 4px);  margin-top:12px; font-weight: 500;  color: #888888;  opacity: {eth_price ? 1 : 0};
                        font-size: 10px;">$ {formatVolume(eth_price, 2) || "--"}</span>
                    <span in:blur={{ duration: 500 }} style="position:absolute; right:calc(3vw + 44px);  margin-top:-40px; font-weight: 500;  color: {!currentWallet ? '#FF0000' : currentWallet === 'metamask' ? '#F6851B88' : '#0052FF88'};
                                                             opacity: {eth_price ? 1 : 0}; font-size: 10px;">{formatVolume($UserETH, 4) || "--"} ETH</span>
                    <span transition:fade={{ duration: 100 }}
                        role="button" 
                        tabindex="0" 
                        on:click={() => { guide = true; }} 
                        on:keypress={(e) => { if (e.key === 'Enter' || e.key === ' ') guide = true; }} 
                        style="position:absolute; left:calc(5vw + 4px); top:4px; font-weight: 500; color: #888888;
                               font-size: 12px; text-decoration: underline; cursor: pointer;">
                        {$lang === "ZH" ? "鏈上現實掛鉤資產收付插件" : "The RWA Payment Gateway"}
                    </span>
                </div>
    
                <button in:blur={{ duration: 500 }} class="button-11" on:click={() => {!evmWalletAddress ? connectCoinbase() : toggleWallet() }}  
                    style=" position:fixed; top:8px; right:calc(8vw); margin-right:-10px; z-index: 1002; background: transparent; color: white; border:1px solid #888888; cursor: pointer;">
                        <div class="button-11__content" style="display:flex; justify-content:center; align-items:center; height:100%;">
                            <img src={EVMs} alt="EVMs" style="height:34px;width:38px; opacity:{!evmWalletAddress ? '0.5' : '1'};margin-top:-6px;"/>
                            <div 
                                style="position:absolute;
                                       background:{!currentWallet ? '#FF0000' : currentWallet === 'metamask' ? '#F6851B' : '#0052FF'};
                                       top:2px; left:2px; width:8px; height:8px; border-radius:15px;
                                       filter:{!currentWallet ? 'drop-shadow(0 0 3px rgba(255, 0, 0, 1))' : 
                                               currentWallet === 'metamask' ? 'drop-shadow(0 0 4px rgba(246, 133, 27, 1))' :
                                               'drop-shadow(0 0 4px rgba(0, 82, 255, 1))'}">
                            </div>
                        </div>
                </button>
            
        {/if}






<!-- Token Data Display -->
{#if evmWalletAddress}
    <div in:blur={{ duration: 500 }}
        style="position:fixed; width:90vw; min-width:240px;
            top:100px; bottom:24px; left:5vw; height:auto; margin:auto; border-radius: 0;background: transparent;overflow-y: auto;cursor:pointer;"
    >

        {#each walletDisplay_type_and_address as wallet}
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
                        font-size: 13px; 
                        margin-top: -2px; 
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.33));">
                            {@html tempMessage ? tempMessage : wallet.display} <Copy />
                  </span>
              </button>
        {/each}
            
        {#each evm_tokens as token}
            
            <!-- For later upgrade use -->
            <!-- <div
                class="token-row"
                style="opacity:{token.name === "C01N" && ($User_C01N === 0 && $User_TOKEN === 0) ? 0.5 : 1}; 
                       border-color:none;
                       background:linear-gradient(#111111, transparent);" -->
            
            <div
                class="token-row"
                style="opacity:1; 
                       border-color:none;
                       background:linear-gradient(#111111, transparent);"
                on:click={ async () => { tx = token.name; }}
            >
                <!-- For later upgrade use -->
                <!-- if (token.name === "C01N" && ($User_C01N === 0 && $User_TOKEN === 0)) {
                    tx = "";
                } else {
                    tx = token.name;
                } -->
                
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

                <div class="token-name">
                    <img src={token.icon} alt={token.name} class="token-icon" />
                    <img src={token.chain} alt={token.name} class="chain-icon-small" style=" border-radius:8px;opacity:0.8; opacity:{token.chain === '' ? '0' : '1'};" />
                    <span class="gold-text" style="font-size:14px;">{$lang === "ZH" ? token.ZH_name : token.name}</span> <span style="font-size:10px;opacity:0.8;">( {token.blockchain} )</span>
                </div>
                <div class="token-value gold-text" style="font-size:14px; margin-right:8px;">
                    {#if token.name === "C01N"}
                        {formatVolume($User_C01N, 2)}
                    {:else if token.name === "TOKEN"}
                        {formatVolume($User_TOKEN, 2)}
                    {/if}
                </div>
            </div>
        {/each}

        <p style="margin:24px;opacity:0.5;">{$lang === "ZH" ? "將增加更多現實掛鉤資產 ..." : "More RWA coming soon ..."}</p>
    </div>
    
{:else}                                
        <div transition:blur={{ duration: 150 }} style="position:fixed;  z-index:100; 
            top:100px; right:5vw; left:calc(5vw - 40px); bottom:120px;  width:90vw; height:auto; margin:auto; border-radius: 28px;background: transparent; overflow-y: auto;cursor:pointer;">
                        {#if !evmWalletAddress}
                                <br style="height:58px;"/>
                                <p class="gold-text" style="margin: 16px; text-align: left; font-weight: 500; padding:4px; min-width:{$lang === "ZH" ? "238px" : "268px"};"> 
                                    ⚡ <a on:click={()=> {connectCoinbase();}} target="_blank" class="spam" style="text-decoration-color: #224488;font-size: {$lang === "ZH" ? "17px" : "15px"}; font-weight: 700;margin-top: 0px;"> 
                                        {$lang === "ZH" ? "嵌接 Coinbase 托管錢包" : "Connect with Coinbase Wallet"}</a>
                                </p>
                                <p on:click={() => {connectEVMWallet();}} 
                                   style="min-width:{$lang === "ZH" ? "238px" : "268px"}; margin: 32px; margin-top: -16px; font-size: 12px; text-align: left; font-weight: 500; padding: 7px; color: #dddddd; text-decoration: underline; text-decoration-color: #FFFF0088; cursor: pointer;">
                                    {$lang === "ZH" ? "或使用以太坊虛擬機錢包插件進行連接" : "or link-up with EVM wallet / extension"}
                                </p>
                                <p class="gold-text" style="margin: 16px;  margin-right:0; margin-top:-4px; font-size: 14px;text-align: left; font-weight: 700; font-size: {$lang === "ZH" ? "16px" : "14px"}; padding:4px;"> 
                                    ⚡ {$lang === "ZH" ? "管理高質量現實掛鉤資產代幣" : "Manage premium RWA tokens"}
                                </p>
                                <p class="gold-text" style="margin: 16px;  margin-right:0; margin-top:24px; font-size: 14px;text-align: left; font-weight: 700; font-size: {$lang === "ZH" ? "16px" : "14px"}; padding:4px;"> 
                                    ⚡ {$lang === "ZH" ? "使用免鏈上手續費的合規穩定幣" : "Gasless and compliant stablecoin"}
                                </p>
                                <p class="gold-text" style="margin: 16px;  margin-right:0; margin-top:24px; font-size: 14px;text-align: left; font-weight: 700; font-size: {$lang === "ZH" ? "16px" : "14px"}; padding:4px;"> 
                                    ⚡ {$lang === "ZH" ? "參與免鎖倉'資產證明質押'獲取獎勵" : "'PoR Staking' without locking tokens"}
                                </p>

                        {/if}
            
        </div>

        <a transition:slide={{ duration: 150 }}  href="https://x.com/erc20permit" target="_blank" 
           style=" color: #888888; font-size: 12px; font-weight: 600; position:fixed; bottom:40px;
                   display: block; text-align: center; width:100vw; left:0;">
            © 2025 Permit Foundation
        </a>
{/if}