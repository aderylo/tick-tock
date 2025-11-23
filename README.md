# Tick Tock: Memento Mori

## Inspiration

**Value your time.**

That was the core thought. We often live our days as if they are infinite resources. The ancient stoic concept of *Memento Mori* ("remember you must die") isn't about being morbid; it's about clarity. We wanted to take that abstract philosophy and turn it into a concrete, visual, and slightly gamified reality check.

## What it does

**Makes you value your time :)**

Tick Tock acts as a "life dashboard" with a retro, terminal-style aesthetic. It features:

*   **Life Visualization**: Your life is represented as a grid of dots. Past time is eaten, future time remains.
*   **The Pacman Metaphor**: In the detailed view, a Pacman character actively "eats" your timeline, representing the relentless march of time.
*   **Real-World Data**: It calculates your statistical life expectancy based on your current age and country (using 2023 UN estimates), projecting a realistic "Game Over" date.
*   **Effective Time**: It doesn't just show years; it allows you to subtract sleep, work, and commute hours to reveal how much *actual* conscious life you have left to pursue your dreams.
*   **Deadline Tracking**: You can set specific goals, creating a "race" against time to achieve them before the dots run out.
*   **Installable App**: Full **PWA (Progressive Web App)** support. You can install it directly on your iPhone (Safari > Share > Add to Home Screen) or Android for a native, full-screen app experience without an app store.

## How we built it

**With pure willpower, caffeine and Svelte!**

*   **Framework**: We used **SvelteKit** for its reactivity and performance. Your browser of choice for local storage, and Cloudefront for serving.  
*   **Styling**: The UI is custom CSS, designed to mimic a retro CRT monitor with scanlines.
*   **Data Logic**: We integrated a dataset of life expectancy statistics from over 200 countries. We built a linear interpolation utility to calculate precise life expectancy based on the user's current age (factoring in survivorship bias).
*   **Persistence**: All user data—age, deadlines, settings—is persisted locally in the browser, respecting privacy while keeping the experience seamless. No external calls are being made, app is essentially a static webiste.
*   **Testing**: For rapid testing during development on various devices we have used [jprq - join public router, quickly](https://jprq.io/). Check it out!

## Challenges we ran into

*   **The Math of Mortality**: Dealing with life expectancy data is tricky. Simply capping it at 80 years feels wrong if you're already 79. We had to implement a dynamic projection model that extends your expected lifespan the longer you survive, ensuring the "Game Over" line always stays ahead of the player (at least by a bit!).
*  **Desing it self**: Let's say we had quite a few heated debates about the User Experience.


## Accomplishments that we're proud of

*   **The "Eulogy" Experience**: Creating an immediate emotional impact with a randomized "R.I.P." intro sequence.
*   **Dynamic Pacman**: Visualizing urgency viscerally as Pacman physically chomps through the life grid.
*   **"Effective Time"**: The shocking realization of how little conscious life remains after subtracting sleep and work.

## What we learned

*   **Svelte Stores are powerful**: Managing complex state (deadlines, multiple view modes, settings) became trivial with Svelte's reactive stores.
*   **Data Visualization Impact**: A simple grid of dots can be more terrifying/motivating than complex charts. Minimalism works when the message is heavy.
*   **Survivorship Bias**: We learned a lot about actuarial science! Living to 65 significantly changes your odds of living to 90.

## What's next for Tick Tock

*   **Calendar Integration**: Syncing your "Deadlines" with Google Calendar/iCal.
*   **Social Challenges**: "Race to the deadline" features to compete with friends on goals.
*   **Health Adjustments**: Allowing users to input lifestyle choices (smoking, exercise) to see their life expectancy dots dynamically expand or contract.
