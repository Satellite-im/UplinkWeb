<script lang="ts">
    import { Icon, Input, Label } from "$lib/elements"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { Shape } from "$lib/enums"
    import { emojiList } from "./EmojiList"
    import Fuse from "fuse.js"
    import { _ } from "svelte-i18n"

    interface EmojiCategory {
        [category: string]: { name: string; glyph: string }[]
    }

    const emojiData: EmojiCategory = emojiList

    let searchQuery: string = ""
    let filteredEmojiData: EmojiCategory = { ...emojiData }

    const fuseOptions = {
        keys: ["name"],
        threshold: 0.3,
    }

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
</script>

<div id="emoji-container">
    <Input alt placeholder={$_("generic.search_placeholder")} bind:value={searchQuery} on:input={filterEmojis}>
        <Icon icon={Shape.Search} />
    </Input>
    <Spacer less />
    <div id="emoji-selector">
        {#each Object.keys(filteredEmojiData) as category}
            <section id={category}>
                <Label text={category.replaceAll("_", " ")} />
                <div class="emoji-list">
                    {#each filteredEmojiData[category] as emoji}
                        <span class="emoji" title={emoji.name}>{emoji.glyph}</span>
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
