<script lang="ts">
    import { fade } from "svelte/transition";

    export let age: number;
    export let totalYears: number;

    $: remainingYears = Math.max(0, totalYears - age);
    $: weekends = Math.round(remainingYears * 52);
    $: books = Math.round(remainingYears * 6);
    $: moons = Math.round(remainingYears * 12.37);
</script>

<div class="perspective-container" in:fade>
    <h2>Put into perspective...</h2>

    <div class="grid">
        <div class="card">
            <span class="number">{weekends}</span>
            <span class="label">Weekends Left</span>
            <p class="subtext">Time for yourself, family, and hobbies.</p>
        </div>

        <div class="card">
            <span class="number">{books}</span>
            <span class="label">Books You'll Read</span>
            <p class="subtext">Stories waiting to be discovered (6/year).</p>
        </div>

        <div class="card">
            <span class="number">{moons}</span>
            <span class="label">Full Moons Left</span>
            <p class="subtext">Moments of wonder in the night sky.</p>
        </div>
    </div>
</div>

<style>
    .perspective-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
        width: 100%;
        max-width: 900px;
        padding: 2rem;
    }

    h2 {
        font-size: 2.5rem;
        font-weight: normal;
        text-align: center;
        margin: 0;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        width: 100%;
    }

    .card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
        border: 1px solid #333;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        transition: transform 0.2s;
    }

    .card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.1);
    }

    .number {
        font-size: 4rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        background: linear-gradient(45deg, #fff, #aaa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .label {
        font-size: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 1rem;
        color: #ccc;
    }

    .subtext {
        font-size: 1rem;
        color: #888;
        margin: 0;
        line-height: 1.4;
    }
</style>
