<script lang="ts">
    import { appState } from "$lib/stores/appState";
    import VisualizationView from "./VisualizationView.svelte";
    import PerspectiveView from "./PerspectiveView.svelte";
    import PacmanView from "./PacmanView.svelte";
    import { fade } from "svelte/transition";

    $: userData = $appState.userData;
    let mode: "classic" | "retro" = "classic";
</script>

<div class="dashboard-view">
    {#if !userData.age}
        <div class="empty-state">
            <h2>Please enter your age in the right sidebar →</h2>
        </div>
    {:else}
        <div class="controls">
            <button
                class="toggle-btn"
                class:active={mode === "classic"}
                on:click={() => (mode = "classic")}
            >
                Classic
            </button>
            <button
                class="toggle-btn"
                class:active={mode === "retro"}
                on:click={() => (mode = "retro")}
            >
                Retro
            </button>
        </div>

        <div class="content-container">
            {#if mode === "classic"}
                <div class="content-grid" in:fade>
                    <div class="section">
                        <VisualizationView
                            age={userData.age}
                            totalYears={userData.lifeExpectancy}
                        />
                    </div>
                    <div class="section">
                        <PerspectiveView
                            age={userData.age}
                            totalYears={userData.lifeExpectancy}
                        />
                    </div>
                </div>
            {:else}
                <div class="retro-container" in:fade>
                    <PacmanView />
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .dashboard-view {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start; /* Start from top */
        padding-top: 2rem;
    }

    .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        background: #222;
        padding: 0.5rem;
        border-radius: 8px;
    }

    .toggle-btn {
        background: transparent;
        border: none;
        color: #888;
        padding: 0.5rem 1.5rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        transition: all 0.2s;
    }

    .toggle-btn.active {
        background: #444;
        color: white;
        font-weight: bold;
    }

    .empty-state {
        text-align: center;
        color: #888;
        margin-top: 5rem;
    }

    .content-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        overflow-y: auto;
    }

    .content-grid {
        display: grid;
        grid-template-rows: auto auto;
        gap: 3rem;
        width: 100%;
        max-width: 1000px;
        padding: 0 2rem 2rem 2rem;
    }

    .retro-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
    }

    .section {
        width: 100%;
        display: flex;
        justify-content: center;
    }
</style>
