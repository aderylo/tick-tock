<script lang="ts">
    import { appState, updateUserData, resetAppState } from "$lib/stores/appState";
    import { createEventDispatcher, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import RetroSelect from "$lib/components/RetroSelect.svelte";

    const dispatch = createEventDispatcher();

    let sleepHours = 8;
    let workHours = 8;
    let commuteTime = 1;
    let workDays = 5;

    // Days 0-7
    const days = Array.from({ length: 8 }, (_, i) => i);

    // Derived options to prevent exceeding 24 hours total
    $: sleepOptions = Array.from({ length: Math.max(0, 24 - workHours - commuteTime) + 1 }, (_, i) => i);
    $: workOptions = Array.from({ length: Math.max(0, 24 - sleepHours - commuteTime) + 1 }, (_, i) => i);
    $: commuteOptions = Array.from({ length: Math.max(0, 24 - sleepHours - workHours) + 1 }, (_, i) => i);

    // Initialize from store
    onMount(() => {
        const ud = $appState.userData;
        
        // Sanitize initial values
        let s = ud.sleepHours;
        let w = ud.workHours;
        let c = ud.commuteTime;
        
        if (s + w + c > 24) {
             // Naive reduction to ensure validity
             if (c > 24 - s - w) c = Math.max(0, 24 - s - w);
             if (w > 24 - s - c) w = Math.max(0, 24 - s - c);
             if (s > 24 - w - c) s = Math.max(0, 24 - w - c);
        }
        
        sleepHours = s;
        workHours = w;
        commuteTime = c;
        workDays = ud.workDays;
    });

    // Update store when values change
    function saveSettings() {
        updateUserData({
            sleepHours,
            workHours,
            commuteTime,
            workDays
        });
    }

    function close() {
        saveSettings(); // Ensure saved on close
        dispatch("close");
    }

    function handleReset() {
        if (confirm("WARNING: THIS WILL WIPE ALL MEMORY LOGS. PROCEED?")) {
            resetAppState();
            dispatch("reset");
        }
    }
</script>

<div class="ascii-frame">
    <button class="close-btn" on:click={close}>X</button>
    
    <div class="terminal-text text-yellow mb-6">
        SETTINGS
    </div>

    <div class="settings-grid">
        <RetroSelect 
            label="SLEEP (HRS/DAY)" 
            bind:value={sleepHours} 
            options={sleepOptions} 
            on:change={saveSettings} 
        />

        <RetroSelect 
            label="WORK (HRS/DAY)" 
            bind:value={workHours} 
            options={workOptions} 
            on:change={saveSettings} 
        />

        <RetroSelect 
            label="COMMUTE (HRS/DAY)" 
            bind:value={commuteTime} 
            options={commuteOptions} 
            on:change={saveSettings} 
        />

        <RetroSelect 
            label="WORK DAYS (PER WEEK)" 
            bind:value={workDays} 
            options={days} 
            on:change={saveSettings} 
        />
    </div>

    <div class="flex flex-col items-center gap-4 mt-8">
        <button class="pixel-btn text-red" style="border-color: #ff3333; color: #ff3333;" on:click={handleReset}>
            [ LOG OUT ]
        </button>
        
        <div class="text-gray mt-2" style="font-size: 0.6rem;">
            (CLEANS MEMORY)
        </div>
    </div>
</div>

<style>
    .ascii-frame {
        border: 2px dashed #444;
        padding: 2rem;
        max-width: 500px;
        width: 95%;
        text-align: center;
        position: relative;
        background: rgba(0, 10, 0, 0.9);
    }

    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: transparent;
        border: none;
        color: #666;
        font-family: "Press Start 2P", cursive;
        font-size: 1.2rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #fff;
    }

    .terminal-text {
        font-family: "Press Start 2P", cursive;
        font-size: 1rem;
        margin-bottom: 2rem;
        text-align: center;
        line-height: 1.8;
    }

    .text-yellow { color: #ffff00; }
    .text-red { color: #ff3333; }
    .text-gray { color: #888; }

    .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
        width: 100%;
    }
    
    /* Old CSS for native select removed */

    .pixel-btn {
        background: transparent;
        border: 4px solid;
        padding: 15px 20px;
        font-family: "Press Start 2P", cursive;
        font-size: 0.8rem;
        cursor: pointer;
        text-transform: uppercase;
        box-shadow: none;
        transition: all 0.2s;
    }

    .pixel-btn:hover {
        background: #000;
        transform: scale(1.05);
    }

    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .gap-4 { gap: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
</style>
