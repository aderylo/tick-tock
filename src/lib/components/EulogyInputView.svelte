<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { appState } from "$lib/stores/appState";

    const dispatch = createEventDispatcher();

    let point1 = "";
    let point2 = "";
    let point3 = "";

    function handleSubmit() {
        if (point1 && point2 && point3) {
            appState.update((s) => ({
                ...s,
                eulogy: { point1, point2, point3 },
            }));
            dispatch("next");
        }
    }

    $: isValid =
        point1.trim().length > 0 &&
        point2.trim().length > 0 &&
        point3.trim().length > 0;
</script>

<div class="container" in:fade>
    <h2>What would you like to be remembered for?</h2>

    <div class="inputs">
        <div class="input-group" in:fly={{ y: 20, delay: 200 }}>
            <input
                type="text"
                placeholder="e.g. Being a kind father"
                bind:value={point1}
            />
        </div>
        <div class="input-group" in:fly={{ y: 20, delay: 400 }}>
            <input
                type="text"
                placeholder="e.g. Building something that lasts"
                bind:value={point2}
            />
        </div>
        <div class="input-group" in:fly={{ y: 20, delay: 600 }}>
            <input
                type="text"
                placeholder="e.g. Always helping others"
                bind:value={point3}
            />
        </div>
    </div>

    <button
        class="submit-btn"
        disabled={!isValid}
        on:click={handleSubmit}
        in:fade={{ delay: 800 }}
    >
        Create Eulogy
    </button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
        width: 100%;
        max-width: 600px;
        padding: 2rem;
    }

    h2 {
        font-size: 2rem;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: #ddd;
    }

    .inputs {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
    }

    .input-group {
        width: 100%;
    }

    input {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #444;
        border-radius: 4px;
        color: white;
        outline: none;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    input:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: #888;
    }

    .submit-btn {
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

    .submit-btn:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }

    .submit-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background: #555;
        color: #888;
    }
</style>
