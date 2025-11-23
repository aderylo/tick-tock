<script lang="ts">
    import { appState } from "$lib/stores/appState";

    $: userData = $appState.userData;

    $: totalHours = 24 * 7;
    $: sleepTotal = userData.sleepHours * 7;
    $: workTotal = userData.workHours * userData.workDays;
    $: commuteTotal = userData.commuteTime * userData.workDays;
    $: screenTotal = userData.screenTime * 7;

    $: usedTime = sleepTotal + workTotal + commuteTotal + screenTotal;
    $: freeTime = Math.max(0, totalHours - usedTime);

    $: segments = [
        { label: "Sleep", hours: sleepTotal, color: "#1a237e" }, // Deep Blue
        { label: "Work", hours: workTotal, color: "#b71c1c" }, // Red
        { label: "Commute", hours: commuteTotal, color: "#e65100" }, // Orange
        { label: "Screen", hours: screenTotal, color: "#424242" }, // Gray
        { label: "Life", hours: freeTime, color: "#ffffff" }, // White
    ];
</script>

<div class="dashboard-view">
    <h2>Where does the time go? (Weekly)</h2>

    <div class="chart-container">
        {#each segments as seg}
            {#if seg.hours > 0}
                <div
                    class="segment"
                    style="flex: {seg.hours}; background: {seg.color};"
                    title="{seg.label}: {seg.hours}h"
                >
                    <span class="seg-label" class:dark={seg.label === "Life"}>
                        {seg.label}
                        <br />
                        <span class="hours">{Math.round(seg.hours)}h</span>
                    </span>
                </div>
            {/if}
        {/each}
    </div>

    <div class="legend">
        <p>Total Hours: 168</p>
        <p>
            Free Time: {Math.round(freeTime)}h ({Math.round(
                (freeTime / totalHours) * 100,
            )}%)
        </p>
    </div>
</div>

<style>
    .dashboard-view {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        padding: 2rem;
    }

    h2 {
        font-size: 2rem;
        font-weight: normal;
    }

    .chart-container {
        width: 100%;
        max-width: 800px;
        height: 100px;
        display: flex;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    .segment {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: flex 0.5s ease;
        overflow: hidden;
        min-width: 0; /* Allow shrinking */
    }

    .seg-label {
        color: white;
        font-size: 0.9rem;
        text-align: center;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
        padding: 0 5px;
    }

    .seg-label.dark {
        color: black;
        text-shadow: none;
    }

    .hours {
        font-size: 1.2rem;
    }

    .legend {
        display: flex;
        gap: 2rem;
        font-size: 1.2rem;
        color: #888;
    }
</style>
