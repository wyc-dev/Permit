<!-- PowerSupply.svelte -->
<script>
    import Inner from "../inner.mp4";
    import Stack from '../icons/stack.svelte';
    import TON from "../icons/ton-logo.svelte";
    import Ball from "../icons/3d_ball.png";
    import Right from "../icons/right.svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { main_address,
            refer_in_DB,
            POWER_from_refer,
            POWER_of_refer_in_DB,
            latest5Tx,
            firstTx,
            tonConnectUI,
        } from '../../store.js';
    import PocketBase from "pocketbase";
    export let iconComponent;
    export let title;
    export let description = '';
    export let rightContent;
    export let borderColor = '#00FF00';
    export let order = "";
    export let content_adjust;
    const pool = "UQALUY7lNkc10kypNpKEA5GwfPLepBgGLc1LBJmbAF15VGea";
    const url = "https://msg.pockethost.io/";
    const pb = new PocketBase(url);
    let showModal;
    let modalTitle;
    let modalInfo;
    let modalMessage = "";
    let modalButtonText;
    let depositAmount = 10;
    import A from "./supplies/A.svelte";
    import B from "./supplies/B.svelte";
    import C from "./supplies/C.svelte";
    import DID from "./supplies/DID.svelte"
    let topBarText;
    export let check_stonfi;
    export let check_og;
    export let check_tonx;
    export let invest;
    export let firstTxTillNow;
    export let transactionCount;
    export let check_cryptoCom;
    export let check_binance;
    export let check_okx;
    export let A_score;
    export let B_score;

        

    async function authenticateUser() {
        await pb.admins.authWithPassword("address@gmail.com", "************");
    }

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0 ) {
            return 0;
        } else if (value >= 1000000000000000) {
            return "∞";
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

    

    async function sendStakeTransaction(stake_amount) {
        
        let amount = stake_amount * 1000000000;

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
            messages: [
                {
                    address: pool,
                    amount: amount.toString(),
                }
            ]
        };

        try {
            const result = await $tonConnectUI.sendTransaction(transaction, {
                modals: ['before', 'success', 'error'],
                notifications: ['before', 'success', 'error']
            });

            window.location.reload();

        } catch (e) {
            console.error(e);

            window.location.reload();
        }
    }
    


    function openModal() {

        createRipple(event);
        
        if (order == "A"){

            modalTitle = "Adoption on TON";
            modalInfo = "Projects Engagement";
            modalButtonText =`${formatVolume(depositAmount,0)} TON for POWER`;
            showModal = true;
            topBarText = "A for Adoption";
            
        } else if (order == "B"){

            modalTitle = "Bonding with TON";
            modalInfo = "Immutable Transactions";
            modalButtonText = "Transactions Details";
            showModal = true;
            topBarText = "B for Bondage";
            
        } else if (order == "C"){

            modalTitle = "Capital Holdings";
            modalInfo = "Account Asset Value";
            // modalMessage = "Simply hold TON in your own wallet and we'll reward people's faith."
            modalButtonText = "Go Deposit";
            showModal = true;
            topBarText = "C for Capital";
            
        } else if (order == "D"){

            modalTitle = "TON DID Network";
            modalInfo = "The Open DID Network";
            modalButtonText = "Invite Whales on TON";
            showModal = true;
            topBarText = "D for DID AUM";
            
        }

    }
    


    function shareToTelegram(message) {
            const url = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/power_network_bot/connect?startapp=${encodeURIComponent($main_address)}`)}&text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
    }


    async function closeModal() {

            createRipple(event);
        
            showModal = "";
            modalTitle = "";

            if (order == "D"){
                const message = "⚡️🌐 DID network with airdrops 🐳💼";
                shareToTelegram(message);
            } else if (order == "B"){
                const url = `https://tonviewer.com/${$main_address}?section=transactions`;
                window.open(url, '_blank');
            } else if (order == "A"){
                await sendStakeTransaction(depositAmount);
                return;
            }
    }

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
    
    let videoElement;
    
    onMount(async () => {
        await authenticateUser();

        videoElement = document.querySelector('.inner-background');

        if (videoElement) {
            videoElement.addEventListener('ended', () => {
                videoElement.play(); // Ensure video replays after ending
            });
        } else {
            console.error("Video element not found");
        }
    });

