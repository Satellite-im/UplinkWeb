<script lang="ts">
    import { Icon, Input, Label, RangeSelector } from "$lib/elements"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { Shape } from "$lib/enums"
    import { emojiList } from "./EmojiList"
    import Fuse from "fuse.js"
    import { _ } from "svelte-i18n"
    import { createEventDispatcher, onMount, tick } from "svelte"
    import { createPersistentState } from "$lib/state"

    interface Emoji {
        skin_tone: boolean
        name: string
        glyph: string
    }

    interface EmojiCategory {
        [category: string]: Emoji[]
    }

    // @ts-ignore
    const emojiData: EmojiCategory = emojiList

    let searchQuery: string = ""
    let filteredEmojiData: EmojiCategory = { ...emojiData }
    let showSkinTonePopup: boolean = false
    let selectedSkinTone: string = "" // No skin tone by default

    interface FrequentlyUsedEmoji {
        [glyph: string]: number
    }
    const frequentlyUsedEmojis = createPersistentState<FrequentlyUsedEmoji>("emoji.history", {})

    const skinTones: string[] = ["🚫", "🏿", "🏾", "🏽", "🏼", "🏻"]
    const sampleEmojis: string[] = ["👍", "👋", "👏", "👌", "✌️"]
    let randomEmoji: string = sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)]

    const fuseOptions = {
        keys: ["name"],
        threshold: 0.3,
    }

    const dispatch = createEventDispatcher()

    function filterEmojis() {
        if (!searchQuery) {
            filteredEmojiData = { ...emojiData }
            return
        }

        filteredEmojiData = {}

        for (const category in emojiData) {
            const fuse = new Fuse(emojiData[category], fuseOptions)
            const result = fuse.search(searchQuery).map(result => result.item)
            if (result.length > 0) {
                filteredEmojiData[category] = result
            }
        }
    }

    function toggleSkinTonePopup() {
        showSkinTonePopup = !showSkinTonePopup
    }

    function selectSkinTone(tone: string) {
        selectedSkinTone = tone === "🚫" ? "" : tone
        randomEmoji = sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)]
        showSkinTonePopup = false
        tick().then(filterEmojis) // Re-filter emojis to trigger re-render
    }

    function getEmojiWithSkinTone(emoji: string, tone: string): string {
        const codePoints = Array.from(emoji).map(char => char.codePointAt(0) as number)
        const baseEmoji = codePoints[0]
        if (codePoints.length > 1 && codePoints[1] >= 0x1f3fb && codePoints[1] <= 0x1f3ff) {
            return String.fromCodePoint(baseEmoji, tone.codePointAt(0) as number)
        }
        return tone ? String.fromCodePoint(baseEmoji, tone.codePointAt(0) as number) : emoji
    }

    function handleEmojiClick(emoji: string, skinTone: string) {
        const emojiWithTone = getEmojiWithSkinTone(emoji, skinTone)
        dispatch("emoji", emojiWithTone)
        trackEmojiUsage(emojiWithTone)
    }

    function trackEmojiUsage(emoji: string) {
        frequentlyUsedEmojis.update(current => {
            if (current[emoji]) {
                current[emoji]++
            } else {
                current[emoji] = 1
            }
            return current
        })
    }

    let frequentlyUsed: { glyph: string }[] = []

    frequentlyUsedEmojis.subscribe(value => {
        const sortedEmojis = Object.entries(value).sort((a, b) => b[1] - a[1])
        frequentlyUsed = sortedEmojis.slice(0, 20).map(([glyph]) => ({ glyph }))
    })

    $: skinToneEmoji = getEmojiWithSkinTone(randomEmoji, selectedSkinTone)

    const emojiSize = createPersistentState("emoji.selectorsize", 44)

    function adjustEmojiSize(containerWidth: number) {
        const newSize = Math.max(16, Math.min(45, 45 - containerWidth / 50))
        emojiSize.set(newSize)
    }

    let emojiContainer: HTMLDivElement

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                adjustEmojiSize(entry.contentRect.width)
            }
        })

        if (emojiContainer) {
            resizeObserver.observe(emojiContainer)
        }

        return () => {
            resizeObserver.disconnect()
        }
    })
</script>

