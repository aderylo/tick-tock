<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { appState, updateUserData } from "$lib/stores/appState";

    $: userData = $appState.userData;
    $: totalMonths = userData.lifeExpectancy * 12;
    $: monthsLived = (userData.age || 0) * 12;

    // Exclusion Toggles
    let excludeSleep = false;
    let excludeWork = false;
    let excludeCommute = false;

    // Init exclusions from store
    onMount(() => {
        if (userData.exclusions) {
            excludeSleep = userData.exclusions.sleep;
            excludeWork = userData.exclusions.work;
            excludeCommute = userData.exclusions.commute;
        }
    });

    // Watch and update store
    $: if (typeof window !== 'undefined') {
        // Only update if changed from initial load or user interaction
        // But we need to avoid infinite loops or resetting on init before load
        // Simple check: we rely on onMount to set initial values, 
        // then this reactive block updates store on future changes
        updateUserData({
            exclusions: {
                sleep: excludeSleep,
                work: excludeWork,
                commute: excludeCommute
            }
        });
    }

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
    let viewMode: "total" | "yearly" | "deadline" = "total";
    let isMobileMenuOpen = false; // For mobile dropdown
    let dots: { cell: HTMLElement; dot: HTMLElement }[] = [];
    let currentDisplayedValue = 0; // Generalized from 'Month'
    let lastRenderedIndex = 0;
    let pacman: HTMLElement | null = null;
    
    // Deadline State - Initialize from global state if available
    let deadlineDateStr = "";
    let deadlineTimeStr = "00:00";
    let showDeadlineInput = false;
    let deadlineDate: Date | null = null;
    
    // Check if deadline exists in store on init
    onMount(() => {
        const interval = setInterval(() => {
            now = new Date();
        }, 1000); // Update every second
        
        // Init deadline from store
        if (userData.deadline && userData.deadline.date) {
            deadlineDateStr = userData.deadline.date;
            if (userData.deadline.time) {
                deadlineTimeStr = userData.deadline.time;
            }
            viewMode = "deadline"; // Optional: switch to deadline mode if it was set? Or just load it.
            // Let's just load the values.
        }

        return () => clearInterval(interval);
    });
    
    // Watch for changes in local deadline inputs and update store
    function updateDeadlineStore() {
        if (deadlineDateStr) {
             updateUserData({
                deadline: {
                    date: deadlineDateStr,
                    time: deadlineTimeStr
                }
            });
        }
    }

    // Always use current time as start date
    $: startDate = new Date();

    // Derived Year Stats
    $: currentYear = new Date().getFullYear();
    $: now = new Date();
    
    // Update dates from strings
    $: if (deadlineDateStr) {
        const d = new Date(deadlineDateStr + 'T' + deadlineTimeStr);
        if (!isNaN(d.getTime())) {
            deadlineDate = d;
            // Debounce or just update store when valid
            updateDeadlineStore();
        }
    } else {
        deadlineDate = null;
    }

    // Deadline Calculations
    $: deadlineDiffMs = (deadlineDate) ? deadlineDate.getTime() - now.getTime() : 0;


    $: totalDeadlineSpanMs = (deadlineDate) ? deadlineDate.getTime() - startDate.getTime() : 1;
    $: deadlineConsumedMs = 0; // Since start is now.
    
    $: effectiveDeadlineDiffMs = deadlineDiffMs * (1 - totalExcludedRatio);
    $: deadlineWeeksLeft = Math.max(0, Math.floor(effectiveDeadlineDiffMs / (1000 * 60 * 60 * 24 * 7)));
    $: deadlineDaysLeft = Math.max(0, Math.floor(effectiveDeadlineDiffMs / (1000 * 60 * 60 * 24)));
    $: deadlineHoursLeft = Math.max(0, Math.floor(effectiveDeadlineDiffMs / (1000 * 60 * 60)));
    
    // Progress for Pacman (0 to 1) - based on capacity reduction
    $: deadlineProgressRaw = 0; // Time passed is 0
        
    $: deadlinePercentLeft = 0; // Not used really, we use capacity
         
    $: deadlinePercentCapacity = (deadlineDate && totalDeadlineSpanMs > 0)
        ? (effectiveDeadlineDiffMs / totalDeadlineSpanMs) * 100
        : 100; // Default to 100% capacity (0% consumed) if no deadline set

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
        } else if (viewMode === "yearly") {
            const yearProgress = 1 - yearPercentLeft / 100;
            target = yearProgress * 365;
        } else if (viewMode === "deadline") {
            // Deadline logic
            // If no deadline is set, deadlinePercentCapacity defaults to 100 (all capacity available).
            // Progress = 1 - (100/100) = 0.
            const deadlineProgress = 1 - (deadlinePercentCapacity / 100);
            target = Math.min(100, Math.max(0, deadlineProgress * 100));
        }
        animateTo(target || 0);
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
        // Yearly: 365 dots (one per day)
        // Deadline: 100 dots (10x10)
        let totalItems = totalMonths;
        if (viewMode === "yearly") totalItems = 365;
        else if (viewMode === "deadline") totalItems = 100;

        for (let i = 0; i < totalItems; i++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";

            // Adjust cell size for yearly mode to be chunkier
            if (viewMode === "deadline") {
                cell.style.height = "30px"; // Square-ish 
            } else if (viewMode === "yearly") {
                // Keep compact for 365 dots
                cell.style.height = "10px"; 
            }

            const dot = document.createElement("div");
            dot.className = "grid-dot future";

            // Adjust dot size for yearly mode
            if (viewMode === "deadline") {
                dot.style.width = "12px"; 
                dot.style.height = "12px";
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

        // Adjust grid columns
        if (viewMode === "deadline") {
            gridContainer.style.gridTemplateColumns = "repeat(10, 1fr)";
            gridContainer.style.maxWidth = "320px"; // 10 * ~30px
            gridContainer.style.gap = "2px";
        } else if (viewMode === "yearly") {
            gridContainer.style.gridTemplateColumns = "repeat(25, 1fr)"; // Fits 365 nicely (14.6 rows)
            gridContainer.style.maxWidth = "650px";
            gridContainer.style.gap = "1px";
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

    <div class="view-toggle desktop-only">
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
        <button
            class="toggle-btn"
            class:active={viewMode === "deadline"}
            on:click={() => (viewMode = "deadline")}>DEADLINE</button
        >
    </div>
    
    <!-- Mobile Dropdown -->
    <div class="mobile-toggle-wrapper mobile-only">
        <button class="mobile-mode-btn" on:click={() => isMobileMenuOpen = !isMobileMenuOpen}>
            MODE: {viewMode.toUpperCase()} {isMobileMenuOpen ? '▲' : '▼'}
        </button>
        
        {#if isMobileMenuOpen}
            <div class="mobile-dropdown">
                <button 
                    class="dropdown-item" 
                    class:selected={viewMode === "total"}
                    on:click={() => { viewMode = "total"; isMobileMenuOpen = false; }}>
                    > TOTAL VIEW
                </button>
                <button 
                    class="dropdown-item" 
                    class:selected={viewMode === "yearly"}
                    on:click={() => { viewMode = "yearly"; isMobileMenuOpen = false; }}>
                    > YEARLY VIEW
                </button>
                <button 
                    class="dropdown-item" 
                    class:selected={viewMode === "deadline"}
                    on:click={() => { viewMode = "deadline"; isMobileMenuOpen = false; }}>
                    > DEADLINE VIEW
                </button>
            </div>
        {/if}
    </div>
    
    {#if viewMode === "deadline"}
        <div class="deadline-inputs">
            <div class="input-group">
                <label for="deadline-picker">SELECT DEADLINE</label>
                <div class="date-time-wrapper" id="deadline-picker">
                    <input type="date" bind:value={deadlineDateStr} aria-label="Select Date" />
                    <input type="time" bind:value={deadlineTimeStr} aria-label="Select Time" />
                </div>
            </div>
        </div>
    {/if}

    <div class="main-content">
        <!-- Placeholder for symmetry (desktop only) -->
        <div class="placeholder-box desktop-only"></div>

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
            {:else if viewMode === "yearly"}
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
            {:else if viewMode === "deadline"}
                <div class="stat-header">DEADLINE:</div>
                 {#if !deadlineDate}
                    <div class="stat-item">PLEASE SELECT A DATE</div>
                 {:else if deadlineDiffMs < 0}
                    <div class="stat-item text-red">DEADLINE PASSED</div>
                 {:else}
                    <div class="stat-item">
                        WEEKS: <span class="white">{deadlineWeeksLeft}</span>
                    </div>
                    <div class="stat-item">
                        DAYS: <span class="blue">{deadlineDaysLeft}</span>
                    </div>
                    <div class="stat-item">
                        HOURS: <span class="green"
                            >{deadlineHoursLeft.toLocaleString()}</span
                        >
                    </div>
                    <div class="separator">---</div>
                    <div class="stat-item">
                        REMAINING: <span class="green"
                            >{deadlinePercentCapacity.toFixed(1)}%</span
                        >
                    </div>
                 {/if}
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

    /* Mobile specific styles */
    .mobile-only {
        display: none;
    }
    
    .mobile-toggle-wrapper {
        position: relative;
        margin-bottom: 1rem;
        z-index: 50;
        width: 100%;
        justify-content: center;
        /* display depends on media query below */
    }
    
    .mobile-mode-btn {
        background: #000;
        color: #ffff00;
        border: 2px solid #ffff00;
        font-family: "Press Start 2P", cursive;
        padding: 0.8rem 1.5rem;
        font-size: 0.8rem;
        cursor: pointer;
        width: 100%;
        max-width: 300px;
        text-align: center;
        box-shadow: 4px 4px 0px rgba(0,255,0,0.2);
    }
    
    .mobile-dropdown {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 300px;
        background: #000;
        border: 2px solid #444;
        display: flex;
        flex-direction: column;
        margin-top: 0.5rem;
        box-shadow: 0 10px 20px rgba(0,0,0,0.9);
    }
    
    .dropdown-item {
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
    }
    
    .dropdown-item:hover {
        background: #111;
        color: #fff;
        padding-left: 1.5rem;
    }
    
    .dropdown-item.selected {
        color: #ffff00;
        background: #111;
        border-left: 4px solid #ffff00;
    }
    
    /* Responsive Switch */
    @media (max-width: 899px) {
        .desktop-only {
            display: none !important;
        }
        .mobile-only {
            display: flex; /* Was display: none by default */
        }
    }

    .deadline-inputs {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
    }
    
    .input-group label {
        font-size: 0.6rem;
        color: #888;
        margin-bottom: 0.2rem;
    }

    input[type="date"],
    input[type="time"] {
        background: transparent;
        border: 1px solid #444;
        color: #fff;
        font-family: inherit;
        padding: 0.3rem;
        font-size: 0.8rem;
        cursor: pointer;
        outline: none;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
    }
    
    .date-time-wrapper {
        display: flex;
        gap: 0.5rem;
    }
    
    .text-red { color: #ff3333; }

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
            display: flex; /* Changed from block to flex to use gap/justify */
            justify-content: center;
            align-items: flex-start;
            width: 100%; /* Use full width */
            max-width: none; /* Remove max-width constraint on wrapper */
            margin: 0;
            gap: 2rem; /* Space between items */
            position: relative;
            overflow: visible;
        }

        .grid-wrapper {
            width: auto; /* Let grid define its own width */
            max-width: 650px; /* Keep existing max-width for the grid itself */
            flex-shrink: 0; /* Prevent shrinking */
        }

        .stats {
            display: flex; /* Ensure visible on desktop */
            position: static; /* Remove absolute positioning */
            width: 250px;
            margin: 0;
            flex-shrink: 0; /* Prevent shrinking */
        }
        
        .placeholder-box {
            width: 250px; /* Same width as stats */
            flex-shrink: 0;
            /* Invisible but takes up space */
        }
    }

        /* Unused .stat class removed */

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
        /* Remove margin: 0 auto since flex handles centering now */
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
