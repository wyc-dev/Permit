<script>
    import SmartWallet from './components/pages/SmartWallet.svelte';
    import Guide from "./components/pages/components/Guide.svelte";
    import Permit from "./components/pages/components/assets/Permit_white.png";
    import ID from "./components/pages/components/assets/DID.mp4";
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { page } from '$app/stores';
    import Translate from "./components/pages/components/token_op/tool_parts/Translate.svelte";
    import Partners from "./components/pages/components/token_op/tool_parts/partners.svelte";
    import { refer_address, lang, main_address } from './store.js';

    // 切換語言的函數
    function toggleLanguage() {
        lang.set($lang === "EN" ? "ZH" : "EN");
    }

    let displayText = '';
    let displayText2 = '';
    let displayText3 = '';
    let fullText = '';
    let fullText2 = '';
    let fullText3 = '';
    let textAnimation;
    let hideExtra = false; // Controls visibility of extra texts
    let hideTimeout; // Manages the timeout

    // 監聽語言變化並觸發動畫
    $: {
        fullText = $lang === "EN" ? "From tokens to money" : "從代幣到現金消費";
        animateText();
    }
    $: {
        fullText2 = $lang === "EN" ? "Merchants deposit + consumption - 0% Fee" : "線下商戶儲值+消費 - 零手續費";
        animateText();
    }
    $: {
        fullText3 = $lang === "EN" ? "Tokens swap + consumption - ~0.01% Fee" : "鏈上代幣轉換+消費 - 0.01% 起";
        animateText();
    }

    function animateText() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        hideExtra = false; // Show texts when animation starts
        clearInterval(textAnimation);
        displayText = '';
        displayText2 = '';
        displayText3 = '';
        let index = 0;
        const maxLength = Math.max(fullText.length, fullText2.length, fullText3.length);

        textAnimation = setInterval(() => {
            if (index < fullText.length) {
                displayText += fullText[index];
            }
            if (index < fullText2.length) {
                displayText2 += fullText2[index];
            }
            if (index < fullText3.length) {
                displayText3 += fullText3[index];
            }
            index++;
            if (index >= maxLength) {
                clearInterval(textAnimation);
                hideTimeout = setTimeout(() => {
                    hideExtra = true; // Hide texts after 3 seconds
                }, 3000);
            }
        }, 25);
    }

    let videoElement;
    let smart = false;
    let guide = false;

    function connect_EVM() {
        smart = true;
    }

    onMount(() => {
        animateText();
        window.Telegram.WebApp.disableVerticalSwipes();
        if (!$page.url.searchParams.get('address')) {
            refer_address.set(window.Telegram.WebApp.initDataUnsafe.start_param);
        } else {
            refer_address.set($page.url.searchParams.get('address'));
        }
        if (videoElement) {
            videoElement.playbackRate = 0.5;
        }
    });

</script>

