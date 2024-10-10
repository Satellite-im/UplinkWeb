<script lang="ts">
    import { Icon, Input, Label, RangeSelector } from "$lib/elements"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { Shape } from "$lib/enums"
    import { emojiList } from "./EmojiList"
    import Fuse from "fuse.js"
    import { _ } from "svelte-i18n"
    import { createEventDispatcher, tick } from "svelte"
    import { createPersistentState } from "$lib/state"
    import { UIStore } from "$lib/state/ui"
    import { derived } from "svelte/store"

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
    $: selectedSkinTone = UIStore.state.selectedSkinTone

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
        selectedSkinTone.set(tone === "🚫" ? "" : tone)
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
        UIStore.state.emojiCounter.update(current => {
            if (current[emoji]) {
                current[emoji]++
            } else {
                current[emoji] = 1
            }
            return current
        })
    }

    $: frequentlyUsed = derived(UIStore.state.emojiCounter, counter => {
        const sortedEmojis = Object.entries(counter).sort((a, b) => b[1] - a[1])
        return sortedEmojis.slice(0, 20).map(([glyph]) => ({ glyph }))
    })

    $: skinToneEmoji = getEmojiWithSkinTone(randomEmoji, $selectedSkinTone)

    const emojiSize = createPersistentState("emoji.selectorsize", 44)
</script>

<div id="emoji-container" data-cy="emoji-container">
    <div class="input-group">
        <Input hook="emoji-container-search-input" alt placeholder={$_("generic.search_placeholder")} bind:value={searchQuery} on:input={filterEmojis}>
            <Icon icon={Shape.Search} />
        </Input>
        <button data-cy="skin-tone-selector" class="skin-tone-selector" on:click={toggleSkinTonePopup} aria-haspopup="true" aria-expanded={showSkinTonePopup}>
            <span class="emoji">{skinToneEmoji}</span>
        </button>
        {#if showSkinTonePopup}
            <div class="skin-tone-popup">
                {#each skinTones as tone}
                    <button data-cy="skin-tone-selector-button" class="skin-tone" on:click={() => selectSkinTone(tone)} aria-label={tone === "🚫" ? "No skin tone" : "Select skin tone"}>
                        <span class="emoji">{getEmojiWithSkinTone(randomEmoji, tone === "🚫" ? "" : tone)}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
    <div class="slider-container" data-cy="emoji-container-size-section">
        <Label hook="emoji-container-size-label" text="Size" />
        <RangeSelector min={16} max={45} bind:value={$emojiSize} />
    </div>
    <Spacer less />
    <div id="emoji-selector" data-cy="emoji-selector">
        <section id="frequently_used" data-cy="frequently-used-section">
            <Label hook="frequently-used-label" text="Frequently Used" />
            <div data-cy="frequently-used-list" class="emoji-list frequently-used-list">
                {#each $frequentlyUsed as emoji}
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
            <section id={category} data-cy="{category.replaceAll('_', '-')}-section">
                <Label hook="{category.replaceAll('_', '-')}-label" text={category.replaceAll("_", " ")} />
                <div class="emoji-list" data-cy="emoji-list">
                    {#each filteredEmojiData[category] as emoji}
                        <span
                            class="emoji"
                            role="button"
                            tabindex="0"
                            title={emoji.name}
                            aria-label={emoji.name}
                            on:click={() => handleEmojiClick(emoji.glyph, emoji.skin_tone ? $selectedSkinTone : "")}
                            on:keydown={e => {
                                if (e.key === "Enter") handleEmojiClick(emoji.glyph, emoji.skin_tone ? $selectedSkinTone : "")
                            }}
                            style="font-size: {$emojiSize}px">{emoji.skin_tone ? getEmojiWithSkinTone(emoji.glyph, $selectedSkinTone) : emoji.glyph}</span>
                    {/each}
                </div>
            </section>
        {/each}
    </div>
    <div id="category-nav" data-cy="emoji-category-nav">
        <a href="#frequently_used" class="category-link" data-cy="category-link-frequently-used">Frequently Used</a>
        {#each Object.keys(filteredEmojiData) as category}
            <a href={`#${category}`} class="category-link" data-cy="category-link-{category.replaceAll('_', '-')}">
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
        width: calc(var(--min-component-width) * 2);

        .input-group {
            display: flex;
            align-items: center;

            .skin-tone-selector {
                font-size: 1.5rem;
                cursor: pointer;
                border: none;
                background: transparent;
                border-radius: 50%;
                padding: 0 0 0 var(--gap);
            }

            .skin-tone-popup {
                display: inline-flex;
                position: absolute;
                background: var(--alt-color);
                border: var(--border-width) solid var(--border-color);
                border-radius: var(--border-radius);
                padding: var(--padding-less);
                z-index: 10;
                right: var(--padding);

                .skin-tone {
                    font-size: 1.5rem;
                    cursor: pointer;
                    background-color: transparent;
                    border: none;

                    .emoji {
                        font-size: var(--input-height) !important;
                    }
                }
            }
        }

        .slider-container {
            display: flex;
            align-items: center;
            gap: var(--gap);
            width: 200px;
            align-self: flex-end;
        }

        #emoji-selector {
            flex: 1;
            overflow-y: scroll;
            overflow-x: hidden;
            padding-right: var(--gap-less);

            section {
                margin-bottom: 1rem;

                .emoji-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: left;
                    gap: var(--gap-less);

                    .emoji {
                        font-size: var(--emoji-size);
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
            padding: var(--padding-less) 0;
            box-sizing: border-box;
            white-space: nowrap;
            gap: var(--gap);

            .category-link {
                padding: var(--padding-minimal) var(--padding);
                text-decoration: none;
                color: var(--text-color);
                background: var(--alt-color);
                border-radius: var(--border-radius-more);
                font-size: var(--label-size);

                &:hover {
                    background-color: var(--primary-color);
                }
            }
        }
    }

    @media only screen and (max-width: 600px) {
        #emoji-container {
            width: 100%;
            height: 100%;
        }
    }
</style>
