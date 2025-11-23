<script lang="ts">
    import { appState } from "$lib/stores/appState";
    import LeftSidebar from "$lib/components/LeftSidebar.svelte";
    import RightSidebar from "$lib/components/RightSidebar.svelte";
    import BigPictureView from "$lib/components/BigPictureView.svelte";
    import YearlyView from "$lib/components/YearlyView.svelte";
    import MonthlyView from "$lib/components/MonthlyView.svelte";
    import WeeklyView from "$lib/components/WeeklyView.svelte";
    import CalendarView from "$lib/components/CalendarView.svelte";
    import RetroIntroView from "$lib/components/RetroIntroView.svelte";
    import { fade } from "svelte/transition";

    $: currentView = $appState.currentView;
    $: mode = $appState.mode;
</script>

<main>
    {#if mode === "intro"}
        <div class="fullscreen-center" in:fade>
            <RetroIntroView />
        </div>
    {:else}
        <div class="dashboard-layout" in:fade>
            <LeftSidebar />

            <div class="center-stage">
                {#key currentView}
                    <div class="view-container" in:fade={{ duration: 300 }}>
                        {#if currentView === "big-picture"}
                            <BigPictureView />
                        {:else if currentView === "yearly"}
                            <YearlyView />
                        {:else if currentView === "monthly"}
                            <MonthlyView />
                        {:else if currentView === "weekly"}
                            <WeeklyView />
                        {:else if currentView === "calendar"}
                            <CalendarView />
                        {/if}
                    </div>
                {/key}
            </div>

            <RightSidebar />
        </div>
    {/if}
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

    .dashboard-layout {
        width: 100%;
        height: 100vh; /* Restored fixed height */
        display: flex;
    }

    .center-stage {
        flex: 1;
        height: 100%; /* Match parent */
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 1;
    }

    .view-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        box-sizing: border-box;
    }
</style>
