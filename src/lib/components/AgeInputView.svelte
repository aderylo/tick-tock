<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    export let age: number | null = null;

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (age !== null && age > 0) {
            dispatch("submit", age);
        }
    }
</script>

<div class="input-container" in:fade>
    <h2>First things first, what's your age?</h2>

    <div class="input-wrapper">
        <input
            type="number"
            bind:value={age}
            placeholder="Age"
            min="1"
            max="120"
            on:keydown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button on:click={handleSubmit} disabled={!age || age <= 0}>
            Enter
        </button>
    </div>
</div>

<style>
    .input-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    h2 {
        font-size: 2rem;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: white;
    }

    .input-wrapper {
        display: flex;
        gap: 1rem;
    }

    input {
        font-size: 2rem;
        padding: 0.5rem;
        width: 100px;
        text-align: center;
        background: transparent;
        border: 2px solid white;
        color: white;
        border-radius: 8px;
    }

    input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.1);
    }

    /* Remove spinner buttons */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
    }

    button {
        font-size: 1.5rem;
        padding: 0.5rem 2rem;
        background: white;
        color: black;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.1s;
    }

    button:hover:not(:disabled) {
        transform: scale(1.05);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
