<script>

  import YC from "./team/WYC.jpeg";
  import Nir from "./team/Nir.png";
  import Brian from "./team/Brian.png";
  import Hamed from "./team/Hamed.jpeg";
  import Tonny from "./team/Tonny.png";

  import adobe from "./corp/adobe.jpeg";
  import atfx from "./corp/atfx.jpeg";
  import binance from "./corp/binance.jpeg";
  import dbs from "./corp/dbs.jpeg";
  import hashkey from "./corp/hashkey.jpeg";
  import liquidium from "./corp/liquidium.jpeg";
  import match_system from "./corp/match_systems.jpeg";
  import tvb from "./corp/mytv_super.jpeg";
  import satori from "./corp/satori_research.jpeg";
  import siemens from "./corp/siemens.jpeg";
  import walmart from "./corp/walmart.jpeg";


  let team = [
    { name: "YC Wong", logo: YC , url: "https://wyc-dev.replit.app/",
     describe : "Tech Lead"},
    // { name: "Jay Burgess", logo: JB  , url: "https://jayburgess.site/", 
    //  describe : "Fractional CRO"},
    { name: "Nirjyoti", logo: Nir  , url: "https://www.linkedin.com/in/nirjyoti-gogoi-b0a517232/",
    describe : "Evangelist"},
    { name: "Brian Leung", logo: Brian  , url: "https://www.linkedin.com/in/brian-leung-b06619b0/",
    describe : "Service Manager"},
    { name: "Tonny Ho", logo: Tonny  , url: "",
    describe : "Product Manager"},
    { name: "Hamed Niavand", logo: Hamed  , url: "https://www.linkedin.com/in/hamedniavand/",
    describe : "Evangelist (UAE)"},
    // Add more here
  ];

  let from = [
    { name: "Adobe", logo: adobe },
    { name: "ATFX", logo: atfx   },
    { name: "Binance", logo: binance  },
    { name: "DBS", logo: dbs  },
    { name: "Hashkey", logo: hashkey   },
    { name: "Liquidium", logo: liquidium   },
    { name: "Match Systems", logo: match_system   },
    { name: "TVB", logo: tvb   },
    // { name: "Satori Research", logo: satori   },
    { name: "Siemens", logo: siemens   },
    { name: "Walmart", logo: walmart   },
    // Add more organizations here 
  ];
</script>

<style>
  
  .container2 {
    /* position:absolute;
    top:3340px; */
    width: 80vw;
    min-height: auto;
    margin-top: 40px;
    left: 0;
    z-index: 12;
    background: black;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;

    box-sizing: border-box;
  }

  .item2 {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 8px;
    margin:16px; 
    height: 120px;
    width: 60px;
    text-align: center;
    color: white;
  }

  .logo {
    width: 60px;
    height: 60px;
    border-radius:80px;
    background-size: cover;
    background-position: center;
    margin-bottom: 8px;
  }

  .name {
    font-size: 12px;
    font-weight:700px;
    word-wrap: break-word;
    width: 140px;
  }

  .item3 {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 16px;
    margin-top:0; 
    margin-bottom:-20px; 
    height: 120px;
    width: 40px;
    text-align: center;
    color: white;
  }

  .logo3 {
    width: 40px;
    height: 40px;
    border-radius:60px;
    background-size: cover;
    background-position: center;
    margin-bottom: 8px;
  }

  .name3 {
    font-size: 10px;
    font-weight:700px;
    word-wrap: break-word;
    width: 80px;
  }
</style>

<div class="container2">

  {#each team as { name, logo, url, describe }}
    <div class="item2">
      <div 
        class="gold-border logo" 
        style="background-image: url({logo});"
        alt="{name} logo"
      ></div>
      <div class="name gold-text">{name}</div>
      <div class="name">{describe}</div>
    </div>
  {/each}
  </div>
  <div class="container2" style="margin-bottom: 80px;">

  {#each from as { name, logo }}
    <div class="item3">
      <div 
        class="logo3" 
        style="background-image: url({logo});"
        alt="{name} logo"
      ></div>
      <div class="name3">{name}</div>
    </div>
  {/each}



</div>