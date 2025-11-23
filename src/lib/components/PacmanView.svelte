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
    export let showWelcome = false;

    // State
    let viewMode: "total" | "yearly" = "total";
    let dots: { cell: HTMLElement; dot: HTMLElement }[] = [];
    let currentDisplayedValue = 0; // Generalized from 'Month'
    let lastRenderedIndex = 0;
    let pacman: HTMLElement | null = null;

    // Derived Year Stats
    $: currentYear = new Date().getFullYear();
    $: now = new Date();
    $: startOfYear = new Date(currentYear, 0, 1);
    $: endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    $: diffMs = endOfYear.getTime() - now.getTime();
    
    // Apply exclusions to remaining time
    $: effectiveDiffMs = diffMs * (1 - totalExcludedRatio);

    $: yearWeeksLeft = Math.floor(effectiveDiffMs / (1000 * 60 * 60 * 24 * 7));
    $: yearDaysLeft = Math.floor(effectiveDiffMs / (1000 * 60 * 60 * 24));
    $: yearHoursLeft = Math.floor(effectiveDiffMs / (1000 * 60 * 60));
    $: yearPercentLeft =
        (effectiveDiffMs / (endOfYear.getTime() - startOfYear.getTime())) * 100;
    $: currentWeek = getWeekNumber(now);

    // React to viewMode changes
    $: if (gridContainer && (viewMode || totalMonths)) {
        initGrid();
    }

    // Animate whenever the target changes (Total or Yearly)
    $: if (dots.length > 0) {
        let target;
        if (viewMode === "total") {
            target = effectiveMonthsConsumed;
        } else {
            // For yearly (48 dots), calculate based on percentage of year passed
            // The yearPercentLeft now already includes the exclusion ratio (it is smaller)
            // So "consumed" is 100% - "remaining%"
            // But we need to be careful.
            // Original: yearProgress = 1 - yearPercentLeft / 100
            // If yearPercentLeft is reduced by exclusions, yearProgress (consumed) increases.
            // This matches the "Total" behavior where excluded time is treated as consumed.
            
            const yearProgress = 1 - yearPercentLeft / 100;
            target = yearProgress * 48;
        }
        animateTo(target);
    }

    onDestroy(() => {
        if (animationInterval) clearInterval(animationInterval);
    });

    function getWeekNumber(d: Date) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(
            ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
        );
    }

    function initGrid() {
        if (!gridContainer) return;

        // Clear existing
        gridContainer.innerHTML = "";
        dots = [];
        currentDisplayedValue = 0;
        lastRenderedIndex = 0;

        // Create Pacman element once
        pacman = document.createElement("div");
        pacman.className = "pacman-shape";

        const fragment = document.createDocumentFragment();

        // Determine grid size based on mode
        // Yearly: 12 months * 4 weeks = 48 dots
        const totalItems = viewMode === "total" ? totalMonths : 48;

        for (let i = 0; i < totalItems; i++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";

            // Adjust cell size for yearly mode to be chunkier
            if (viewMode === "yearly") {
                cell.style.height = "25px"; // Bigger cells
                // Width defaults to auto (fill column), which centers the dot via flexbox
            }

            const dot = document.createElement("div");
            dot.className = "grid-dot future";

            // Adjust dot size for yearly mode
            if (viewMode === "yearly") {
                dot.style.width = "10px"; // Bigger dots
                dot.style.height = "10px";
            }

            cell.appendChild(dot);
            fragment.appendChild(cell);
            dots.push({ cell, dot });
        }
        gridContainer.appendChild(fragment);

        // Initialize first position
        if (dots.length > 0 && pacman) {
            dots[0].cell.appendChild(pacman);
            dots[0].dot.style.display = "none";
        }

        // Adjust grid columns for yearly mode
        if (viewMode === "yearly") {
            gridContainer.style.gridTemplateColumns = "repeat(4, 1fr)"; // 4 columns (weeks)
            gridContainer.style.maxWidth = "160px"; // Narrow layout for 4 cols
            gridContainer.style.gap = "4px"; // Slightly more gap
        } else {
            gridContainer.style.gridTemplateColumns = "repeat(24, 1fr)";
            gridContainer.style.maxWidth = "650px";
            gridContainer.style.gap = "1px";
        }
    }

    function animateTo(target: number) {
        if (animationInterval) clearInterval(animationInterval);

        const totalDiff = Math.abs(target - currentDisplayedValue);
        const intervalMs = 30;
        const maxDurationMs = 2000; // Faster animation for switch
        const maxFrames = maxDurationMs / intervalMs;

        const baseSpeed = 0.5;
        const requiredSpeed = totalDiff / maxFrames;
        const speed = Math.max(baseSpeed, requiredSpeed);

        animationInterval = setInterval(() => {
            if (Math.abs(currentDisplayedValue - target) < speed) {
                currentDisplayedValue = target;
                updateVisuals(currentDisplayedValue); // Snap to final
                clearInterval(animationInterval);
                return;
            }

            const diff = target - currentDisplayedValue;
            const direction = Math.sign(diff);

            // Calculate next step
            const step = direction * speed;
            currentDisplayedValue += step;

            updateVisuals(currentDisplayedValue);
        }, intervalMs);
    }

    function updateVisuals(currentFloat: number) {
        const newIndex = Math.floor(currentFloat);

        // If we haven't moved to a new cell, just return
        if (newIndex === lastRenderedIndex) return;

        const direction = Math.sign(newIndex - lastRenderedIndex);

        // Walk from the last known position to the new position
        let i = lastRenderedIndex;

        // Safety break to prevent infinite loops if logic fails
        let steps = 0;
        while (i !== newIndex && steps < 1000) {
            const item = dots[i];
            if (item) {
                if (direction > 0) {
                    item.dot.className = "grid-dot past";
                    item.dot.style.display = "block";
                } else {
                    item.dot.className = "grid-dot future";
                    item.dot.style.display = "block";
                }
            }
            i += direction;
            steps++;
        }

        // Now i is the newIndex
        const targetItem = dots[newIndex];
        if (targetItem && pacman) {
            if (pacman.parentElement !== targetItem.cell) {
                targetItem.cell.appendChild(pacman);
            }
            targetItem.dot.style.display = "none";
        }

        lastRenderedIndex = newIndex;
    }
