<script>
    export let operation;
    export let recentDeposits;
    export let recentSpends;
    export let op_color;
    export let TOKEN_contract;
    export let user_address;
    import { lang } from '../../../../../store.js';

    // 卡片点击处理函数
    function handleCardClick(txHash, event) {
        window.open(`https://basescan.org/tx/${txHash}`, '_blank');
    }

    // 卡片点击处理函数
    function checkOnBase() {
        window.open(`https://basescan.org/token/${TOKEN_contract}`, '_blank');
    }

    function round(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    function formatVolume(value, float) {
        if (!value || isNaN(value) || value == null || value == 0) {
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
            return `${(value / 1000000).toFixed(float)} K`;
        } else if (value) {
            return round(value, float);
        }
    }
</script>

{#if operation === "DEPOSIT"}
    <!-- {#if recentDeposits.length === 0}
        <div class="more_records">No records found</div>
    {:else} -->
        <div class="tx-container">
            {#each recentDeposits as tx}
                <div 
                    class="tx-card deposit" 
                    on:click={() => handleCardClick(tx.txHash)}
                    role="button"
                    tabindex="0"
                >
                    <div class="header_tx">
                        <span class="header_tx timestamp">{tx.timestamp}</span>
                        <span class="header_tx status">
                            <a href="https://basescan.org/tx/{tx.txHash}" target="_blank" class="details">
                                On-chain Details ↗
                            </a>
                        </span>
                    </div>
                    <div class="body">
                        <span class="amount">{formatVolume(tx.amount, 1)} TOKEN</span>
                        <span class="direction" style="color:{op_color};">{tx.direction}</span>
                    </div>
                </div>
            {/each}
            <a href="https://basescan.org/token/{TOKEN_contract}?a={user_address}" target="_blank" class="more_records">
                {recentSpends.length === 0 ? ($lang === "ZH" ? "找不到任何交易紀錄" : "No records found") : ($lang === "ZH" ? "查閱所有交易紀錄" : "Full history on Basescan")}
            </a>
        </div>

{:else if operation === "SPEND"}

        <div class="tx-container">
            {#each recentSpends as tx}
                <div 
                    class="tx-card spend"
                    on:click={() => handleCardClick(tx.txHash)}
                    role="button"
                    tabindex="0"
                >
                    <div class="header_tx">
                        <span class="header_tx timestamp">{tx.timestamp}</span>
                        <span class="header_tx status">
                            <a href="https://basescan.org/tx/{tx.txHash}" target="_blank" class="details">
                                On-chain Details ↗
                            </a>
                        </span>
                    </div>
                    <div class="body">
                        <span class="amount">{formatVolume(tx.amount, 1)} TOKEN</span>
                        <span class="direction" style="color:{op_color};">{tx.direction}</span>
                    </div>
                </div>
            {/each}
            <a href="https://basescan.org/token/{TOKEN_contract}?a={user_address}" target="_blank" class="more_records">
                {recentSpends.length === 0 ? ($lang === "ZH" ? "找不到任何交易紀錄" : "No records found") : ($lang === "ZH" ? "查閱所有交易紀錄" : "Full history on Basescan")}
            </a>
        </div>
 
{/if}

<style>
    .tx-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 80vw;
        margin: 0 auto; /* 水平居中 */
    }

    .tx-card {
        border-radius: 8px 8px 8px 8px;
        width: 100%; /* 佔據容器的全部寬度 */
        min-width: 240px;
        max-width: 400px;
        height: 52px;
        margin: 16px 0; /* 上下間距，左右自動居中 */
        transition: transform 0.33s;
    }

    .header_tx {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        margin: 4px;
        color: #888;
    }

    .body {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 8px;
        margin-top: -12px;
        margin-bottom: -16px;
    }

    .amount {
        font-weight: bold;
        font-size: 14px;
    }

    .direction {
        font-size: 1em;
        opacity: 1;
    }

    .details {
        text-decoration: none;
        color: #FFA500;
        text-align: left;
        font-size: 10px;
        margin: 0px;
    }

    .more_records {
        text-align: center;
        color: #888;
        font-size: 12px;
        margin: 16px;
    }
</style>