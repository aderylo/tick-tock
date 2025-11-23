<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { appState } from "$lib/stores/appState";

    $: userData = $appState.userData;
    $: totalMonths = userData.lifeExpectancy * 12;
    $: monthsLived = (userData.age || 0) * 12;

    // Exclusion Toggles
    let excludeSleep = false;
    let excludeWork = false;
    let excludeCommute = false;

    // Ratios (0-1)
    $: sleepRatio = excludeSleep ? userData.sleepHours / 24 : 0;
    $: workRatio = excludeWork
        ? (userData.workHours * userData.workDays) / 168
        : 0;
    $: commuteRatio = excludeCommute
        ? (userData.commuteTime * userData.workDays) / 168
        : 0;

    $: totalExcludedRatio = Math.min(
        0.99,
        sleepRatio + workRatio + commuteRatio,
    );

    // Effective Calculation
    $: monthsRemainingRaw = Math.max(0, totalMonths - monthsLived);
    $: monthsExcluded = monthsRemainingRaw * totalExcludedRatio;
    $: effectiveMonthsConsumed = monthsLived + monthsExcluded;
    $: effectiveMonthsLeft = Math.max(0, totalMonths - effectiveMonthsConsumed);
    $: effectivePercentLeft = (effectiveMonthsLeft / totalMonths) * 100;

    let gridContainer: HTMLElement;
    let animationInterval: any;

    // State
    let dots: { cell: HTMLElement; dot: HTMLElement }[] = [];
    let currentDisplayedMonth = 0;
    let pacman: HTMLElement | null = null;

    // Initialize Grid only when totalMonths changes or on mount
    $: if (gridContainer && totalMonths) {
        initGrid();
    }

    // Animate whenever the target changes
    $: if (dots.length > 0) {
        animateTo(effectiveMonthsConsumed);
    }

    onDestroy(() => {
        if (animationInterval) clearInterval(animationInterval);
    });

    function initGrid() {
        if (!gridContainer) return;

        // Clear existing
        gridContainer.innerHTML = "";
        dots = [];
        currentDisplayedMonth = 0;

        // Create Pacman element once
        pacman = document.createElement("div");
        pacman.className = "pacman-shape";

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < totalMonths; i++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";

            const dot = document.createElement("div");
            dot.className = "grid-dot future";

            cell.appendChild(dot);
            fragment.appendChild(cell);
            dots.push({ cell, dot });
        }
        gridContainer.appendChild(fragment);
    }

    function animateTo(target: number) {
        if (animationInterval) clearInterval(animationInterval);

        const totalDiff = Math.abs(target - currentDisplayedMonth);
        const intervalMs = 30;
        const maxDurationMs = 3000; // Max 3 seconds
        const maxFrames = maxDurationMs / intervalMs;

        // Base speed: minimum units per frame (prevents crawling on short distances)
        // Required speed: units per frame to finish in maxDuration
        const baseSpeed = 0.5;
        const requiredSpeed = totalDiff / maxFrames;
        const speed = Math.max(baseSpeed, requiredSpeed);

        animationInterval = setInterval(() => {
            if (Math.abs(currentDisplayedMonth - target) < speed) {
                currentDisplayedMonth = target;
                updateVisuals(currentDisplayedMonth, currentDisplayedMonth); // Snap to final
                clearInterval(animationInterval);
                return;
            }

            const diff = target - currentDisplayedMonth;
            const direction = Math.sign(diff);

            // Calculate next step
            const step = direction * speed;
            const nextMonth = currentDisplayedMonth + step;

            updateVisuals(currentDisplayedMonth, nextMonth);
            currentDisplayedMonth = nextMonth;
        }, intervalMs);
    }

    function updateVisuals(from: number, to: number) {
        const start = Math.floor(Math.min(from, to));
        const end = Math.floor(Math.max(from, to));
        const isEating = to > from;

        // Update dots in the range
        for (let i = start; i <= end; i++) {
            const item = dots[i];
            if (!item) continue;

            if (isEating) {
                item.dot.className = "grid-dot past";
                item.dot.style.display = "none";
            } else {
                // Reappearing
                item.dot.className = "grid-dot future";
                item.dot.style.display = "block";
            }
        }

        // Move Pacman
        const pacmanIndex = Math.floor(to);
        const targetItem = dots[pacmanIndex];

        if (targetItem && pacman) {
            // Ensure pacman is in the right cell
            if (pacman.parentElement !== targetItem.cell) {
                targetItem.cell.appendChild(pacman);
            }
            // Ensure the dot under pacman is hidden (even if we just restored it)
            targetItem.dot.style.display = "none";
        }
    }
