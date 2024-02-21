<script lang="ts">
    import { Appearance } from "$lib/enums";
    import Container from "../lib/components/Container.svelte"
    import Button from '../lib/elements/Button.svelte';
</script>

<!-- Buttons -->
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
