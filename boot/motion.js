import { landing } from "./state.js"

export function slideTile(tile, picked) {
    // Measure, switch layout, then translate back so the square travels instead of jumping.
    const first = tile.getBoundingClientRect()
    const token = ++landing.slideToken
    landing.usersRow.classList.add("sliding")
    if (picked) {
        parkOthers(tile)
        landing.stage.classList.add("picked")
        tile.classList.add("chosen")
    } else {
        restoreOthers(tile)
        landing.stage.classList.remove("picked")
    }
    const last = tile.getBoundingClientRect()
    const dx = first.left - last.left
    const dy = first.top - last.top
    tile.style.transition = "none"
    tile.style.transform = `translate(${dx}px, ${dy}px)`
    tile.offsetWidth // commit the start position before the transition is armed
    let armed = false
    requestAnimationFrame(() => {
        if (token !== landing.slideToken) return
        armed = true
        tile.style.transition = "transform 520ms cubic-bezier(.22, .61, .36, 1)"
        tile.style.transform = "translate(0px, 0px)"
    })
    const started = performance.now()
    const finish = () => {
        if (token !== landing.slideToken) return
        const moving = tile.getAnimations().some(animation => animation.playState === "running")
        if (moving && performance.now() - started < 1200) {
            setTimeout(finish, 80)
            return
        }
        // Drop the slide's own transition so a later fade can use opacity again.
        tile.style.transition = ""
        tile.style.transform = ""
        landing.usersRow.classList.remove("sliding")
    }
    tile.addEventListener("transitionend", function onEnd(event) {
        if (!armed || event.target !== tile || event.propertyName !== "transform") return
        tile.removeEventListener("transitionend", onEnd)
        finish()
    })
    setTimeout(finish, 800)
}

function pinTiles(tiles) {
    // Measure everyone before anyone leaves. Pulling them out one by one recenters the rest.
    const origin = landing.stage.getBoundingClientRect()
    const leaving = []
    for (const tile of tiles) {
        // A leftover slide transition only lists transform, which would cancel this fade.
        tile.style.transition = ""
        tile.style.transform = ""
    }
    for (const tile of tiles) {
        const rect = tile.getBoundingClientRect()
        leaving.push({ tile, left: rect.left - origin.left, top: rect.top - origin.top })
    }
    for (const { tile, left, top } of leaving) {
        tile.style.left = `${left}px`
        tile.style.top = `${top}px`
        tile.classList.add("parked")
        landing.stage.append(tile)
    }
    // The parked spot has to paint at full opacity. One frame is not enough: the class
    // lands before that paint and the fade is skipped.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            for (const { tile } of leaving) {
                if (!tile.classList.contains("parked")) continue
                tile.inert = true
                tile.classList.add("gone")
            }
        })
    })
}

function parkOthers(chosen) {
    // Leave the others where they are and fade them. The row then holds only the chosen square.
    pinTiles([...landing.usersRow.children].filter(tile => tile !== chosen))
}

export function dismissTiles(tiles) {
    // Park them where they stand and hide them in the same frame, with no fade.
    const origin = landing.stage.getBoundingClientRect()
    for (const tile of tiles) {
        tile.style.transition = "none"
        tile.style.transform = ""
    }
    const placed = []
    for (const tile of tiles) {
        const rect = tile.getBoundingClientRect()
        placed.push({ tile, left: rect.left - origin.left, top: rect.top - origin.top })
    }
    for (const { tile, left, top } of placed) {
        tile.style.left = `${left}px`
        tile.style.top = `${top}px`
        tile.classList.add("parked", "gone")
        tile.inert = true
        landing.stage.append(tile)
    }
    landing.stage.offsetWidth
    for (const { tile } of placed) tile.style.transition = ""
}

export function restoreOthers(chosen) {
    const tiles = [
        ...landing.usersRow.children,
        ...landing.stage.querySelectorAll(":scope > .landing-tile.parked"),
    ].filter(tile => !tile.classList.contains("landing-create"))
    tiles.sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot))
    for (const tile of tiles) {
        if (tile !== chosen) {
            tile.classList.add("gone")
            tile.style.transition = ""
            tile.style.transform = ""
        }
        tile.classList.remove("parked", "chosen")
        tile.style.left = ""
        tile.style.top = ""
        landing.usersRow.append(tile)
    }
    // The move back into the row has to paint at opacity 0, or the fade-in is skipped.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            for (const tile of tiles) {
                if (tile === chosen) continue
                tile.inert = false
                tile.classList.remove("gone")
            }
        })
    })
}
