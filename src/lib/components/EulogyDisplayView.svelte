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
            <div class="death-symbol">
                <!-- Retro skull icon -->
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8 2 5 5 5 9V11C5 13 7 15 7 15V19C7 20.1 7.9 21 9 21H15C16.1 21 17 20.1 17 19V15C17 15 19 13 19 11V9C19 5 16 2 12 2ZM7 9C7 6.2 9.2 4 12 4C14.8 4 17 6.2 17 9V11H7V9ZM9 19V16H15V19H9ZM15 14H9C8.5 14 8 13.6 8 13C8 12.4 8.5 12 9 12H15C15.6 12 16 12.4 16 13C16 13.6 15.6 14 15 14Z" fill="#555"/>
                    <rect x="10" y="7" width="1.5" height="2" fill="#555"/>
                    <rect x="12.5" y="7" width="1.5" height="2" fill="#555"/>
                </svg>
            </div>
            <h3>IN LOVING MEMORY</h3>
            <div class="divider"></div>
        </div>

        <div class="card-content">
            <p>HERE LIES A SOUL WHO WILL BE REMEMBERED FOR:</p>
            <ul>
                <li>"{eulogy.point1}"</li>
                <li>"{eulogy.point2}"</li>
                <li>"{eulogy.point3}"</li>
            </ul>
        </div>

        <div class="card-footer">
            <p>A LIFE WELL LIVED.</p>
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
        background: rgba(0, 10, 0, 0.95);
        border: 2px dashed #444;
        padding: 3rem;
        width: 100%;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        position: relative;
        font-family: "Press Start 2P", cursive;
    }

    /* Decorative corners removed for cleaner retro look, or keep as pixel corners */
    .card::before,
    .card::after {
        display: none;
    }

    .death-symbol {
        margin-bottom: 1rem;
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
    }

    .card-header h3 {
        font-family: inherit;
        font-size: 1.2rem;
        margin: 0 0 1rem 0;
        color: #ccc;
        letter-spacing: 2px;
        line-height: 1.5;
    }

    .divider {
        height: 2px;
        background: #333;
        margin-bottom: 3rem;
        width: 100%;
    }

    .card-content p {
        color: #888;
        font-style: normal;
        margin-bottom: 2.5rem;
        font-size: 0.8rem;
        line-height: 1.8;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    li {
        font-size: 1rem;
        color: #ffff00;
        font-family: inherit;
        line-height: 1.6;
    }

    .card-footer {
        margin-top: 4rem;
        font-size: 0.7rem;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 3px;
    }

    .continue-btn {
        background: transparent;
        border: 2px solid #555;
        color: #888;
        padding: 1rem 2rem;
        cursor: pointer;
        transition: all 0.2s;
        font-family: "Press Start 2P", cursive;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 0.8rem;
    }

    .continue-btn:hover {
        border-color: #ffff00;
        color: #ffff00;
        transform: scale(1.05);
    }
</style>
