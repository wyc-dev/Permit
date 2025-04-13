<script>
    
    export let fill = "white";
    import Tick from "./tick.svelte"
    import Cross from "./cross.svelte"
    import Dots from "./dots.svelte"
    
</script>

<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">

        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">

            {#if fill === "#22FF22"}
                <Tick {fill}/>
            {:else if fill === "#FF2222"}
                <Cross {fill}/>
            {:else}
                <Dots {fill}/>
            {/if}

        </div>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="60" height="60" style="shape-rendering: auto; display: block; background: transparent;"><g><circle stroke-linecap="round" fill="none" stroke-dasharray="56.548667764616276 56.548667764616276" stroke={fill} stroke-width="4" r="36" cy="50" cx="50">
          <animateTransform values="0 50 50;360 50 50" keyTimes="0;1" dur="10s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform>
        </circle><g></g></g></svg>

</div>