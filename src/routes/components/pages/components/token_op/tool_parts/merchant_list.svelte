<script>
    import { fade } from "svelte/transition";
    import { lang } from '../../../../../store.js';
    import Sleptbase from "./merchants_logo/sleptbase.png";
    import Mattock from "./merchants_logo/mattock.png";
    import Nook from "./merchants_logo/nook.png";
    import MB from "./merchants_logo/mb.png";
    import JB from "./merchants_logo/jbchain.png";
    import BuzzUp from "./merchants_logo/buzz.png";
    import Drop from "./merchants_logo/drop.png";
    import Offchain from "./merchants_logo/offchain.jpeg";
    import Karson from "./merchants_logo/karson.jpeg";
    import LockCha from "./merchants_logo/LockCha.jpeg";
    import Sosen from "./merchants_logo/sosen.png";
    import Ustar from "./merchants_logo/ustar.jpg";
    import Gfi from "./merchants_logo/gfi.jpg";
    import Stattoo from "./merchants_logo/s-tattoo.jpeg";
    import LX from "./merchants_logo/lxstudio.png";
    import Uniswap from "./merchants_logo/uniswap.png";
    import Tonx from "./merchants_logo/tonx.jpeg";
    import Soundbeats from "./merchants_logo/soundbeats.jpeg";
    
    export let merchant_list = [
        { link: "https://app.uniswap.org/?intro=true", logo: Uniswap, deposit: true, spend: true},
        { link: "https://buzz-up.io/", logo: BuzzUp, deposit: true, spend: true},
        { link: "https://www.linkedin.com/company/mattock-technologies-limited/", logo: Mattock, deposit: false, spend: true},
        { link: "https://linktr.ee/monsterblockhk", logo: MB, deposit: false, spend: false},
        { link: "https://gfiresearch.net/", logo: Gfi, deposit: false, spend: false},
        { link: "https://www.dropsystem.io/", logo: Drop, deposit: false, spend: false},
        { link: "https://t.me/UStars_bot?start=BBDD23A8", logo: Ustar, deposit: false, spend: false},
        { link: "https://offchain.social/", logo: Offchain, deposit: false, spend: false},
        { link: "https://jibchain.net/", logo: JB, deposit: false, spend: false},
        { link: "https://www.soundbeats.io/", logo: Soundbeats, deposit: false, spend: false},
        { link: "https://www.instagram.com/karsonvocalcoach/profilecard/?igsh=Y3VuYjc4Z3d6d3k5", logo: Karson, deposit: false, spend: true},
        { link: "https://sosenstudio.com/", logo: Sosen , deposit: false, spend: true},
        { link: "https://www.lxstudio.co/", logo: LX, deposit: false, spend: true},
        { link: "https://www.sleptbase.ltd/", logo: Sleptbase, deposit: false, spend: false},
        { link: "https://www.lockcha.com/", logo: LockCha, deposit: false, spend: false},
        { link: "https://www.instagram.com/s.tattoostudio?igsh=dG5rMHZkaWdiZHMx", logo: Stattoo, deposit: true, spend: true},
        { link: "https://www.instagram.com/bar_nook_hk/", logo: Nook, deposit: false, spend: true},
        { link: "https://tonx.ai/", logo: Tonx, deposit: false, spend: false},
        // { name: "Sleptbase C", logo: Sleptbase }
    ];

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0) {
            return 0;
        } else if (value >= 1000000000000000000000) { // 10²¹
            return `${(value / 1000000000000000000000).toFixed(float)} Z`;
        } else if (value >= 1000000000000000000) {    // 10¹⁸
            return `${(value / 1000000000000000000).toFixed(float)} E`;
        } else if (value >= 1000000000000000) {       // 10¹⁵
            return `${(value / 1000000000000000).toFixed(float)} P`;
        } else if (value >= 1000000000000) {          // 10¹²
            return `${(value / 1000000000000).toFixed(float)} T`;
        } else if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(float)} B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000000).toFixed(float)} K`;
        } else if (value) {
            return round(value, float);
        }
    }
</script>

<div
    in:fade={{ duration: 800 }} 
    style="position: absolute; top: 56px; bottom: 120px; height: auto; width: 80vw; min-width: 200px; margin-left: 5vw; border-radius: 16px; border-top: 1.5px solid #333333; background: linear-gradient(#111000, transparent);"
>

    <div style="background:#8CFFFB; width:8px;height:8px; position:absolute;top:40px;left:5vw;border-radius:8px ;"></div> 
    <p style="color:#8CFFFB; width:8px;width:120px; position:absolute;top:28px;left:5vw;">{$lang === "ZH" ? "可儲值" : "Can deposit"}</p>
    <div style="background:#ccacf8; width:8px;height:8px; position:absolute;top:40px;left:calc(5vw + 120px);border-radius:8px ;"></div> 
    <p style="color:#ccacf8; width:8px;width:120px; position:absolute;top:28px;left:calc(5vw + 116px);">{$lang === "ZH" ? "可消費" :"Can spend"}</p>
    <!-- <h3 class="gold-text" style="position: absolute; padding: 0px; color: white; margin-top: 12px; text-align: center; font-size: 16px; margin-left: 16px;"
    >
        Businesses support TOKEN:
    </h3> -->
    <div class="scroll-container">
        {#each merchant_list as merchant}
            <a href={merchant.link} target="_blank" class="merchant-card " in:fade={{ duration: 800 }}>
                <div style="opacity: {merchant.deposit ? 1 : 0.1};background:#8CFFFB; width:8px;height:8px; position:absolute;top:-12px;left:-4px;border-radius:8px ;"></div> 
                <div style="opacity: {merchant.spend ? 1 : 0.1};background:#ccacf8; width:8px;height:8px; position:absolute;top:-12px;left:8px;border-radius:8px ;"></div> 
                <img src={merchant.logo} alt={merchant.name} class="merchant-logo" />
            </a>
        {/each}
    </div>
</div>

<style>
    .scroll-container {
        position: absolute;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
        padding: 20px;
        overflow-y: auto;
        top:80px;
        bottom:0px;
        max-width: 90%;
    }

    .merchant-card {
        position: relative;
        width: 40px;
        height: 40px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .merchant-logo {
        border-radius: 12px;
        width: 40px;
        height: 40px;
        object-fit: contain;
        transition: transform 0.3s ease;
    }

    .merchant-logo:hover {
        transform: scale(1.5);
    }
</style>