<div id="emoji-container" bind:this={emojiContainer}>
    <div class="input-group">
        <Input alt placeholder={$_("generic.search_placeholder")} bind:value={searchQuery} on:input={filterEmojis}>
            <Icon icon={Shape.Search} />
        </Input>
        <button class="skin-tone-selector" on:click={toggleSkinTonePopup} aria-haspopup="true" aria-expanded={showSkinTonePopup}>
            <span class="emoji">{skinToneEmoji}</span>
        </button>
        {#if showSkinTonePopup}
            <div class="skin-tone-popup">
                {#each skinTones as tone}
                    <button class="skin-tone" on:click={() => selectSkinTone(tone)} aria-label={tone === "🚫" ? "No skin tone" : "Select skin tone"}>
                        <span class="emoji">{getEmojiWithSkinTone(randomEmoji, tone === "🚫" ? "" : tone)}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
    <div class="slider-container">
        <Label text="Size" />
        <RangeSelector min={16} max={45} bind:value={$emojiSize} />
    </div>
    <Spacer less />
    <div id="emoji-selector">
        <section id="frequently_used">
            <Label text="Frequently Used" />
            <div class="emoji-list frequently-used-list">
                {#each frequentlyUsed as emoji}
                    <span
                        class="emoji"
                        role="button"
                        tabindex="0"
                        aria-label={emoji.glyph}
                        on:click={() => handleEmojiClick(emoji.glyph, "")}
                        on:keydown={e => {
                            if (e.key === "Enter") handleEmojiClick(emoji.glyph, "")
                        }}
                        style="font-size: {$emojiSize}px">{emoji.glyph}</span>
                {/each}
            </div>
        </section>
        {#each Object.keys(filteredEmojiData) as category}
            <section id={category}>
                <Label text={category.replaceAll("_", " ")} />
                <div class="emoji-list">
                    {#each filteredEmojiData[category] as emoji}
                        <span
                            class="emoji"
                            role="button"
                            tabindex="0"
                            title={emoji.name}
                            aria-label={emoji.name}
                            on:click={() => handleEmojiClick(emoji.glyph, emoji.skin_tone ? selectedSkinTone : "")}
                            on:keydown={e => {
                                if (e.key === "Enter") handleEmojiClick(emoji.glyph, emoji.skin_tone ? selectedSkinTone : "")
                            }}
                            style="font-size: {$emojiSize}px">{emoji.skin_tone ? getEmojiWithSkinTone(emoji.glyph, selectedSkinTone) : emoji.glyph}</span>
                    {/each}
                </div>
            </section>
        {/each}
    </div>
    <div id="category-nav">
        <a href="#frequently_used" class="category-link">Frequently Used</a>
        {#each Object.keys(filteredEmojiData) as category}
            <a href={`#${category}`} class="category-link">
                {category.replaceAll("_", " ")}
            </a>
        {/each}
    </div>
</div>

<style lang="scss">
    #emoji-container {
        display: flex;
        flex-direction: column;
        height: var(--emoji-selector-height);
        max-width: calc(var(--min-component-width) * 2);

        .input-group {
            display: flex;
            align-items: center;

            .skin-tone-selector {
                font-size: 1.5rem;
                cursor: pointer;
                border: none;
                background: transparent;
                border-radius: 50%;
                padding: 0 0 0 calc(var(--gap) * 0.5vw);
            }

            .skin-tone-popup {
                display: inline-flex;
                position: absolute;
                background: var(--alt-color);
                border: calc(var(--border-width) * 0.1vw) solid var(--border-color);
                border-radius: calc(var(--border-radius) * 0.1vw);
                padding: calc(var(--padding-less) * 0.1vw);
                z-index: 10;
                right: calc(var(--padding) * 0.1vw);

                .skin-tone {
                    font-size: 1.5rem;
                    cursor: pointer;
                    background-color: transparent;
                    border: none;

                    .emoji {
                        font-size: calc(var(--input-height) * 0.1vw) !important;
                    }
                }
            }
        }

        .slider-container {
            display: flex;
            align-items: center;
            gap: calc(var(--gap) * 0.5vw);
            width: 20vw;
            align-self: flex-end;
        }

        #emoji-selector {
            flex: 1;
            overflow-y: scroll;
            overflow-x: hidden;
            padding-right: calc(var(--gap-less) * 0.5vw);
            max-width: calc(var(--min-component-width) * 2);

            section {
                margin-bottom: 1rem;

                .emoji-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    gap: calc(var(--gap-less) * 0.5vw);

                    .emoji {
                        font-size: calc(var(--emoji-size) * 0.5vw);
                        display: flex;
                        cursor: pointer;
                        outline: none;
                        user-select: none;
                        position: relative;

                        transition:
                            transform 0.3s ease,
                            filter 0.3s ease;

                        &:focus {
                            transform: scale(1.2);
                            filter: brightness(1.2);
                            &:focus::after {
                                content: "";
                                position: absolute;
                                bottom: -0.25rem;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0.5rem;
                                height: 0.5rem;
                                background-color: var(--primary-color-alt);
                                border-radius: 50%;
                                box-shadow: 0 0 8px var(--primary-color-alt);
                            }
                        }
                    }
                }

                .frequently-used-list {
                    justify-content: flex-start;
                }
            }
        }

        #category-nav {
            display: flex;
            overflow-x: auto;
            padding: calc(var(--padding-less) * 0.5vw) 0;
            box-sizing: border-box;
            white-space: nowrap;
            gap: calc(var(--gap) * 0.5vw);

            .category-link {
                padding: calc(var(--padding-minimal) * 2vw) calc(var(--padding) * 0.5vw);
                margin-right: 10px;
                text-decoration: none;
                color: var(--text-color);
                background: var(--alt-color);
                border-radius: calc(var(--border-radius-more) * 0.5vw);
                font-size: calc(var(--label-size) * 0.1vw);

                &:hover {
                    background-color: var(--primary-color);
                }
                scroll-margin-top: 20px;
            }
            scroll-margin-top: 20px;
        }
    }
    // #category-nav::-webkit-scrollbar {
    //     margin-top: 5px;
    // }

    @media only screen and (max-width: 600px) {
        #emoji-container {
            padding: 0.5rem;
            .input-group,
            .slider-container,
            #emoji-selector,
            #category-nav {
                width: 100%;
            }
            display: flex;
            justify-content: center; /* Horizontal center */
            align-items: center; /* Vertical center */
        }
    }
</style>
