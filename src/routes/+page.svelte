<script lang="ts">
    import IntroView from "$lib/components/IntroView.svelte";
    import AgeInputView from "$lib/components/AgeInputView.svelte";
    import VisualizationView from "$lib/components/VisualizationView.svelte";
    import PerspectiveView from "$lib/components/PerspectiveView.svelte";
    import ActionView from "$lib/components/ActionView.svelte";

    let step = 0; // 0: Intro, 1: Input, 2: Visualization, 3: Perspective, 4: Action
    let age: number | null = null;
    let totalYears = 80; // Shared state for total years

    function handleIntroComplete() {
        step = 1;
    }

    function handleAgeSubmit(event: CustomEvent<number>) {
        age = event.detail;
        step = 2;
    }

    function nextStep() {
        if (step === 0) {
            step = 1;
        } else if (step === 1 && age !== null && age > 0) {
            step = 2;
        } else if (step === 2) {
            step = 3;
        } else if (step === 3) {
            step = 4;
        }
    }

    function prevStep() {
        if (step > 0) {
            step--;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        // Don't navigate if input is focused (allow typing/cursor movement)
        if (document.activeElement?.tagName === "INPUT") return;

        if (e.key === "ArrowRight") {
            nextStep();
        } else if (e.key === "ArrowLeft") {
            prevStep();
        }
    }

    $: isNextDisabled = step === 1 && (age === null || age <= 0);
</script>

<svelte:window on:keydown={handleKeydown} />

<main>
    {#if step === 0}
        <IntroView on:complete={handleIntroComplete} />
    {:else if step === 1}
        <AgeInputView bind:age on:submit={handleAgeSubmit} />
    {:else if step === 2}
        <VisualizationView age={age || 0} bind:totalYears />
    {:else if step === 3}
        <PerspectiveView age={age || 0} {totalYears} />
    {:else if step === 4}
        <ActionView />
    {/if}

    {#if step < 4}
        <div class="navigation-controls">
            <button class="nav-btn" on:click={prevStep} disabled={step === 0}>
                ←
            </button>
            <button
                class="nav-btn"
                on:click={nextStep}
                disabled={isNextDisabled || step === 4}
            >
                →
            </button>
        </div>
    {/if}
</main>

<style>
    :global(body) {
        background-color: black;
        color: white;
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: monospace;
        overflow: hidden;
    }

    main {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .navigation-controls {
        position: absolute;
        bottom: 2rem;
        display: flex;
        gap: 1rem;
    }

    .nav-btn {
        background: transparent;
        border: 1px solid white;
        color: white;
        font-size: 1.5rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s;
    }

    .nav-btn:hover:not(:disabled) {
        background: white;
        color: black;
    }

    .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: #555;
    }
</style>
