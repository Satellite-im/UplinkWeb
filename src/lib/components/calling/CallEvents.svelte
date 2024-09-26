<script lang="ts">
    import { Icon, Label, Text } from "$lib/elements"
    import { CallEvent, Shape, Size } from "$lib/enums"
    import { getTimeAgo } from "$lib/utils/Functions"

    export let event: CallEvent = CallEvent.Started
    export let eventTime: Date = new Date()

    function getOutlineColor(): string {
        switch (event) {
            case CallEvent.Started:
                return "stroke-success"
            case CallEvent.Ended:
                return "stroke-error"
            case CallEvent.Missed:
                return "stroke-primary"
            case CallEvent.Declined:
                return "stroke-error"
            default:
                return ""
        }
    }
</script>

<div class={`call-event ${getOutlineColor()}`}>
    {#if event === CallEvent.Started}
        <div class="left">
            <Icon size={Size.Large} icon={Shape.PhoneCall} />
        </div>
        <div class="right">
            <Label text="Call started" />
            <Text>{getTimeAgo(eventTime)}</Text>
        </div>
    {:else if event === CallEvent.Ended}
        <div class="left">
            <Icon size={Size.Large} icon={Shape.PhoneSlash} />
        </div>
        <div class="right">
            <Label text="Call ended" />
            <Text>{getTimeAgo(eventTime)}</Text>
        </div>
    {:else if event === CallEvent.Missed}
        <div class="left">
            <Icon size={Size.Large} icon={Shape.PhoneXMark} />
        </div>
        <div class="right">
            <Label text="Call missed" />
            <Text>{getTimeAgo(eventTime)}</Text>
        </div>
    {:else if event === CallEvent.Declined}
        <div class="left">
            <Icon size={Size.Large} icon={Shape.PhoneSlash} />
        </div>
        <div class="right">
            <Label text="Call declined" />
            <Text>{getTimeAgo(eventTime)}</Text>
        </div>
    {/if}
</div>

<style lang="scss">
    .call-event {
        display: flex;
        align-items: center;
        gap: var(--gap);
        background-color: var(--alt-color);
        border-radius: var(--border-radius);
        padding: var(--padding-less) var(--padding);

        .left {
            display: flex;
            align-items: center;
            gap: var(--gap);
        }

        &.stroke-success {
            border: var(--border-width) solid var(--success-color);
        }
        &.stroke-error {
            border: var(--border-width) solid var(--error-color);
        }
        &.stroke-primary {
            border: var(--border-width) solid var(--primary-color);
        }
    }
</style>
