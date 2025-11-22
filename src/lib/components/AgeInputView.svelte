<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();

    let questionText = "First things first... how old are you?";
    let displayedQuestion = "";
    let isInputVisible = false;
    export let age: number | null = null;
    let abortController: AbortController | null = null;

    onMount(() => {
        abortController = new AbortController();
        runInputSequence(abortController.signal);
        return () => {
            if (abortController) abortController.abort();
        };
    });

    async function typeText(
        text: string,
        onUpdate: (s: string) => void,
        speed = 100,
        signal: AbortSignal,
    ) {
        for (let i = 0; i <= text.length; i++) {
            if (signal.aborted) return;
            onUpdate(text.slice(0, i));
            await new Promise((r) => setTimeout(r, speed));
        }
    }

    async function runInputSequence(signal: AbortSignal) {
        displayedQuestion = "";
        isInputVisible = false;

        // 1. Type Question
        await typeText(
            questionText,
            (s) => (displayedQuestion = s),
            80,
            signal,
        );
        if (signal.aborted) return;

        // 2. Show Input
        isInputVisible = true;
    }

    function handleAgeSubmit(e: KeyboardEvent) {
        if (e.key === "Enter") {
            const input = e.target as HTMLInputElement;
            const val = parseInt(input.value);
            if (!isNaN(val)) {
                age = val;
                dispatch("submit", age);
            }
        }
    }
</script>

<div class="input-container">
    <h1>{displayedQuestion}<span class="cursor"></span></h1>
    {#if isInputVisible}
        <input
            type="number"
            bind:value={age}
            onkeydown={handleAgeSubmit}
            placeholder="Enter age..."
            autofocus
            in:fade
        />
    {/if}
</div>

<style>
    h1 {
        font-size: 3rem;
        font-weight: normal;
        white-space: pre-line;
        text-align: center;
        line-height: 1.5;
    }

    .cursor {
        display: inline-block;
        width: 10px;
        height: 1em;
        background-color: white;
        margin-left: 5px;
        vertical-align: bottom;
        animation: blink 1s step-end infinite;
    }

    @keyframes blink {
        50% {
            opacity: 0;
        }
    }

    .input-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    input {
        background: transparent;
        border: none;
        border-bottom: 2px solid white;
        color: white;
        font-size: 2rem;
        text-align: center;
        font-family: monospace;
        outline: none;
        width: 200px;
    }

    /* Remove spinner for number input */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
    }
</style>