<section in:fade={{ duration: 150, easing: cubicInOut }}>
    <div class="backdrop"></div>

    {#if guide}
        <div transition:fade={{ duration: 100 }}>
            <button on:click={() => {guide = false;}}
                style="position:fixed; width:20vw; height:50px;border:none; top:00px; left:5vw; z-index: 10000; background: transparent; border:none;">
            </button>
            <Guide/>
        </div>
    {:else if smart}
        <button on:click={() => {smart = false; main_address.set(null);}}
            style="position:fixed; width:168px; height:50px;border:none; top:00px; left:0vw; z-index: 30; background: transparent;">
        </button>
        <img src={Permit} alt="Permit" style="position: fixed; height:32px; width:auto; left:calc(5vw); top:16px;" />
        <p class="animated-text" style="position:fixed; top:28px; z-index:1;color:white; left: calc(5vw + 40px); width:auto; font-size:24px; font-weight: 700; transform: translateY(-50%); text-align: left;">
            Permit <span style="font-size: 10px;opacity: 0.5; margin-left: 4px;">( Alpha )</span>
        </p>
        <SmartWallet/>
    {:else if !$main_address}
        <div class="header" style="z-index:1000;">
            <img src={Permit} alt="Permit" style="position: fixed; height:32px; width:auto; left:calc(5vw); top:16px;" />
            <p class="animated-text" style="position:fixed; top:28px; z-index:1;color:white; left: calc(5vw + 40px); width:auto; font-size:24px; font-weight: 700; transform: translateY(-50%); text-align: left;">
                Permit <span style="font-size: 10px;opacity: 0.5; margin-left: 4px;">( Alpha )</span>
            </p>
            {#if !smart}
                <button disabled={displayText !== fullText} class="button-11" on:click={toggleLanguage} style="position:absolute; top:8px; right:calc(8vw); margin-right:-10px; z-index: 1002; background: transparent; color: white; border:1px solid #888888; cursor: pointer;">
                    <div class="button-11__content" style="display:flex; justify-content:center; align-items:center; height:100%;">
                        <video 
                            autoplay 
                            loop 
                            muted 
                            playsinline 
                            style="position: fixed; max-width: 40px; height: 36px; object-fit: cover; border-radius: 8px; margin-top:-4px; border:1px solid #FFFFFF44; opacity:0.4; z-index:-1;">
                            <source src={ID} type="video/mp4" />
                        </video>
                        <span style="margin-top:8px;"><Translate/></span>
                    </div>
                </button>
            {/if}
        </div>
        <a transition:fade={{ duration: 150 }} on:click={() => {guide = true;}}
            style="color: #aaaaaa; font-size: 14px; font-weight: 600; position: fixed; top:380px; width:100vw; min-width: 330px; text-decoration: underline; cursor:pointer;">
            {$lang === "ZH" ? "免手續費鏈上 RWA 支付獎勵系統" : "Gasless RWA Pay-Fi System"}
        </a>
        <button disabled={displayText !== fullText} class="main_button button-11 gold-border" 
            on:click={() => {connect_EVM();}} transition:fade={{ duration: 150 }}
            style="position: fixed; top:440px;">
            <div class="button-11__content" style="filter: drop-shadow(0 0 2px #FFFFFF);">
                <video 
                    autoplay 
                    loop 
                    muted 
                    playsinline 
                    style="position: fixed; width: 100%; max-height: 100%; object-fit: cover; border-radius: 8px; margin:-2px; opacity:1; z-index:-1;">
                    <source src={ID} type="video/mp4" />
                </video>
                <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                    {displayText !== fullText && $lang !== "ZH" 
                     ? "Loading Assets Data" 
                     : displayText !== fullText && $lang === "ZH" 
                     ? "正在載入資產數據" 
                     : $lang === "ZH" 
                     ? "您的 RWA 庫存" : "RWA Dashboard"}
                </p>
            </div>
        </button>

                <p class="main-text" on:click={()=>{if(hideExtra){hideExtra=false;}else{hideExtra=true;}}} 
                    transition:fade={{ duration: 150 }} style="position: fixed; top:{hideExtra ? '195px' : '140px'}; opacity:{hideExtra ? '1' : '0'}; transition: top 0.6s ease , opacity 0.3s ease; left:0; width:100vw; min-width: 330px; font-weight: 700; font-size: 24px; background: linear-gradient(to bottom, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2 2 1px rgba(255, 255, 255, 1));">
                    {displayText}
                </p>
        
                {#if !hideExtra}
                    <p on:click={()=>{if(hideExtra){hideExtra=false;}else{hideExtra=true;}}} 
                        transition:fade={{ duration: 300 }} style="position: fixed; top:{hideExtra ? '200px' : '160px'};  left:0; width:100vw; min-width: 330px; font-weight: 700; font-size: 14px; background: linear-gradient(to bottom, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        {displayText2}
                    </p>
                    <p on:click={()=>{if(hideExtra){hideExtra=false;}else{hideExtra=true;}}} 
                        transition:fade={{ duration: 300 }} style="position: fixed; top:200px; left:0; width:100vw; min-width: 330px; font-weight: 700; font-size: 14px; background: linear-gradient(to bottom, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        {displayText3}
                    </p>
                {/if}
        
                {#if displayText2 === fullText2 && !hideExtra}
                    <p on:click={()=>{if(hideExtra){hideExtra=false;}else{hideExtra=true;}}} 
                        transition:fade={{ duration: 300 }} style="position: fixed; top:{hideExtra ? '200px' : '240px'};left:0; width:100vw; min-width: 330px; font-weight: 700; font-size: 14px ;background: linear-gradient(to bottom, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        {$lang === "EN" ? "PoR staking mechanism without lock-up" : "全球首個無鎖倉「儲備證明」質押"}
                    </p>
                {/if}
        
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
                    <a href="https://x.com/erc20permit" target="_blank"  transition:fade={{ duration: 150 }}
                       style=" position: absolute; color: #888888; font-size: 12px; font-weight: 600;
                              bottom: 16px; margin-bottom: 16px; display: block; text-align: center; width:100vw; left:0;">
                        © 2025 Permit Foundation
                    </a>
                {:else}
                    <!-- Placeholder for non-English version if needed -->
                    <h3 style="margin-top:20px;text-align: center;"><strong>使用 Permit 即表示同意平台免責聲明:</strong></h3>
                    <p style="margin:20px; font-size: 12px; text-align: left;">Permit 是一個去中心化實物資產（RWA）的啟動平台與錢包插件，於多條區塊鏈網絡上並行，以模組化插件方式執行高效的 RWA 資產管理。詳情請仔細閱讀：</p>
                    <ol style="margin-bottom: 80px;margin-right:10vw;">
                        <li><strong>資產性質</strong>：Permit 管理多種資產（ 如 TOKEN 及 C01N ），其中部分可能與加密貨幣（如 USDC）掛鉤，其價值由去中心化機制、相關加密資產及市場因素決定，而非依賴法定貨幣儲備。</li>
                        <li><strong>資產托管</strong>：Permit 基金會不直接持有或控制用戶資產。用戶可能選擇使用第三方服務（例如 Coinbase Wallet）來管理其錢包及私鑰，相關資產的安全性和管理責任由用戶與該第三方服務提供者自行承擔，Permit 基金會對此不承擔責任。</li>
                        <li><strong>風險</strong>：用戶認知並接受使用 Permit 所涉及的風險，包括但不限於智能合約漏洞、網絡攻擊及資產價值波動。</li>
                        <li><strong>無收益保證</strong>：Permit 不承諾任何收益或回報，用戶須自行評估與使用相關的所有風險。</li>
                        <li><strong>合規性</strong>：用戶有責任確保其使用 Permit 平台符合適用法律法規。Permit 基金會可能應法律要求與相關監管機構合作，但不對用戶的法律合規性承擔責任。</li>
                        <li><strong>無擔保</strong>：Permit 按「現狀」提供服務，在適用法律允許的最大範圍內，Permit 基金會不對任何損失承擔責任。</li>
                        <li><strong>不記錄用戶數據</strong>：Permit 基金會不會收集、儲存或處理任何個人身份信息或用戶數據。通過區塊鏈網絡或第三方服務（例如 Coinbase Wallet）產生的任何數據，均不在 Permit 基金會的控制或責任範圍內。用戶確認，其在使用平台及相關服務時，須自行承擔管理和保護其數據隱私的全部責任。</li>
                    </ol>
                    <a href="https://x.com/erc20permit" target="_blank"  transition:fade={{ duration: 150 }}
                       style=" position: absolute; color: #888888; font-size: 12px; font-weight: 600;
                              bottom: 16px; margin-bottom: 16px; display: block; text-align: center; width:100vw; left:0;">
                        © 2025 Permit Foundation
                    </a>
                {/if}
            </div>
            
        
    {/if}

</section>

