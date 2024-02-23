<script lang="ts">
    import { Appearance, MessagePosition, Shape, Status } from "$lib/enums";

    import Icon from "$lib/elements/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Switch from "$lib/elements/Switch.svelte";
    import Select from "$lib/elements/Select.svelte";
    import Container from "../lib/components/Container.svelte"
    import Button from '../lib/elements/Button.svelte';
    import Checkbox from "$lib/elements/Checkbox.svelte";
    import RangeSelector from "$lib/elements/RangeSelector.svelte";
    import Key from "$lib/components/Key.svelte";

    import Message from "$lib/components/Message.svelte";
    import MessageGroup from "$lib/components/MessageGroup.svelte";
    import MessageContainer from "$lib/components/MessageContainer.svelte";
    import MessageReactions from "$lib/components/MessageReactions.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
</script>

<Container title="Elements" row>
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
            <Input
                placeholder="Type something . . ." />
            <Input 
                alt
                placeholder="Type something . . ." />
        </Container>

        <Container title="Highlight Input">
            <Input
                alt
                highlight={Appearance.Success}
                placeholder="Highlight Success . . ." />
            <Input
                alt
                highlight={Appearance.Info}
                placeholder="Highlight Info . . ." />
            <Input
                alt
                highlight={Appearance.Warning}
                placeholder="Highlight Warning . . ." />
            <Input
                alt
                highlight={Appearance.Error}
                placeholder="Highlight Error . . ." />
        </Container>

        <Container title="Add Icons">
            <Input
                alt
                placeholder="Icon . . .">
                <Icon icon={Shape.Beaker} />
            </Input>
            <Input
                alt
                highlight={Appearance.Info}
                placeholder="Icon . . .">
                <Icon icon={Shape.Beaker} />
            </Input>
        </Container>
    </Container>

    <!-- Switch -->
    <Container title="Switch" row>
        <Container title="Standard">
            <Switch on /> <!-- TODO: This isn't working for some reason -->
            <Switch />
        </Container>
    </Container>

    <!-- Select -->
    <Container title="Select" row>
        <Container title="Standard">
            <Select alt options={[
                { value: "default", text: "Default" },
                { value: "night", text: "Night-time" },
                { value: "light", text: "Day-time" },
                { value: "sunset", text: "Sunset" },
            ]}/>
            <Select options={[
                    { value: "default", text: "Default" },
                    { value: "night", text: "Night-time" },
                    { value: "light", text: "Day-time" },
                    { value: "sunset", text: "Sunset" },
                ]}/>
        </Container>
        <Container title="Highlight">
            <Select 
                highlight={Appearance.Info}
                alt
                options={[
                    { value: "default", text: "Default" },
                    { value: "night", text: "Night-time" },
                    { value: "light", text: "Day-time" },
                    { value: "sunset", text: "Sunset" },
                ]}/>

            <Select 
                highlight={Appearance.Success}
                alt
                options={[
                    { value: "default", text: "Default" },
                    { value: "night", text: "Night-time" },
                    { value: "light", text: "Day-time" },
                    { value: "sunset", text: "Sunset" },
                ]}/>

            <Select 
                highlight={Appearance.Warning}
                alt
                options={[
                    { value: "default", text: "Default" },
                    { value: "night", text: "Night-time" },
                    { value: "light", text: "Day-time" },
                    { value: "sunset", text: "Sunset" },
                ]}/>

            <Select
                highlight={Appearance.Error}
                alt
                options={[
                    { value: "default", text: "Default" },
                    { value: "night", text: "Night-time" },
                    { value: "light", text: "Day-time" },
                    { value: "sunset", text: "Sunset" },
                ]}/>
        </Container>
    </Container>

    <!-- Checkbox -->
    <Container title="Checkbox" row>
        <Container title="Standard">
            <Checkbox checked />
            <Checkbox />
        </Container>
    </Container>

    <!-- Range Selector -->
    <Container title="Range Selection" row>
        <Container title="Standard">
            <RangeSelector
                min={1}
                max={100} 
                value={50} />
        </Container>
    </Container>
</Container>

<!-- Profile Picture -->
<Container title="Profile Picture" row>
    <Container title="Standard">
        <ProfilePicture 
            notifications={3}
            image="/src/lib/assets/pluto.png"
            status={Status.Online}/>
        <ProfilePicture 
            image="/src/lib/assets/blue_marble.png"
            status={Status.Idle}/>
        <ProfilePicture 
            image="/src/lib/assets/moon.png"
            status={Status.DoNotDisturb}/>
    </Container>
    <Container title="Highlight">
        <ProfilePicture 
            image="/src/lib/assets/pluto.png"
            highlight={Appearance.Success}
            status={Status.Online}/>
        <ProfilePicture 
            image="/src/lib/assets/blue_marble.png"
            highlight={Appearance.Info}
            status={Status.Idle}/>
        <ProfilePicture 
            image="/src/lib/assets/moon.png"
            highlight={Appearance.Warning}
            status={Status.Offline}/>
        <ProfilePicture 
            image="/src/lib/assets/mars.png"
            notifications={3}
            highlight={Appearance.Error}
            status={Status.DoNotDisturb}/>
    </Container>
    <Container title="Typing">
        <ProfilePicture 
            image="/src/lib/assets/moon.png"
            typing
            status={Status.Online}/>
    </Container>
</Container>

<!-- Messages -->
<Container title="Components" row>
    <Container title="Keyboard Keys">
        <Key character="W" />
        <Key character="A" />
        <Key character="S" />
        <Key character="D" />
    </Container>
    <Container title="Messages">
        <MessageGroup>
            <MessageContainer>
                <Message position={MessagePosition.First}>Hello, world!</Message>
                <MessageReactions reactions={[
                    {
                        emoji: "🔥",
                        highlight: Appearance.Primary,
                        count: 3,
                        description: ":fire: you and 2 users reacted.",
                    },
                    {
                        emoji: "🌎",
                        highlight: Appearance.Default,
                        count: 2,
                        description: ":earth: 2 users reacted.",
                    }
                ]}/>
            </MessageContainer>
            <MessageContainer>
                <Message>This is another message.</Message>
            </MessageContainer>
            <MessageContainer>
                <Message position={MessagePosition.Last}>And one last message!</Message>
            </MessageContainer>
        </MessageGroup>

        <MessageGroup remote>
            <MessageContainer>
                <Message remote position={MessagePosition.First}>Hello humans.</Message>
                <MessageReactions remote reactions={[
                    {
                        emoji: "👽",
                        highlight: Appearance.Default,
                        count: 2,
                        description: ":alien: 2 users reacted."
                    },
                    {
                        emoji: "👀",
                        highlight: Appearance.Default,
                        count: 1,
                        description: ":eyes: 1 user reacted."
                    }
                ]}/>
            </MessageContainer>
            <MessageContainer>
                <Message remote>I am not an alien.</Message>
            </MessageContainer>
            <MessageContainer>
                <Message remote position={MessagePosition.Last}>Unless I am, oOoo who knows!?</Message>
            </MessageContainer>
        </MessageGroup>

        <MessageGroup>
            <MessageContainer>
                <Message reply remote localSide position={MessagePosition.First}>I am not an alien.</Message>
                <Message position={MessagePosition.Last}>Hmm, okay!</Message>
            </MessageContainer>
        </MessageGroup>
    </Container>
</Container>
