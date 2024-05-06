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
            name: "Water"
        },
    ],
    profileOverlays: []
}

export let mock_frames: Frame[] = [
    {
        image: "/assets/frames/fire.png",
        name: "Fire",
    },
    {
        image: "/assets/frames/water.png",
        name: "Water"
    },
    {
        image: "/assets/frames/gold.png",
        name: "Gold"
    },
    {
        image: "/assets/frames/mustache.png",
        name: "Mustache"
    },
    {
        image: "/assets/frames/moon.png",
        name: "Orbiting Moon"
    }
]