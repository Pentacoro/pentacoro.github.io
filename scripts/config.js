cfg = {
    audio: {
        icons: false,
    },
    desktop: {
        grid: {
            enabled: true,

            hLength: 0, vLength: 0,
            width: 90, height: 68,
            hMargin:12, vMargin:12,
    
            modHmargin: 0, modVmargin: 0,
    
            autoHlength: false,
            autoVlength: false,
            autoHmargin: false,
            autoVmargin: false,
    
            sendStash: true,
            sendBorder: true,
            sendForce: false,
    
            borderRadius: 8,
            visibleNodes: false,
        },
        icon: {
            responsive: true,
            style: null
        },
        background: {
            image: "../assets/norrum/Desktop/fondoB.png",
            color: "#444444",
        },
        taskbar: {
            height: 60
        }
    },
    apps: {
        dir: "./apps/filesystem_explorer/explorer_lau.js",
        msf: "./apps/media/iframer/iframer_lau.js",
        txt: "./apps/plexos_notepad/notepad_lau.js",
        js:  "./apps/imported_apps/monaco_editor/monaco_lau.js",
        img: "./apps/media/gallery/gallery_lau.js",
        vid: "./apps/media/player/player_lau.js",
    }
}