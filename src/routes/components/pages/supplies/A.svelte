<script>
    import Stonfi from "../../icons/A/ston_fi_farm.png";
    import TS_OG from "../../icons/A/ts_og.png";
    import Tonx_id from "../../icons/A/tonx_id.png";
    import Coins from "../components/assets/coins.mp4";
    import Bg from "../components/assets/ton_invest_power_bg.mp4";
    // import Tag from "../../icons/price_tag.png";

    export let invest;
    export let check_stonfi;
    export let check_og;
    export let check_tonx;
    export let A_score;
    
</script>



<p class="gold-text" style="position:absolute; top:128px; left:40px; color:white; font-size:14px;
          width:100vw; text-align: left;">
    On-chain Interactions
</p>
<p class="gold-text" style="position:absolute; top:128px; right:40px; color:white; font-size:14px; 
          width:100vw; text-align: right;">
    ⚡ +{A_score}
</p>

<!-- 滾動條選擇區 -->
<div class="defi">
    
    <div class="item-box" style="opacity:{check_og ? 1 : 0.3};">
        <img class="item" src={TS_OG} alt="ts_og"
            style="border: 1px solid {check_og ? "white" : "none"}; filter: {check_og ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text">TON Soc.</p>
        <p class="item-invest "> (OG Member)</p>
        <p class="item-invest2 gold-text"> + {check_og ? 10 : 0} ⚡</p>
    </div>
    <div class="item-box" style="opacity:{check_stonfi ? 1 : 0.3};">
        <img class="item" src={Stonfi} alt="stonfi"
            style="border: 1px solid {check_stonfi ? "white" : "none"}; filter: {check_stonfi ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text">Ston Fi</p>
        <p class="item-invest "> (LP Farmer)</p>
        <p class="item-invest2 gold-text"> + {check_stonfi ? 10 : 0} ⚡</p>
    </div>
    <div class="item-box" style="opacity:{check_tonx ? 1 : 0.3};">
        <img class="item" src={Tonx_id} alt="ts_og" 
            style="border: 1px solid {check_tonx ? "white" : "none"}; filter: {check_tonx ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text">TONX ID</p>
        <p class="item-invest "> (SBT holder)</p>
        <p class="item-invest2 gold-text"> + {check_tonx ? 10 : 0} ⚡</p>
    </div>

</div>

<p class="gold-text" style="position:absolute; top:332px; left:40px; color:white; font-size:14px; 
      width:100vw; text-align: left;">
    Boost POWER with TON
</p>
<p class="gold-text" style="position:absolute; top:332px; right:40px; color:white; font-size:14px;
      width:100vw; text-align: right;">
        ⚡ +{invest} 
</p>

<!-- TON -> POWER positions here in PowerSupply.svelte-->

<p style="position:absolute; top:462px; left:0px; color:white; font-size:12px; 
      width:100vw; text-align: center;">
    + 1 transaction by investing ⚡🌐
</p>

<p style="position:absolute; top:492px; left:0px; color:white; font-size:12px; 
      width:100vw; text-align: center;">
    + unlimited 🎁 with <span style="font-size:12px; color:#FF4444;">90% off</span> offer
</p>

    <div class="yellow-border" style="position:fixed; border:1px solid #888888 ; border-radius: 80px; width:312px; height:68px; opacity:0.5;
        top:386px; left: 50%; transform: translateX(-50%);"></div>

    <div style="position:fixed; border:2px solid #FFFFFFcc ; border-radius: 80px; width:308px; height:64px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 1));
    top:387px; left: 50%; transform: translateX(-50%); background:linear-gradient(#000000, transparent, transparent ); z-index:3;"></div>

    <div class="gold-border" style="position:fixed; border:1px solid #888888 ; border-radius: 80px; width:308px; height:64px;
        top:388px; left: 50%; transform: translateX(-50%); filter: drop-shadow(0 0 3px rgba(255, 255, 0, 1)); z-index:1;">
    
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
            "
        >
                <source src={Bg} type="video/mp4" />
        </video>
    </div>
    
    <video 
            autoplay 
            loop 
            muted 
            playsinline 
            style="position: absolute; bottom: 180px; left: 50%; transform: translateX(-50%); max-width:80px; height: 80px; object-fit: cover; z-index: 1;border-radius: 16px;">
            <source src={Coins} type="video/mp4" />
    </video>

<p style="position:absolute; top:528px; left:56px; color:white; font-size:12px; opacity: 0.3; 
      width:100vw; text-align: left;">
        $WATT TGE soon
</p>
<p style="position:absolute; top:528px; right:56px; color:white; font-size:12px; opacity: 0.3; 
      width:100vw; text-align: right;">
        POWER -> $WATT
</p>

<div style="left: 50%; transform: translateX(-50%);position:fixed; border:2px solid #FFD700 ; border-radius: 20px; width:308px; height:200px; z-index:0;
            top:400px;  border-top:none;  opacity:1;"></div>

<div class="rotating-border"></div>


<style>
  .rotating-border {
    position: fixed;
    width: 308px;
    height: 240px;
    top: 380px;
    z-index:0;
    left: 50%;
    transform: translateX(-50%);
    opacity:0.5;
    border: 2px solid;
    border-top: none; border-bottom: none;
    border-radius: 40px;
    border-image: linear-gradient(to right, white, yellow) 1;
    background: none;
    animation: borderAnimation 1s linear infinite; /* 使用動畫 */
      /* 使用 mask 模擬圓角效果 */
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-in;
      mask-composite: exclude;
      -webkit-mask-border-radius: 20px; /* 設置圓角 */
  }

  @keyframes borderAnimation {
    0%, 100% {
      border-image-source: linear-gradient(to right, white, yellow, gold, orange);
    }
    25% {
      border-image-source: linear-gradient(to right, yellow, gold, orange, gold);
    }
    50% {
      border-image-source: linear-gradient(to right, gold, orange, gold, yellow);
    }
    75% {
      border-image-source: linear-gradient(to right, orange, gold, yellow, white);
    }
    100% {
      border-image-source: linear-gradient(to right, yellow, white, yellow, gold);
    }
  }
</style>

