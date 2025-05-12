<script>
  import { onMount, onDestroy } from "svelte";
  export let coin_name;
  export let user_address;
  import C01N_logo from "../tokens/C01N.png";
  import Atomic from "../assets/atomic.mp4";
  import TxBg from "../assets/tx.mp4";
  import ID from "../assets/DID.mp4";
  import Load from "./tool_parts/loading/loading.svelte";
  import BackButton from "./tool_parts/BackButton.svelte";
  import INFO_table from "./tool_parts/c01n_info_table.svelte";
  import { ethers } from "ethers";
  import { fade, scale, blur } from "svelte/transition";
  import { Provider, C01NStaking, TotalStaker, UserETH, User_C01N, User_TOKEN, TOKENStaked, C01NStaked, C01NSupply, BASE, lang, C01NContractAddress, C01NABI, TOKENContractAddress } from '../../../../store.js';
  let statusInterval = null;
  let operation = "INFO";
  let op_color = "#CCCCCC";
  let isMounted = true;
  let checkedStaking = false;
  
  $: linkColor = op_color;
  $: stakingInfo = $C01NStaking ? $C01NStaking : [false, 0, "0", "0", 0];

  // Initialize contract
  const C01N_contract = new $BASE.eth.Contract($C01NABI, $C01NContractAddress);
  $: InfoButtonText = $lang === "EN" ? "Get TOKEN to stake" : "取得 TOKEN 進行質押";
  $: StakeButtonText = $lang === "EN" ? "PoR Quantum Staking" : "資產認證量子質押";
  $: UnstakeButtonText = $lang === "EN" ? `Unstake for ${formatVolume(contract_reward,1)} C01N` : `解押獲取 ${formatVolume(contract_reward,1)} C01N`;
  $: StakingText = stakingInfo[0] === false 
      ? StakeButtonText 
      : UnstakeButtonText;
  $: C01N_info1 = $lang === "EN" 
    ? "Transmit and authenticate wallet status<br/>to find C01N in the parallel universe" 
    : "傳輸並驗證錢包狀態<br/>在平行宇宙中挖掘 C01N";
  $: C01N_staking1 = $lang === "EN" 
    ? `Found ${formatVolume(theoretical_reward,3)} C01N in parallel universe<br/>Hold at least ${formatVolume(stakingInfo[2],1)} TOKEN & ${formatVolume(stakingInfo[3],1)} C01N to unstake` 
    : `在平行宇宙挖掘到 ${formatVolume(theoretical_reward,3)} C01N<br/>請持有最少 ${formatVolume(stakingInfo[2],1)} TOKEN & ${formatVolume(stakingInfo[3],1)}  C01N 解除質押`;
  $: walletStatus = $lang === "EN" ? "User wallet status :" : "目前用戶錢包狀態 :"
  $: stakingStatus = $lang === "EN" ? "User staking status :" : "目前用戶質押狀態 :"
  $: C01N_info2 = $lang === "EN" 
    ? "After staked, all assets in wallet can still be used freely. You are just required to have the same amount or more TOKEN and C01N when unstake for the C01N reward."
    : "質押後 - 您錢包中所有資產均可自由使用<br/>只需要在取消質押並獲得 C01N 獎勵時<br/>持有相同數量或更多的 TOKEN 及 C01N";
  let math1 = $lang === "EN" 
    ? "User's staking <span style='font-size:10px;color:gold;'>x</span> Duration <span style='font-size:10px;color:gold;'>x</span> C01N Supply"
    : "用戶質押量 <span style='font-size:10px;color:gold;'>x</span> 質押時長 <span style='font-size:10px;color:gold;'>x</span> C01N 流通量" ;
  let math2 = $lang === "EN" 
    ? "Total staking <span style='font-size:10px;color:gold;'>x</span> Stakers <span style='font-size:10px;color:gold;'>x</span> Year in Sec"
    : "總質押量 <span style='font-size:10px;color:gold;'>x</span> 質押用戶 <span style='font-size:10px;color:gold;'>x</span> 一年的秒數" ;
  let C01N_reward_explain = $lang === "EN" 
    ? "* Theoretical reward value is for reference only, the real  C01N PoR staking reward calculation has a minimum time threshold. Regardless of the TOKEN & C01N amount staked, at least 100,000,000 seconds (approximately 1158 days) must be staked to receive the reward."
    : "* 「理論獎勵值」只用作參考，真實的 C01N 獎勵計算設有最低時間閥值，不論 TOKEN & C01N 的 PoR 質押數量，同樣最少需要質押 100,000,000 秒 (繼約 1158 日) 以獲得獎勵；" ;
  let C01N_reward_explain2 = $lang === "EN" 
    ? "The final calculation is based on the 'calculateReward' function of the C01N open-source contract code."
    : "最終計算以 C01N 公開合約代碼的 'calculateReward' 函數作準。" ;
  let timstampNow = 0;

  $: Duration = Number(stakingInfo[1]) === 0 ? 0 : timstampNow - Number(stakingInfo[1]);
  $: Days_left = Duration ? convertSecondsToDays(100000000 - Duration) : 0 ;
  $: contract_reward = 0;
  $: theoretical_reward = stakingInfo && $C01NSupply && $TOKENStaked && $C01NStaked && $TotalStaker
    ? ((Number(stakingInfo[2]) + Number(stakingInfo[3])) * Duration * Number($C01NSupply)) 
      / ((Number($TOKENStaked) + Number($C01NStaked)) * Number($TotalStaker) * 31536000)
    : 0;
  // $: reward = contract_reward 
  //   ? contract_reward
  //   : theoretical_reward;
  let showDetailedFormula = false;
  let lastTxHash;
  let Hash;
  let fill = "white";

  const resetStakingData = () => {
      C01NStaking.set([false, 0, 0, 0, 0]);
      TotalStaker.set(0);
      TOKENStaked.set(0);
      C01NStaked.set(0);
      C01NSupply.set(0);
      // console.log("Staking data reset to initial values.");
  };

  function openUniswapTab() {
      window.open(`https://app.uniswap.org/swap?inputCurrency=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&outputCurrency=${$TOKENContractAddress}&chain=base`, '_blank');
  }

  function updateLinkColor(color) {
    fill = color;
    const linkElement = document.querySelector(".tx-hash-link");
    if (linkElement) {
      linkElement.style.color = color;
    }
  }

  function getCurrentTimestamp() {
    timstampNow = Math.floor(Date.now() / 1000);
    // console.log(timstampNow);
  }

  function convertSecondsToDays(secs) {
    return Math.floor(secs / (60 * 60 * 24)); // 86,400 seconds in a day
  }

  const checkC01NStatus = async () => {
    
    if (!isMounted) return;
    
    try {
      await fetchStakingInfo();

      if (!$C01NStaked || !$C01NSupply) {
        await new Promise(resolve => setTimeout(resolve(fetchC01NStats()), 2000));
      }
      if (!$TotalStaker) {
        await new Promise(resolve => setTimeout(resolve(fetchStakerInfo()), 1000));
      }
      if (contract_reward === 0) {
        await new Promise(resolve => setTimeout(resolve(fetchReward()), 3000));
      }
      
    } catch (error) {
      // if (isMounted) console.error("Error in checkC01NStatus:", error);
    }
  };

  async function PoR() {
    lastTxHash = $lang === "EN" ? "Approving PoR Operation" : "簽署核准認證質押操作";
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TOKEN_tx = new ethers.Contract($C01NContractAddress, $C01NABI, signer);
        const C01N_amount_wei = ethers.parseUnits($User_C01N.toString(), 18);
        const TOKEN_amount_wei = ethers.parseUnits($User_TOKEN.toString(), 18);
        const tx = await TOKEN_tx.PoR_staking(C01N_amount_wei, TOKEN_amount_wei);
  
        updateLinkColor("#FFD700");
        await tx.wait();
        Hash = tx.hash;
        lastTxHash = $lang === "EN" ? "PoR Operation Confirmed" : "認證質押操作已完成";
        updateLinkColor("#22FF22");
    } catch (error) {
        if (!$UserETH) {
          lastTxHash = $lang === "EN" ? "Deposit ETH for Gas" : "存入 ETH 繳付鏈上費用";
          updateLinkColor("#FF2222");
        } else {
          lastTxHash = $lang === "EN" ? "Transaction Canceled" : "操作交易已取消";
          updateLinkColor("#FF2222");
        }
    } finally {
      resetStakingData();
      try {
        await Promise.all([
          fetchStakingInfo(),
          new Promise((resolve) => setTimeout(() => resolve(fetchC01NStats()), 1500)),
          new Promise((resolve) => setTimeout(() => resolve(fetchStakerInfo()), 3000)),
        ]);
      } catch (error) {
        // console.error("Error in post-transaction fetches:");
      }
      operation = "INFO";
      op_color = "#CCCCCC";
      setTimeout(() => {
        lastTxHash = "";
        updateLinkColor("#FFD700");
      }, 5000);
    }
  }

  const fetchStakingInfo = async () => {
    if (checkedStaking) { return; }
    try {
      const stakingInfo = await C01N_contract.methods.stakingInfo(user_address).call();
      const convertedStakingInfo = [
        stakingInfo[0], // boolean
        Number(stakingInfo[1] || 0), // timestamp
        parseFloat(ethers.formatUnits(stakingInfo[2] || 0, 18)).toFixed(4), // TOKEN amount
        parseFloat(ethers.formatUnits(stakingInfo[3] || 0, 18)).toFixed(4), // C01N  amount
        Number(stakingInfo[4] || 0), // other field
      ];
      C01NStaking.set(convertedStakingInfo);
      if (convertedStakingInfo[0] === true){
        checkedStaking = true;
      } else {
        checkedStaking = false;
      }
      // console.log("Converted staking info:", convertedStakingInfo);
    } catch (error) {
      // console.error("Error fetching staking info:", error);
    }
  };

  const fetchStakerInfo = async () => {
    if ($TotalStaker) { return; }
    try {
      const StakerAmount = await C01N_contract.methods.totalStaker().call();
      TotalStaker.set(Number(StakerAmount || 0));
      // console.log("Total stakers:", Number(StakerAmount || 0));
    } catch (error) {
      // console.error("Error fetching staker info:", error);
    }
  };

  const fetchReward = async () => {
    if (!Duration || ($User_C01N && $User_TOKEN)) { return; }
    try {
      const C01N_amount_wei = ethers.parseUnits($User_C01N.toString(), 18);
      const TOKEN_amount_wei = ethers.parseUnits($User_TOKEN.toString(), 18);
      const contract_reward_wei 
        = await C01N_contract.methods.calculateReward(C01N_amount_wei, TOKEN_amount_wei, Duration).call();
      contract_reward= parseFloat(ethers.formatUnits(contract_reward_wei || 0, 18)).toFixed(4);
      // console.log("Total C01N reward from contract:", Number(contract_reward || 0));
    } catch (error) {
      // console.error("Error fetching staker info:", error);
    }
  };

  const fetchC01NStats = async () => {
    if ($C01NStaked && $C01NSupply){
        return;
    }
    try {
      const [totalStakingTOKEN, totalStakingC01N, totalSupply] = await Promise.all([
        C01N_contract.methods.totalStakingTOKEN().call(),
        C01N_contract.methods.totalStakingC01N().call(),
        C01N_contract.methods.totalSupply().call(),
      ]);
      const convertedTOKEN = parseFloat(ethers.formatUnits(totalStakingTOKEN || 0, 18)).toFixed(4);
      const convertedC01N = parseFloat(ethers.formatUnits(totalStakingC01N || 0, 18)).toFixed(4);
      const convertedSupply = parseFloat(ethers.formatUnits(totalSupply || 0, 18)).toFixed(4);
      TOKENStaked.set(convertedTOKEN);
      C01NStaked.set(convertedC01N);
      C01NSupply.set(convertedSupply);
      // console.log("Converted C01N stats:", { totalStakingTOKEN: convertedTOKEN, totalStakingC01N: convertedC01N, totalSupply: convertedSupply });
    } catch (error) {
      // console.error("Error fetching C01N stats:", error);
    }
  };

  function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }

  function formatVolume(value, float) {
    if (!value || isNaN(value) || value == null || value == 0) {
      return 0;
    } else if (value >= 1000000000000000000000) {
      return `${(value / 1000000000000000000000).toFixed(float)} Z`;
    } else if (value >= 1000000000000000000) {
      return `${(value / 1000000000000000000).toFixed(float)} E`;
    } else if (value >= 1000000000000000) {
      return `${(value / 1000000000000000).toFixed(float)} P`;
    } else if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(float)} T`;
    } else if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(float)} B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000000).toFixed(float)} M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(float)} K`;
    } else if (value) {
      return round(value, float);
    }
  }

  onMount(async () => {
    isMounted = true;
    resetStakingData();
    getCurrentTimestamp();
    new Promise((resolve) => {
        setTimeout(() => resolve(fetchStakingInfo()), 1000);
    });

    statusInterval = setInterval(checkC01NStatus, 3000);
    const toggleInterval = setInterval(() => {
      showDetailedFormula = !showDetailedFormula;
    }, 5000);
    return () => {
      isMounted = false;
      clearInterval(statusInterval);
      clearInterval(toggleInterval);
      statusInterval = null;
    };
  });

  onDestroy(() => {
    isMounted = false;
    checkedStaking = false;
    resetStakingData();
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = null;
    }
    if (typeof window.gc === 'function') {
      window.gc();
    }
  });