</script>

<div class="pacman-container">
    {#if showWelcome}
        <div class="welcome-text">
            WELCOME TO REAL LIFE, <span class="text-yellow"
                >{userData.name}</span
            >.
        </div>
    {/if}

    <div class="view-toggle">
        <button
            class="toggle-btn"
            class:active={viewMode === "total"}
            on:click={() => (viewMode = "total")}>TOTAL</button
        >
        <button
            class="toggle-btn"
            class:active={viewMode === "yearly"}
            on:click={() => (viewMode = "yearly")}>YEARLY</button
        >
    </div>

    <div class="main-content">
        <div class="grid-wrapper" bind:this={gridContainer}></div>

        <div class="stats">
            {#if viewMode === "total"}
                <div class="stat-header">TIME LEFT:</div>
                <div class="stat-item">
                    YEARS: <span class="white"
                        >{Math.floor(effectiveMonthsLeft / 12)}</span
                    >
                </div>
                <div class="stat-item">
                    MONTHS: <span class="blue"
                        >{Math.round(
                            effectiveMonthsLeft,
                        ).toLocaleString()}</span
                    >
                </div>
                <div class="stat-item">
                    WEEKS: <span class="green"
                        >{Math.round(
                            effectiveMonthsLeft * 4.345,
                        ).toLocaleString()}</span
                    >
                </div>
                <div class="separator">---</div>
                <div class="stat-item">
                    REMAINING: <span class="green"
                        >{effectivePercentLeft.toFixed(1)}%</span
                    >
                </div>
            {:else}
                <div class="stat-header">YEAR {currentYear}:</div>
                <div class="stat-item">
                    WEEKS: <span class="white">{yearWeeksLeft}</span>
                </div>
                <div class="stat-item">
                    DAYS: <span class="blue">{yearDaysLeft}</span>
                </div>
                <div class="stat-item">
                    HOURS: <span class="green"
                        >{yearHoursLeft.toLocaleString()}</span
                    >
                </div>
                <div class="separator">---</div>
                <div class="stat-item">
                    REMAINING: <span class="green"
                        >{yearPercentLeft.toFixed(1)}%</span
                    >
                </div>
            {/if}
        </div>
    </div>

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
        font-family: "Press Start 2P", cursive; /* Retro font */
        overflow-y: auto;
        padding: 1rem;
        box-sizing: border-box;
        font-size: 0.8rem; /* Base size adjustment for this font */
    }

    .view-toggle {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .toggle-btn {
        background: transparent;
        border: none;
        color: #666;
        font-family: inherit;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: all 0.2s;
    }

    .toggle-btn:hover {
        color: #fff;
        text-shadow: 0 0 5px #fff;
    }

    .toggle-btn.active {
        color: #ffff00;
        text-shadow: 0 0 5px #ffff00;
        border-bottom: 2px solid #ffff00;
    }

    .welcome-text {
        font-size: 1.5rem; /* Bigger welcome text */
        color: white;
        text-align: center;
        margin-bottom: 1rem;
        line-height: 1.5;
    }

    .text-yellow {
        color: #ffff00;
    }

    .main-content {
        display: flex;
        flex-direction: column-reverse; /* Stats on top of Grid on mobile */
        align-items: center;
        gap: 2rem;
        width: 100%;
    }

    .stats {
        display: none; /* Hidden by default (mobile/tablet) */
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        font-size: 0.9rem;
        color: #888;
        line-height: 1.6;
        width: 100%;
        max-width: 650px;
    }

    .stat-header {
        color: #888;
        margin-bottom: 0.5rem;
    }

    .stat-item {
        color: #888;
    }

    .separator {
        color: #444;
        font-weight: bold;
    }

    /* Desktop Layout: Side by Side with Absolute Positioning */
    @media (min-width: 900px) {
        .main-content {
            flex-direction: row;
            display: block; /* Block layout for the wrapper */
            width: 650px; /* Fixed width matching the grid */
            margin: 0 auto; /* Center the 650px block */
            position: relative; /* Anchor for absolute stats */
            overflow: visible; /* Allow stats to hang out */
        }

        .grid-wrapper {
            width: 100%; /* Fill the centered container */
        }

        .stats {
            display: flex; /* Ensure visible on desktop */
            position: absolute; /* Take out of flow */
            left: 100%; /* Move to right edge of container */
            top: 0;
            margin-left: 2rem; /* Gap */
            align-items: flex-start;
            text-align: left;
            width: 250px;
            margin-top: 0;
        }
    }

    .stat {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
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
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 1rem;
    }

    .pixel-btn {
        background: transparent;
        border: 2px solid #444;
        color: #666;
        padding: 0.8rem 1rem;
        font-family: inherit;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.2s;
        line-height: 1.2;
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
        grid-template-columns: repeat(24, 1fr);
        gap: 1px;
        width: 100%;
        max-width: 650px;
        height: auto;
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
        width: 4px; /* Smaller dots */
        height: 4px;
        border-radius: 50%;
    }

    :global(.grid-dot.future) {
        background-color: #ffffff; /* White for remaining */
    }

    :global(.grid-dot.past) {
        background-color: #333; /* Dim gray for eaten */
    }

    :global(.pacman-shape) {
        width: 14px; /* Bigger Pacman */
        height: 14px;
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
