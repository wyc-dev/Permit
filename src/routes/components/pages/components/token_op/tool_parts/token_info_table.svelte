<script>
    import { fade } from "svelte/transition";
    import { lang } from '../../../../../store.js';
    // export let user_address;
    export let user_balance;
    export let lp_balance;
    export let coin_name;
    export let coin_price;
    export let price_unit;
    export let totalSupply = 0;
    export let totalMinted = 0;
    export let totalBurnt = 0;
    export let contract;

    $: description =
        coin_name === "TOKEN"
            ? ($lang === "ZH" ? "通證幣是由商家共同維繫的生態系統代幣，其 RWA 的價值與大眾及所有持幣者的鏈下共識價值掛鉤。": "TOKEN is a merchant-facilitated token within an ecosystem that facilitates RWA with value tied to its acceptance and off-chain value.")
            : "";
    $: description2 =
        coin_name === "TOKEN"
            ? ($lang === "ZH" ? "* 這裡的已挖掘及流通供應量已扣除去中心化 LP 中的代幣數量 ": "* Minted and Circulations here already minus the number of tokens in the decentralized LP.")
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

<div in:fade={{ duration: 800 }}  style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
    position:absolute; top:56px; bottom:3vh; height:auto; width:80vw; min-width:200px; margin-left:5vw; border-radius:  16px;
                                                 border-top: 1.5px solid #333333;background:linear-gradient(#111000, transparent);">
    <div class="scroll-container">
        <!-- <h3 class="gold-text" style="padding: 6px; color: white; margin-top: 8px; text-align: center; font-size: 16px;margin-left:16px;">{coin_name === "TOKEN"
                                                                                                                                          ? ($lang === "ZH" ? "通證幣" : "TOKEN") : coin_name} {$lang === "ZH" ? "資訊" : "Data"}</h3> -->

        <table style="width: calc(80vw - 16px); margin: auto; border-collapse: collapse;margin: 8px;">
            <tbody>
                <!-- User Information -->
                <tr in:fade={{ duration: 100 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "用戶結餘" : "User Balance"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume(user_balance,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {coin_name} {$lang === "ZH" ? "價格" : "Price"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">$ 0.128205</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流動池額度" : "In Uniswap LP"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; filter: drop-shadow(0 0 4px #eb7af8);"> {formatVolume(lp_balance,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流通供應量 *" : "Circulations *"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume(totalSupply - lp_balance,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 400 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ 
                        <span style="color:#8CFFFB; font-size: 12px;">{$lang === "ZH" ? "已挖掘 *" : "Minted *"}</span> / 
                        <span style="color:#ccacf8; font-size: 12px;">{$lang === "ZH" ? "已銷毁" : "Burnt"}</span>
                    </td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                        <span style="color:#8CFFFB; font-size: 12px;">{formatVolume(totalMinted - lp_balance,2)}</span>
                        / <span style="color:#ccacf8; font-size: 12px;">{formatVolume(totalBurnt,2)}</span>
                    </td>
                </tr>
                <tr in:fade={{ duration: 500 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;opacity: 0.5;">▫️ {$lang === "ZH" ? "代幣簡介" : "Description"}</td>
                    <a href="https://basescan.org/token/{contract}" target="_blank" style="font-size: 10px; text-align: right; font-weight: 500; color:#888888;
                                                                                             position: absolute; margin-top:8px; right:calc(0vw + 16px);"> {$lang === "ZH" ? "合約公開代碼" : "Contract Source Code"} </a>
                </tr>
                <tr in:fade={{ duration: 600 }}>
                    <p style="font-size: 10px; padding: 22px; margin-top:-16px; text-align: left; width:180%; color:#888888;">{description}</p>
                    <p style="font-size: 10px; padding: 22px; margin-top:-44px; text-align: left; width:180%; color:#888888;">{description2}</p>
                </tr>
            </tbody>
        </table>
    </div>
    
</div>
