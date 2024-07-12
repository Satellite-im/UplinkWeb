<script lang="ts">
    import { Appearance } from "$lib/enums"
    import { Button, Label } from "$lib/elements"
    import { onMount } from "svelte"
    import Text from "$lib/elements/Text.svelte"

    let score: number = 0
    let currentArrow: string | null = null
    let timer: number = 10
    const timeIncrement: number = 0.5
    let countdownInterval: any
    let gameOver: boolean = false
    let gameStarted: boolean = false

    const arrows: string[] = ["up", "down", "left", "right"]
    let activeArrow: string | null = null

    function getRandomArrow(): string {
        return arrows[Math.floor(Math.random() * arrows.length)]
    }

    function scrambleArrows(): void {
        const arrowContainer = document.querySelector(".arrows")
        if (arrowContainer) {
            const scrambledPositions = Array.from(arrowContainer.children).sort(() => Math.random() - 0.5)
            scrambledPositions.forEach(el => {
                arrowContainer.appendChild(el)
            })
        }
    }

    function setActiveArrow(arrow: string): void {
        activeArrow = arrow
        currentArrow = arrow
    }

    function updateScore(): void {
        score = score
    }

    function updateTimer(): void {
        timer = timer
    }

    function startCountdown(): void {
        clearInterval(countdownInterval)
        countdownInterval = setInterval(() => {
            timer -= 0.01
            if (timer <= 0) {
                endGame()
            }
        }, 10)
    }

    function endGame(): void {
        clearInterval(countdownInterval)
        gameOver = true
        activeArrow = null
    }

    function tryAgain(): void {
        score = 0
        timer = 10
        scrambleArrows()
        setActiveArrow(getRandomArrow())
        gameOver = false
        gameStarted = false
    }

    onMount(() => {
        document.addEventListener("keydown", event => {
            const keyMap: { [key: string]: string } = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
            }

            if (gameOver) {
                return
            }

            if (!gameStarted) {
                gameStarted = true
                startCountdown()
            }

            if (keyMap[event.key] === currentArrow) {
                score++
                timer += timeIncrement
                scrambleArrows()
                setActiveArrow(getRandomArrow())
            } else {
                endGame()
            }
        })

        scrambleArrows()
        setActiveArrow(getRandomArrow())
    })
</script>

<div id="game">
    <Label text={`time: ${timer.toFixed(2)}`} />
    <Text>{score}</Text>
    <div class="arrows">
        <div class="arrow" id="up" class:active={activeArrow === "up"}>
            <img src="/assets/arrow.png" alt="Up Arrow" />
        </div>
        <div class="arrow" id="down" class:active={activeArrow === "down"}>
            <img src="/assets/arrow.png" alt="Down Arrow" />
        </div>
        <div class="arrow" id="left" class:active={activeArrow === "left"}>
            <img src="/assets/arrow.png" alt="Left Arrow" />
        </div>
        <div class="arrow" id="right" class:active={activeArrow === "right"}>
            <img src="/assets/arrow.png" alt="Right Arrow" />
        </div>
    </div>
    {#if gameOver}
        <Button small appearance={Appearance.Primary} on:click={tryAgain}>Try Again?</Button>
    {/if}
</div>

<style>
    #game {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
    }

    .arrows {
        display: flex;
        justify-content: space-around;
        width: 200px;
        margin: 0 auto;
    }

    .arrow {
        width: 85px;
        height: 85px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .arrow img {
        width: fit-content;
        filter: grayscale(60%) brightness(50%);
    }

    .arrow.active img {
        filter: grayscale(0%) brightness(150%);
    }

    #up {
        transform: rotate(0deg);
    }

    #down {
        transform: rotate(180deg);
    }

    #left {
        transform: rotate(-90deg);
    }

    #right {
        transform: rotate(90deg);
    }
</style>
