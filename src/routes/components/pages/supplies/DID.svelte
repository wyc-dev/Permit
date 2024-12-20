<script>
    import Loading from "../components/assets/loading.mp4";
    import DID from "../components/assets/DID.mp4";
    import CardBack from "../components/assets/card_back.mp4";
    import Bg from "../components/assets/ton_invest_power_bg.mp4";
    import { onMount } from 'svelte';
    import { blur , fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { TT_Power,
            telegram_x_TON,
            DID_tg,
            DID_stonfi,
            DID_og,
            DID_tonx,
            choosed_address_for_ID, 
            choosed_address_total_power } from '../../../store.js';
    import PocketBase from "pocketbase";
    import QRCode from "qrcode-svg";
    import Network from "./Network.svelte";
    import Tonviewer from "../../icons/tonviewer.png";
    import TON from "../../icons/ton-3d.png";
    import Light from "../../icons/light.png";
    import Telegram from "../../icons/telegram.png";
    import Stonfi from "../../icons/A/ston_fi_farm.png";
    import TS_OG from "../../icons/A/ts_og.png";
    import Tonx_id from "../../icons/A/tonx_id.png";
    import Right from "../../icons/right_gold.svelte";

    
    export let main_address;
    export let refer_in_db;
    export let POWER_from_refer;
    export let POWER_of_refer_in_db;
    export let content_adjust;
    let showModal = false;
    let flipped = false;
    let visible = false;
    let loading = true;
    let ID_QR_URL;

    const url = "https://msg.pockethost.io/";
    const pb = new PocketBase(url);

    $: Main_ID_opacity = main_address === removeDashFromString($choosed_address_for_ID)
        ? 1
        : 0;
    $: FD_ID_opacity = main_address !== removeDashFromString($choosed_address_for_ID)
        ? 1
        : 0;
    $: power_from_tg = String($telegram_x_TON).length === 0 ? 0 : 1000;

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

    function removeDashFromString(str) {
        return str.replace(/-/g, "");
    }

    /**
    * 根據給定地址生成漸變色的 JPG 圖片。
    * @param {string} address - 用戶的 TON 地址。
    * @returns {string} 返回 Base64 編碼的 JPG 圖片。
    */
    function createGradientJPG(address) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 設置圖片尺寸 (例如: 200x200)
        canvas.width = 200;
        canvas.height = 200;

        // 利用地址生成顏色 (通過地址的哈希值決定顏色漸變)
        const colors = generateColorsFromAddress(address);

        // 創建漸變
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, colors[0]); // 起始顏色
        gradient.addColorStop(1, colors[1]); // 結束顏色

        // 填充漸變
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 將 Canvas 轉換為 JPG Base64
        return canvas.toDataURL('image/jpeg');
    }

    /**
    * 根據地址生成兩個顏色（使用哈希計算）。
    * @param {string} address - 用戶的 TON 地址。
    * @returns {string[]} 返回兩個 RGB 顏色。
    */
    function generateColorsFromAddress(address) {
        const hash = hashCode(address);
        const color1 = `rgb(${(hash >> 16) & 0xff}, ${(hash >> 8) & 0xff}, ${hash & 0xff})`;
        const color2 = `rgb(${(hash >> 8) & 0xff}, ${hash & 0xff}, ${(hash >> 16) & 0xff})`;
        return [color1, color2];
    }

    /**
    * 計算字符串的哈希值（簡單哈希函數）。
    * @param {string} str - 輸入字符串。
    * @returns {number} 返回哈希值。
    */
    function hashCode(str) {
        return str.split('').reduce((hash, char) => {
          return (hash << 5) - hash + char.charCodeAt(0);
        }, 0);
    }

    function change_ID_show_QR(){
        
        const qr = new QRCode({
            content: `https://t.me/power_network_bot/connect?startapp=${encodeURIComponent($choosed_address_for_ID)}`,
            padding: 0,
            width: 256,
            height: 256,
            color: "#ffffff", // QR 码颜色为白色
            background: "transparent",   // 没有背景
            ecl: "M"          // 纠错级别，可根据需要调整
        });
        const svgString = qr.svg(); 
        const base64 = btoa(unescape(encodeURIComponent(svgString))); 
        ID_QR_URL = `data:image/svg+xml;base64,${base64}`;
    }

    async function checkTg(address) {
        try {
            const result = await pb.collection("users").getList(1, 1, {
                filter: `username="${removeDashFromString(address)}"`,
            });

            // Check if result contains items and handle accordingly
            if (result.items && result.items.length > 0) {
                let htmlContent = result.items[0].telegram || "";
                let tg = htmlContent
                    .replace(/<\/?p>/g, "") // Remove HTML tags
                    .split(",")
                    .map((item) => item.trim()); // Trim and format

                DID_tg.set(tg); // Update store
                return tg; // Return parsed Telegram data
            } else {
                DID_tg.set("TG not found.");
                // No matching items found
                return null;
            }
        } catch (error) {
            console.error("Error fetching Telegram data:", error);
            return null; // Return null on error
        } finally {
            // Optional: Add any cleanup logic here if needed
        }
    }

    function shareToTelegram() {
            const url = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/power_network_bot/connect?startapp=${encodeURIComponent(main_address)}`)}&text=${encodeURIComponent("⚡️🌐 DID network with airdrops 🐳💼")}`;
            window.open(url, '_blank');
    }
    
    onMount( async () => {

        if(main_address.length === 0){
            choosed_address_for_ID.set(main_address)
            choosed_address_total_power.set(POWER_from_refer)
        }

        change_ID_show_QR();

        await checkTg($choosed_address_for_ID);
        
        setTimeout(() => {
            flipped = true;
            visible = false;
            loading = false;
        }, 600);

        setTimeout(() => {
            visible = true;
            flipped = false;
        }, 300);

    });
