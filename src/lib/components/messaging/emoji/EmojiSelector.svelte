<script lang="ts">
    import { Icon, Input, Label } from "$lib/elements"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { Shape } from "$lib/enums"
    import { emojiList } from "./EmojiList"
    import Fuse from "fuse.js"
    import { _ } from "svelte-i18n"
    import { createEventDispatcher, tick } from "svelte"

    interface Emoji {
        skin_tone: boolean
        name: string
        glyph: string
    }

    interface EmojiCategory {
        [category: string]: Emoji[]
    }

    const emojiData: EmojiCategory = emojiList

    let searchQuery: string = ""
    let filteredEmojiData: EmojiCategory = { ...emojiData }
    let showSkinTonePopup: boolean = false
    let selectedSkinTone: string = "" // No skin tone by default

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
    }

    $: skinToneEmoji = getEmojiWithSkinTone(randomEmoji, selectedSkinTone)
</script>

<div id="emoji-container">
    <div class="input-group">
        <Input alt placeholder={$_("generic.search_placeholder")} bind:value={searchQuery} on:input={filterEmojis}>
            <Icon icon={Shape.Search} />
        </Input>
        <button class="skin-tone-selector" on:click={toggleSkinTonePopup}>
            <span class="emoji">{skinToneEmoji}</span>
        </button>
        {#if showSkinTonePopup}
            <div class="skin-tone-popup">
                {#each skinTones as tone}
                    <button class="skin-tone" on:click={() => selectSkinTone(tone)}>
                        <span class="emoji">{getEmojiWithSkinTone(randomEmoji, tone === "🚫" ? "" : tone)}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
    <Spacer less />
    <div id="emoji-selector">
        {#each Object.keys(filteredEmojiData) as category}
            <section id={category}>
                <Label text={category.replaceAll("_", " ")} />
                <div class="emoji-list">
                    {#each filteredEmojiData[category] as emoji}
                        {#if emoji.skin_tone}
                            <span class="emoji" title={emoji.name} on:click={() => handleEmojiClick(emoji.glyph, selectedSkinTone)}>{getEmojiWithSkinTone(emoji.glyph, selectedSkinTone)}</span>
                        {:else}
                            <span class="emoji" title={emoji.name} on:click={() => handleEmojiClick(emoji.glyph, "")}>{emoji.glyph}</span>
                        {/if}
                    {/each}
                </div>
            </section>
        {/each}
    </div>
    <div id="category-nav">
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
                }
            }
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
                    justify-content: space-between;
                    gap: 0.5rem;

                    .emoji {
                        font-size: 1.5rem;
                        cursor: pointer;
                    }
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
