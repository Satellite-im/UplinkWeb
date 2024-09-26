// swipe.ts
export function swipe(node: HTMLElement) {
    let touchStartX = 0
    let touchStartY = 0
    let touchEndX = 0
    let touchEndY = 0
    let swipeStartTime = 0

    const SWIPE_THRESHOLD = 50 // Minimum distance (px) for a swipe
    const RESTRAINT = 100 // Maximum allowed perpendicular distance
    const ALLOWED_TIME = 500 // Maximum time (ms) allowed to complete the swipe

    function handleTouchStart(event: TouchEvent) {
        const touch = event.changedTouches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        swipeStartTime = new Date().getTime()
    }

    function handleTouchEnd(event: TouchEvent) {
        const touch = event.changedTouches[0]
        touchEndX = touch.clientX
        touchEndY = touch.clientY
        const swipeDistanceX = touchEndX - touchStartX
        const swipeDistanceY = touchEndY - touchStartY
        const swipeTime = new Date().getTime() - swipeStartTime

        if (swipeTime <= ALLOWED_TIME) {
            if (Math.abs(swipeDistanceX) >= SWIPE_THRESHOLD && Math.abs(swipeDistanceY) <= RESTRAINT) {
                // Horizontal swipe detected
                const eventName = swipeDistanceX > 0 ? "swiperight" : "swipeleft"
                node.dispatchEvent(new CustomEvent(eventName, { bubbles: true }))
            } else if (Math.abs(swipeDistanceY) >= SWIPE_THRESHOLD && Math.abs(swipeDistanceX) <= RESTRAINT) {
                // Vertical swipe detected
                const eventName = swipeDistanceY > 0 ? "swipedown" : "swipeup"
                node.dispatchEvent(new CustomEvent(eventName, { bubbles: true }))
            }
        }
    }

    node.addEventListener("touchstart", handleTouchStart, { passive: true })
    node.addEventListener("touchend", handleTouchEnd, { passive: true })

    return {
        destroy() {
            node.removeEventListener("touchstart", handleTouchStart)
            node.removeEventListener("touchend", handleTouchEnd)
        },
    }
}
