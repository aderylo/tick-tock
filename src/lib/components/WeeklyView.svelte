<script lang="ts">
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    // Adjust so 0 = Monday if preferred, but standard JS is 0=Sun

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
</script>

<div class="dashboard-view">
    <h2>This Week</h2>

    <div class="week-grid">
        {#each days as day, i}
            <div class="day-col">
                <div class="bar-track">
                    <div
                        class="bar-fill"
                        class:filled={i < dayOfWeek}
                        class:today={i === dayOfWeek}
                    ></div>
                </div>
                <span class="label" class:active={i === dayOfWeek}>{day}</span>
            </div>
        {/each}
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
    }

    .week-grid {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 300px;
        gap: 1rem;
    }

    .day-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        height: 100%;
    }

    .bar-track {
        flex: 1;
        width: 100%;
        background: #222;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
    }

    .bar-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: #444;
        transition: height 0.5s;
    }

    .bar-fill.filled {
        height: 100%;
    }

    .bar-fill.today {
        height: 50%; /* Rough estimate of half day */
        background: white;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .label {
        color: #666;
        font-size: 1.2rem;
        text-transform: uppercase;
    }

    .label.active {
        color: white;
        font-weight: bold;
    }
</style>
