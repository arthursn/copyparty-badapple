"use strict";

// Written by stackxp
// GitHub: https://github.com/stackxp/copyparty-badapple/

let qs = (q, o = document) => o.querySelector(q)
let rempx = (s) => parseInt(s.replace(/px$/, ""))

const pixelWidth = "300px",
    pixelHeight = "240px"

async function play(videoPath, zoom=0.5, filename="") {
    // Enable the grid, if not already
    if (!thegrid.en)
        qs("#griden").click()

    const style = document.createElement("style")
    document.head.append(style)
    style.sheet.insertRule("#ggrid>a { height: var(--grid-sz); }", 0)

    const video = document.createElement("video")
    try {
        await new Promise((res, rej) => {
            video.onloadedmetadata = (v) => res(v)
            video.onerror = () => rej()
            video.src = videoPath
            video.load()
        })
    } catch {
        modal.alert("<h2>Copyparty grid video player</h2>The video file couldn't be found!")
        return
    }
    const videoAspectRatio = video.videoWidth / video.videoHeight

    // Preparing
    let canvas = new OffscreenCanvas(1, 1)
    let ctx = canvas.getContext("2d")

    let grid = qs("#ggrid")
    grid.innerHTML = ""
    grid.style.zoom = zoom

    let gridStyle = getComputedStyle(grid)
    let gridFileHeight = rempx(gridStyle.fontSize) * thegrid.sz + rempx(gridStyle.rowGap)
    let gridHeadHeight = rempx(getComputedStyle(qs("#ghead")).height)
    const getNumberGridColumns = (grid) => (getComputedStyle(grid).gridTemplateColumns.match(/ /g) || []).length

    let canvasWidth = getNumberGridColumns(grid) + 1
    let canvasHeight = Math.floor((window.innerHeight - gridHeadHeight) / gridFileHeight / zoom) - 1
    if ((videoAspectRatio * canvasHeight) > canvasWidth) {
        canvasHeight = Math.round(canvasWidth / videoAspectRatio)
    } else {
        canvasWidth = Math.round(canvasHeight * videoAspectRatio)
    }
    canvas.height = canvasHeight
    canvas.width = canvasWidth

    // Freeze grid width ensuring that number of columns remains the same
    let clientWidth = grid.clientWidth
    grid.style.width = `${clientWidth}px`
    while (canvasWidth < (getNumberGridColumns(grid) + 1)) {
        clientWidth -= 10
        grid.style.width = `${clientWidth}px`
    }

    let numPixels = canvas.width * canvas.height

    grid.scrollIntoView()

    // Populate grid (that giant data uri is an empty 1x1 image)
    for (let i = 0; i < numPixels; i++)
        grid.innerHTML += `<a href="${videoPath}"><div style="overflow: hidden; display: block; height: var(--grid-sz);"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" style="width: ${pixelWidth}; height: ${pixelHeight};"></div><span>${filename}</span></a>`

    let intIdx = setInterval(() => {
        // Very efficient
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

        for (let i = 0; i < numPixels; i++) {
            let color = Array.from(data.slice(i * 4, i * 4 + 3))
            let hex = "#" + color.map((x) => x.toString(16).padStart(2, "0")).join("")

            grid.childNodes[i].firstChild.style.background = hex
        }
    }, 16)

    video.onended = () => {
        clearInterval(intIdx)
        location.reload()
    }

    video.volume = 0.8
    video.play()
}

const rickroll = (zoom=0.5, filename="LOL") => play("./rickroll.mp4", zoom, filename)
const badapple = (zoom=0.5, filename="BADAPPLE!!") => play("./badapple.mp4", zoom, filename)

rickroll()
// badapple()