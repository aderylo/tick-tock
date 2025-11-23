<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let introText =
        "Hello human!\n Would you like to see your life in numbers?";
    let displayedIntro = "";
    let isIntroSelected = false;
    let abortController: AbortController | null = null;

    onMount(() => {
        abortController = new AbortController();
        runIntroSequence(abortController.signal);
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

    async function runIntroSequence(signal: AbortSignal) {
        displayedIntro = "";
        isIntroSelected = false;

        // 1. Type Intro
        await typeText(introText, (s) => (displayedIntro = s), 100, signal);
        if (signal.aborted) return;

        // 2. Wait
        await new Promise((r) => setTimeout(r, 1500));
        if (signal.aborted) return;

        // 3. Select All (Ctrl + A effect)
        isIntroSelected = true;
        await new Promise((r) => setTimeout(r, 1000));
        if (signal.aborted) return;

        // 4. Delete (Clear)
        displayedIntro = "";
        isIntroSelected = false;

        // 5. Transition to next step
        dispatch("complete");
    }
</script>

<h1 class="typing-text" class:selected={isIntroSelected}>
    {displayedIntro}<span class="cursor"></span>
</h1>

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

    .typing-text.selected {
        background-color: white;
        color: black;
    }

    .typing-text.selected .cursor {
        display: none;
    }
</style>
