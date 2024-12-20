<script>
    import Background from "./components/background.mp4";
    import Logout from './components/icons/logout.svelte';
    import LOGO from './components/pages/components/Earth.svelte';
    import Dashboard from './components/pages/Dashboard.svelte';
    import { onMount, onDestroy } from "svelte";
    import { TonConnectUI } from "@tonconnect/ui";
    import { fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { page } from '$app/stores';
    import { tonConnectUI,
            main_address,
            main_raw_address,
            refer_address,
            TON_apiKey} from './store.js';
    import Ball from "./components/icons/3d_ball.png";
    import Unplug from "./components/icons/unplug.png";
    import TG_TON from "./components/icons/ton_tg.png";
    import Link from "./components/icons/link.mp4";
    import Bg from "./components/pages/components/assets/ton_invest_power_bg.mp4";
    

    let showModal = false; // 管理模态框可见性
    let modalTitle = "";
    let modalMessage = "";
    let inviter = "";
    let userAgent;
    let videoElement;
    let unsubscribe; // Ensure this is properly scoped
    let earth_opacity = 1;
    
    $: mod_refer_address = $refer_address ? `${$refer_address.slice(0, 6)}...${$refer_address.slice(-6)}`: "undefined";
    
    $: button_text = $main_address 
        ? `${$main_address.slice(0, 6)}...${$main_address.slice(-6)}`
        : "Connect TON Wallet";

    $: modal_text = modalTitle == "Log Out Confirm"
        ? "Log Out"
        : modalTitle == "Only by Invitation"
        ? "Verify Address" 
        : "Open In Telegram";

    async function checkAddress() {
        try {
            const response = await fetch(
                `https://toncenter.com/api/v2/getWalletInformation?address=${inviter}&api_key=${$TON_apiKey}`
            );
            const data = await response.json();
            if (data.ok) {
                if (data.result.account_state === "uninitialized" || !data.result.account_state) {
                    inviter = ""; 
                    alert("This is not a valid inviter address, and has not even been initialized.");
                    return;
                } else {
                    alert(`Inviter - ${inviter.slice(0, 4)}...${inviter.slice(-4)} has been applied.`);
                    refer_address.set(inviter); 
                    inviter = "";
                }
            } else {
                alert("This is not a valid inviter address.");
                inviter = "";
                return;
            }
        } catch (error) {
            alert("This is not a valid inviter address.");
            inviter = "";
            return;
        }
    }

    function openModal() {
            modalTitle = "Only by Invitation";
            modalMessage = `Please enter or paste the inviter's address.`;
            showModal = true;
    }



    async function closeModal() {
        if (modalTitle == "Log Out Confirm"){
            $tonConnectUI.disconnect().then(() => {
                console.log("Disconnected successfully.");
                main_raw_address.set(null); // 清空原始地址
                main_address.set(null); // 清空转换后的地址
            }).catch((e) => {
                console.error("Disconnect failed:", e.message);
            });
        } else if (modalTitle == "Only by Invitation"){
            await checkAddress();
        } else if (modalTitle == "Browser Restricted"){
            window.open('https://t.me/power_network_bot/connect?startapp=UQALUY7lNkc10kypNpKEA5GwfPLepBgGLc1LBJmbAF15VGea');
        }
        modalTitle = "";
        modalMessage = ``;
        showModal = false;
    }


    async function fetchBounceableAddressB64Url(originalAddress) {
        const apiUrl = `https://tonapi.io/v2/address/${originalAddress}/parse?api_key=?api_key=${$TON_apiKey}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch data from API');
            }
            const data = await response.json();
            return data.bounceable.b64url;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            return null;
        }
    }


    

    function connectWallet() {
        // 添加 Ripple 效果
        createRipple(event);

        // // 獲取屏幕寬高
        // const screenWidth = window.innerWidth;
        // const screenHeight = window.innerHeight;

        // 檢查是否符合運行條件
        if (!window.Telegram.WebApp.initDataUnsafe.start_param) {
            modalTitle = "Browser Restricted";
            modalMessage = `Please use Telegram App to check status and claim airdrops.`;
            showModal = true;
            return; // 停止後續執行
        }

        // 檢查是否已連接錢包
        if ($main_address || $tonConnectUI.wallet) {
            console.log("Wallet already connected, disconnecting...");
            modalTitle = "Log Out Confirm";
            modalMessage = `Are you sure to log out?`;
            showModal = true;
        } else {
            $tonConnectUI.openModal().catch((e) => {
                console.error("Open modal failed:", e.message);
            });
        }

        // 如果沒有推薦地址，打開模態框
        if (!refer_address) {
            openModal();
            return;
        }
    }

    // // // 檢查是否在 Telegram 瀏覽器中打開
    // function checkTelegramWebApp() {
    //         userAgent = navigator.userAgent ;
    //         const tg = (/iPhone/i.test(userAgent) || /Android/i.test(userAgent)) && !/Windows/i.test(userAgent);
    //         return tg;
    // }


    
    onMount(() => {

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

        // Initialize TonConnectUI with the manifest URL
        if (!$tonConnectUI) {
            tonConnectUI.set(new TonConnectUI({
                manifestUrl: "https://power-network.fyi/tonconnect-manifest.json",
            }));
        }

        // Subscribe to connection status changes
        unsubscribe = $tonConnectUI.onStatusChange(
            async (wallet) => {
                if (wallet && wallet.account) {
                    main_raw_address.set(wallet.account.address);
                    main_address.set(await fetchBounceableAddressB64Url($main_raw_address));
                } else {
                    main_raw_address.set(null);
                    main_address.set(null);
                }
            },
            (e) => {
                console.error("Error with wallet connection:", e.message);
            }
        );
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

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        if ($tonConnectUI) {
            $tonConnectUI.disconnect().catch((e) => {
                console.error("Error during cleanup:", e);
            });
        }
    });
</script>



<svelte:head>
    <title>Power Network</title>
    <meta property=’og:title’ content='⚡️🌐'/>
    <meta property="og:description" content="🔍 On-chain activities status tracking 
                                                🪪 DID network 🌐 Hold-to-Earn on TON 💎">
    <meta property="og:icon" content="https://power-network.fyi/favcon.png"/>
    <meta property="og:image" content="https://power-network.fyi/poster.png" />
    <meta property="og:url" content="https://power-network.fyi/" />
    <meta property="og:type" content="website" />
    <meta name="description" content="🔍 On-chain activities status tracking 
                                        🪪 DID network 🌐 Hold-to-Earn on TON 💎" />
</svelte:head>






<section in:fade={{ duration: 150, easing: cubicInOut }}>

            <div class="backdrop"></div>
            <video bind:this={videoElement} class="video-background" autoplay loop muted playsinline preload="auto">
            <source src={Background} type="video/mp4">
            </video><div class="backdrop" style="background:#000000aa;"></div>


    {#if !$main_address}

            <div class="gradient-div-top"></div>
            <div class="gradient-div-up"></div>
    
            {#if $refer_address}
                    <p style="position:absolute; top:8px; z-index:303;color:#000000; left: 50%; width:100vw; min-width:240px; font-size:12px;
                    transform: translate(-50%, -50%);font-weight: 700;"> Invited by address : {mod_refer_address}</p>
            {:else}
                    <p style="position:absolute; top:8px; z-index:303;color:#000000; left: 50%; width:100vw; min-width:240px; font-size:12px;
                    transform: translate(-50%, -50%);font-weight: 700;"> Requires invitation to join the alpha. </p>
            {/if}
    
            <div in:fade={{ duration: 500 }} style="height:150px;margin-top:56px;">
                <LOGO {earth_opacity}/>
            </div>
   

        
            <p style="position:absolute; top:260px; z-index:101;color:gold; left: 50%; width:100vw; min-width:240px; font-size:20px; font-weight: 700;
            transform: translate(-50%, -50%); animation: colorChange 3s infinite;
                      transition: color 3s ease-in-out;"> ⚡ Power Network ⚡ </p>
        
        <p style="position:absolute; top:50px; z-index:101;color:#444444; left: 50%; width:100vw; min-width:240px; font-size:12px; font-weight: 700;
        transform: translate(-50%, -50%); "> Alpha Version 2.0 </p>
    
            <div style="position: absolute; top: 345px; left: 50%; min-width:240px; 
                        width: 100vw; max-width: 280px; transform: translate(-50%, -50%); 
                        z-index: 101; "><br/><br/>
                <div style="height:1vh;"/><p style="display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 600;margin-left:14px;">
                    ⚡ Exclusive multi-phase airdrops</p>
                <div style="height:1vh;"/><p style="display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 600;margin-left:14px;">
                    ⚡ Reward-driven EVMs x TON DID</p>
                <div style="height:1vh;"/><p style="display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 600;margin-left:14px;">
                    ⚡ Amplifying the AUM of holdings</p>
                <div style="height:1vh;"/><p style="display: flex; flex-direction: column; text-align: center; justify-content: center;">
                    <a href="https://docs.power-network.fyi/" target="_blank" style="color: #888888; text-decoration: none;font-size: 14px; font-weight: 600;">
                        ( Instructions for Users )
                    </a>
                </p>
            </div>

            <button on:click={()=>{alert("This IP is not whitelisted, this feature will be available to the public very soon.”");}}                    
                    class="main_button pushable" style="top:480px;">
                <span class="front_evm"  style="outline: 1px solid white;">
                    <video 
                        autoplay 
                        loop 
                        muted 
                        playsinline 
                        style="
                            position: absolute; 
                            width: 100%; 
                            height: 100%; 
                            object-fit: cover;
                            border-radius: 80px; 
                            z-index:-1;
                        "
                    >
                            <source src={Bg} type="video/mp4" />
                    </video>
                    Connect EVM Wallet</span>
            </button>
    
            <button on:click={connectWallet}                    
                    class="main_button pushable" style="top:560px;">
                <span class="front">
                    {button_text}</span>
            </button>
       
    {:else}
        
            <button on:click={connectWallet} class="gold-border"
                style="position:fixed; width:56px; height:56px; border-radius:56px; top:40px; right:32px; z-index: 30;">
                <Logout/>
            </button>
        
            <img src={Ball} alt="Ball" style="position:fixed; width:56px; height:56px; border-radius:56px; top:45px; right:32px; z-index: 29;"/>
            <Dashboard />
        
    {/if}
    



    {#if showModal}

        <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div-top" style="z-index:2000;"></div>
        <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div-up" style="z-index:2000;"></div>
        
            <div class="overlay" transition:fade={{ duration: 100, easing: cubicInOut }} on:click={()=>{showModal = false;}}></div>
            <div class="modal" transition:fade={{ duration: 500, easing: cubicInOut }}>
                <p
                    style="position:absolute; top:8px;color:gold; font-size:16px; font-weight:700;"
                >
                    {modalTitle}
                </p>
                <p
                    style="position:absolute; top: 88px; transform: translate(0%, -50%); width:80%;font-size:14px;"
                >
                    {modalMessage}
                </p>

                {#if modalTitle == "Only by Invitation"}
                        <input bind:value={inviter} style="position:absolute; top: 160px; transform: translate(0%, -50%); width:75%;font-size:16px; border:1px solid white"/>
                {:else if modalTitle == "Log Out Confirm"}
                        <img src={Unplug} alt="Unplug" style="position:absolute; top: 80px;width:100%;"/>
                {:else if modalTitle == "Browser Restricted"}
                        <img src={TG_TON} alt="TG_TON" style="position:fixed; top: 136px;width:auto; height:60px;z-index:3;"/>
                        <video style="position:fixed; top: 124px;width:auto; height:80px;" 
                            autoplay loop muted playsinline preload="auto">
                            <source src={Link} type="video/mp4">
                        </video>
                {/if}
                
                <button class="gold-border pushable"
                    on:click={() => {
                        closeModal();
                    }}
                    style="position:absolute; width:240px; height:56px; bottom:8px;"
                >
                    <span class="front" style="position:absolute; width:240px;">{modal_text}</span>
                </button>
            </div>

        <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div" style="z-index:2000;"></div>
        
    {/if}

    <div class="gradient-div"></div>


    <p style="position:fixed; top:750px; font-size:12px; width: calc(100vw - 80px);left:40px;">
        Thanks for visiting with developer mode or other informal methods to enable TAPP. If you have any questions, please feel free to contact - @yc_bc_dev</p>

</section>