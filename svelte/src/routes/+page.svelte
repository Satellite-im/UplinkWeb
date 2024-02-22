<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import { Appearance, Shape } from "$lib/enums";
    import Container from "../lib/components/Container.svelte"
    import Button from '../lib/elements/Button.svelte';
</script>

<!-- Buttons -->
<Container title="Buttons" row>
    <Container title="Standard Buttons">
        <Button
            text="A Button!"
            appearance="{Appearance.Default}" /> 
        <Button 
            text="An Alt Button!"
            appearance="{Appearance.Alt}" /> 
        <Button
            text="An Info Button!"
            appearance="{Appearance.Info}" /> 
        <Button
            text="An Success Button!"
            appearance="{Appearance.Success}" /> 
        <Button
            text="An Warning Button!"
            appearance="{Appearance.Warning}" /> 
        <Button
            text="An Error Button!"
            appearance="{Appearance.Error}" /> 
    </Container>

    <Container title="Outlined Buttons">
        <Button
            text="A Button!"
            outline
            appearance="{Appearance.Default}" /> 
        <Button 
            text="An Alt Button!"
            outline
            appearance="{Appearance.Alt}" /> 
        <Button
            text="An Info Button!"
            outline
            appearance="{Appearance.Info}" /> 
        <Button
            text="An Success Button!"
            outline
            appearance="{Appearance.Success}" /> 
        <Button
            text="An Warning Button!"
            outline
            appearance="{Appearance.Warning}" /> 
        <Button
            text="An Error Button!"
            outline
            appearance="{Appearance.Error}" /> 
    </Container>

    <Container title="Emoji & Icon Buttons">
        <Button
            text="A Button!"
            outline
            appearance="{Appearance.Default}">
            🪐
        </Button>

        <Button icon>
            <Icon alt icon={Shape.XMark} />
        </Button>
    </Container>

    <Container title="Button with Tooltip">
        <Button
            text="Hover Me"
            tooltip="Hey, you!"
            outline
            appearance="{Appearance.Default}">
        </Button>
    </Container>
</Container>


<!-- Inputs -->
<Container title="Inputs" row>
    <Container title="Standard Input">
        <Input placeholder="Type something . . ." />
        
        <Input alt placeholder="Type something . . ." />
    </Container>

    <Container title="Highlight Input">
        <Input alt highlight={Appearance.Success} placeholder="Highlight Success . . ." />
        <Input alt highlight={Appearance.Info} placeholder="Highlight Info . . ." />
        <Input alt highlight={Appearance.Warning} placeholder="Highlight Warning . . ." />
        <Input alt highlight={Appearance.Error} placeholder="Highlight Error . . ." />
    </Container>

    <Container title="Add Icons">
        <Input alt placeholder="Icon . . .">
            <Icon icon={Shape.Beaker} />
        </Input>
        <Input alt highlight={Appearance.Info} placeholder="Icon . . .">
            <Icon icon={Shape.Beaker} />
        </Input>
    </Container>
</Container>