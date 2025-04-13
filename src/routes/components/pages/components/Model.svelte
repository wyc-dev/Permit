<script>
    import { cubicInOut } from "svelte/easing";
    export let showModal;
    export let inviter;
    export let modalTitle;
    export let modalMessage;
    export let Unplug;
    export let TG_TON;
    export let Link;
    export let modal_text;    
</script>

{#if showModal}

    <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div-top" style="z-index:2000;"></div>
    <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div-up" style="z-index:2000;"></div>

        <div class="overlay" transition:fade={{ duration: 100, easing: cubicInOut }} on:click={()=>{showModal = false;}}></div>
        <div class="modal" transition:fade={{ duration: 500, easing: cubicInOut }}>
            <p
                style="position:absolute; top:8px;color:gold; font-size:16px; font-weight:700;"
            >
                {modalTitle}
            </p>
            <p
                style="position:absolute; top: 88px; transform: translate(0%, -50%); width:80%;font-size:14px;"
            >
                {modalMessage}
            </p>

            {#if modalTitle == "Only by Invitation"}
                    <input bind:value={inviter} style="position:absolute; top: 160px; transform: translate(0%, -50%); width:75%;font-size:16px; border:1px solid white"/>
            {:else if modalTitle == "Log Out Confirm"}
                    <img src={Unplug} alt="Unplug" style="position:absolute; top: 80px;width:100%;"/>
            {:else if modalTitle == "Browser Restricted"}
                    <img src={TG_TON} alt="TG_TON" style="position:fixed; top: 136px;width:auto; height:60px;z-index:3;"/>
                    <video style="position:fixed; top: 124px;width:auto; height:80px;" 
                        autoplay loop muted playsinline preload="auto">
                        <source src={Link} type="video/mp4">
                    </video>
            {/if}

            <button class="gold-border pushable"
                on:click={() => {
                    closeModal();
                }}
                style="position:absolute; width:240px; height:56px; bottom:8px;"
            >
                <span class="front" style="position:absolute; width:240px;">{modal_text}</span>
            </button>
        </div>

    <div transition:fade={{ duration: 150, easing: cubicInOut }} class="gradient-div" style="z-index:2000;"></div>

{/if}