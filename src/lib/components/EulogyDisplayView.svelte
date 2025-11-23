<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { appState } from "$lib/stores/appState";

    const dispatch = createEventDispatcher();

    $: eulogy = $appState.eulogy;
</script>

<div class="container" in:fade>
    <div class="card" in:scale={{ duration: 500, start: 0.9 }}>
        <div class="card-header">
            <h3>In Loving Memory</h3>
            <div class="divider"></div>
        </div>

        <div class="card-content">
            <p>Here lies a soul who will be remembered for:</p>
            <ul>
                <li>"{eulogy.point1}"</li>
                <li>"{eulogy.point2}"</li>
                <li>"{eulogy.point3}"</li>
            </ul>
        </div>

        <div class="card-footer">
            <p>A life well lived.</p>
        </div>
    </div>

    <button
        class="continue-btn"
        on:click={() => dispatch("next")}
        in:fade={{ delay: 1000 }}
    >
        Continue
    </button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
        width: 100%;
        height: 100%;
        justify-content: center;
    }

    .card {
        background: #1a1a1a;
        border: 1px solid #333;
        padding: 3rem;
        width: 100%;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        position: relative;
    }

    /* Decorative corners */
    .card::before,
    .card::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #555;
        transition: all 0.3s;
    }

    .card::before {
        top: 10px;
        left: 10px;
        border-right: none;
        border-bottom: none;
    }

    .card::after {
        bottom: 10px;
        right: 10px;
        border-left: none;
        border-top: none;
    }

    .card-header h3 {
        font-family: serif;
        font-size: 2rem;
        margin: 0 0 1rem 0;
        color: #fff;
        letter-spacing: 2px;
    }

    .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #555, transparent);
        margin-bottom: 2rem;
    }

    .card-content p {
        color: #888;
        font-style: italic;
        margin-bottom: 1.5rem;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    li {
        font-size: 1.3rem;
        color: #ddd;
        font-family: serif;
    }

    .card-footer {
        margin-top: 3rem;
        font-size: 0.9rem;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 3px;
    }

    .continue-btn {
        background: transparent;
        border: 1px solid #555;
        color: #888;
        padding: 0.8rem 2rem;
        cursor: pointer;
        transition: all 0.2s;
        font-family: monospace;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .continue-btn:hover {
        border-color: white;
        color: white;
    }
</style>
