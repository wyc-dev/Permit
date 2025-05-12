<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { User_TOKEN, BASE, TOKENContractAddress, TOKENABI, TOKENSupply, TOKENMinted, TOKENBurnt, TOKEN_UNISWAP_LP, lang } from '../../../../../store.js';

    export let coin_name;

    // 初始化 TOKEN 合約
    const TOKEN_contract = new $BASE.eth.Contract($TOKENABI, $TOKENContractAddress);

    // 動態計算，移除 1000000000000 fallback
    $: editMinted = $TOKENMinted - ($TOKEN_UNISWAP_LP || 0);
    $: description =
        coin_name === "TOKEN"
            ? ($lang === "ZH" ? "通證幣是由商家共同維繫的生態系統代幣，其 RWA 的價值與大眾及所有持幣者的鏈下共識價值掛鉤。" : "TOKEN is a merchant-facilitated token within an ecosystem that facilitates RWA with value tied to its acceptance and off-chain value.")
            : "";
    $: description2 =
        coin_name === "TOKEN"
            ? ($lang === "ZH" ? "* 這裡的已挖掘及流通供應量已扣除去中心化 LP 中的代幣數量 " : "* Minted and Circulations here already minus the number of tokens in the decentralized LP.")
            : "";

    // Fetch LP balance 如果 $TOKEN_UNISWAP_LP 係 0
    const fetchLPBalance = async () => {
        try {
            const lpAddress = "0x498581fF718922c3f8e6A244956aF099B2652b2b";
            const balance = await TOKEN_contract.methods.balanceOf(lpAddress).call();
            const formattedBalance = Number(balance) / 10 ** 18; // 假設 18 位小數
            TOKEN_UNISWAP_LP.set(formattedBalance);
            return formattedBalance;
        } catch (error) {
            // console.error("Fetch LP balance failed:", error);
            return null;
        }
    };

    // 頁面載入時檢查 $TOKEN_UNISWAP_LP
    onMount(async () => {
        if ($TOKEN_UNISWAP_LP === 0) {
            await fetchLPBalance();
        }
    });

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value === 0) {
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
        } else if (value >= 1000006) {
            return `${(value / 1000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(float)} K`;
        } else {
            return round(value, float);
        }
    }
</script>

<div in:fade={{ duration: 800 }}  style="in: background 0.3s ease-in-out, color 0.3s ease-in-out, border 0.6s ease-in-out;
    position:absolute; top:60px; bottom:3vh; height:auto; width:80vw; min-width:200px; margin-left:5vw; border-radius:  16px;
                                                 border-top: 1.5px solid #333333;background:linear-gradient(#111000, transparent);">
    <div class="scroll-container">
        <!-- <h3 class="gold-text" style="padding: 6px; color: white; margin-top: 8px; text-align: center; font-size: 16px;margin-left:16px;">{coin_name === "TOKEN"
                                                                                                                                          ? ($lang === "ZH" ? "通證幣" : "TOKEN") : coin_name} {$lang === "ZH" ? "資訊" : "Data"}</h3> -->

        <table style="width: calc(80vw - 16px); margin: auto; border-collapse: collapse;margin: 8px;">
            <tbody>
                <!-- User Information -->
                <tr in:fade={{ duration: 100 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "用戶結餘" : "User Balance"}</td>
                    <td style="font-size: 14px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume($User_TOKEN,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 200 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {coin_name} {$lang === "ZH" ? "價格" : "Price"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">$ 0.128205</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流動池額度" : "In Uniswap LP"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold; filter: drop-shadow(0 0 4px #eb7af888);"> {formatVolume($TOKEN_UNISWAP_LP? $TOKEN_UNISWAP_LP : 1000000000000 ,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 300 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ {$lang === "ZH" ? "流通供應量 *" : "Circulations *"}</td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">{formatVolume($TOKENSupply - ($TOKEN_UNISWAP_LP ? $TOKEN_UNISWAP_LP : 1000000000000) ,2) < 0 ? 0 : formatVolume($TOKENSupply - $TOKEN_UNISWAP_LP ,2)} {coin_name}</td>
                </tr>
                <tr in:fade={{ duration: 400 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;">▫️ 
                        <span style="color:#8CFFFB; font-size: 12px;">{$lang === "ZH" ? "已挖掘 *" : "Minted *"}</span> / 
                        <span style="color:#ccacf8; font-size: 12px;">{$lang === "ZH" ? "已銷毁" : "Burnt"}</span>
                    </td>
                    <td style="font-size: 12px; padding: 6px; text-align: right; font-weight: bold;">
                        <span style="color:#8CFFFB; font-size: 12px;">{formatVolume(editMinted < 0 ? 0 : editMinted ,2)}</span>
                        / <span style="color:#ccacf8; font-size: 12px;">{formatVolume($TOKENBurnt,2)}</span>
                    </td>
                </tr>
                <tr in:fade={{ duration: 500 }}>
                    <td style="font-size: 12px; padding: 6px; text-align: left; width:50%;opacity: 0.5;">▫️ {$lang === "ZH" ? "代幣簡介" : "Description"}</td>
                    <a href="https://basescan.org/token/{$TOKENContractAddress}" target="_blank" style="font-size: 10px; text-align: right; font-weight: 500; color:#888888;
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
