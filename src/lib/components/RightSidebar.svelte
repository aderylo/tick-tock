<script lang="ts">
    import { appState, updateUserData } from "$lib/stores/appState";
    import { fly } from "svelte/transition";

    let isOpen = true; // Default open for now, or toggleable

    function toggle() {
        isOpen = !isOpen;
    }

    // Local bindings to store
    $: userData = $appState.userData;

    function handleInput(field: keyof typeof userData, value: string) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            updateUserData({ [field]: num });
        }
    }
</script>

<div class="sidebar-container" class:open={isOpen}>
    <button class="toggle-btn" on:click={toggle}>
        {isOpen ? "→" : "←"}
    </button>

    <div class="content">
        <h2>Parameters</h2>

        <div class="input-group">
            <label for="age">Age</label>
            <input
                id="age"
                type="number"
                value={userData.age || ""}
                on:input={(e) => handleInput("age", e.currentTarget.value)}
                placeholder="Years"
            />
        </div>

        <div class="input-group">
            <label for="expectancy">Life Expectancy</label>
            <input
                id="expectancy"
                type="number"
                value={userData.lifeExpectancy}
                on:input={(e) =>
                    handleInput("lifeExpectancy", e.currentTarget.value)}
            />
        </div>

        <div class="divider"></div>

        <div class="input-group">
            <label for="sleep">Sleep (h/day)</label>
            <input
                id="sleep"
                type="number"
                value={userData.sleepHours}
                on:input={(e) =>
                    handleInput("sleepHours", e.currentTarget.value)}
            />
        </div>

        <div class="input-group">
            <label for="work">Work (h/day)</label>
            <input
                id="work"
                type="number"
                value={userData.workHours}
                on:input={(e) =>
                    handleInput("workHours", e.currentTarget.value)}
            />
        </div>

        <div class="input-group">
            <label for="commute">Commute (h/day)</label>
            <input
                id="commute"
                type="number"
                value={userData.commuteTime}
                on:input={(e) =>
                    handleInput("commuteTime", e.currentTarget.value)}
            />
        </div>

        <div class="input-group">
            <label for="screen">Screen Time (h/day)</label>
            <input
                id="screen"
                type="number"
                value={userData.screenTime}
                on:input={(e) =>
                    handleInput("screenTime", e.currentTarget.value)}
            />
        </div>
    </div>
</div>

<style>
    .sidebar-container {
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        width: 300px;
        background: #111;
        border-left: 1px solid #333;
        transform: translateX(0);
        transition: transform 0.3s ease;
        z-index: 900;
        padding: 2rem;
        box-sizing: border-box;
    }

    .sidebar-container:not(.open) {
        transform: translateX(100%);
    }

    .toggle-btn {
        position: absolute;
        left: -40px;
        top: 20px;
        width: 40px;
        height: 40px;
        background: #111;
        border: 1px solid #333;
        border-right: none;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px 0 0 8px;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        color: #fff;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        color: #888;
        font-size: 0.9rem;
    }

    input {
        background: #222;
        border: 1px solid #444;
        padding: 0.8rem;
        color: white;
        border-radius: 4px;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #666;
    }

    .divider {
        height: 1px;
        background: #333;
        margin: 0.5rem 0;
    }
</style>
