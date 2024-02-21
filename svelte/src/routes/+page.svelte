<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
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