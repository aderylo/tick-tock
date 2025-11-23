<script lang="ts">
    import { appState } from "$lib/stores/appState";
    import RetroIntroView from "$lib/components/RetroIntroView.svelte";
    import { fade } from "svelte/transition";

    $: currentView = $appState.currentView;
    $: mode = $appState.mode;
</script>

<main>
    <div class="fullscreen-center" in:fade>
        <RetroIntroView />
    </div>
</main>

<style>
    :global(body) {
        background-color: black;
        color: white;
        margin: 0;
        min-height: 100vh; /* Allow growing */
        width: 100vw;
        font-family: "Inter", sans-serif;
        /* overflow: hidden; Removed to allow browser UI to collapse */
        overflow-y: auto;
    }

    main {
        width: 100%;
        min-height: 100vh; /* Match body */
        position: relative;
        /* Force a bit of extra height on mobile to trigger scroll */
        padding-bottom: 1px; 
    }

    /* Ensure full height for desktop still works */
    .fullscreen-center {
        width: 100%;
        height: 100vh; /* Restored fixed height for children to calculate % against */
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
