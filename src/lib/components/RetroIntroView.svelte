<script lang="ts">
    import { appState, updateUserData, setMode, resetAppState } from "$lib/stores/appState";
    import PacmanView from "$lib/components/PacmanView.svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let currentScreen: "home" | "loading" | "eulogy" | "reflection" | "status" | "settings" =
        "home";

    let travellerName = "";
    let travellerAge: string = "";
    let consoleLines: string[] = [];
    let eulogyText = "";
    let showEulogyActions = false;

    const eulogyTemplates = [
        "Traveller <span class='text-white'>[NAME]</span> lived quietly but sincerely.<br>Their presence made small moments feel lighter.<br>Their journey may be complete, but the traces of their kindness remain.",
        "<span class='text-white'>[NAME]</span> cared deeply, tried often, and stayed human through both joy and difficulty.<br>Their path wasn’t always easy, but it was theirs — and they walked it bravely.",
        "<span class='text-white'>[NAME]</span> appreciated the small joys: a good conversation, a warm day, a moment of connection.<br>They lived simply, but with heart.",
        "<span class='text-white'>[NAME]</span> spent their years searching for meaning, learning, growing, and asking why.<br>In that pursuit, they found more truth than they knew.",
    ];

    function beginSimulation() {
        if (!travellerName || !travellerAge) {
            alert("IDENTITY REQUIRED.");
            return;
        }

        const ageNum = parseInt(travellerAge);
        if (isNaN(ageNum)) return;

        // Update store immediately with initial data
        updateUserData({
            name: travellerName.toUpperCase(),
            age: ageNum,
        });

        currentScreen = "loading";
        runTerminalSequence();
    }

    function skipIntro() {
        // Set defaults if empty so visualization works
        const nameToUse = travellerName || "TRAVELLER";
        const ageToUse = travellerAge ? parseInt(travellerAge) : 30;

        updateUserData({
            name: nameToUse.toUpperCase(),
            age: ageToUse,
        });

        // Update local state to match for consistency
        travellerName = nameToUse;
        travellerAge = ageToUse.toString();

        currentScreen = "status";
    }

    onMount(() => {
        // Check if user has already entered data (persisted)
        const ud = $appState.userData;
        // We consider it "entered" if age is set (since name has a default)
        // And we ensure we aren't already deep in the intro flow (which on fresh load we aren't)
        if (ud.age && ud.age > 0) {
            // Populate local fields
            travellerName = ud.name;
            travellerAge = ud.age.toString();
            // Skip directly to status
            currentScreen = "status";
        }
    });

    async function typeLine(text: string, delay = 30) {
        // Add empty line first
        consoleLines = [...consoleLines, ""];

        for (let i = 0; i < text.length; i++) {
            consoleLines[consoleLines.length - 1] += text.charAt(i);
            // Force reactivity
            consoleLines = [...consoleLines];
            await new Promise((r) => setTimeout(r, delay));
        }
        await new Promise((r) => setTimeout(r, 100));
    }

    async function runTerminalSequence() {
        await new Promise((r) => setTimeout(r, 200));
        await typeLine("> CONNECTING TO BIOLOGICAL SERVER...", 10);
        await typeLine("> DOWNLOADING TIMELINE...", 10);
        await typeLine("> PARSING MEMORY FRAGMENTS...", 10);
        await new Promise((r) => setTimeout(r, 400));

        await typeLine("...", 50);
        await typeLine(
            `> ERROR: TRAVELLER ${travellerName.toUpperCase()} SIGNAL LOST.`,
            20,
        );
        await typeLine("> STATUS: TERMINATED.", 20);

        // Add death line manually to style it differently if needed, or just type it
        await typeLine("> CAUSE OF DEATH: COMPLETION OF LIFECYCLE.", 20);

        await new Promise((r) => setTimeout(r, 2000));

        // Setup Eulogy
        const randomIndex = Math.floor(Math.random() * eulogyTemplates.length);
        eulogyText = eulogyTemplates[randomIndex].replace(
            /\[NAME\]/g,
            travellerName.toUpperCase(),
        );

        currentScreen = "eulogy";
        // Delay showing buttons slightly for effect
        setTimeout(() => (showEulogyActions = true), 1000);
    }

    function handleEulogyContinue() {
        currentScreen = "status";
    }

    function handleEulogyNo() {
        currentScreen = "reflection";
    }

    function handleReflectionSubmit() {
        alert("TRAJECTORY UPDATED. RESUMING SIMULATION...");
        currentScreen = "status";
    }

    function openSettings() {
        currentScreen = "settings";
    }

    function closeSettings() {
        currentScreen = "status";
    }

    function handleReset() {
        if (confirm("WARNING: THIS WILL WIPE ALL MEMORY LOGS. PROCEED?")) {
            resetAppState();
            // Also clear local state
            travellerName = "";
            travellerAge = "";
            currentScreen = "home";
        }
    }
