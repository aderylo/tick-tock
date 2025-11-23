<script lang="ts">
    import { appState, updateUserData, resetAppState } from "$lib/stores/appState";
    import { createEventDispatcher, onMount } from "svelte";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();

    let sleepHours = 8;
    let workHours = 8;
    let commuteTime = 1;
    let workDays = 5;

    // Initialize from store
    onMount(() => {
        const ud = $appState.userData;
        sleepHours = ud.sleepHours;
        workHours = ud.workHours;
        commuteTime = ud.commuteTime;
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
        <div class="setting-item">
            <label for="sleep">SLEEP (HRS/DAY)</label>
            <input 
                id="sleep" 
                type="number" 
                min="0" 
                max="24" 
                bind:value={sleepHours} 
                on:change={saveSettings}
            />
        </div>

        <div class="setting-item">
            <label for="work">WORK (HRS/DAY)</label>
            <input 
                id="work" 
                type="number" 
                min="0" 
                max="24" 
                bind:value={workHours} 
                on:change={saveSettings}
            />
        </div>

        <div class="setting-item">
            <label for="commute">COMMUTE (HRS/DAY)</label>
            <input 
                id="commute" 
                type="number" 
                min="0" 
                max="24" 
                bind:value={commuteTime} 
                on:change={saveSettings}
            />
        </div>

        <div class="setting-item">
            <label for="workdays">WORK DAYS (PER WEEK)</label>
            <input 
                id="workdays" 
                type="number" 
                min="0" 
                max="7" 
                bind:value={workDays} 
                on:change={saveSettings}
            />
        </div>
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

    .setting-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 300px;
    }

    label {
        font-family: "Press Start 2P", cursive;
        font-size: 0.7rem;
        color: #aaa;
        margin-bottom: 0.5rem;
        letter-spacing: 1px;
    }

    input {
        background: transparent;
        border: 2px solid #333;
        color: #ffffff;
        font-family: "Press Start 2P", cursive;
        font-size: 0.9rem;
        outline: none;
        padding: 0.8rem;
        text-align: center;
        width: 100%;
        transition: border-color 0.3s;
    }

    input:focus {
        border-color: #00ff00;
    }

    /* Hide spin buttons */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
    }

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
