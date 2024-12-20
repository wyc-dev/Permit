<script>
    import Binance from "../../icons/B/binance.png";
    import CryptoCom from "../../icons/B/cryptoCom.png";
    import OKX from "../../icons/B/okx.png";
    import { latest5Tx, firstTx } from '../../../store.js';

    export let firstTxTillNow;
    export let transactionCount;
    export let check_cryptoCom;
    export let check_binance;
    export let check_okx;
    export let B_score;

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0 ) {
            return 0;
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
</script>



<p class="interaction-label-left gold-text">CEX / DEX Interactions</p>
<p class="interaction-label-right gold-text">⚡ +{B_score}</p>

<div class="defi">
    <div class="item-box" style="opacity:{check_binance ? 1 : 0.3};">
        <img class="item" src={Binance} alt="Binance"
            style="border: 1px solid {check_binance ? "white" : "none"}; filter: {check_binance ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text">Binance</p>
        <p class="item-invest gold-text" style="font-size:12px;" > + {check_binance ? 10 : 0} ⚡</p>
    </div>
    <div class="item-box" style="opacity:{check_cryptoCom ? 1 : 0.3};">
        <img class="item" src={CryptoCom} alt="CryptoCom"
            style="border: 1px solid {check_cryptoCom ? "white" : "none"}; filter: {check_cryptoCom ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text" style="font-size:11px;" >Crypto.com</p>
        <p class="item-invest gold-text" style="font-size:12px;" > + {check_cryptoCom ? 10 : 0} ⚡</p>
    </div>
    <div class="item-box" style="opacity:{check_okx ? 1 : 0.3};">
        <img class="item" src={OKX} alt="OKX"
            style="border: 1px solid {check_okx ? "white" : "none"}; filter: {check_okx ? "drop-shadow(0 0 2px rgba(255, 255, 255, 1))" : "none"};"/>
        <p class="item-text">OKX</p>
        <p class="item-invest gold-text" style="font-size:12px;" > + {check_okx ? 10 : 0} ⚡</p>
    </div>
</div>

<p class="summary-left gold-text">Made {transactionCount} Txs in {firstTxTillNow} days</p>
<p class="summary-right gold-text">⚡ +{transactionCount + firstTxTillNow}</p>

<p class="first-tx-label">1st transaction you made</p>
<div class="transaction-table">
    <table>
        <tbody>
            {#if $firstTx}
                <tr
                    on:click={() => window.open(`https://tonviewer.com/transaction/${$firstTx.hash}`, '_blank')}
                    class="clickable-row"
                >
                    <td class="date-column">{new Date($firstTx.utime * 1000).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })}</td>
                    <td class="type-column">{$firstTx.type} {formatVolume($firstTx.amount,2)} {$firstTx.token}</td>
                    <td class="hash-column">...{$firstTx.hash.slice(-4)}</td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5" class="no-data">No first transaction data found.</td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<p class="recent-tx-label">Most recent 5 transactions</p>
<div class="transaction-table" style="top: 428px;">
    <table>
        <tbody>
                {#if $latest5Tx.length > 0}
                        {#each $latest5Tx as tx}
                        <tr
                          on:click={() => window.open(`https://tonviewer.com/transaction/${tx.hash}`, '_blank')}
                          class="clickable-row"
                        >
                          <td class="date-column">{tx.date}</td>
                          <td>{tx.direction}</td>
                          <td>{tx.amount} {tx.token}</td>
                          <td class="hash-column">...{tx.hash.slice(-4)}</td>
                        </tr>
                        {/each}
                {:else}
                        <tr>
                        <td colspan="6" class="no-data">No recent transactions found.</td>
                        </tr>
                {/if}
        </tbody>
    </table>
</div>

<style>

    .interaction-label-left {
        position: absolute;
        top: 128px;
        left: 40px;
        color: white;
        font-size: 14px;
        width: 100vw;
        text-align: left;
    }

    .interaction-label-right {
        position: absolute;
        top: 128px;
        right: 40px;
        color: white;
        font-size: 14px;
        width: 100vw;
        text-align: right;
    }

    .defi {
        display: flex;
        gap: 10px;
    }

    .summary-left {
        position: absolute;
        top: 310px;
        left: 40px;
        color: white;
        font-size: 14px;
        width: 100vw;
        text-align: left;
    }

    .summary-right {
        position: absolute;
        top: 310px;
        right: 40px;
        color: white;
        font-size: 14px;
        width: 100vw;
        text-align: right;
    }

    .first-tx-label {
        position: absolute;
        top: 345px;
        left: 40px;
        color: white;
        font-size: 12px;
        font-weight: 700;
        width: 100vw;
        text-align: left;
    }

    .recent-tx-label {
        position: absolute;
        top: 400px;
        left: 40px;
        color: white;
        font-size: 12px;
        font-weight: 700;
        width: 100vw;
        text-align: left;
    }

    .transaction-table {
        position: absolute;
        top: 372px;
        left: 40px;
        width: calc(100vw - 80px);
        height: 120px;
        overflow-y: scroll;
        background: none;
        scroll-behavior: smooth;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    td {
        padding: 4px 0;
        font-size: 10px;
        color: #FFFFcc;
    }

    .date-column {
        width: 40%;
        text-align: left;
    }

    .type-column {
        width: 40%;
        text-align: right;
    }

    .hash-column, .token-column, .amount-column {
        text-align: right;
    }

    .no-data {
        text-align: center;
        padding: 8px 0;
        color: #888;
    }
</style>