</script>

<div class="game-container">
    {#if currentScreen === "home"}
        <div class="screen visible" in:fade>
            <div class="earth-container">
                <div class="static-title">
                    <span>EARTH ONLINE</span>
                </div>
                <div class="pixel-earth"></div>
            </div>

            <div class="input-group">
                <label for="input-id">TRAVELLER ID</label>
                <input
                    type="text"
                    id="input-id"
                    placeholder="_ _ _ _ _ _"
                    autocomplete="off"
                    bind:value={travellerName}
                    maxlength="12"
                />
            </div>

            <div class="input-group">
                <label for="input-age">CURRENT AGE</label>
                <input
                    type="number"
                    id="input-age"
                    placeholder="_ _"
                    autocomplete="off"
                    style="width: 120px;"
                    bind:value={travellerAge}
                    max="80"
                />
            </div>

            <button class="pixel-btn" on:click={beginSimulation}
                >BEGIN SIMULATION</button
            >

            <button class="skip-btn" on:click={skipIntro}>
                [ SKIP INTRO ]
            </button>
        </div>
    {/if}

    {#if currentScreen === "loading"}
        <div class="screen visible" in:fade>
            <div class="flex flex-col items-start max-w-md w-full">
                <div
                    id="console-output"
                    class="text-left w-full"
                    style="line-height: 2;"
                >
                    {#each consoleLines as line}
                        <div class="terminal-text text-left text-white">
                            {line}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    {#if currentScreen === "eulogy"}
        <div class="screen visible" in:fade>
            <div class="ascii-frame">
                <!-- Cross at Top Middle -->
                <div class="cross-container">
                    <div class="pixel-cross">†</div>
                </div>

                <div
                    class="terminal-text text-gray mb-6"
                    style="font-size: 0.7rem; letter-spacing: 1px;"
                >
                    [ MEMORY_LOG: <span class="text-white"
                        >{travellerName.toUpperCase()}</span
                    > ]
                </div>

                <!-- Dynamic Eulogy Text Container -->
                <div
                    class="text-center leading-relaxed mb-10 text-gray-300 px-4"
                    style="font-size: 0.8rem; line-height: 2;"
                >
                    {@html eulogyText}
                </div>

                {#if showEulogyActions}
                    <div class="flex gap-8 justify-center" in:fade>
                        <button
                            class="pixel-btn"
                            on:click={handleEulogyContinue}>PLAY AGAIN</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    {#if currentScreen === "reflection"}
        <div class="screen visible" in:fade>
            <div class="w-full max-w-2xl text-center">
                <div class="terminal-text text-green mb-6 blink">
                    LEGACY REWRITE PROTOCOL
                </div>

                <div
                    class="text-left mb-4 text-gray-400"
                    style="font-size: 0.8rem;"
                >
                    "What part feels wrong? What would you want your life to say
                    instead?"
                </div>

                <div class="text-center mb-8">
                    <textarea
                        rows="8"
                        class="w-full border-gray-600 text-white"
                        placeholder="Rewrite your legacy here..."
                    ></textarea>
                </div>

                <button class="pixel-btn" on:click={handleReflectionSubmit}
                    >UPDATE TRAJECTORY</button
                >
            </div>
        </div>
    {/if}

    {#if currentScreen === "status"}
        <div class="screen visible" in:fade>
            <!-- Settings Icon -->
            <button class="settings-btn" on:click={openSettings} title="Settings">
                ⚙️
            </button>
            
            <div class="w-full h-full flex justify-center items-center">
                <PacmanView showWelcome={true} />
            </div>
        </div>
    {/if}

    {#if currentScreen === "settings"}
        <div class="screen visible" in:fade>
            <div class="ascii-frame">
                <div class="terminal-text text-green mb-6">
                    [ SYSTEM CONFIGURATION ]
                </div>

                <div class="flex flex-col items-center gap-4">
                    <button class="pixel-btn text-red" style="border-color: #ff3333; color: #ff3333;" on:click={handleReset}>
                        ⚠ FACTORY RESET
                    </button>
                    
                    <div class="text-gray mt-4" style="font-size: 0.7rem;">
                        This will purge all local data.
                    </div>

                    <button class="pixel-btn secondary mt-8" on:click={closeSettings}>
                        [ RETURN ]
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* ... previous styles ... */
    .settings-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 20;
        transition: transform 0.2s;
        opacity: 0.5;
    }
    
    .settings-btn:hover {
        transform: rotate(90deg);
        opacity: 1;
    }

    /* --- Global Variables & Reset --- */
    :global(:root) {
        --terminal-green: #00ff00;
        --terminal-bg: #000000;
        --terminal-dim: #003300;
    }

    /* Apply the body styles from index.html to the container */
    .game-container {
        background-color: var(--terminal-bg);
        color: #ffffff;
        font-family: "Press Start 2P", cursive;
        /* Solid, blocky pixel font */
        margin: 0;
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        user-select: none;
        font-size: 12px;
        /* Base size reduced for this wide font */
        line-height: 1.5;
        position: relative;
    }

    .screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* opacity: 0; handled by svelte transition */
        /* pointer-events: none; handled by svelte if/else */
        z-index: 1;
        padding: 2rem;
    }

    .screen.visible {
        opacity: 1;
        pointer-events: auto;
        z-index: 10;
    }

    /* --- Typography & Elements --- */
    .terminal-text {
        font-size: 1rem;
        /* Adjusted for Press Start 2P */
        margin-bottom: 1.5rem;
        text-align: center;
        line-height: 1.8;
        color: var(--terminal-green); /* Ensure color is set */
    }

    /* Specific override for Loading Screen to fit lines */
    #loading-screen .terminal-text {
        font-size: 0.7rem;
        margin-bottom: 0.8rem;
        white-space: nowrap;
        /* Keep on one line if possible */
    }

    /* --- Inputs --- */
    .input-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-bottom: 2rem;
    }

    label {
        font-size: 0.8rem;
        color: #ffffff;
        margin-bottom: 0.8rem;
        letter-spacing: 1px;
    }

    input,
    textarea {
        background: transparent;
        border: none;
        color: #ffffff;
        font-family: "Press Start 2P", cursive;
        font-size: 1rem;
        outline: none;
        padding: 0.5rem;
        text-align: center;
        text-transform: uppercase;
        width: 100%;
        max-width: 400px;
        box-shadow: none;
        transition: all 0.3s;
    }

    input:focus,
    textarea:focus {
        /* No border change on focus */
    }

    /* Hide spin buttons for number input */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    textarea {
        border: 2px solid #333;
        /* Keep box for textarea */
        background: rgba(0, 20, 0, 0.8);
        text-align: left;
    }

    /* --- Buttons --- */
    .pixel-btn {
        background: var(--terminal-green);
        color: #000;
        border: 4px solid var(--terminal-green);
        /* Thicker border for blocky feel */
        padding: 15px 20px;
        font-family: "Press Start 2P", cursive;
        font-size: 0.9rem;
        cursor: pointer;
        text-transform: uppercase;
        margin-top: 1.5rem;
        box-shadow: none;
        transition: all 0.2s;
    }

    .pixel-btn:hover {
        background: #000;
        color: var(--terminal-green);
    }

    .pixel-btn.secondary {
        background: transparent;
        border-color: #666;
        color: #888;
    }

    .pixel-btn.secondary:hover {
        border-color: #fff;
        color: #fff;
    }

    .skip-btn {
        background: transparent;
        border: none;
        color: #444;
        font-family: "Press Start 2P", cursive;
        font-size: 0.7rem;
        cursor: pointer;
        margin-top: 2rem;
        transition: color 0.2s;
        text-transform: uppercase;
    }

    .skip-btn:hover {
        color: #666;
    }

    /* --- Pixel Earth & Static Text --- */
    .earth-container {
        position: relative;
        width: 160px;
        height: 160px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 4rem;
        /* More space for text above */
        margin-top: 2rem;
    }

    .pixel-earth {
        width: 100px;
        /* Slightly larger again */
        height: 100px;
        image-rendering: pixelated;
        background: radial-gradient(circle at 30% 30%, #4facfe, #00f2fe);
        border-radius: 50%;
        box-shadow: inset -10px -10px 0px rgba(0, 0, 0, 0.2);
        position: relative;
        animation: spin 12s linear infinite;
        border: 4px solid #000;
        z-index: 2;
        overflow: hidden;
        /* KEEPS THE MAP INSIDE THE CIRCLE */
    }

    .pixel-earth::after {
        content: "";
        position: absolute;
        top: 10%;
        /* Adjusted to fit better */
        left: 0;
        width: 200%;
        height: 80%;
        background-image: linear-gradient(90deg, transparent 50%, #2ecc71 50%),
            linear-gradient(90deg, #2ecc71 30%, transparent 30%);
        background-size: 40px 20px;
        opacity: 0.9;
        animation: moveMap 6s linear infinite;
    }

    .static-title {
        position: absolute;
        top: -40px;
        /* Above the earth */
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        text-align: center;
        z-index: 3;
    }

    .static-title span {
        color: #fff;
        font-size: 1rem;
        font-weight: bold;
        text-shadow: 2px 2px 0px #000;
        background: #000;
        padding: 5px 10px;
        border: 2px solid #fff;
    }

    @keyframes orbit {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes moveMap {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(-50%);
        }
    }

    /* --- ASCII Frame & Eulogy --- */
    .ascii-frame {
        border: 2px dashed #444;
        /* Simulates - - - - frame */
        padding: 2rem;
        max-width: 850px;
        width: 95%;
        text-align: center;
        position: relative;
        background: rgba(0, 10, 0, 0.5);
    }

    .cross-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .pixel-cross {
        font-size: 2rem;
        color: #555;
        font-weight: bold;
    }

    /* --- Utilities --- */
    .blink {
        animation: blinker 1s linear infinite;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }

    .text-green {
        color: var(--terminal-green);
    }

    .text-yellow {
        color: #ffff00;
    }

    .text-red {
        color: #ff3333;
    }

    .text-blue {
        color: #33ccff;
    }

    .text-gray {
        color: #888;
    }

    .text-white {
        color: #ffffff;
    }

    /* Tailwind utilities replacement since we might not have full tailwind in this scope or want to rely on it matching exactly */
    .flex {
        display: flex;
    }
    .flex-col {
        flex-direction: column;
    }
    .items-start {
        align-items: flex-start;
    }
    .items-center {
        align-items: center;
    }
    .justify-center {
        justify-content: center;
    }
    .gap-8 {
        gap: 2rem;
    }
    .w-full {
        width: 100%;
    }
    .max-w-md {
        max-width: 28rem;
    }
    .max-w-2xl {
        max-width: 42rem;
    }
    .text-left {
        text-align: left;
    }
    .text-center {
        text-align: center;
    }
    .mb-6 {
        margin-bottom: 1.5rem;
    }
    .mb-4 {
        margin-bottom: 1rem;
    }
    .mb-8 {
        margin-bottom: 2rem;
    }
    .mb-10 {
        margin-bottom: 2.5rem;
    }
    .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .leading-relaxed {
        line-height: 1.625;
    }
    .text-gray-300 {
        color: #d1d5db;
    }
    .text-gray-400 {
        color: #9ca3af;
    }
</style>
