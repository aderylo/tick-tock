<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { appState } from "$lib/stores/appState";

    const dispatch = createEventDispatcher();

    let item1 = "";
    let item2 = "";
    let item3 = "";

    function handleFinish() {
        if (item1 && item2 && item3) {
            appState.update((s) => ({
                ...s,
                actionItems: { item1, item2, item3 },
            }));
            // Here we could dispatch a 'finish' event or just end the flow
            // For now, let's just log or maybe show a completion state
            alert("Carpe Diem!");
        }
    }

    $: isValid =
        item1.trim().length > 0 &&
        item2.trim().length > 0 &&
        item3.trim().length > 0;
</script>

<div class="container" in:fade>
    <h2>Knowing this, what will you do today?</h2>
    <p class="subtitle">Three actions to make today count.</p>

    <div class="inputs">
        <div class="input-group" in:fly={{ y: 20, delay: 200 }}>
            <span class="number">1</span>
            <input type="text" placeholder="I will..." bind:value={item1} />
        </div>
        <div class="input-group" in:fly={{ y: 20, delay: 400 }}>
            <span class="number">2</span>
            <input type="text" placeholder="I will..." bind:value={item2} />
        </div>
        <div class="input-group" in:fly={{ y: 20, delay: 600 }}>
            <span class="number">3</span>
            <input type="text" placeholder="I will..." bind:value={item3} />
        </div>
    </div>

    <button
        class="commit-btn"
        disabled={!isValid}
        on:click={handleFinish}
        in:fade={{ delay: 800 }}
    >
        Commit to Action
    </button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 100%;
        max-width: 600px;
        padding: 2rem;
    }

    h2 {
        font-size: 2rem;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: white;
    }

    .subtitle {
        color: #888;
        font-size: 1.1rem;
        margin-top: -1rem;
        margin-bottom: 1rem;
    }

    .inputs {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
    }

    .input-group {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .number {
        font-size: 1.5rem;
        color: #555;
        font-weight: bold;
        width: 30px;
    }

    input {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        background: transparent;
        border: none;
        border-bottom: 1px solid #444;
        color: white;
        outline: none;
        transition: all 0.2s;
    }

    input:focus {
        border-bottom-color: white;
    }

    .commit-btn {
        margin-top: 2rem;
        padding: 1rem 3rem;
        font-size: 1.2rem;
        background: white;
        color: black;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: bold;
        letter-spacing: 1px;
    }

    .commit-btn:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }

    .commit-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background: #555;
        color: #888;
    }
</style>
