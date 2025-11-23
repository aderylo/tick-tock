<script lang="ts">
    const today = new Date();
    const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
    ).getDate();
    const currentDay = today.getDate();
    const percent = (currentDay / daysInMonth) * 100;
    const daysLeft = daysInMonth - currentDay;

    const monthName = today.toLocaleString("default", { month: "long" });
</script>

<div class="dashboard-view">
    <h2>{monthName}</h2>

    <div class="calendar-grid">
        {#each Array(daysInMonth) as _, i}
            <div
                class="day"
                class:past={i + 1 < currentDay}
                class:today={i + 1 === currentDay}
            >
                {i + 1}
            </div>
        {/each}
    </div>

    <div class="stats">
        <p>{daysLeft} days remaining</p>
    </div>
</div>

<style>
    .dashboard-view {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    h2 {
        font-size: 2.5rem;
        font-weight: normal;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 10px;
        width: 100%;
    }

    .day {
        aspect-ratio: 1;
        border: 1px solid #333;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
        color: #888;
    }

    .day.past {
        background: #222;
        color: #444;
        border-color: #222;
    }

    .day.today {
        background: white;
        color: black;
        font-weight: bold;
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    }

    .stats {
        font-size: 1.5rem;
        color: #888;
    }
</style>
