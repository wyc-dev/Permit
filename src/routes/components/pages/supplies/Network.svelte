<!-- Network.svelte -->
<script>
    import { onMount } from "svelte";
    import { choosed_address_for_ID , 
            choosed_address_total_power,
            TON_apiKey,
            telegram_x_TON,
            DID_tg,
            DID_stonfi,
            DID_og,
            DID_tonx,
           } from '../../../store.js';
    import Ball from "../../icons/3d_ball.png";
    
    export let main_address;
    export let refer_in_db;
    export let POWER_from_refer;
    export let POWER_of_refer_in_db;
    export let content_adjust;
    
    let circleContainer;

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
    
    let ID_address = main_address;
    let unsubscribe;

    async function choose(address) {

        let index = refer_in_db.findIndex(ref => ref === address);
        let power = index >= 0 ? POWER_of_refer_in_db[index] : address === main_address ? POWER_from_refer : 0;
        choosed_address_for_ID.set(address);
        choosed_address_total_power.set(power);
        try {
            await checkNFTs();
        } catch {
            
        }

        // Temporarily subscribe to log the current power
        unsubscribe = choosed_address_total_power.subscribe(value => {
            // console.log("Current power:", value);
        });
    }

    // async function choose(address) {
    //     try {
    //         // 嘗試檢查 TNS 名稱
    //         const tnsName = await checkTNS(address);

    //         // 如果成功獲取 TNS 名稱，使用 TNS 名稱作為選擇的地址
    //         const selectedAddress = tnsName || address;

    //         let index = refer_in_db.findIndex(ref => ref === selectedAddress);
    //         let power = index >= 0 
    //             ? POWER_of_refer_in_db[index] 
    //             : selectedAddress === main_address 
    //                 ? POWER_from_refer 
    //                 : 0;

    //         choosed_address_for_ID.set(selectedAddress);
    //         choosed_address_total_power.set(power);

    //         // 暫時訂閱並記錄當前的 power
    //         unsubscribe = choosed_address_total_power.subscribe(value => {
    //             // console.log("Current power:", value);
    //         });
    //     } catch (error) {
    //         // 捕捉 DNS 查詢的錯誤，回退到使用原始地址
    //         console.error("Failed to fetch DNS for the address:", error);

    //         let index = refer_in_db.findIndex(ref => ref === address);
    //         let power = index >= 0 
    //             ? POWER_of_refer_in_db[index] 
    //             : address === main_address 
    //                 ? POWER_from_refer 
    //                 : 0;

    //         choosed_address_for_ID.set(address);
    //         choosed_address_total_power.set(power);

    //         // 暫時訂閱並記錄當前的 power
    //         unsubscribe = choosed_address_total_power.subscribe(value => {
    //             // console.log("Current power:", value);
    //         });
    //     }
    // }

    // 查詢並檢查 NFT 的函數
    async function checkNFTs() {

        DID_og.set(false);
        DID_tonx.set(false);
        DID_stonfi.set(false);
        
        try {
            const response = await fetch(`https://tonapi.io/v2/accounts/${$choosed_address_for_ID}/nfts?limit=1000&offset=0&indirect_ownership=false&api_key=${$TON_apiKey}`);
            const data = await response.json();

            if (!data.nft_items || !Array.isArray(data.nft_items)) {
                // console.error("Invalid NFT data");
                return;
            }
            // 遍歷所有的 NFT 項目
            data.nft_items.forEach(nft => {
                // 檢查 check_og 條件
                if (nft.collection && nft.collection.address === "0:f6eb890eb9055611b72013bca8e3aff0897983e79fbd1bb59aff1e3ab03c6519" && nft.trust !== "blacklist") {
                    DID_og.set(true);
                }
                // 檢查 check_tonx 條件
                if (nft.collection && nft.collection.address === "0:1ce2372986701e2d0ff0992edee25796821172b1123f54a5024748e18950d7f6" && nft.trust !== "blacklist") {
                    DID_tonx.set(true);
                }
                // 檢查 check_stonfi 條件
                if (nft.collection && nft.collection.name && nft.collection.name.includes("Farm NFT collection") && nft.trust !== "blacklist") {
                    DID_stonfi.set(true);
                }
            });

        } catch (error) {
            // console.error("Error fetching or processing NFT data:", error);
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
        const colors = generateColorsFromAddress(removeDashFromString(address));

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

    onMount(() => {
        choose(ID_address);
    });
    
</script>



<div style="position:absolute; min-height: 300px; min-width:100vw; margin-top: -822px;">
        {#if main_address}
            <div on:click={()=>{choose(main_address);}} class="circle-container center-circle">

                <div
                    class="circle main-circle "
                >
                    <p class="circle-info" style="color:{POWER_from_refer > 1 ? 'white': 'gold'};">{`${main_address.slice(0, 4)}...${main_address.slice(-4)}`}</p>
                    <p class="circle-subinfo">
                        {formatVolume(POWER_from_refer, 2)} ⚡
                    </p>
                    <img class="circle " src={createGradientJPG(main_address)} alt="Gradient PFP" style="position:absolute;margin-top:0px;margin-left:10px; opacity: 0.5; ">
                </div>

                <div class="vertical-line " style="position:fixed; top:39px; background: {!POWER_from_refer ? 'transparent': 'gold'};"/>
                <img src={Ball} alt="Ball" style="position:absolute;margin-top:0px;margin-left:0px; opacity: 0.5;">

            </div>
        {/if}

        {#if refer_in_db.length > 0}

             <p style="z-index:99;position:fixed;font-size: 10px; font-weight: 700; color:#888888;top:0; left:0;width:100%;">
                 Your TON DID Network</p>
            <p style="z-index:99;position:fixed;font-size: 10px; font-weight: 700; color:#888888;bottom:0; left:0;width:100%;">
                 with {refer_in_db.length} friend's DID</p>

            <div bind:this={circleContainer} class="circle-container" style="justify-content: {content_adjust};">
                
                {#each refer_in_db as refer, index}
                    <div disabled={POWER_of_refer_in_db[index] < 0.01} on:click={()=>{choose(refer_in_db[index]);}} class={`circle ${POWER_of_refer_in_db[index] > 0.01 ? 'active' : 'inactive'}`} >
                        
                        {#if index === 0 && refer_in_db.length > 1}
                                <div class="vertical-line " style="background: {POWER_of_refer_in_db[index] > 0? 'gold': '#888888'};"/>
                                <div class="horizontal-line" />
                                {#if POWER_of_refer_in_db[index] > 0}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;">
                                    </div>
                                {:else}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;background:black;">
                                    </div>
                                {/if}
                        {:else if index === refer_in_db.length - 1 && refer_in_db.length > 1}
                                <div class="vertical-line " style="background: {POWER_of_refer_in_db[index] > 0? 'gold': '#888888'};" />
                                <div class="horizontal-line-right" />
                                {#if POWER_of_refer_in_db[index] > 0}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;">

                                    </div>
                                {:else}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;background:black;">
                                    </div>
                                {/if}
                        {:else if refer_in_db.length > 1}
                                <div class="vertical-line" style="background: {POWER_of_refer_in_db[index] > 0? 'gold': '#888888'};"/>
                                <div class="long-horizontal-line" />
                                {#if POWER_of_refer_in_db[index] > 0}
                                    <img class="circle" src={createGradientJPG(refer_in_db[index])} alt="Gradient PFP" style="position:absolute;margin-top:0px;margin-left:10px;opacity: 0.5; background: transparent;" />
                                {:else}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;background:black;">
                                    </div>
                                {/if}
                        {:else if refer_in_db.length == 1}
                                <div class="vertical-line" style="background: {POWER_of_refer_in_db[index] > 0? 'gold': '#888888'};"/>
                                {#if POWER_of_refer_in_db[index] > 0}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;">
                                    </div>
                                {:else}
                                    <div class="circle" style="position:absolute;margin-top:0px;margin-left:10px;background:black;">
                                    </div>
                                {/if}
                        {/if}

                        <p class="circle-info"  style="color:{POWER_of_refer_in_db[index] > 0? '#ffffff': '#888888'};">{`${refer.slice(0, 4)}...${refer.slice(-4)}`}</p>
                        <p class="circle-subinfo" style="color:{POWER_of_refer_in_db[index] > 0? 'gold': '#888888'};">
                            {typeof POWER_of_refer_in_db[index] !== "undefined"
                                ? `${formatVolume(POWER_of_refer_in_db[index], 2)} ⚡`
                                : "選ばれし者"}
                        </p>
                        
                        <img src={Ball} alt="Ball" style="position:absolute;margin-top:0px;margin-left:0px;opacity: 0.3; background: transparent;">

                        
                    </div>
                {/each}
                
            </div>
        {/if}
</div>


    
<style>

    .circle-container {
        position: absolute;
        top: 660px;
        height: 120px;
        margin-bottom:20px;
        justify-content: var(--content-adjust);
        max-width: 290px;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .center-circle {
        position: absolute;
        top: 552px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .main-circle {
        background: #000000;
        border: 2px solid gold; /* 初始寬度設置為動畫的最小寬度 */
        flex-direction: column;
        position: relative;
        animation: borderWidthChange 9s infinite ease-in-out; /* 使用 ease-in-out 增強過渡效果 */
    }

    /* 定義動畫 */
    @keyframes borderWidthChange {
        0%, 100% {
            border: 1.5px solid #FFFFFF;
        }
        25% {
            border: 1.5px solid #FFFF00;
        }
        50% {
            border: 1.5px solid #FFD700;
        }
        75% {
            border: 1.5px solid #FFFF00;
        }
    }



    .vertical-line {
        position: absolute;
        height: 78px;
        width: 2px;
        top: -12px;
        background: var(--line-color, #888888);
        z-index: -3;
    }

    .horizontal-line, .horizontal-line-right, .long-horizontal-line {
        position: absolute;
        height: 2px;
        top: -12px;
        background: linear-gradient(to right, gold, orange);
        animation: backgroundColorChange 0.5s infinite;
        transition: background 3s ease-in-out;
        z-index: -3;
    }

    .horizontal-line {
        width: 54px;
        right: -13px;
    }
    .horizontal-line-right {
        width: 54px;
        left: -13px;
    }

    .long-horizontal-line {
        width: 105px;
    }

    .circle {
        position: relative;
        cursor: pointer;
        flex-direction: column;
        margin-left: 20px;
        left: -10px;
        top: 0;
    }

    .active {
        border: 1px solid gold;
    }

    .inactive {
        border: 1px solid #888888;
        opacity: 0.9;
    }

    .circle-info, .circle-subinfo {
        font-size: 11px;
        color: gold;
        margin-bottom: 0;
    }

    .circle-subinfo {
        font-size: 9px;
        width: 80px;
    }   

    @keyframes backgroundColorChange {
        0%, 100% {
            background: linear-gradient(to right, gold, yellow, gold, orange, gold);
        }
        25% {
            background: linear-gradient(to right, gold, orange, gold, yellow, gold);
        }
        50% {
            background: linear-gradient(to right, orange, gold, yellow, gold, orange);
        }
        70% {
            background: linear-gradient(to right, gold, yellow, gold, orange, gold);
        }
    }
</style>