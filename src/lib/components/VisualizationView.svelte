<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import ageDataRaw from "$lib/assets/age.csv?raw";

    export let age: number;

    export let totalYears = 80; // Default fallback
    let progressPercent = 0;
    let animationInterval: any;
    let luck = 50;
    let mounted = false;

    // Parse CSV data: index = age, value = remaining years
    const lifeExpectancyData = ageDataRaw
        .trim()
        .split("\n")
        .map((line) => {
            const val = parseFloat(line.replace(",", "."));
            return isNaN(val) ? 0 : val;
        });

    $: {
        calculateLifeExpectancy(age, luck);
        if (mounted) {
            if (animationInterval) clearInterval(animationInterval);
            progressPercent = (age / totalYears) * 100;
        }
    }

    function calculateLifeExpectancy(currentAge: number, currentLuck: number) {
        let meanRemaining = 0;

        if (currentAge < lifeExpectancyData.length) {
            meanRemaining = lifeExpectancyData[currentAge];
        } else {
            // Extrapolate: assume diminishing returns based on the last known value
            const lastKnown = lifeExpectancyData[lifeExpectancyData.length - 1];
            const yearsOver = currentAge - (lifeExpectancyData.length - 1);
            // Simple decay: lastKnown * (0.9 ^ yearsOver)
            meanRemaining = lastKnown * Math.pow(0.9, yearsOver);
        }

        // Normal Distribution Model
        // Heuristic for Standard Deviation:
        // Assume spread is roughly 15 years, but scale down if remaining life is short
        const stdDev = Math.min(15, meanRemaining / 2);

        // Convert luck (0-100) to a Z-score using Inverse Normal CDF
        // Avoid 0 and 100 to prevent infinity
        const p = Math.max(0.01, Math.min(currentLuck, 99.99)) / 100;
        const zScore = inverseNormal(p);

        const adjustedRemaining = meanRemaining + zScore * stdDev;

        totalYears = currentAge + adjustedRemaining;
    }

    // Acklam's algorithm for Inverse Normal CDF approximation
    function inverseNormal(p: number): number {
        const a1 = -39.6968302866538,
            a2 = 220.946098424521,
            a3 = -275.928510446969;
        const a4 = 138.357751867269,
            a5 = -30.6647980661472,
            a6 = 2.50662827745924;
        const b1 = -54.4760987982241,
            b2 = 161.585836858041,
            b3 = -155.698979859887;
        const b4 = 66.8013118877197,
            b5 = -13.2806815528857;
        const c1 = -7.78489400243029e-3,
            c2 = -3.22396458041136e-1;
        const c3 = -2.40075827716184,
            c4 = -2.54973253934373;
        const c5 = 4.37466414146497,
            c6 = 2.93816398269878;
        const d1 = 7.78469570904146e-3,
            d2 = 3.22467129070039e-1;
        const d3 = 2.445134137143,
            d4 = 3.75440866190742;
        const p_low = 0.02425,
            p_high = 1 - 0.02425;

        let q, r;
        if (0 < p && p < p_low) {
            q = Math.sqrt(-2 * Math.log(p));
            return (
                (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
            );
        } else if (p_low <= p && p <= p_high) {
            q = p - 0.5;
            r = q * q;
            return (
                ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) *
                    q) /
                (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
            );
        } else if (p_high < p && p < 1) {
            q = Math.sqrt(-2 * Math.log(1 - p));
            return (
                -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
            );
        }
        return 0; // Should not happen with clamped input
    }

    onMount(() => {
        mounted = true;
        startProgressAnimation();
        return () => {
            if (animationInterval) clearInterval(animationInterval);
        };
    });

    function startProgressAnimation() {
        // Reset for animation
        let currentPercent = 0;
        const targetPercent = (age / totalYears) * 100;
        const animationSpeed = 10;

        if (animationInterval) clearInterval(animationInterval);

        animationInterval = setInterval(() => {
            if (currentPercent < targetPercent) {
                currentPercent += 0.5; // Increment step
                if (currentPercent > targetPercent)
                    currentPercent = targetPercent;
                progressPercent = currentPercent;
            } else {
                clearInterval(animationInterval);
            }
        }, animationSpeed);
    }
</script>

<div class="progress-wrapper" in:fade>
    <h2 class="probability-text">
        Expected remaining lifespan: {Math.round(totalYears - age)} years
    </h2>

    <div class="progress-container">
        <div class="progress-bar" style="width: {progressPercent}%"></div>
    </div>

    <div class="slider-container">
        <label for="luck-slider">
            I feel luckier than {luck}% of the population
        </label>
        <input
            id="luck-slider"
            type="range"
            min="1"
            max="99"
            bind:value={luck}
        />
    </div>
</div>

<style>
    .progress-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 80%;
        max-width: 600px;
    }

    .probability-text {
        font-size: 1.5rem;
        font-weight: normal;
        text-align: center;
        margin: 0;
    }

    .progress-container {
        width: 100%;
        height: 40px;
        background: repeating-linear-gradient(
            -45deg,
            #ffffff,
            #ffffff 10px,
            #eeeeee 10px,
            #eeeeee 20px
        );
        border: 2px solid lightgray;
        /* Rectangular shape - no border radius */
        border-radius: 0;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        position: relative;
    }

    .progress-bar {
        height: 100%;
        /* Dark gray stripes for the "past" */
        background: repeating-linear-gradient(
            -45deg,
            #333333,
            #333333 10px,
            #444444 10px,
            #444444 20px
        );
        transition: width 0.1s linear;
        border-right: 2px solid white;
        box-sizing: border-box;
    }

    .slider-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
    }

    input[type="range"] {
        width: 100%;
        accent-color: white;
    }
</style>