</script>



{#if lastTxHash }

  <div style="position:fixed; top:0px; left:0; bottom:0; z-index: 999; 
    height:auto; width:100vw; background: #000000; ">
  
      <video
        autoplay 
        loop 
        muted 
        playsinline transition:blur={{ duration: 150 }} 
        style="
            position: fixed; 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 100vw; 
            min-height: 100vh; 
            object-fit: cover;
            border-left: 0px solid;
            border-right: 0px solid;
            border-radius: 16px; 
            z-index: 1100;">
        <source src={TxBg} transition:blur={{ durFation: 300 }}  type="video/mp4" />
      </video>

        <button on:click={()=>{lastTxHash = "";}}
          style="
            position: fixed;
            background: transparent;
            border: none;
            padding: 0;
            top: 12px;
            height:32px; width:24px;
            left: calc(10vw + 0px);
            z-index: 29;
            cursor: pointer;
            z-index: 1300;
          "
        >
          <BackButton/>
        </button>
    
        <img
          src={C01N_logo}
          alt="C01N_logo"
          style="
            position: fixed;
            background: transparent;
            border: none;
            padding: 0;
            top: 18px;
            height:28px;
            right: calc(10vw + 0px);
            z-index: 999;
            cursor: pointer;
            z-index: 1300;
          "
        />
  
        <!-- 🎉 文字內容，放在影片上方，置中顯示 -->
        <div transition:fade={{ duration: 150 }}  style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          width:90vw;
          z-index: 1200;
        ">
  
            <div style="position: fixed; width:90vw; left:0; margin-top:-32px;"> <Load {fill}/> </div>
  
            <!-- 🎉 成功訊息 -->
            <p
                transition:fade={{ duration: 150 }}
                href="https://basescan.org/tx/{Hash}"
                target="_blank"
                class="tx-hash-link"
                style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:0px; font-size: 16px; font-weight: bold; color: {fill};filter: drop-shadow(0 0 4px {fill}11);"
            >
                  {#each lastTxHash.split('') as char, i}
                    <span class="gold-text" style="font-size: 16px; font-weight: bold; color: {fill};filter: drop-shadow(0 0 4px {fill}11);" transition:fade={{ delay: i * 50, duration: 0 }}>
                        {#if char === ' '}&nbsp;{:else}{char}{/if}</span>
                  {/each}
            </p>
  
                <a
                  href="https://basescan.org/tx/{Hash}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="white-space: pre; position: absolute; width:90vw; left:0; margin-top:36px; color: {fill}; font-size: 14px; text-decoration: underline;"
                >
                    <span style="font-size: 12px; font-weight: bold; color: #888888;filter: drop-shadow(0 0 4px {fill}11);">
                        View on BaseScan</span>
                </a>
        </div>
    
    </div>
  
{:else}

  <div style="position:fixed; top:0px; left:0; z-index: 999; 
    height:100vh; width:100vw; background: #000000; ">

      <!-- 頂層部分 -->
      <button
        style="
          position: fixed;
          background: transparent;
          border: none;
          padding: 0;
          top: 14px;
          right: calc(10vw + 0px);
          z-index: 29;
          cursor: pointer;
        "
      >
        <img
          src={C01N_logo}
          alt="C01N_logo"
          role="presentation"
          style="
            width: 28px;
            height: 28px;
            border-radius: 56px;
            pointer-events: none;
          "
        />
      </button>
  
          <button
            style="
              position: fixed;
              background: transparent;
              border: none;
              padding: 0;
              top: 12px;
              height:32px; width:24px;
              left: calc(10vw + 0px);
              z-index: 29;
              cursor: pointer;
            "
          >
            <BackButton/>
          </button>


        
        <div transition:blur={{ duration: 150 }}
          style="position:fixed; width:90vw; min-width:240px; filter: drop-shadow(0 0 8px #FFD70022); border-top: 1.5px solid {operation === "STAKE" ? "#FFFF0044" : "#444444"};background:linear-gradient(#111111, transparent);
              top:60px; bottom:120px; left:5vw; height:auto; margin:auto; border-radius: 28px; overflow-y: auto;cursor:pointer;"
        >


            <!-- The function box -->
            <div 
              transition:fade={{ duration: 150 }} 
              style="
                z-index: 300; 
                position: absolute; 
                top: 20px; 
                width: 80vw; 
                margin-left: 5vw; 
                height: 24px; 
                min-width: 200px; 
                display: flex; 
                align-items: center; 
                justify-content: space-between;"
            >
              {#each [
                    { name: "INFO", color: "#CCCCCC" },
                    { name: "STAKE", color: "#FFD700" }
              ] as btn}
                <button 
                  on:click={() => { 
                    operation = btn.name; 
                    op_color = btn.color; 
                  }}
                  class="nav-button"
                  transition:fade={{ duration: 150 }}
                  style="
                        flex: 1; /* 每個按鈕平分空間 */
                        width: 16vw; /* 確保每個按鈕不會太寬 */
                        color: {operation == btn.name ? '#000000' : btn.color};
                        font-weight: 800;
                        font-size: 12px;
                        margin-top: 0px;
                        height: 32px; 
                        border-radius: 16px;
                        border: none;
                        border-bottom: 2px solid #00000088;
                          background: {operation == btn.name 
                              ? `radial-gradient(circle, white 0%, ${op_color} 100%)` 
                              : 'transparent'};
                        opacity: {operation == btn.name ? '1' : '0.33'};
                        in: background 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out;
                        white-space: nowrap;  
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                  "
                >
                  <span style="margin-top:6px;color: {operation == btn.name ? '#000000' : btn.color};
                               font-weight: 700;
                               font-size: 14px;">
                            {btn.name === "INFO" 
                                ? ($lang === "ZH" ? "資訊" : "INFO")
                                : btn.name === "STAKE"
                                ? ($lang === "ZH" ? "質押" : "STAKE")
                                :""}

                            </span>
                </button>
              {/each}
            </div>




          {#if operation === "INFO"}
            
              <div transition:blur={{ durFation: 300 }}>                
                  <INFO_table {coin_name}/>
              </div>

          {:else}

              <div transition:fade={{ duration: 150 }} class={stakingInfo[0] === false ? "no-rgb-border gold-border2" : "rgb-border"} style="filter: drop-shadow(0 0 2px {op_color});">
                
                <div transition:fade={{ duration: 300 }} style="position:absolute; width:100%; height:100%; top:0; background: black; z-index: -2;"></div>
                    <video transition:fade={{ duration: 300 }} 
                      autoplay 
                      loop 
                      muted 
                      playsinline 
                      style="
                          position: absolute; 
                          width: 100%; 
                          height: 90%; 
                          max-width: 500px;
                          top: 55%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          object-fit: cover;
                          bottom:0;
                          object-fit: cover;
                          border-radius: 34px; 
                          opacity:{stakingInfo[0] === false ? 0.3 : 1};
                          z-index: -1;
                      "
                    >
                      <source src={Atomic} type="video/mp4" />
                    </video>
  
                    <p class="gold-text" style="font-size:16px; position:absolute; top:8px; width:100%; z-index: 100 ;">
                        {$lang === "EN" ? "Proof of Reserves Staking" : "資產認證質押" }</p>
                    
                    <div transition:fade={{ duration: 600 }} style="position:absolute; top:0; left: 50%; z-index: 100 ;
                          transform: translate(-50%, 0%);
                          width:260px; height:300px;">
                      
                          <p class="rgb-text" style="font-size:10px; font-weight: 500; color:gold; filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 1));position:absolute; top:44px; width:100%; right:0; text-align: center;">
                            {@html stakingInfo[0] === false ? C01N_info1 : C01N_staking1} </p>
                          <p style="font-size:12px; font-weight: 500; color:#ffffff; filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 1));position:absolute; top:90px; width:100%; right:0; text-align: center;">
                            {stakingInfo[0] === false ? walletStatus : stakingStatus} </p>
                          <p class={stakingInfo[0] === false ? "" : "rgb-text"} style="font-size:20px; font-weight: 700; color:gold; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));position:absolute; top:126px; width:45%; left:0; text-align: right;">
                            {stakingInfo[0] === false ? formatVolume($User_TOKEN,1) : formatVolume(stakingInfo[2],1)} </p>
                          <p class={stakingInfo[0] === false ? "" : "gold-text"} style="color:#FFFF00; font-size:16px; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));position:absolute; top:130px; width:45%; right:0; text-align: left;">
                              TOKEN</p>
                          <p class={stakingInfo[0] === false ? "" : "rgb-text"} style="font-size:20px; font-weight: 700; color:gold; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));position:absolute; top:166px; width:45%; left:0; text-align: right;">
                            {stakingInfo[0] === false ? formatVolume($User_C01N,1) : formatVolume(stakingInfo[3],1)} </p>
                          <p class={stakingInfo[0] === false ? "" : "gold-text"} style="color:#FFFF00; font-size:16px; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));position:absolute; top:170px; width:45%; right:0; text-align: left;">
                              C01N</p>
                          <p style="font-size:9px; font-weight: 400; color:#ffffff; filter: drop-shadow(1px 1px 4px rgba(0, 0, 0, 1));position:absolute; top:220px; width:100%; right:0; text-align: center;">
                            {@html C01N_info2} </p>
                      
                    </div>
                      
              </div>



            <div transition:fade={{ duration: 150 }} style="position:absolute; top:350px; left: 50%; background: transparent;  z-index: 200 ;
                transform: translate(-50%, 0%);
                width:300px; height:80px;">
  
                <p class="gold-text" style="font-size:14px;position:absolute; top:22px; left:12px;">
                  {$lang === "EN" ? "Reward" : "獎勵計算"} = </p>

                {#if showDetailedFormula}
                    <div transition:fade={{ duration: 600 }}>
                        <p style="font-size:10px; position:absolute; top:12px; right:2px; width:65%; left:30%;">
                          ((<span class="rgb-text" style="font-size:12px;">{formatVolume(parseFloat(stakingInfo[2]), 0)}</span>
                          + <span class="rgb-text" style="font-size:12px;">{formatVolume(parseFloat(stakingInfo[3]), 0)}</span>)
                          x <span class="rgb-text" style="font-size:12px;">{formatVolume(Duration, 0)}</span>
                          x <span class="rgb-text" style="font-size:12px;">{formatVolume(parseFloat($C01NSupply), 0)}</span>)
                        </p>
                        <div style="width:220px;height:1px; background:white; position:absolute; top:36px; width:65%; left:30%;"></div>
                        <p style="font-size:10px; position:absolute; top:36px; right:4px; width:65%; left:30%;">
                          ((<span class="rgb-text" style="font-size:12px;">{formatVolume(parseFloat($TOKENStaked), 0)}</span>
                          + <span class="rgb-text" style="font-size:12px;">{formatVolume(parseFloat($C01NStaked), 0)}</span>)
                          x <span class="rgb-text" style="font-size:12px;">{$TotalStaker}</span>
                          x <span class="rgb-text" style="font-size:12px;">31.5 M</span>)
                        </p>
                        <p class="gold-text" style="font-size:14px;position:absolute; top:60px; left:72px; width:75%; text-align:left;">
                          = <span class="rgb-text" style="font-size:20px;margin-left:8px;margin-right:8px;">{formatVolume(parseFloat(contract_reward),4)}</span> C01N 
                          {#if Days_left > 0}
                            <span class="rgb-text" style="font-size:12px;margin-left:8px;margin-right:8px;color:#FFD70088;">( {Days_left} Days left )</span>
                          {/if}
                        </p>
                        <span style="position:absolute; top:90px; left:72px; color:#666666; font-size: 12px; margin-left:0; width: 180px;text-align:left;"> 
                          {$lang === "EN" ? "Historical Minted : " + formatVolume(parseFloat(stakingInfo[4]),4) : "歷史鑄造數量 : " + formatVolume(parseFloat(stakingInfo[4]),4)} </span>
                        <span style="position:absolute; top:110px; left:72px; color:#FFD70088; font-size: 12px; margin-left:0; width: 200px;text-align:left;"> 
                          {$lang === "EN" ? "Theoretical Reward : " + formatVolume(theoretical_reward,4) : "理論獎勵值 : " + formatVolume(theoretical_reward,4)} *</span>
                    </div>
                {:else}
                      <div transition:fade={{ duration: 600 }}>
                          <p style="font-size: {$lang === "EN" ? "10px" : "12px"} ;position:absolute; top:12px; right:2px; width:68%; left:30%;">
                            {@html math1}
                          </p>
                          <div style="width:220px;height:1px; background:white; position:absolute; top:36px; width:68%; left:30%;"></div>
                          <p style="font-size: {$lang === "EN" ? "10px" : "12px"} ;position:absolute; top:36px; right:4px; width:68%; left:30%;">
                            {@html math2}
                          </p>
                          <p class="gold-text" style="font-size:14px;position:absolute; top:60px; left:72px; width:75%; text-align:left;">
                            = <span class="rgb-text" style="font-size:20px;margin-left:8px;margin-right:8px;">{formatVolume(parseFloat(contract_reward),4)}</span> C01N 
                          </p>
                          <span style="position:absolute; top:90px; left:72px; color:#666666; font-size: 12px; margin-left:0; width: 180px;text-align:left;"> 
                            {$lang === "EN" ? "Historical Minted : " + formatVolume(parseFloat(stakingInfo[4]),4) : "歷史鑄造數量 : " + formatVolume(parseFloat(stakingInfo[4]),4)} </span>
                          <span style="position:absolute; top:110px; left:72px; color:#FFD70088; font-size: 12px; margin-left:0; width: 200px;text-align:left;"> 
                            {$lang === "EN" ? "Theoretical Reward : " + formatVolume(theoretical_reward,4) : "理論獎勵值 : " + formatVolume(theoretical_reward,4)} *</span>
                      </div>
                {/if}
                  
            </div>

            <p transition:fade={{ duration: 150 }} style="position:absolute; top:500px; color:#FFD70088; font-size: 10px; left:5vw; width: 80vw;text-align:left;height:160px;"> 
              {C01N_reward_explain} <a style="font-size: 10px; color:#FFD700 " href="https://basescan.org/address/0x547d38746207443cbe6d9fab37e20249e14f0d22#readContract" target="_blank" >{C01N_reward_explain2}</a></p>
            
          {/if}

        </div>

          <div  style="position:fixed; width:90vw; min-width:240px; background:linear-gradient(transparent, #000000);  z-index: 300 ;
          bottom:120px; left:5vw; height:10px; margin:auto; overflow-y: auto;cursor:pointer;">
              <!-- 這是 bottom button 上方的漸變 -->
          </div>

      </div>
  
          <button 
            disabled={(!$C01NStaking || !$TotalStaker) 
                      || ((User_C01N < stakingInfo[3] || User_TOKEN < stakingInfo[2]) && operation === "STAKE") }
            on:click={()=>{
                    if (operation === "STAKE"){
                        PoR();
                    } else {
                        openUniswapTab();
                    }}} 
            transition:fade={{ duration: 150 }} class="main_button_tx pushable button-11 gold-border"
                     style=" background:linear-gradient(#8CFFFB44, #ccacf844);  position: fixed; bottom:48px;
                      font-weight: 700; cursor: pointer; z-index:3000;">
                    <div class="button-11__content" transition:fade={{ duration: 150 }}  style="filter: drop-shadow(0 0 2px #FFD700);">
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
                              margin:-2px;
                              opacity:1;
                              z-index:-1;">
                            <source src={ID} type="video/mp4" />
                          </video>
                              <p style="position:absolute;white-space: nowrap;top:4px; width:100%;font-size: 16px; font-weight: 600;">
                                  {operation === "INFO" ? InfoButtonText : StakingText}</p>
                    </div>
          </button>

{/if}

<a href="https://skynet.certik.com/tools/token-scan/base/0x547D38746207443CBE6d9fAB37e20249e14F0D22/" target="_blank"  transition:fade={{ duration: 150 }}
   style=" position: fixed; color: {op_color}88; font-size: 12px; font-weight: 600; z-index:1300;
          bottom: 12px; display: block; text-align: center; width:100vw; left:0;">
  {$lang === "EN" ? "C01N Contract Scan on Skynet by Certik" : "C01N 在 Certik 天網的代碼漏洞掃描"}
</a>