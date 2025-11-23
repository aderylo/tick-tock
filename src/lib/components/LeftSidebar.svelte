<script lang="ts">
    import { appState, setView, type ViewType } from "$lib/stores/appState";
    import { fly } from "svelte/transition";

    let isOpen = false; // Default hidden

    function toggle() {
        isOpen = !isOpen;
    }

    const navItems: { id: ViewType; label: string; icon: string }[] = [
        { id: "big-picture", label: "Big Picture", icon: "🌌" },
        { id: "yearly", label: "Yearly View", icon: "📅" },
        { id: "monthly", label: "Monthly View", icon: "📆" },
        { id: "weekly", label: "Weekly View", icon: "🗓️" },
        { id: "calendar", label: "Breakdown", icon: "🧩" },
    ];
</script>

<div class="sidebar-container" class:open={isOpen}>
    <button class="toggle-btn" on:click={toggle}>
        {isOpen ? "←" : "→"}
    </button>

    <div class="sidebar-content">
        <div class="nav-list">
            {#each navItems as item}
                <button
                    class="nav-item"
                    class:active={$appState.currentView === item.id}
                    on:click={() => {
                        setView(item.id);
                        // Optional: close on selection on mobile? keeping open for now
                    }}
                >
                    <span class="icon">{item.icon}</span>
                    <span class="label">{item.label}</span>
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .sidebar-container {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 250px;
        background: rgba(0, 0, 0, 0.95);
        border-right: 1px solid #333;
        z-index: 1000;
        transform: translateX(-100%); /* Hidden by default */
        transition: transform 0.3s ease;
    }

    .sidebar-container.open {
        transform: translateX(0);
    }

    .toggle-btn {
        position: absolute;
        right: -40px;
        top: 20px;
        width: 40px;
        height: 40px;
        background: #111;
        border: 1px solid #333;
        border-left: none;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0 8px 8px 0;
        font-size: 1.2rem;
    }

    .sidebar-content {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-top: 2rem;
        overflow: hidden;
    }

    .nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: transparent;
        border: none;
        color: #888;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        text-align: left;
        font-size: 1rem;
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .nav-item.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        font-weight: bold;
    }

    .icon {
        font-size: 1.2rem;
    }
</style>