</script>

















{#if showModal}

    <div class="gradient-div-top" style="z-index: 1000;"> </div>
    <div class="gradient-div-up" style="z-index: 1000;"> </div>
    <p style="position:fixed; top:6px; z-index:1100;color:#000000; left: 50%; width:100vw; min-width:240px; font-size:12px;
    transform: translate(-50%, -50%);font-weight: 700;"> {topBarText} </p>

    <div class="overlay" transition:fade={{ duration: 300, easing: cubicInOut }} style="margin-top:8px;">

            <div style="z-index:0; ">
                        <video class="inner-background" autoplay loop muted playsinline preload="auto">
                            <source src={Inner} type="video/mp4">
                        </video>
            </div>
            <div style="position:absolute; border:1px solid white; top:112px; bottom:128px; left:16px; right:16px; height:auto; width:auto;
                        border-radius: 32px; background: #000000; z-index:0; filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.15)); ">
            </div>
            
            <p class="gold-text" style="position:absolute; top:34px; color:gold; font-size:16px; font-weight:700;
                      width:100%; ">
                {modalTitle}
            </p>

            <p class="header_small">
                {modalInfo}
            </p>
    

            
            {#if order == "A" }

                    <A
                        {invest}
                        {check_og}
                        {check_tonx}
                        {check_stonfi}
                        {A_score} />

                        <div style="
                                display: flex; 
                                align-items: center; 
                                justify-content: center; /* 確保內部內容水平居中 */
                                position: absolute; 
                                width: 80vw; /* 外層寬度 */
                                min-width: 400px;
                                top: 392px; /* 上下位置不變 */
                                left: calc(50% + 4px); /* 水平居中 */
                                transform: translateX(-50%); /* 修正居中的偏移量 */
                                z-index: 300;
                                gap: 8px; /* 元素之間的間距 */
                            ">
                                <!-- TON Icon -->
                                <div style="height:24px; width:24px;z-index:3;">
                                    <TON />
                                </div>
        
                                <!-- Input Box -->
                                <input 
                                    style="
                                        appearance: none; 
                                        -moz-appearance: textfield; /* Firefox 移除加減掣 */
                                        -webkit-appearance: none; /* Chrome 移除加減掣 */
                                        color: white; 
                                        font-size: 20px; 
                                        font-weight: 700; 
                                        text-align: center; 
                                        border: none; 
                                        background: transparent;
                                        width: 40px; /* 最小寬度限制 */
                                        max-width: 100px; /* 最大寬度限制（可根據需求調整） */
                                        padding: 0;
                                        box-sizing: content-box; /* 確保寬度僅考慮內容 */
                                        "
                                        bind:value={depositAmount}
                                        on:input={(e) => {
                                            const inputLength = e.target.value.length;
                                            e.target.style.width = `${Math.max(40, inputLength * 10)}px`;
                                            // 動態調整 New Value 的 margin-left
                                            // 判斷是否需要固定 margin-left
                                            const isInvalid = formatVolume(depositAmount ,1) === "∞" || formatVolume(depositAmount ,1) ===  0 || depositAmount === 0 || isNaN(Number(depositAmount));
                                            const marginOffset = isInvalid ? -36 : -40 - (inputLength * 1.5);
                                            // 動態調整 New Value 的 margin-left
                                            document.querySelector(".get_power").style.marginLeft = `${marginOffset}px`;
                                        }}
                                />
        
                                <!-- TON Label -->
                                <p style="color: white; font-size: 20px; font-weight: 700;">
                                    TON
                                </p>
        
                                <!-- Right Icon -->
                                <div style="margin-left: 0px;">
                                    <Right />
                                </div>
    
    
                                <!-- Del Value -->
                                <p style="
                                    position: relative; 
                                    top: -18px; /* 調整位置使其位於下方文字的上方 */
                                    font-size: 12px; 
                                    font-weight: 700; 
                                    color: #888888; 
                                    opacity: 0.8; 
                                    margin: 0;
                                    text-decoration: line-through; /* 刪除線 */
                                    text-decoration-thickness: 2px; /* 調整刪除線的粗細 */
                                    text-decoration-color: #FF4444; /* 可選：設置刪除線顏色 */
                                ">
                                    {formatVolume(depositAmount ,1)} ⚡
                                </p>
        
                                <!-- New Value -->
                                <p class="gold-text get_power" style="
                                    font-size: 22px; 
                                    font-weight: 700; 
                                    color: white;
                                    margin-left:-40px;
                                ">
                                    {formatVolume(depositAmount * 10, 1)} ⚡
                                </p>
                        </div>
                
            {:else if order == "B"}

                    <B
                        {check_cryptoCom}
                        {check_binance}
                        {check_okx}
                        {B_score}
                        {firstTxTillNow}
                        {transactionCount}
                        {$latest5Tx}
                        {$firstTx}
                        />

                
            {:else if order == "C"}

                    <C />
        
                    <!-- <p style="position:fixed; border:none;
                              width:calc(100vw - 80px); left:40px; top:50vh; height:80px;
                              z-index:100;background:transparent;
                              "> {modalMessage}
                    </p> -->
                
            {:else if order == "D"}

                    <DID 
                        {check_og}
                        {check_tonx}
                        {check_stonfi}
                        {check_cryptoCom}
                        {check_binance}
                        {check_okx}
                        main_address={$main_address} 
                        refer_in_db={$refer_in_DB} POWER_from_refer={$POWER_from_refer} POWER_of_refer_in_db={$POWER_of_refer_in_DB} {content_adjust} />
        
                    <!-- <div style="position:absolute; top:400px; left:50%; width:80%; transform: translateX(-50%); text-align: left;">
                        <span style="display: block; height:20px; font-size: 14px;">
                            <span style="font-size: 14px; font-weight: 700;">Friends may scan QR code to join ⚡🌐</span>
                        </span>
                        <span style="display: block; height:20px; font-size: 14px;">
                            <span style="font-size: 14px; font-weight: 700;">Also scan your friend's to boost ⚡</span>
                        </span>
                        <span style="display: block; height:20px; font-size: 14px;">
                            <span style="font-size: 14px; color: grey;">Physical stores we collab called </span>
                            <span style="font-size: 14px; color: gold;">Stations</span>.
                        </span>
                        <span style="display: block; height:20px; font-size: 14px;">
                            <span style="font-size: 14px; color: grey;">They will post their QR code at their venue,</span>
                        </span>
                        <span style="display: block; height:20px; font-size: 14px;">
                            <span style="font-size: 14px; color: gold;">Stations </span>
                            <span style="font-size: 14px; color: grey;"> will provide additional bonuses</span>.
                        </span>
                    </div> -->
    
            <!-- {:else if order == "E"} -->
                
            {/if}


        
            <button class="gold-border" on:click={()=>{showModal=false;}}
                style="position:fixed; width:56px; height:56px; border-radius:56px; top:40px; left:32px; z-index: 300;">
                <Stack/>
            </button>
            <img src={Ball} alt="Ball" style="position:fixed; width:56px; height:56px; border-radius:56px; top:45px; left:32px; z-index: 299;"/>


        
            <button
                class="main_button pushable" style="top:580px;"
                on:click={closeModal} id="tx">
                <span class="front">
                    {order == "A" ? `⚡ POWER + ${formatVolume(depositAmount * 10,0)} ⚡` : modalButtonText}</span>
            </button>
    </div>

{/if}



<div transition:fade={{ duration: 600, easing: cubicInOut }} on:click={openModal} style="filter: drop-shadow(0 0 2px {borderColor}44); border:1px solid {borderColor}; border-radius:16px ; width:32px; height:32px;
            margin-bottom: -20px; margin-left:-8px; background-color: #11100088; z-index:4;">
    <img src={Ball} alt="Ball" style="position:fixed; width:32px; height:32px;
          margin-top: 0px; margin-left:0px; z-index:3; opacity: 0.8;"/>
    <p style="position:fixed; color:{borderColor};z-index:4;margin-left:10px;">{order}</p>
</div>

<div transition:fade={{ duration: 600, easing: cubicInOut }}  on:click={openModal} on:keydown={openModal}  class="info-card thunder-animation" style=" --border-color: {borderColor}; background:{borderColor}11; transition: border-color 0.5s ease-in-out, border-color 0.5s ease-in-out;z-index:3;">

    <div class="icon">
        <svelte:component this={iconComponent} />
    </div>
    <div class="content">
        <p class="title">{title}</p>
        {#if description}
            <p class="description">{description}</p>
        {/if}
    </div>
    <div class="right-content">
        <p class="right-content">{rightContent}</p>
    </div>
    
</div>









<style>    

    /* 雷電效果 */
    .thunder-animation {
        animation: lightning-flash 9s infinite ease-in-out; /* 控制閃爍頻率 */
        transition: background 1s ease-in-out, box-shadow 1s ease-in-out;
    }
    
    /* 主雷電動畫 */
    @keyframes lightning-flash {
        0%, 100% {
            border-color: var(--border-color);
        }
        5% {
            border-color: white;
            box-shadow: 0 0 1px rgba(255, 255, 255, 1), 0 0 16px rgba(255, 255, 0, 0.1);
        }
        10% {
            box-shadow: 0 0 1px rgba(255, 255, 255, 0), 0 0 16px rgba(255, 255, 0, 0);
            border-color: var(--border-color);
        }
    }
    
    .info-card {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color);;
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 16px;
        
    }
    
    .icon {
        width: 56px;
        height: 56px;
        margin-right: 16px;
        margin-left: -16px;
        display: flex;          /* 添加这行 */
        align-items: center;    /* 添加这行，垂直居中 */
        justify-content: center;/* 可选，水平居中 */
    }
    .content {
        flex: 1;
    }
    .title {
        top:4px;
        margin-left:-24px; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 700;
    }
    .description {
        top:22px;
        margin-left:-24px; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 12px; font-weight: 500;
    }
    .right-content {

        color:gold; line-height:20px; display: flex;flex-direction: column; text-align: left; justify-content: center; font-size: 14px; font-weight: 700;
    }

    @keyframes float-infinity {
        0%, 100% {
            /* transform: translateX(3px) rotate(-3deg) scale(1); */
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }
        10% {
            /* transform: translateX(1px) rotate(3deg) scale(1.05); */
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1));
        }
        30% {
            /* transform: translateX(3px) rotate(-3deg) scale(1); */
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }
        50% {
            /* transform: translateX(1px) rotate(3deg) scale(0.95); */
            filter: drop-shadow(0 0 20px rgba(255, 215, 255, 1));
        }
        70% {
            /* transform: translateX(3px) rotate(-3deg) scale(1); */
            filter: drop-shadow(0 0 10px rgba(255, 215, 255, 0.5));
        }
        90% {
            /* transform: translateX(1px) rotate(3deg) scale(1.05); */
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1));
        }
    }

    .inner-background {
        position: fixed;
        opacity: 0.15;
        top: 50%; /* 将顶部设置为视口的中心 */
        left: 50%; /* 将左侧设置为视口的中心 */
        width: 120vh; /* 视频的宽度等于视口的高度 */
        height: 120vw; /* 视频的高度等于视口的宽度 */
        transform: translate(-50%, -50%) rotate(90deg); /* 将视频移动到视口的中心并旋转 */
        transform-origin: center center; /* 旋转的中心点是视频的中心 */
        object-fit: cover; /* 保证视频内容覆盖整个容器但保持内容的比例 */
        z-index: 0; /* 确保视频在内容后面 */
    }
    /* .inner-background2 {

    } */
</style>