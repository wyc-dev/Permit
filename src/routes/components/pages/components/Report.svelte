<script>
    import { fade , blur } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import POWER from '../../Power.svelte';
    import Earth from './Earth.svelte';
    import Loading from "../../icons/mini-loading.svelte";
    import { TT_Power, refer_in_DB,
            usdt_balance,
            POWER_from_refer} from '../../../store.js';
    export let power;
    export let mod_address;
    export let firstTxTillNow;
    export let transactionCountLoaded;
    export let transactionCount;
    export let TON_balance;
    export let USDT_balanceLoaded;
    export let POWER_from_refer_Loaded;
    export let percentageLoaded;
    export let total_POWER_in_db;
    export let investment;
    export let percentage;
    export let dollar;

    // 根據數據是否完整來動態設置 earth_opacity
    let earth_opacity = 0.1;

    // 檢查所有數據是否完整
    $: isDataComplete =
        isFinite(firstTxTillNow) &&
        transactionCountLoaded &&
        isFinite(TON_balance) &&
        USDT_balanceLoaded &&
        POWER_from_refer_Loaded &&
        isFinite(investment) &&
        isFinite(percentage) &&
        isFinite(dollar);

    // 動態設置 loading_text，列出尚未加載完成的項目
    $: loading_text = (() => {
        if (!isFinite(firstTxTillNow)) return "1st Transaction Time";
        if (!transactionCountLoaded) return "Transaction Count";
        if (!isFinite(TON_balance)) return "TON Balance";
        if (!USDT_balanceLoaded) return "USDT Balance";
        if (!POWER_from_refer_Loaded) return "Network AUM";
        if (!isFinite(investment)) return "Investment";
        if (!isFinite(percentage)) return "% of Ownership";
        if (!isFinite(dollar)) return "Stable AUM";
        return ""; // 所有項目已完成時返回空字符串
    })();

    // 如果數據完整，設置 earth_opacity 為 1，否則為 0
    $: earth_opacity = isDataComplete ? 1 : 0.1;

    // 使用 key 強制重新加載 Earth 組件
    $: earthKey = isDataComplete ? 'complete' : 'incomplete';

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value === null || value === 0) {
            return 0;
        } else if (value >= 1000000000000) {
            return `${(value / 1000000000000).toFixed(float)} T`;
        } else if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(float)} B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(float)} M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(float)} K`;
        } else {
            return Number(value).toFixed(float);
        }
    }
</script>

<div class="gradient-div-top"></div>
<div class="gradient-div-up"></div>

<p style="position:fixed; top:6px; z-index:303;color:#000000; left: 50%; width:100vw; min-width:240px; font-size:12px;
        transform: translate(-50%, -50%);font-weight: 700;">
    Real-time on-chain status of {mod_address}
</p>



<div in:blur={{ duration: 300, easing: cubicInOut }} style="position: fixed; z-index:300; height:100vh; width:100vw; left:0; top:0; background: #000000;">
    <div style="height:150px;margin-top:75px;">
        <POWER />
    </div>
    {#key earthKey}
        <div in:fade={{ duration: 500 }} style="height:150px;width:150px;z-index:1100;">
            <Earth {earth_opacity} />
        </div>
    {/key}

    <!-- 動態顯示加載中提示 -->
    {#if !isDataComplete}        
            <p style="position: absolute; top: 544px; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-size: 12px; font-weight: 600; text-align: center; opacity:0.5;">
                Loading: {loading_text}
            </p>
            <p style="position: absolute; top: 540px; left: 50%; transform: translate(-50%, -50%); color: #88888888; font-size: 12px; font-weight: 500; text-align: center; opacity:0.5;">
                Loading: {loading_text}
            </p>
            <div  style=" width:24px; position: fixed; top: 552px; right: 40px; transform: translate(-50%, -50%);opacity:0.5;"><Loading/></div>
    {/if}

    
    <div in:blur={{ duration: 600, easing: cubicInOut }} style="position: absolute; top: 400px; left: 50%; min-width:240px; 
            width: 100vw; max-width: 340px; transform: translate(-50%, -50%); z-index: 101;">

        <span class="info-line">⚡ <span class="{transactionCountLoaded ? 'gold-text' : 'blur-text'}">{formatVolume(transactionCount, 0)}</span> Txs in <span class="{firstTxTillNow ? 'gold-text' : 'blur-text'}">{formatVolume(firstTxTillNow, 0)}</span> days on TON.</span>
        <span class="info-line">⚡ Holding <span class="{TON_balance ? 'gold-text' : 'blur-text'}">{formatVolume(TON_balance, 0)}</span> TON & <span class="{USDT_balanceLoaded ? 'gold-text' : 'blur-text'}">{formatVolume($usdt_balance, 0)}</span> USDT.</span>
        <span class="info-line">⚡ Hosting <span class="{POWER_from_refer_Loaded ? 'gold-text' : 'blur-text'}">{formatVolume($POWER_from_refer, 2)}</span> TON on <span class="{POWER_from_refer_Loaded ? 'gold-text' : 'blur-text'}">{formatVolume($refer_in_DB.length, 0)}</span> OGs.</span>
        <span class="info-line">⚡ Invested <span class="{investment ? 'gold-text' : 'gold-text'}">{formatVolume(investment, 2)}</span> TON in alpha .</span>
        <span class="info-line">⚡ Powered <span class="{percentageLoaded ? 'gold-text' : 'blur-text'}">{formatVolume(power / total_POWER_in_db, 2)} % </span> of <span class="{percentageLoaded ? 'gold-text' : 'blur-text'}">{formatVolume(total_POWER_in_db, 1)}</span> ⚡🌐 .</span>
        <span class="info-line">⚡ Own <span class="{percentageLoaded ? 'gold-text' : 'blur-text'}">{formatVolume(percentage, 2)} %</span> of <span class="{percentageLoaded ? 'gold-text' : 'blur-text'}"> $ {formatVolume(dollar, 2)}</span> AUM.</span>
    </div>

    <div class="warning-tape" style="position: absolute; top:0; left:0;"></div>
    <div class="warning-tape2" style="position: absolute; top:0; right:0;"></div>

</div>

<style>
    /* Add your styles here */
</style>