<script lang="ts">
    import { appState, setMode, updateUserData } from "$lib/stores/appState";
    import LeftSidebar from "$lib/components/LeftSidebar.svelte";
    import RightSidebar from "$lib/components/RightSidebar.svelte";
    import BigPictureView from "$lib/components/BigPictureView.svelte";
    import YearlyView from "$lib/components/YearlyView.svelte";
    import MonthlyView from "$lib/components/MonthlyView.svelte";
    import WeeklyView from "$lib/components/WeeklyView.svelte";
    import CalendarView from "$lib/components/CalendarView.svelte";
    import IntroView from "$lib/components/IntroView.svelte";
    import AgeInputView from "$lib/components/AgeInputView.svelte";
    import { fade } from "svelte/transition";

    $: currentView = $appState.currentView;
    $: mode = $appState.mode;

    function handleIntroComplete() {
        setMode("age-input");
    }

    function handleAgeSubmit(event: CustomEvent<number>) {
        updateUserData({ age: event.detail });
        setMode("dashboard");
    }
</script>

<main>
    {#if mode === "intro"}
        <div class="fullscreen-center" in:fade>
            <IntroView on:complete={handleIntroComplete} />
        </div>
    {:else if mode === "age-input"}
        <div class="fullscreen-center" in:fade>
            <AgeInputView
                age={$appState.userData.age}
                on:submit={handleAgeSubmit}
            />
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
        height: 100vh;
        width: 100vw;
        font-family: "Inter", sans-serif; /* Modern font */
        overflow: hidden;
    }

    main {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .fullscreen-center {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .dashboard-layout {
        width: 100%;
        height: 100%;
        display: flex;
    }

    .center-stage {
        flex: 1;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 1; /* Below sidebars */
        overflow-y: auto; /* Allow scrolling if content is tall */
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
