<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, slide } from "svelte/transition";

    export let value: number;
    export let options: number[];
    export let label: string;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;

    const dispatch = createEventDispatcher();
    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;
    }

    function select(opt: number) {
        value = opt;
        isOpen = false;
        dispatch("change", value);
    }

    // Close on outside click (simple version)
    function handleOutsideClick(e: MouseEvent) {
        // Implement via action or parent if needed, for now simple toggle
    }
</script>

<div class="setting-item">
    <div class="label" id={labelId}>{label}</div>
    <div class="custom-select-wrapper">
        <button 
            class="select-btn" 
            on:click={toggle} 
            class:open={isOpen}
            aria-labelledby={labelId}
        >
            {value} {isOpen ? '▲' : '▼'}
        </button>

        {#if isOpen}
            <div class="options-list" transition:slide={{ duration: 200 }}>
                {#each options as opt}
                    <button 
                        class="option-btn" 
                        class:selected={value === opt}
                        on:click={() => select(opt)}
                    >
                        > {opt}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .setting-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 300px;
        position: relative;
        z-index: 1; /* Base z-index */
    }

    /* Bring active item to front so list overlaps others */
    .setting-item:has(.select-btn.open) {
        z-index: 100;
    }

    .label {
        font-family: "Press Start 2P", cursive;
        font-size: 0.7rem;
        color: #aaa;
        margin-bottom: 0.5rem;
        letter-spacing: 1px;
    }

    .custom-select-wrapper {
        position: relative;
        width: 100%;
    }

    .select-btn {
        background: transparent;
        border: 2px solid #333;
        color: #ffffff;
        font-family: "Press Start 2P", cursive;
        font-size: 0.9rem;
        outline: none;
        padding: 0.8rem;
        text-align: center;
        width: 100%;
        cursor: pointer;
        box-shadow: none;
        transition: all 0.2s;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }

    .select-btn:hover {
        border-color: #888;
    }

    .select-btn.open {
        border-color: #ffff00;
        color: #ffff00;
        background: rgba(255, 255, 0, 0.1);
    }

    .options-list {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-height: 200px; /* Scrollable if too long */
        overflow-y: auto;
        background: #000;
        border: 2px solid #444;
        display: flex;
        flex-direction: column;
        margin-top: 0.5rem;
        box-shadow: 0 10px 20px rgba(0,0,0,0.9);
        z-index: 50;
    }

    /* Scrollbar styling for the list */
    .options-list::-webkit-scrollbar {
        width: 8px;
        background: #111;
    }
    .options-list::-webkit-scrollbar-thumb {
        background: #444;
    }

    .option-btn {
        background: transparent;
        border: none;
        border-bottom: 1px solid #222;
        color: #888;
        font-family: inherit;
        padding: 1rem;
        text-align: left;
        cursor: pointer;
        font-size: 0.7rem;
        transition: all 0.2s;
        width: 100%;
    }

    .option-btn:hover {
        background: #111;
        color: #fff;
        padding-left: 1.5rem;
    }

    .option-btn.selected {
        color: #ffff00;
        background: #111;
        border-left: 4px solid #ffff00;
    }
</style>