</script>

<style>
    .card-container {
        perspective: 1000px;
        width: 80vw;
        max-width:300px;
        height: 50vw;
        height: 240px;
        position: relative;
        margin: 24px auto;
        margin-top: 132px;
        border-radius: 16px;
    }

    .card {
        width: 100%;
        height: 100%;
        position: absolute;
        transform-style: preserve-3d;
        transition: transform 1s;
        transform: rotateY(0deg);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .card.flipped {
        transform: rotateY(180deg);
    }

    .face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2vw;
        color: white;
        border-radius: 16px;
        border: 1px solid #ccc;
        background: transparent;
        box-shadow: 0 0 4px 2px rgba(255, 255, 255, 0.8);
    }

    .id_bg{
        position: absolute;
        top:0;
        left:0;
        opacity: 0.3;
    }

    .front, .back {
        /* background-color: #f0f0f0; */
        border: 1px solid #ccc;
    }

    .back {
        background-color: #d0e0f0;
        transform: rotateY(180deg);
    }

    .info-panel {
        margin-top:4px;
        width: calc(100% - 24px);
        height: calc(100% - 24px);
        background: #00000088;
        border-radius: 12px;
        border: 8px solid #000000aa;
        opacity: 0; /* 初始不透明度為 0 */
        transition: opacity 0.5s ease-in-out, border 0.5s ease-in-out; /* 添加過渡效果 */
    }

    .info-panel.visible {
        opacity: 1; /* 最終不透明度為 1 */
    }




    /* CSS */
    .button-57 {
      background-color: #0078d0;
      border: 0;
      border-radius: 56px;
      color: #fff;
      cursor: pointer;
      display: inline-block;
      outline: 0;
      position: relative;
      text-align: center;
      text-decoration: none;
      transition: all .3s;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      overflow: hidden;
    }

    .button-57:before {
      background-color: initial;
      background-image: linear-gradient(#fff 0, rgba(255, 255, 255, 0) 100%);
      border-radius: 125px;
      content: "";
      height: 50%;
      left: 4%;
      opacity: .5;
      position: absolute;
      top: 0;
      transition: all .3s;
      width: 92%;
    }

    .button-57:hover {
      box-shadow: rgba(255, 255, 255, .2) 0 3px 15px inset, rgba(0, 0, 0, .1) 0 3px 5px, rgba(0, 0, 0, .1) 0 10px 13px;
      transform: scale(1.05);
    }

    @media (min-width: 768px) {
      .button-57 {
        padding: 16px 48px;
      }
    }

</style>

<div class="card-container">

    <video 
            autoplay 
            loop 
            muted 
            playsinline 
            class="card-container"
            style="     pointer-events: none; /* 禁止點擊事件 */
                        user-drag: none; /* 禁止拖動 */
                        -webkit-user-drag: none;
                        user-select: none; /* 禁止選中 */
                        -webkit-user-select: none; /* Webkit 瀏覽器 */
                        -moz-user-select: none; /* Firefox */
                        -ms-user-select: none; /* IE */
                       position: absolute;
                       top: 0;
                       left: 0;
                       width: 100%;
                       height: 100%;
                       object-fit: cover; /* 確保視頻覆蓋整個 div */
                       z-index: -1; /* 讓視頻背景位於其他內容後面 */
                       pointer-events: none; /* 防止點擊背景視頻 */
                   ">
            <source src={Bg} type="video/mp4" />
    </video> 

    <div class="card" class:flipped={flipped} transition:blur={{ duration: 300, easing: cubicInOut }}>
            {#if loading}

                    <video 
                        autoplay 
                        loop 
                        muted 
                        playsinline 
                        class="face id_bg">
                        <source src={Loading} type="video/mp4" />
                    </video>
            
            {/if}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              on:click={() => { flipped = true; visible = false; }}
              class="face front" 
              style="position: absolute; left: 50%; transform: translateX(-50%); 
                     user-select: none; 
                     -webkit-user-select: none; /* Webkit 瀏覽器 */
                     -moz-user-select: none; /* Firefox */
                     -ms-user-select: none; /* IE */
                     user-drag: none; /* 禁止拖動 */
                     -webkit-user-drag: none;"
            >                
                <div class={visible ? 'info-panel visible' : 'info-panel'}>

                        <video 
                                autoplay 
                                loop 
                                muted 
                                playsinline 
                                class="face id_bg">
                                <source src={DID} type="video/mp4" />
                        </video> 

                        <img class="face id_bg gold-border" src={createGradientJPG($choosed_address_for_ID)} alt="Gradient" />

                         <p style="position:absolute; top:0px; left:0; width:100%; text-align: center; font-size: 9px; color:#444444; font-weight: 700;">
                             ⚡ TON Decentralized Identity Card by Power Network ⚡</p>
                         <p style="position:absolute; bottom:0px; left:0; width:100%; text-align: center; font-size: 9px; color:#444444; font-weight: 700;transform: rotate(180deg);">
                             ⚡ TON Decentralized Identity Card by Power Network ⚡</p>
                         <p style="position:absolute; top:108px; right:-140px; width:100%; text-align: center; font-size: 9px; color:#444444; font-weight: 700;transform: rotate(90deg);">
                             ⚡ Anonymous Proof of Reserve On Address ⚡</p>
                         <p style="position:absolute; top:108px; left:-140px; width:100%; text-align: center; font-size: 9px; color:#444444; font-weight: 700;transform: rotate(270deg);">
                             ⚡ Anonymous Proof of Reserve On Address ⚡</p>

                        <div style="position: absolute; top:4px; left:28px; ">
                                <img src={ID_QR_URL} alt="QR Code" class="floating" style="width: 100px; height: 100px; position: absolute; top:24px; left:0px" />
                        </div>

                        <a href="https://tonviewer.com/{$choosed_address_for_ID}" target="_blank" style="text-decoration: none; color: inherit;">
                            <img src={Tonviewer} alt="Tonviewer" style="height:24px; width:24px; position: absolute; top:32px; left:132px;">
                            <p style="position:absolute; top:28px; left:160px; font-weight: 700; font-size: 14px;">{$choosed_address_for_ID.slice(0, 4)}...{$choosed_address_for_ID.slice(-4) }</p>
                        </a>

                         <img 
                             src={TON} 
                             alt="TON"
                             style="opacity: {FD_ID_opacity}; height: 28px; width: 24px; position: absolute; top: 62px; left: 132px;"
                         >
                         <p class="sub-text"
                             style="opacity: {FD_ID_opacity}; position: absolute; top: 60px; left: 146px; font-size: 14px;">
                             {formatVolume($choosed_address_total_power, 2)} TON
                         </p>
                                 
                         <img 
                             src={Light} 
                             alt="Light"
                             style="opacity: {Main_ID_opacity}; height: 24px; width: 24px; position: absolute; top: 66px; left: 132px;"
                         >
                         <p class="sub-text"
                             style="opacity: {Main_ID_opacity}; position: absolute; top: 60px; left: 146px; font-size: 14px;">
                             {formatVolume($choosed_address_total_power + $TT_Power, 4)}
                         </p>

                          <img 
                              src={Telegram} 
                              alt="Telegram"
                              style="height: 26px; width: 24px; position: absolute; top: 94px; left: 133px;"
                          >
                         <p style="position:absolute; top:90px; left:162px; font-weight: 700; font-size: 14px; color: {$DID_tg && String($DID_tg).length > 0 ? '#FFFFFF' : '#888888'};">
                             {String($DID_tg).length > 0 ? $DID_tg : "TG not linked."}
                         </p>




                                 


                                 <div class="defi" style="top:140px; left:20px;">
                                     <div
                                         class="item-box"
                                         style="opacity: {$DID_og ? 1 : 0.3};"
                                     >
                                         <img
                                             class="item"
                                             src={TS_OG}
                                             alt="OG"
                                             style="filter: {$DID_og ? 'drop-shadow(0 0 2px white)' : 'none'};"
                                         />
                                     </div>
                                     <div
                                         class="item-box"
                                         style="opacity: {$DID_stonfi ? 1 : 0.3};"
                                     >
                                         <img
                                             class="item"
                                             src={Stonfi}
                                             alt="OG"
                                             style="filter: {$DID_stonfi ? 'drop-shadow(0 0 2px white)' : 'none'};"
                                         />
                                     </div>
                                     <div
                                         class="item-box"
                                         style="opacity: {$DID_tonx ? 1 : 0.3};"
                                     >
                                         <img
                                             class="item"
                                             src={Tonx_id}
                                             alt="OG"
                                             style="filter: {$DID_tonx ? 'drop-shadow(0 0 2px white)' : 'none'};"
                                         />
                                     </div>
                                 </div>
                </div>
                
            </div>











                                 
                                 
            <div on:click={()=>{flipped=false;visible=true;}} class="face back" style="background:#111100; border:none; ">
                                 
                <video 
                        autoplay 
                        loop 
                        muted 
                        playsinline 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;border-radius: 16px;">
                        <source src={CardBack} type="video/mp4" />
                </video>
                <div style="position: absolute; top:220px; width:100vw; margin:56px; background-color:#111000;">
          
                             <Network {main_address} {refer_in_db} {POWER_from_refer} {POWER_of_refer_in_db} {content_adjust}/>
                   
                </div>

                        {#if !POWER_from_refer}
                             <p on:click={shareToTelegram} class="gold-text" style="position: fixed ;top:104px; font-size: 12px;"> Connect your friends on TON.</p>
                        {/if}
        
            </div>

             {#if flipped === true }

                    <div style="position:fixed; width:20px; height:calc(100% - 40px); left:0; top:20px; z-index:100;
                    background: linear-gradient(90deg, #000000, transparent); border: border-radius: 90px;"></div>
                    <div style="position:fixed; width:20px; height:calc(100% - 40px); right:0; top:20px; z-index:100;
                    background: linear-gradient(270deg, #000000, transparent); border: border-radius: 90px;"></div>

                    {#if refer_in_db.length >= 4}
                                 
                         <div style="position: fixed; top:115px ; right:4px; font-size: 12px; z-index:101"> 
                                <Right/></div>
                         <div style="position: fixed; top: 115px; left: 4px; font-size: 12px; transform: scaleX(-1); z-index:101">
                                <Right/></div>
                                 
                    {/if}

             {/if}
        
    </div>
</div>











        <p class="gold-text" style="position:absolute; top:390px; left:40px; color:white; font-size:14px; 
           width:100vw; text-align: left;">
            Friend's TON holdings
        </p>
        <p class="gold-text" style="position:absolute; top:390px; right:40px; color:white; font-size:14px;
           width:100vw; text-align: right;">
             ⚡ + {formatVolume(POWER_from_refer,2)}
        </p>
        
         <p class="gold-text" style="position:absolute; top:430px; left:40px; color:white; font-size:14px; 
            width:100vw; text-align: left;">
            Linkage of Telegram & SBT
         </p>
         <p class="gold-text" style="position:absolute; top:430px; right:40px; color:white; font-size:14px;
            width:100vw; text-align: right;">
              ⚡ + {formatVolume(power_from_tg,2)}
         </p>

    


<button on:click={()=>{alert("Coming soon on alpha v3.");}} class="button-57" style="position:absolute; top:475px;left:40px; right:calc(50vw + 8px); width:auto; height: 56px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 12px;">Link-Up Telegram</span>
</button>
    
<button on:click={()=>{alert("Coming soon on alpha v3.");}}  class="button-57" style="position: absolute; top: 475px; right: 40px; left: calc(50vw + 8px); width: auto; height: 56px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 12px;">Mint / Update SBT</span>
</button>



                                 










{#if showModal}

     <div class="overlay" transition:fade={{ duration: 100, easing: cubicInOut }} on:click={()=>{showModal = false;}}></div>
     <div class="modal" transition:fade={{ duration: 500, easing: cubicInOut }}>
         <p
             style="position:absolute; top:8px;color:gold; font-size:16px; font-weight:700;"
         >
             {modalTitle}
         </p>
         <p
             style="position:absolute; top: 40%; transform: translate(0%, -50%); width:75%;font-size:16px;"
         >
             {modalMessage}
         </p>

         <button class="gold-border pushable"
             on:click={() => {
                 closeModal();
             }}
             style="position:absolute; width:240px; height:56px; bottom:8px;"
         >
             <span class="front" style="position:absolute; width:240px;">{modal_text}</span>
         </button>
     </div>
{/if}