</script>

<div class="pacman-container">
    <div class="stats">
        <div class="stat">AGE: <span class="white">{userData.age}</span></div>
        <div class="stat">
            MONTHS LEFT: <span class="blue"
                >{Math.round(effectiveMonthsLeft).toLocaleString()}</span
            >
        </div>
        <div class="stat">
            REMAINING TIME: <span class="green"
                >{effectivePercentLeft.toFixed(1)}%</span
            >
        </div>
    </div>

    <div class="grid-wrapper" bind:this={gridContainer}></div>

    <div class="toggles">
        <button
            class="pixel-btn"
            class:active={excludeSleep}
            on:click={() => (excludeSleep = !excludeSleep)}
        >
            {excludeSleep ? "[X]" : "[ ]"} EXCLUDE SLEEP
        </button>
        <button
            class="pixel-btn"
            class:active={excludeWork}
            on:click={() => (excludeWork = !excludeWork)}
        >
            {excludeWork ? "[X]" : "[ ]"} EXCLUDE WORK
        </button>
        <button
            class="pixel-btn"
            class:active={excludeCommute}
            on:click={() => (excludeCommute = !excludeCommute)}
        >
            {excludeCommute ? "[X]" : "[ ]"} EXCLUDE COMMUTE
        </button>
    </div>
</div>

<style>
    .pacman-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        width: 100%;
        height: 100%;
        font-family: "Courier New", Courier, monospace;
    }

    .stats {
        display: flex;
        flex-direction: column; /* Vertical stack */
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
        color: #888;
        font-weight: bold;
        text-align: center;
    }

    .white {
        color: white;
    }
    .blue {
        color: #33ccff;
    }
    .green {
        color: #00ff00;
    }

    .toggles {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap; /* Allow wrapping on small screens */
        justify-content: center;
        margin-top: 1rem;
    }

    .pixel-btn {
        background: transparent;
        border: 2px solid #444;
        color: #666;
        padding: 0.5rem 1rem;
        font-family: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .pixel-btn:hover {
        border-color: #888;
        color: #888;
    }

    .pixel-btn.active {
        border-color: #ffff00;
        color: #ffff00;
        background: rgba(255, 255, 0, 0.1);
    }

    .grid-wrapper {
        display: grid;
        grid-template-columns: repeat(24, 1fr); /* 2 Years per row */
        gap: 1px;
        width: 100%;
        max-width: 650px; /* Cap width on desktop to keep dots packed */
        height: auto;
        /* Removed max-height/overflow to ensure border always wraps content with padding */
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #333;
        align-content: start;
        margin: 0 auto;
        box-sizing: border-box;
    }

    :global(.grid-cell) {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 10px; /* Compact height */
        position: relative;
    }

    :global(.grid-dot) {
        width: 6px; /* Smaller dots */
        height: 6px;
        border-radius: 50%;
    }

    :global(.grid-dot.future) {
        background-color: #444;
    }

    :global(.grid-dot.past) {
        background-color: #111;
    }

    :global(.pacman-shape) {
        width: 8px; /* Adjusted Pacman size */
        height: 8px;
        background: #ffff00;
        border-radius: 50%;
        clip-path: polygon(
            100% 74%,
            44% 48%,
            100% 21%,
            100% 0,
            0 0,
            0 100%,
            100% 100%
        );
        position: absolute;
        z-index: 10;
        box-shadow: 0 0 5px #ffff00;
        animation: chomp 0.2s infinite;
    }

    @keyframes chomp {
        0% {
            clip-path: polygon(
                100% 74%,
                44% 48%,
                100% 21%,
                100% 0,
                0 0,
                0 100%,
                100% 100%
            );
        }
        50% {
            clip-path: polygon(
                100% 100%,
                50% 50%,
                100% 0,
                100% 0,
                0 0,
                0 100%,
                100% 100%
            );
        }
        100% {
            clip-path: polygon(
                100% 74%,
                44% 48%,
                100% 21%,
                100% 0,
                0 0,
                0 100%,
                100% 100%
            );
        }
    }
</style>
