<script>
    
    import { fade } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import PowerBoard from "./PowerBoard.svelte";

</script>



<div in:fade={{ duration: 1000, easing: cubicInOut }}
    style="position:fixed; width:calc(100vw - 32px); min-width:320px; background: transparent;
    left:auto; top:96px ; bottom:0px; height:100%;border-radius: 28px;  margin:8px; ">
    
        <div in:fade={{ duration: 1000, easing: cubicInOut }}
            style=" margin-top:0px; position: absolute; width: 100%;  top: 0px; left: 0; bottom: 88px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;">
            <PowerBoard />
        </div>
    
</div>


