<script>

    import Logic from "./tokens/TOKEN_logic.png";
    import Deposit from "./tokens/1.png";
    import Spend from "./tokens/2.png";
    import Permit101 from "./tokens/permit101.png";
    import Permit101zh from "./tokens/permit101zh.png";
    import TOKEN_flow from "./tokens/TOKEN_flow.png";
    import earth from "./assets/ton_invest_power_bg.mp4";
    import Open from "./assets/open.svelte";
    import Close from "./assets/close.svelte";
    import ID from "./assets/DID.mp4";
    import Org from "./Organizations.svelte";
    import { lang , TOKENContractAddress } from '../../../store.js';
    import { slide } from "svelte/transition";
    import System from "./system.mp4";
    import { onMount, onDestroy } from 'svelte';
    import BackButton from "./token_op/tool_parts/BackButton.svelte";
    import Translate from "./token_op/tool_parts/Translate.svelte";

    let table_height_add = 280;
    $: topic = "";

      function toggleTable() {
          if (table_height_add === 0){
              table_height_add = 260;
          } else {
              table_height_add = 0;
          }
      }

      // 新增一個控制按鈕透明度的變量
      let buttonOpacity = 1;

      // 新增一個綁定滾動容器的參考變量
      let scrollContainer;

      // 定義一個變數來儲存視窗寬度
      let windowWidth = 0;

      // 定義一個函數根據容器的 scrollTop 更新透明度（scrollTop = 0 時，opacity = 1；scrollTop = 100 時，opacity = 0）
      function updateButtonOpacity() {
        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
        buttonOpacity = Math.max(0, 1 - scrollTop / 100);
      }

    onMount(() => {
        // Preload images
        const imagesToPreload = [
            Logic,
            Deposit,
            Spend,
            Permit101,
            Permit101zh,
            TOKEN_flow
        ];

        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        // Existing onMount logic
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updateButtonOpacity);
        }
        windowWidth = window.innerWidth;
        const handleResize = () => {
            windowWidth = window.innerWidth;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', updateButtonOpacity);
            }
            window.removeEventListener('resize', handleResize);
        };
    });

    $: isWide = windowWidth > 600;

    
      onDestroy(() => {
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', updateButtonOpacity);
        }
      });



      // 定義文本映射表
        const translations = {
            EN: {
                topic1: "How to use Permit ?",
                topic2: "Ecosystem Overview",
                topic3:"Committed by Leaders",
                topic4:"New chapter of Pay-Fi",
                p4: "TOKEN : A seamless on-chain payment experience without gas fees.",
                p5:"▫️ ~ 7.8 TOKEN : 1 USDC liquidty backed. <br> ▫️ Easily secure instant transactions. <br> ▫️ Maximise discounts and rewards. <br> ▫️ Transactions are fully on BASE.",
                p2: "Demonstrating the mutual benefits between merchants and consumers through the power of Web3.<br /><br/><span style='font-size:12px;font-weight:700;color:#444444; '>(Tap to expand the flow chart)</span>",                
                launch: "Launch your token efficiently",
                onboard: "Obtain consumers & funds from Web3",
                contract: "TOKEN open source smart contract",
                connectToBlockchains: "Connect to Blockchains",
                selectCoin: "Choose Token for Operations",
                moreDetails: "More details on Gitbook",
                application: "Bring consumers to business",
                exit: "Exit / Disconnect",
            },
            ZH: {
                topic1: "如何使用 Permit ?",
                topic2: "Permit 生態佈局",
                topic3:"由 Web3 專員執行承諾",
                topic4:"支付金融的革新",
                p4: "TOKEN : 瞬時免 Gas 鏈上支付體驗 ",
                p5:"▫️ ~ 7.8 通證幣 : 1 USDC 流動性支撐 <br> ▫️ 瞬時鏈上資產操作 <br> ▫️ 最大化會員優惠回贈 <br> ▫️ 交易均在 BASE 鏈進行",
                p2:"透過 Web3 的代幣經濟促進商戶與消費者之間的消費及金融互動 - 達致互惠互利 <br /><br /><span style='font-size:12px;font-weight:700;color:#444444;'>(按下放大流程圖)</span>",
                launch:"一站式代幣發行上架及營運",
                onboard: "從 Web3 獲取消費力及資金",
                contract: "檢閱 TOKEN 智能合約公開代碼",
                connectToBlockchains: "挑選區塊鏈並連接錢包",
                selectCoin: "選擇代幣種類購買 / 出售 / 運用",
                moreDetails: "更多業務訊息請查看 Gitbook",
                application: "把資金和消費力帶進業務",
                exit: "退出 / 登出",
            },
        };

      // 定義一個響應式的 langText 變量，用於存儲當前語言的翻譯
      $: langText = translations[$lang];

      // 切換語言的函數
      function toggleLanguage() {
        lang.set($lang === "EN" ? "ZH" : "EN")
      }

    // function toggleSize() {
    //     const img = document.getElementById("toggleImage");
    //     if (img.style.width === "90vw" && !isWide) {
    //         img.style.width = "300vw"; // 放大，導致橫向滾動
    //         img.style.height = "auto"; // 高度不變
    //     } else {
    //         img.style.width = "90vw"; // 回復
    //         img.style.height = "auto";
    //     }
    // }
    function toggleSize2() {
        const img = document.getElementById("toggleImage2");
        if (img.style.width === "90vw" && !isWide) {
            img.style.width = "200vw"; // 放大，導致橫向滾動
            img.style.height = "auto"; // 高度不變
        } else {
            img.style.width = "90vw"; // 回復
            img.style.height = "auto";
        }
    }
    function toggleSize3() {
        const img = document.getElementById("toggleImage3");
        if (img.style.width === "90vw" && !isWide) {
            img.style.width = "160vw"; // 放大，導致橫向滾動
            img.style.height = "auto"; // 高度不變
        } else {
            img.style.width = "90vw"; // 回復
            img.style.height = "auto";
        }
    }
    
    
