<script lang="ts">
    import { appState } from "$lib/stores/appState";

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // Calculate progress
    const totalDays =
        (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const passedDays =
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const percent = (passedDays / totalDays) * 100;
    const weeksLeft = Math.round((totalDays - passedDays) / 7);
</script>

<div class="dashboard-view">
    <h2>Yearly Progress ({today.getFullYear()})</h2>

    <div class="progress-container">
        <div class="bar-bg">
            <div class="bar-fill" style="width: {percent}%"></div>
        </div>
        <div class="stats">
            <div class="stat">
                <span class="val">{percent.toFixed(1)}%</span>
                <span class="label">Completed</span>
            </div>
            <div class="stat">
                <span class="val">{weeksLeft}</span>
                <span class="label">Weeks Left</span>
            </div>
        </div>
    </div>
</div>

<style>
    .dashboard-view {
        width: 100%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
    }

    h2 {
        font-size: 2.5rem;
        font-weight: normal;
        margin: 0;
    }

    .progress-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .bar-bg {
        width: 100%;
        height: 60px;
        background: #222;
        border: 1px solid #444;
        position: relative;
    }

    .bar-fill {
        height: 100%;
        background: white;
        transition: width 1s ease-out;
    }

    .stats {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .val {
        font-size: 3rem;
        font-weight: bold;
    }

    .label {
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
</style>
