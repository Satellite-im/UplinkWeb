import type { Bundle, Frame } from "$lib/types"

export let mock_bundle_elemental: Bundle = {
    name: "Elemental",
    frames: [
        {
            image: "/assets/frames/fire.png",
            name: "Fire",
        },
        {
            image: "/assets/frames/water.png",
            name: "Water",
        },
    ],
    profileOverlays: [],
}

export let mock_frames: Frame[] = [
    // TODO: We need to put these in a CDN or something, as we get more and more it will end up being too much to bundle
    {
        image: "/assets/frames/foxy.png",
        name: "Foxy",
    },
    {
        image: "/assets/frames/too_epic.png",
        name: "Far Too Epic",
    },
    {
        image: "/assets/frames/nature.png",
        name: "Natural",
    },
    {
        image: "/assets/frames/moon.png",
        name: "Orbiting Moon",
    },
    {
        image: "/assets/frames/skulls.png",
        name: "Skull Party",
    },
    {
        image: "/assets/frames/bronze.png",
        name: "Bronze",
    },
    {
        image: "/assets/frames/quaint.png",
        name: "Quaint",
    },
    {
        image: "/assets/frames/scalefriends.png",
        name: "Friends In Scales",
    },
    {
        image: "/assets/frames/dragonborn.png",
        name: "Dragon Born",
    },
    {
        image: "/assets/frames/magma.png",
        name: "Magma",
    },
    {
        image: "/assets/frames/cat.png",
        name: "Cat",
    },
    {
        image: "/assets/frames/porthole.png",
        name: "Porthole",
    },
    {
        image: "/assets/frames/stone.png",
        name: "Stone",
    },
    {
        image: "/assets/frames/marble.png",
        name: "Marble",
    },
    {
        image: "/assets/frames/robot.png",
        name: "Robotic",
    },
    {
        image: "/assets/frames/disc.png",
        name: "Disc",
    },
    {
        image: "/assets/frames/gems.png",
        name: "Gems",
    }
]