</script>


<style>
        :global(body) {
        margin: 0;
        overflow: hidden;
        }
        
        .canvas3d {
          background: black;
          /* left: 50%;
          transform: translateX(-50%); /* 将元素移动到屏幕中心 */ 
          width: 80%;
          margin-left:10vw;
          margin-top:-80px;
          margin-bottom: 120px;
          height: auto; /* 让高度自动调整 */
          max-width: 80vw; /* 防止溢出屏幕宽度 */
          min-height: 80px;
          max-height: 400px;
          display: block; /* 确保元素正确显示 */
          overflow:hidden;
        }

    .dynamic-image2 {
        max-height: 300px;
        object-fit: contain;
        flex-shrink: 0;
        margin-right: 10px;
        cursor: pointer;
        transition: width 0.3s ease-in-out;
    }

        tr{
            height:60px;
        }
</style>



<div  transition:slide={{ duration: 150 }}   
     style="position:fixed; top:0; left:0; z-index: 999;
            height:100vh; width:100vw; background: #000000; transition: opacity 0.3s ease-in-out;">
    
    <div  transition:slide={{ duration: 150 }}  style="opacity: {1 - buttonOpacity}; position:fixed; top:0; left:0; z-index: 1000;
        height:68px; width:100vw;background: #000000;">
    </div>
    <p transition:slide={{ duration: 150 }}  style="position:fixed; top:26px; color:gold; left: 0; width:100%; font-size:20px; font-weight: 700;
                transform: translate(0%, -50%); animation: colorChange 3s infinite;">
        {$lang === "EN" ? "Our vision" : "我們的願景"}
    </p>    

    <button style="
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
      aria-label="Close camera"
    >
        <BackButton/>
    </button>
    
    <button disabled={buttonOpacity === 0} class="button-11" on:click={toggleLanguage}  style="opacity: {buttonOpacity}; position:absolute; top:8px; right:calc(8vw); margin-right:-10px; z-index: 1002; background: transparent; color: white; border:1px solid #888888; cursor: pointer;">
        <div class="button-11__content" style="display:flex; justify-content:center; align-items:center; height:100%;">
                    <video 
                        autoplay 
                        loop 
                        muted 
                        playsinline 
                        style="
                        position: fixed; 
                        max-width: 40px; 
                        height: 36px; 
                        object-fit: cover;
                        border-radius: 8px; 
                        margin-top:-4px;
                        border:1px solid #FFFFFF44;
                        opacity:0.4;
                        z-index:-1;">
                        <source src={ID} type="video/mp4" />
                    </video>
                 <span style="margin-top:8px;"><Translate/></span>
            </div>
      </button>

    

    <!-- 中間的主要內容 -->
    <div  transition:slide={{ duration: 150 }}  bind:this={scrollContainer}  
      style="position:absolute; width:100vw; min-width:240px; z-index: 1000;
          top:0px; bottom:0; left:0vw; height:auto; margin:auto;
             overflow-y: auto;cursor:pointer;">


        <div  transition:slide={{ duration: 150 }}  style="margin-top: 80px; background: black;margin-left:5vw;">

            <div  transition:slide={{ duration: 150 }}  disabled style="height:20px;"></div>
            
            <p transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "why")
                    { topic = "" } else { topic = "why" } }} 
                class={topic === "why" ? "gold-text" : ""}
                style=" color:{topic === "" ? "white" : "#666666"};
                       filter: {topic === "why" ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.1))' : ''};
                       left:5vw; line-height:20px; display: flex; align-items: center; font-weight: 700; z-index: 1000;  margin-bottom:30px;
                      color: white; font-size: 16px;">
                ⚡ {$lang === "EN" ? "Why Permit ?" : "為何選用 Permit ?"}
            </p>
            <div  transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "why")
                    { topic = "" } else { topic = "why" } }} style="position:absolute; margin-top:-55px;right:8vw;opacity:{topic === "why" ? 1 : 0.4};">
                {#if topic === "why"}
                    <Close />
                {:else}
                    <Open />
                {/if}
            </div>
            
            {#if topic === "why"}
                    
                    <div transition:slide={{ duration: 300 }}  on:click={toggleTable} style="width: 90vw; height: calc(210px + {table_height_add}px); border-left: 1px solid #FFFF00; border-right: 1px solid #FFFF00; border-top: 1px dotted #ffffff; margin-bottom: 20px; overflow-y: auto; border-radius: 8px;{isWide ? "max-width:600px;" : ""}
                                                                                             background: linear-gradient(to bottom, #FFFFFF44, transparent, transparent, transparent, transparent, transparent, transparent); ">
        
                          <video disabled
                            autoplay 
                            loop 
                            muted 
                            playsinline
                              style="
                                position: absolute;
                                top: 210px;
                                left:(5vw + 1px);
                                height: calc(100px + {table_height_add}px);
                                width: calc(90vw - 1px); {isWide ? "max-width:599px;" : ""}
                                object-fit: cover;
                                border-radius: 8px;
                                z-index: 1;
                                opacity: 0.4;
                              ">
                            <source src={earth}  type="video/mp4" />
                          </video>
                        
                            <table transition:slide={{ duration: 300 }} 
                                style="
                                  z-index: 2;
                                  width: 100%;
                                  border-collapse: collapse;
                                  color: white;
                                  font-size: 14px;
                                  background: radial-gradient(circle, rgba(17, 17, 17, 0.4) 0%, transparent 80%);
                                  position: relative;
                                "
                              > 
                            <thead>
                                <tr>
                                    <th style="padding: 8px;width:35%;font-weight: 700; font-size: 20px ;background: linear-gradient(to bottom, #FFFFFF, #FFFFFF, #FFFF00, #FFD700, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{$lang === "EN" ? "Permit" : "Permit "}</th>
                                    <th style="padding: 8px;width:10%;"></th>
                                    <th style="padding: 8px;width:40%;font-size: 14px; opacity: 0.68;">{$lang === "EN" ? "Traditional Payment" : "傳統支付"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                <tr>
                                        <td style="padding: 8px;animation: colorChange 3s infinite;font-size:12px;">
                                            {@html $lang === "EN" ? "0% for users + <br> merchants rebate " : "0% 支付手續費 + <br> 商戶額外激勵回贈"}
                                        </td>
                                        <td style="padding: 8px;font-size: 14px;white-space: nowrap; font-weight: 700;">{$lang === "EN" ? "Fees" : "手續費"}</td>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" }; opacity: 0.5;">
                                            {@html $lang === "EN" ? " Credit and debit <br> cards ~ 1 - 4 %" : "信用卡及金融卡 <br> ~ 1 - 4 %"}
                                        </td>
                                </tr>
        
                                <tr>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" };animation: colorChange 3s infinite;">
                                            {@html $lang === "EN" ? "Merchants only need to pay for gas fees <br><span style='font-size:10px;'>(< 0.00001 USD / Tx)</span>" : "只需商戶支付區塊鏈燃料費 ( 每筆轉賬低於 0.00001 USD )"}
                                        </td>
                                        <td style="padding: 8px;font-size: 14px;white-space: nowrap; font-weight: 700;">{$lang === "EN" ? "Cost" : "維護成本"}</td>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" }; opacity: 0.5;">
                                            {@html $lang === "EN" ? "Monthly Fees / Deposits / Transaction Fees" : "月費 / 按金 / 手續費"}
                                        </td>
                                </tr>
                                
                                <tr>
                                        <td style="padding: 8px;white-space: nowrap;font-size: {$lang === "EN" ? "10px" : "12px" };animation: colorChange 3s infinite;">
                                            {@html $lang === "EN" ? "Immutable transactions <br> with instant settlement" : "不可逆轉的區塊鏈記錄 <br> 高精準 '交易即結算'"}
                                        </td>
                                        <td style="padding: 8px; font-size: 14px;white-space: nowrap; font-weight: 700;">
                                            {$lang === "EN" ? "Accuracy" : "準確性"}
                                        </td>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" }; opacity: 0.5;">
                                            {@html $lang === "EN" ? "Centralized delayed settlement" : "具風險的中心化結算系統"}
                                        </td>
                                </tr>
        
                                <tr>
                                        <td style="padding: 8px;white-space: nowrap; font-size:{$lang === "EN" ? "10px" : "12px" };animation: colorChange 3s infinite;">
                                            {@html $lang === "EN" ? " Client assets are stored <br>  in wallet, can only be <br> operated by the user." : "客戶資產存放在錢包 <br> 並只有用戶可以操作"}
                                        </td>
                                        <td style="padding: 8px; font-size: 14px;white-space: nowrap; font-weight: 700;">
                                            {$lang === "EN" ? "Access" : "使用權限"}
                                        </td>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" }; opacity: 0.5;">
                                            {@html $lang === "EN" ? "Banks could freezes / operate with policy" : "銀行持有用戶資產並因應政策進行凍結或轉賬操作"}
                                        </td>
                                </tr>
                                
                                <tr>
                                        <td style="padding: 8px;white-space: nowrap; font-size:16px;animation: colorChange 3s infinite;">
                                            {@html $lang === "EN" ? "No limit" : "無上下限"}
                                        </td>
                                        <td style="padding: 8px; font-size: 14px;white-space: nowrap; font-weight: 700;">
                                            {$lang === "EN" ? "Recharge" : "儲值限額"}
                                        </td>
                                        <td style="padding: 8px;font-size: {$lang === "EN" ? "10px" : "12px" }; opacity: 0.5;">
                                            {@html $lang === "EN" ? "With minimum and maximum top-up amount" : "設有最低及最高 <br> 可增值額"}
                                        </td>
                                </tr>
        
                                <tr>
                                    <td style="padding: 8px; white-space: nowrap; font-size: {$lang === "EN" ? "10px" : "12px" }; animation: colorChange 3s infinite;">
                                        {@html $lang === "EN" ? "1-Click for Users <br> Within 1 Hour <br> for Merchants" : "用戶: 一鍵申請<br>商家: 一小時內開通"}
                                    </td>
                                    <td style="padding: 8px; font-size: 14px; white-space: nowrap; font-weight: 700;">
                                        {$lang === "EN" ? "Onboarding" : "帳戶開通"}
                                    </td>
                                    <td style="padding: 8px; font-size: {$lang === "EN" ? '10px' : '12px'}; opacity: 0.5;">
                                        {@html $lang === "EN" ? "Complex bank procedures from 2 days to 4 weeks" : "申請Visa卡或POS機需經過 2 日至 4 週的繁瑣銀行流程"}
                                    </td>
                                </tr>

                            </tbody>
                                <div  transition:slide={{ duration: 150 }}  disabled style="height:40px;"></div>
                        </table>
                    </div>
        
                    <div  transition:slide={{ duration: 150 }}  style="position:absolute; background:linear-gradient(transparent, #000000ee, #000000); height: 60px; width:100vw; top:calc(310px + {table_height_add}px); left:0; z-index:5; "></div>
                    
                    <p transition:slide={{ duration: 150 }}  style="margin-right: 5vw; margin-top:-8px; margin-bottom:20px;font-size: 12px; font-weight: 500; text-align: center;"> 
                     {@html $lang === 'EN' ? "<span style='font-size:12px;font-weight:700;color:#444444; '>(Tap / scroll to view the entire table)</span>" : "<span style='font-size:12px;font-weight:700;color:#444444; '>( 點擊 / 滾動查看整個表格 )</span>"}
                    </p>


            {/if}

            <p transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "how")
                { topic = "" } else { topic = "how" } }} 
            class={topic === "how" ? "gold-text" : ""}
            style=" color:{topic === "" ? "white" : "#666666"}; margin-top:40px; left:5vw; line-height:20px; display: flex; align-items: center; font-weight: 700; z-index: 1000;
                   color: white; font-size: 16px; ">
            ⚡ {$lang === "EN" ? "How Permit works?" : "如何操作 Permit ?"}
            </p>
            <div  transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "how")
                { topic = "" } else { topic = "how" } }} style="position:absolute; margin-top:-30px;right:8vw;opacity:{topic === "how" ? 1 : 0.4};">
            {#if topic === "how"}
                <Close />
            {:else}
                <Open />
            {/if}
            </div>

            {#if topic === "how"}

                <p transition:slide={{ duration: 150 }}  style="margin: 16px; margin-top:24px; margin-bottom:12px;font-size: 12px; font-weight: 500; text-align: left;"> 
                    {@html langText.p2}
                </p>

                <div  on:click={toggleSize3} transition:slide={{ duration: 300 }}  class="image-container"  style="margin-bottom:16px;">
                        <img on:click={toggleSize3} id="toggleImage3"
                            src={$lang === "EN" ? Permit101 : Permit101zh} 
                            alt="Permit101" style="{isWide ? "max-width:600px;" : ""}"
                            class="dynamic-image"
                        />

                </div>
                
            {:else if topic === "why"}
                
                <div style="height:32px;"></div>
                
            {/if}
        

            <p transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "new")
                    { topic = "" } else { topic = "new" } }} 
                class={topic === "new" ? "gold-text" : ""}
                style=" color:{topic === "" ? "white" : "#666666"}; margin-top:{topic === "why" ? "0" : "40px"}; left:5vw; line-height:20px; display: flex; align-items: center; font-weight: 700; z-index: 1000;
                       color: white; font-size: 16px; ">
            ⚡ {langText.topic4}
            </p>
            <div  transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "new")
                    { topic = "" } else { topic = "new" } }} style="position:absolute; margin-top:-30px;right:8vw;opacity:{topic === "new" ? 1 : 0.4};">
                {#if topic === "new"}
                    <Close />
                {:else}
                    <Open />
                {/if}
            </div>

            {#if topic === "new"}
        
                    <p transition:slide={{ duration: 150 }}  style="margin: 16px; margin-top:24px; margin-bottom:12px;font-size: 12px; font-weight: 500; text-align: left;"> 
                        {@html langText.p2}
                    </p>
        
                    <div  transition:slide={{ duration: 300 }}  on:click={toggleSize2} class="image-container">
                        <img    id="toggleImage2"
                                src={TOKEN_flow} 
                                alt="TOKEN_flow" 
                                class="dynamic-image2"
                                style="width:90vw;max-width:1200px;margin-top:32px;{isWide ? "max-width:800px;" : ""}"
                                />
                    </div>
        
                    <p transition:slide={{ duration: 150 }}  style=" margin-left:-5vw; font-size: 12px; font-weight: 700; z-index: 1000;margin-top:28px;margin-bottom:40px;"> 
                        <a transition:slide={{ duration: 150 }}  href="https://basescan.org/address/{$TOKENContractAddress}#code" target="_blank" class="spam" style=" font-weight: 700; text-decoration-color: #FFD7aa ; color:#FFD7aa; font-size: 12px;">
                        {langText.contract}</a>
                    </p>
        
                    <div    transition:slide={{ duration: 300 }}  class="image-container"  style="margin-bottom:16px;">
                        <!-- 允許橫向滾動的內部容器 -->
                        <div  transition:slide={{ duration: 150 }}  class="scroll-container" >
                                <img  
                                     src={Logic} 
                                     alt="Logic" 
                                     class="dynamic-image2"
                                      />
                                <img  
                                     src={Deposit} 
                                     alt="Deposit" 
                                     class="dynamic-image2" style="max-height:280px;" />
                                <img  
                                     src={Spend} 
                                     alt="Spend" 
                                     class="dynamic-image2"  style="max-height:280px;"/>
                          
                        </div>
                    </div>
        
                    <p transition:slide={{ duration: 150 }}  style="margin: 16px; margin-top:32px; margin-bottom:40px;font-size: 12px; font-weight: 500; text-align: left;"> 
                         {@html langText.p5}
                    </p>
        
                    <p transition:slide={{ duration: 150 }}  style="margin-top: 0px; margin-left:-5vw; font-size: 12px; font-weight: 700; z-index: 1000;margin-top:20px;"> 
                        <a transition:slide={{ duration: 150 }}  href="https://forms.gle/8UMjRt6yGFWfhgJo8" target="_blank" class="spam" style=" font-weight: 700; text-decoration-color: #FFD7aa ; color:#FFD7aa; font-size: 12px;">
                        {langText.onboard}</a>
                    </p>
            {/if}
        
            <p transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "org")
                    { topic = "" } else { topic = "org" } }} 
                class={topic === "org" ? "gold-text" : ""}
                style=" color:{topic === "" ? "white" : "#666666"}; margin-top: 40px; left:5vw; line-height:20px; display: flex; align-items: center; font-weight: 700;  
                      color: white; font-size: 16px; z-index: 1000;">
            ⚡ {langText.topic3}
            </p>
            
            <div  transition:slide={{ duration: 150 }}  on:click={()=>{if (topic === "org")
                    { topic = "" } else { topic = "org" } }} style="position:absolute; margin-top:-30px;right:8vw;opacity:{topic === "org" ? 1 : 0.4};">
                {#if topic === "org"}
                    <Close />
                {:else}
                    <Open />
                {/if}
            </div>

            {#if topic === "org"}
            
                    <div  transition:slide={{ duration: 300 }}  disabled style="margin-left: 5vw; width:80vw;"><Org/></div>

                    <p transition:slide={{ duration: 150 }}  style="margin-top: 0px; margin-left:-5vw; font-size: 12px; font-weight: 700; z-index: 1000;margin-top:20px;"> 
                
            {/if}

              <video 
                    disabled
                    autoplay 
                    loop 
                    muted 
                    playsinline 
                    class="canvas3d" style="width:80vw; max-height: 160px; margin-left:5vw;margin-top: 60px;">
                    <source src={System} type="video/mp4"/>
              </video>

            <a transition:slide={{ duration: 150 }}  href="https://x.com/erc20permit" target="_blank" 
               style=" color: #888888; font-size: 12px; font-weight: 600; margin-top:-60px; margin-bottom: 20px;
                       display: block; text-align: center; width:90vw; left:0;">
                © 2025 Permit Foundation
            </a>

            
        </div>
    </div>
</div>