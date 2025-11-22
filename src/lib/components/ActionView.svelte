<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let text =
        "I hope you get it, your time is scarce.\nMake use of it!\n\nDo you have something you have put off for a long time?\nPick three things you want to achieve in the next 100 days.\n\nIf you enter an email we'll check on you.";
    let displayedText = "";
    let showInputs = false;
    let abortController: AbortController | null = null;

    let goal1 = "";
    let goal2 = "";
    let goal3 = "";
    let email = "";

    onMount(() => {
        abortController = new AbortController();
        runSequence(abortController.signal);
        return () => {
            if (abortController) abortController.abort();
        };
    });

    async function typeText(
        fullText: string,
        onUpdate: (s: string) => void,
        speed = 50,
        signal: AbortSignal,
    ) {
        for (let i = 0; i <= fullText.length; i++) {
            if (signal.aborted) return;
            onUpdate(fullText.slice(0, i));
            await new Promise((r) => setTimeout(r, speed));
        }
    }

    async function runSequence(signal: AbortSignal) {
        await typeText(text, (s) => (displayedText = s), 40, signal);
        if (signal.aborted) return;
        showInputs = true;
    }

    function handleSubmit() {
        // In a real app, this would send data to a backend
        console.log("Goals:", { goal1, goal2, goal3, email });
        alert("Commitment recorded. Good luck!");
    }
</script>

<div class="action-container">
    <h1 class="typing-text">
        {displayedText}<span class="cursor" class:hidden={showInputs}></span>
    </h1>

    {#if showInputs}
        <div class="inputs-wrapper" in:fade>
            <div class="goals">
                <input type="text" placeholder="Goal #1" bind:value={goal1} />
                <input type="text" placeholder="Goal #2" bind:value={goal2} />
                <input type="text" placeholder="Goal #3" bind:value={goal3} />
            </div>

            <div class="email-section">
                <input
                    type="email"
                    placeholder="your@email.com"
                    bind:value={email}
                />
                <button on:click={handleSubmit}>Commit</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .action-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 100%;
        max-width: 800px;
        padding: 2rem;
    }

    h1 {
        font-size: 1.8rem;
        font-weight: normal;
        white-space: pre-wrap;
        text-align: center;
        line-height: 1.5;
        min-height: 150px; /* Prevent layout shift */
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

    .cursor.hidden {
        display: none;
    }

    @keyframes blink {
        50% {
            opacity: 0;
        }
    }

    .inputs-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 100%;
        max-width: 500px;
    }

    .goals {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    input {
        background: transparent;
        border: none;
        border-bottom: 1px solid #666;
        color: white;
        font-size: 1.2rem;
        padding: 0.5rem;
        font-family: monospace;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-bottom-color: white;
    }

    .email-section {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .email-section input {
        flex: 1;
    }

    button {
        background: white;
        color: black;
        border: none;
        padding: 0.5rem 1.5rem;
        font-family: monospace;
        font-size: 1.2rem;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    button:hover {
        opacity: 0.8;
    }
</style>
