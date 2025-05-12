<script>
    import { fade } from "svelte/transition";
    // import { lang } from '../../../../../store.js';
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
    import HSK from "./merchants_logo/hsk.png";
    import True from "./merchants_logo/truemarkets.jpg";
    import PartnersV from "./merchants_logo/partners_vdo.mp4";
    import Coinbase from "./merchants_logo/coinbase.png";
    import Base from "./merchants_logo/base.jpeg";
    import Aced from "./merchants_logo/aced.png";
    import Ourbit from "./merchants_logo/ourbit.png";
    import Ultiland from "./merchants_logo/ultiland.png";
    import CFT from "./merchants_logo/CFTime.jpeg";
    
    export let merchant_list = [
        { link: "https://hsk.xyz/", logo: Coinbase,  },
        { link: "https://app.uniswap.org/?intro=true", logo: Base,  },
        { link: "https://hsk.xyz/", logo: HSK,  },
        { link: "https://app.uniswap.org/?intro=true", logo: Uniswap,  },
        { link: "https://buzz-up.io/", logo: BuzzUp,  },
        { link: "https://www.linkedin.com/company/mattock-technologies-limited/", logo: Mattock,  },
        { link: "https://linktr.ee/monsterblockhk", logo: MB, },
        { link: "https://cftime.io/", logo: CFT, },
        { link: "https://www.ultiland.io/", logo: Ultiland,  },
        { link: "https://www.ourbit.com/", logo: Ourbit,  },
        { link: "https://gfiresearch.net/", logo: Gfi, },
        { link: "https://www.dropsystem.io/", logo: Drop, },
        { link: "https://t.me/UStars_bot?start=BBDD23A8", logo: Ustar, },
        { link: "https://offchain.social/", logo: Offchain, },
        { link: "https://app.truemarkets.org/en/markets", logo: True,  },
        { link: "https://jibchain.net/", logo: JB, },
        { link: "https://www.soundbeats.io/", logo: Soundbeats, },
        { link: "https://www.instagram.com/karsonvocalcoach", logo: Karson,  },
        { link: "https://sosenstudio.com/", logo: Sosen ,  },
        { link: "https://www.lxstudio.co/", logo: LX,  },
        { link: "https://www.sleptbase.ltd/", logo: Sleptbase, },
        { link: "https://www.instagram.com/aced_bar", logo: Aced, },
        { link: "https://www.lockcha.com/", logo: LockCha, },
        { link: "https://www.instagram.com/s.tattoostudio", logo: Stattoo,  },
        { link: "https://www.instagram.com/bar_nook_hk/", logo: Nook,  },
        { link: "https://tonx.ai/", logo: Tonx, },
    ];

</script>


<div transition:fade={{ duration: 150 }}  style="position:fixed; background:linear-gradient( #000000, transparent); height: 20px; width:100vw; top:68px; left:0; z-index:1; "></div>

  <video
    autoplay 
    loop 
    muted 
    playsinline
    style="
        position: fixed; 
        top: 220px;
        left: 50%;
        transform: translate(-50%, -50%);
        width:180vw;
        min-width: 100vw; 
        height: 300px; 
        object-fit: cover;
        border-left: 0px solid;
        border-right: 0px solid;
        border-radius: 16px; 
        overflow: none;
        opacity: 0.1;
        z-index: -1;">
    <source src={PartnersV} type="video/mp4" />
  </video>
    <div transition:fade={{ duration: 150 }}  class="scroll-container">
        {#each merchant_list as merchant}
            <p class="merchant-card ">
                <img src={merchant.logo} alt={merchant.name} class="merchant-logo" />
            </p>
        {/each}
    </div>
    <div transition:fade={{ duration: 150 }}  class="scroll-container2" style="z-index:30;background:linear-gradient(transparent, #00000088, transparent);">
    </div>

<div style="position:fixed; background:linear-gradient(transparent, #000000); height: 24px; width:100vw; top:348px; left:0; z-index:1; "></div>


<style>
    .scroll-container {
        position: fixed;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        background-color: black;
        gap: 5vw;
        padding: 0px;
        overflow-y: auto;
        top:68px;
        height:300px;
        min-height:160px;
        width:100vw;
        opacity: 0.2;
        /* max-width: 400px; */
    }
    .scroll-container2 {
        position: fixed;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        background-color: black;
        gap: 5vw;
        padding: 0px;
        overflow-y: auto;
        top:68px;
        height:300px;
        min-height:160px;
        width:100vw;
        opacity: 1;
        /* max-width: 400px; */
    }

    .merchant-card {
        position: relative;
        width: 16vw;
        height: 16vw;
        max-width: 68px;
        max-height: 68px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .merchant-logo {
        border-radius: 12px;
        width: 16vw;
        height: 16vw;
        max-width: 68px;
        max-height: 68px;
        object-fit: contain;
        transition: transform 0.3s ease;
    }

    .merchant-logo:hover {
        transform: scale(1.2);
    }
</style>