<script>
    import TON from "../../icons/ton-logo.svelte";
    import USDT from "../../icons/C/usdt.svelte";
    import REDO from "../../icons/C/REDO.png";
    import Hamster from "../../icons/C/HMSTR.png";
    import Dogs from "../../icons/C/DOGS.png";
    import { TON_balance, TON_price,
            assets_worth_in_TON,
            assets_list, 
            usdt_minter, 
            redo_minter, 
            dogs_minter, 
            hmstr_minter,
            usdt_balance,
            redo_balance,
            dogs_balance,
            hmstr_balance,
            usdt_worth,
            redo_worth,
            dogs_worth,
            hmstr_worth, } from '../../../store.js';

    $: calculateWorths();
    $: ton_worth_color =  $TON_balance > 0 ? "#888800" : "#888888"
    $: usdt_worth_color = $usdt_balance > 0 ? "#888800" : "#888888"
    $: redo_worth_color = $redo_balance > 0 ? "#888800" : "#888888"
    $: dogs_worth_color = $dogs_balance > 0 ? "#888800" : "#888888"
    $: hmstr_worth_color= $hmstr_balance > 0 ? "#888800" : "#888888"

    function calculateWorths() {

        // 遍歷 assets_list，計算每種資產的美元總值
        $assets_list.forEach(asset => {
            if (asset.master === $dogs_minter) {
                dogs_worth.set(asset.TON_value);
            } else if (asset.master === $hmstr_minter) {
                hmstr_worth.set(asset.TON_value);
            } 
        });
    }

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
</script>

<p class="gold-text" style="position:absolute; top:128px; left:40px; color:white; font-size:14px;
      width:100vw; text-align: left;">
    *PoR in TON of account
</p>
<p class="gold-text" style="position:absolute; top:128px; right:40px; color:white; font-size:14px; 
      width:100vw; text-align: right;">
    ⚡ +{formatVolume($TON_balance + $assets_worth_in_TON, 2)}
</p>

<div class="defi">

    <div class="asset1">
        <TON/>
        <p class="assets-text" style="color:{ton_worth_color};">Native TON coin holdings</p>
        <p class="balance-text">{formatVolume($TON_balance,6)} TON</p>
        <p class="worth-text" style="color:{ton_worth_color};">= {formatVolume($TON_balance,2)} TON</p>
    </div>
    <div class="asset2">
        <USDT/>
        <p class="assets-text" style="color:{usdt_worth_color};">Tether holdings</p>
        <p class="balance-text">{formatVolume($usdt_balance,6)} USDT</p>
        <p class="worth-text" style="color:{usdt_worth_color};">~ {formatVolume($usdt_balance / $TON_price,2)} TON</p>
    </div>
    <div class="asset3">
        <img src={REDO} alt="REDO" style="width: 32px; height: 32px;"/>
        <p class="assets-text" style="color:{redo_worth_color};">Resistance Dog</p>
        <p class="balance-text">{formatVolume($redo_balance,6)} REDO</p>
        <p class="worth-text" style="color:{redo_worth_color};">~ {formatVolume($redo_balance * $redo_worth,2)} TON</p>
    </div>
    <div class="asset4">
        <img src={Dogs} alt="Dogs" style="width: 32px; height: 32px;"/>
        <p class="assets-text" style="color:{dogs_worth_color};">Dogs Community holdings</p>
        <p class="balance-text">{formatVolume($dogs_balance,6)} DOGS</p>
        <p class="worth-text" style="color:{dogs_worth_color};">~ {formatVolume($dogs_balance * $dogs_worth,2)} TON</p>
    </div>
    <div class="asset5">
        <img src={Hamster} alt="Hamster" style="width: 32px; height: 32px;"/>
        <p class="assets-text" style="color:{hmstr_worth_color};">Hamster Kombat holdings</p>
        <p class="balance-text">{formatVolume($hmstr_balance,6)} HMSTR</p>
        <p class="worth-text" style="color:{hmstr_worth_color};">~ {formatVolume($hmstr_balance * $hmstr_worth,2)} TON</p>
    </div>

    <p class="info-text1">* PoR = <del style="color:#888888;font-size: 10px;">Proof-of-Reserves</del> POWER-of-Returns </p>
    <p class="info-text2">More quality assets will be included soon.</p>

</div>


<style>
    .assets-text{
        position: absolute;
        width:calc(100vw - 120px);
        font-size: 10px;
        text-align: left;
        top:-16px;
        left:48px;
    }
    .balance-text{
        position: absolute;
        width:calc(100vw - 120px);
        font-size: 16px;
        text-align: left;
        top:4px;
        left:48px;
    }
    .worth-text{
        width:calc(100vw - 120px);
        font-size: 10px;
        text-align: right;
        margin-top:-50px;
        border-bottom: 1px solid ;
        margin-left:40px;
    }
    
    .info-text1{
        position: fixed;
        width:calc(100vw - 80px);
        font-size: 12px;
        text-align: center;
        top:490px;
        left:40px;
    }
    .info-text2{
        position: fixed;
        width:calc(100vw - 80px);
        font-size: 12px;
        text-align: center;
        top:520px;
        left:40px;
    }
    .asset1{
        position: fixed;
        top:175px;
        left:24px;

        margin:16px;
        width: 32px;
        height: 32px;
        border: 2px solid white; border-radius: 32px;
    }
    .asset2{
        position: fixed;
        top:235px;
        left:24px;

        margin:16px;
        width: 32px;
        height: 32px;
        border: 2px solid white; border-radius: 32px;
    }
    .asset3{
        position: fixed;
        top:295px;
        left:24px;

        margin:16px;
        width: 32px;
        height: 32px;
        border: 2px solid white; border-radius: 32px;
    }
    .asset4{
        position: fixed;
        top:355px;
        left:24px;

        margin:16px;
        width: 32px;
        height: 32px;
        border: 2px solid white; border-radius: 32px;
    }
    .asset5{
        position: fixed;
        top:415px;
        left:24px;

        margin:16px;
        width: 32px;
        height: 32px;
        border: 2px solid white; border-radius: 32px;
    }
</style>