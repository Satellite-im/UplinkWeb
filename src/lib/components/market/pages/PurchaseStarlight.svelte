<script>
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Text from "$lib/elements/Text.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
</script>

<div class="purchase-starlight">
    <img class="banner" src="/assets/market/starlight/starlight_banner.png" alt="Starlight Banner" />

    <Label text="Active Bundle" />
    <div class="purchase">
        <div class="purchase-bulk">
            <Label text="$4.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="5,000 Starlight" />
            <Text>+0 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="5,000" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>
        <div class="purchase-bulk">
            <Label text="$9.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="10,500 Starlight" />
            <Text>+500 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="10,500" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>
        <div class="purchase-bulk">
            <Label text="$24.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="27,500 Starlight" />
            <Text>+2,500 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="27,500" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>
        <div class="purchase-bulk">
            <Label text="$49.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="57,500 Starlight" />
            <Text>+7,500 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="57,500" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>

        <div class="purchase-bulk">
            <Label text="$74.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="90,000 Starlight" />
            <Text>+15,000 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="90,000" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>
        <div class="purchase-bulk">
            <Label text="$99.99" />
            <img src="/assets/market/starlight/starlight.png" alt="Starlight" class="starlight-logo" />
            <Label text="120,000 Starlight" />
            <Text>+20,000 Bonus Starlight</Text>
            <Controls>
                <Button appearance={Appearance.Primary} text="120,000" fill>
                    <Icon icon={Shape.Starlight} />
                </Button>
            </Controls>
        </div>
    </div>
</div>

<style lang="scss">
    .purchase-starlight {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        max-width: 900px;
        min-width: var(--min-component-width);

        .banner {
            border-radius: var(--border-radius);
            max-width: 100%;
        }

        .purchase {
            display: inline-flex;
            gap: var(--gap);
            flex-wrap: wrap;

            .purchase-bulk {
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap-less);
                align-items: center;
                padding: var(--padding);
                background: var(--alt-color-alt);
                border-radius: var(--border-radius);
                flex: 30%;

                .starlight-logo {
                    max-width: 100px;
                }
            }
        }
    }
</style>
