<script>
    
    import SmartWallet from './components/pages/SmartWallet.svelte';
    import Guide from "./components/pages/components/Guide.svelte";
    import Permit from "./components/pages/components/assets/Permit_white.png";
    import ID from "./components/pages/components/assets/DID.mp4";
    // import earth from "./components/pages/components/assets/landing.mp4";
    import { onMount, onDestroy } from "svelte";
    // import { TonConnectUI } from "@tonconnect/ui";
    import { fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { page } from '$app/stores';
    import Translate from "./components/pages/components/token_op/tool_parts/Translate.svelte";
    import Partners from "./components/pages/components/token_op/tool_parts/partners.svelte";
    import { refer_address, lang,
            main_address } from './store.js';
    
      // 切換語言的函數
      function toggleLanguage() {
        lang.set($lang === "EN" ? "ZH" : "EN")
      }

    let displayText = '';
    let fullText = '';
    let textAnimation;

    // 監聽語言變化並觸發動畫
    $: {
        fullText = $lang === "EN" ? "Crypto is money" : "加密貨幣即是錢";
        animateText();
    }

    function animateText() {
        clearInterval(textAnimation);
        displayText = '';
        let index = 0;

        textAnimation = setInterval(() => {
            if (index < fullText.length) {
                displayText += fullText[index];
                index++;
            } else {
                clearInterval(textAnimation);
            }
        }, 100); // 每個字符間隔100毫秒
    }
    
    

    let videoElement;
    let smart = false;
    let guide = false;
    
    // function identifyBlockchainAddress(address) {
    //     // EVM 地址檢測 (0x 開頭 + 40 個十六進制字符)
    //     const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    //     // TON 地址檢測 (通常是 48 或 66 個字符的 Base64Url 格式)
    //     const tonRegex = /^(EQ|Ef|UQ|Uf|kQ)[A-Za-z0-9_-]{46,64}$/;
    //     // Solana 地址檢測 (43-44 字符 Base58)
    //     const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;

    //     if (evmRegex.test(address)) {
    //         return "EVM";
    //     } else if (tonRegex.test(address)) {
    //         return "TON";
    //     } else if (solanaRegex.test(address)) {
    //         return "SOL";
    //     } else {
    //         return "Invalid";
    //     }
    // }
    

    function connect_EVM() {
      smart = true;
    }


    
    onMount(() => {

        animateText();

        window.Telegram.WebApp.disableVerticalSwipes();

        // 从查询参数中获取 'address'        
        if(!$page.url.searchParams.get('address')){
            refer_address.set(window.Telegram.WebApp.initDataUnsafe.start_param);
        } else {
            refer_address.set($page.url.searchParams.get('address'));
        }
        if (videoElement) {
            videoElement.playbackRate = 0.5;
        }
        
    });

    function createRipple(event) {
        // 找到按鍵的容器
        const button = event.currentTarget;

        // 創建 ripple 的 div
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');

        // 設置 ripple 的大小與位置
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        // 添加到按鍵中
        button.appendChild(ripple);

        // 在動畫完成後移除 ripple
        setTimeout(() => {
            ripple.remove();
        }, 500);
    }

    // onDestroy(() => {
        // if (unsubscribe) unsubscribe();
        // if ($tonConnectUI) {
        //     $tonConnectUI.disconnect().catch((e) => {
        //         console.error("Error during cleanup:", e);
        //     });
        // }
    // });
</script>



<svelte:head>
    <title>Permit</title>
    <meta property=’og:title’ content='Permit'/>
    <meta property="og:description" content="The RWA Payment Gateway">
    <meta property="og:icon" content="https://permit.money/favcon.png"/>
    <meta property="og:image" content="https://permit.money/poster.png" />
    <meta property="og:url" content="https://permit.money/" />
    <meta property="og:type" content="website" />
    <meta name="description" content="The RWA Payment Gateway" />
</svelte:head>






<section in:fade={{ duration: 150, easing: cubicInOut }}>
    


            <div class="backdrop"></div>

    

    {#if guide}

            <div  transition:fade={{ duration: 100 }}>
                <button on:click={()=>{guide = false;}}
                    style="position:fixed; width:20vw; height:50px;border:none; top:00px; left:5vw; z-index: 10000; background: transparent;
                           border:none;">
                </button>
                <Guide/>
            </div>
        
    {:else if smart}

            <button on:click={()=>{smart=false;main_address.set(null);}}
                style="position:fixed; width:168px; height:50px;border:none; top:00px; left:0vw; z-index: 30; background: transparent;">
            </button>

            <img src={Permit} alt="Permit" style=" position: fixed; height:32px; width:auto; left:calc(5vw); top:16px;" />
    
            <p class="animated-text" style="position:fixed; top:28px; z-index:1;color:white; left: calc(5vw + 40px); width:auto; font-size:24px; font-weight: 700;
                        transform: translateY(-50%); text-align: left;">
                Permit <span style="font-size: 10px;opacity: 0.5; margin-left: 4px;">( Alpha )</span>
            </p>
             
            <SmartWallet/><!-- on:click={connectWallet} -->
    
        
    {:else if !$main_address}

            <div class="header" style=" z-index:1000;">
                    <!-- <video style=" position: fixed; height:32px; width:auto; left:calc(5vw); top:16px;" autoplay loop muted playsinline preload="auto">
                        <source src={coin} type="video/mp4">
                    </video> -->
                <img src={Permit} alt="Permit" style=" position: fixed; height:32px; width:auto; left:calc(5vw); top:16px;" />
    
                <p class="animated-text" style="position:fixed; top:28px; z-index:1;color:white; left: calc(5vw + 40px); width:auto; font-size:24px; font-weight: 700;
                            transform: translateY(-50%); text-align: left;">
                    Permit <span style="font-size: 10px;opacity: 0.5; margin-left: 4px;">( Alpha )</span>
                </p>
    
                {#if !smart}
                    <button on:click={toggleLanguage} 
                        style=" position:absolute; top:8px; right:calc(8vw); margin-right:-10px; z-index: 1002; background: transparent; color: white; padding: 4px 8px; border:4px solid transparent; font-size: 16px; cursor: pointer;">
                        <Translate/>
                    </button>
                {/if}
            </div>
    
            <a transition:fade={{ duration: 150 }} on:click={()=>{guide = true;}}
                style="color: #aaaaaa; font-size: 14px; font-weight: 600; position: fixed; top:380px; width:100vw; text-decoration: underline; cursor:pointer;">
                {$lang === "ZH" ? "免手續費鏈上 RWA 支付獎勵系統" : "Gasless RWA Pay-Fi System"}
            </a>
    
              <!-- <video
                autoplay 
                loop 
                muted 
                playsinline transition:blur={{ duration: 300 }} 
                style="
                    position: fixed; 
                    top: 220px;
                    left: calc(50% + 24px);
                    transform: translate(-50%, -50%);
                    width:180vw;
                    max-width: 800px; 
                    height: auto; 
                    object-fit: cover;
                    border-left: 0px solid;
                    border-right: 0px solid;
                    border-radius: 16px; 
                    overflow: none;
                    opacity: 1;
                    z-index: -1;">
                <source src={earth} transition:blur={{ durFation: 300 }}  type="video/mp4" />
              </video> -->
    
              <button class="main_button button-11 gold-border" 
                  on:click={()=>{connect_EVM();}}   transition:fade={{ duration: 150 }}
                  style="position: fixed; top:440px;">
                <div class="button-11__content " style="filter: drop-shadow(0 0 2px #FFFFFF);">
                      <video 
                        autoplay 
                        loop 
                        muted 
                        playsinline 
                        style="
                          position: fixed; 
                          width: 100%; 
                          max-height: 100%; 
                          object-fit: cover;
                          border-radius: 8px; 
                          margin-top:-2px;
                          opacity:1;
                          z-index:-1;">
                        <source src={ID} type="video/mp4" />
                      </video>
                    <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                        {$lang === "ZH" ? "您的 RWA 庫存" : "RWA Dashboard"}</p>
                </div>
              </button>

                <p transition:fade={{ duration: 150 }} style="position: fixed; top:180px; left:0; width:100vw; font-weight: 700; font-size: 28px ;background: linear-gradient(to bottom, #FFFFFF, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 16px rgba(0, 0, 0, 1));">
                    {displayText}</p>

                <Partners/>


                                                        
            <div transition:fade={{ duration: 100 }} style="z-index:3000; position: absolute; top: 540px; left: 0vw; width: 100vw; color: #aaaaaa; background-color: #111111; font-size: 12px; font-weight: 400; text-align: left; line-height: 1.5; opacity: 1;border-top: 1px solid #333333;border-bottom: 1px solid #333333;">
                {#if $lang === "EN"}
                    <h3 style="margin:20px;font-size: 12px;text-align: center;"><strong>By using Permit, you agree to this disclaimer:</strong></h3>
                    <p style="margin:20px; font-size: 12px; text-align: left; ">Permit is a decentralized launchpad and wallet plug-in designed for managing Real World Assets (RWAs) on inter-blockchain network. Assets such as "TOKEN" and others are facilitated through its plugins and smart contracts, including the Token RWA Bridging Protocol. Please read the following carefully:</p>
                <ol style="margin-bottom: 80px;margin-right:10vw;">
                    <li><strong>Asset Nature</strong>: Permit manages a variety of assets (e.g., TOKEN), some of which may be pegged to cryptocurrencies (such as USDC). Their value is determined by decentralized mechanisms, related cryptographic assets, and market factors, rather than fiat currency reserves.</li>
                        <li><strong>Asset Custody</strong>: Permit Foundation itself does not directly hold or control user assets. Users may opt to use third-party services (e.g., Coinbase Wallet) to manage their wallets and private keys. The security and management of such assets are the sole responsibility of the user and the respective third-party service provider, and the Permit Foundation bears no liability in this regard.</li>
                        <li><strong>Risks of Use</strong>: Users acknowledge and accept the risks associated with using Permit, including but not limited to smart contract vulnerabilities, network attacks, and asset value fluctuations.</li>
                        <li><strong>No Profit or Return Guarantee</strong>: Permit does not promise any profits or returns. Users must independently assess all risks associated with its use.</li>
                        <li><strong>Regulatory Compliance</strong>: Users are solely responsible for ensuring that their use of Permit Foundation complies with all applicable laws and regulations in their jurisdiction. The Permit Foundation may cooperate with relevant regulatory authorities as required by law, but it assumes no responsibility for the legal compliance of users.</li>
                        <li><strong>No Warranty and Limitation of Liability</strong>: Permit is provided "as is," and to the fullest extent permitted by applicable law, the Permit Foundation disclaims liability for any losses.</li>
                        <li><strong>No Collection of User Data</strong>: Permit Foundation does not collect, store, or process any personally identifiable information or user data. Any data generated through interactions with the blockchain network or third-party services (e.g., Coinbase Wallet) remains outside the control and responsibility of the Permit Foundation. Users acknowledge that they bear sole responsibility for managing and protecting their own data privacy in connection with their use of the platform and any associated services.</li>
                    </ol>
                    <a href="https://t.me/permit_money" target="_blank"  transition:fade={{ duration: 150 }}
                       style=" position: absolute; color: #888888; font-size: 12px; font-weight: 600;
                              bottom: 16px; margin-bottom: 16px; display: block; text-align: center; width:100vw; left:0;">
                        © 2025 Permit Foundation
                    </a>
                {:else}
                    <!-- Placeholder for non-English version if needed -->
                    <h3 style="margin-top:20px;text-align: center;"><strong>使用 Permit 即表示同意平台免責聲明:</strong></h3>
                    <p style="margin:20px; font-size: 12px; text-align: left;">Permit 是一個去中心化實物資產（RWA）的啟動平台與錢包插件，於多條區塊鏈網絡上並行。如“TOKEN”等資產由其插件管理。請仔細閱讀：</p>
                    <ol style="margin-bottom: 80px;margin-right:10vw;">
                        <li><strong>資產性質</strong>：Permit 管理多種資產（例如 TOKEN），其中部分可能與加密貨幣（如 USDC）掛鉤，其價值由去中心化機制、相關加密資產及市場因素決定，而非依賴法定貨幣儲備。</li>
                        <li><strong>資產托管</strong>：Permit 基金會不直接持有或控制用戶資產。用戶可能選擇使用第三方服務（例如 Coinbase Wallet）來管理其錢包及私鑰，相關資產的安全性和管理責任由用戶與該第三方服務提供者自行承擔，Permit 基金會對此不承擔責任。</li>
                        <li><strong>風險</strong>：用戶認知並接受使用 Permit 所涉及的風險，包括但不限於智能合約漏洞、網絡攻擊及資產價值波動。</li>
                        <li><strong>無收益保證</strong>：Permit 不承諾任何收益或回報，用戶須自行評估與使用相關的所有風險。</li>
                        <li><strong>合規性</strong>：用戶有責任確保其使用 Permit 平台符合適用法律法規。Permit 基金會可能應法律要求與相關監管機構合作，但不對用戶的法律合規性承擔責任。</li>
                        <li><strong>無擔保</strong>：Permit 按「現狀」提供，在適用法律允許的最大範圍內，Permit 基金會不對任何損失承擔責任。</li>
                        <li><strong>不記錄用戶數據</strong>：Permit 基金會不會收集、儲存或處理任何個人身份信息或用戶數據。通過區塊鏈網絡或第三方服務（例如 Coinbase Wallet）產生的任何數據，均不在 Permit 基金會的控制或責任範圍內。用戶確認，其在使用平台及相關服務時，須自行承擔管理和保護其數據隱私的全部責任。</li>
                    </ol>
                    <a href="https://t.me/permit_money" target="_blank"  transition:fade={{ duration: 150 }}
                       style=" position: absolute; color: #888888; font-size: 12px; font-weight: 600;
                              bottom: 16px; margin-bottom: 16px; display: block; text-align: center; width:100vw; left:0;">
                        © 2025 Permit Foundation
                    </a>
                {/if}
            </div>
            
        
    {/if}

</section>