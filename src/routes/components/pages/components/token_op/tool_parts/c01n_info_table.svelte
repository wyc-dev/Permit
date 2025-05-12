<script>
    import { fade } from "svelte/transition";
    import { lang, UserETH, User_C01N, TOKENStaked, C01NStaked, C01NSupply, C01NStaking, C01NContractAddress } from '../../../../../store.js';
    // export let user_address;
    export let coin_name;

    $: info = $C01NStaking ? $C01NStaking : [false , 0, 0, 0, 0];

    $: description =
        coin_name === "C01N"
            ? ($lang === "ZH" ? "「疊加態幣」（C01N）是一款受量子領域啟發的加密貨幣。透過'資產認證質押'機制，用戶只需聲明當前錢包的 TOKEN 及 C01N 持有量即可啟動挖礦，無需鎖定代幣，保留錢包資產的控制權並隨時間獲取獎勵。融合了科幻與尖端技術，提供安全、前衛的新世代資產體驗。"
               : "'Superposition Coin'（C01N）is a cryptocurrency inspired by quantum-theory. Through Permit's 'Proof of Reserves Staking' mechanism, users can simply start mining by declaring their current status of TOKEN and C01N in their wallets, without the need to lock any tokens. This allows users to retain control over their assets while earning rewards over time. Blending science with cutting-edge technology, C01N delivers a secure and avant-garde experience for next-generation digital asset.")
            : "";

      function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
      }

      function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0 ) {
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
            return `${(value / 1000).toFixed(float)} K`;
        } else if (value){
            return round(value, float);
        }
      }
    
</script>

<div in:fade={{ duration: 800 }}  style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out; z-index: 1200; 
    position:absolute; top:60px; bottom:3vh; height:auto; width:80vw; min-width:200px; margin-left:5vw; border-radius:  16px;
                                                 border-top: 1.5px solid #333333;background:linear-gradient(#111000, transparent);">
    <div class="scroll-container">
        <!-- <h3 class="gold-text" style="padding: 6px; color: white; margin-top: 8px; text-align: center; font-size: 16px;margin-left:16px;">{coin_name === "TOKEN"
                                                                                                                                          ? ($lang === "ZH" ? "通證幣" : "TOKEN") : coin_name} {$lang === "ZH" ? "資訊" : "Data"}</h3> -->

        <table style="width: calc(80vw - 16px); margin: auto; border-collapse: collapse;margin: 8px;">
            <tbody>
                <!-- User Information -->
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:55%;">▫️ {$lang === "ZH" ? "鏈上燃料尚餘" : "Gas Remaining"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                        ⛽ {$UserETH} ETH
                    </td>
                </tr>
                <tr in:fade={{ duration: 100 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "用戶結餘" : "User Balance"}</td>
                    <td style="color:{$User_C01N > 0 ? "#FFFF00" : $User_C01N ? "#FFFFFF" : "#666666"};font-size: 14px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume($User_C01N,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "用戶已挖掘" : "User Minted"}</td>
                    <td style="color:{$C01NStaking ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> {info[4]} C01N</td>
                </tr>
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "用戶質押量" : "User Staking"}</td>
                    <td class={!info[2] ? "" : "rgb-text"} style="color:{$C01NStaking ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> {!info[2] ? "--" : formatVolume(info[2],2)} TOKEN</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;"></td>
                    <td class={!info[3] ? "" : "rgb-text"} style="color:{$C01NStaking ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> {!info[3] ? "--" : formatVolume(info[3],2)} C01N</td>
                </tr>
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "全鏈質押總量" : "Total Staking"}</td>
                    <td style="color:{$C01NStaked ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> {formatVolume($C01NStaked,2)} C01N</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;"></td>
                    <td style="color:{$TOKENStaked ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> {formatVolume($TOKENStaked,2)} TOKEN</td>
                </tr>
                <!-- <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ Total Staker</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;"> -- </td>
                </tr> -->
                <tr in:fade={{ duration: 400 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流動池額度" : "In Uniswap LP"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; filter: drop-shadow(0 0 4px #eb7af8);"> -- {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 500 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流通供應量" : "Circulations"}</td>
                    <td style="color:{$C01NSupply ? "#FFFFFF" : "#666666"};font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume($C01NSupply,2)} {coin_name}</td>
                </tr>
                <!-- <tr in:fade={{ duration: 400 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ 
                        <span style="color:#8CFFFB; font-size: 12px;">{$lang === "ZH" ? "已挖掘 *" : "Minted *"}</span> / 
                        <span style="color:#ccacf8; font-size: 12px;">{$lang === "ZH" ? "已銷毁" : "Burnt"}</span>
                    </td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                        <span style="color:#8CFFFB; font-size: 12px;">{formatVolume(totalMinted - TOKEN_UNISWAP_LP,2)}</span>
                        / <span style="color:#ccacf8; font-size: 12px;">{formatVolume(totalBurnt,2)}</span>
                    </td>
                </tr> -->
                <tr in:fade={{ duration: 500 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;opacity: 0.5;">▫️ {$lang === "ZH" ? "代幣簡介" : "Description"}</td>
                    <a href="https://basescan.org/token/{$C01NContractAddress}" target="_blank" style="font-size: 10px; text-align: right; font-weight: 500; color:#888888;
                                                                                             position: absolute; margin-top:8px; right:calc(0vw + 16px);"> {$lang === "ZH" ? "合約公開代碼" : "Contract Source Code"} </a>
                </tr>
                <tr in:fade={{ duration: 600 }}>
                    <p style="font-size: 10px; padding: 22px; margin-top:-16px; text-align: left; width:160%; color:#888888;">{description}</p>
                </tr>
            </tbody>
        </table>
    </div>
    
</div>
