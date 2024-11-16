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
    
            hideOnShrink: true,
            stickToBorder: true,
    
            borderRadius: 8,
            visibleNodes: false,
        },
        icon: {
            responsive: true,
            style: null
        },
        background: {
            image: "../plexos/res/images/norrum/Desktop/fondoB.png",
            color: "#444444",
        },
        taskbar: {
            anchored: true,
            height: 60
        }
    },
    apps: {
        dir:  "/plexos/app/sys/Explorer/explorer_lau.js",
        msf:  "/plexos/app/meta/Web Framer/iframer_lau.js",
        img:  "/plexos/app/meta/Image Viewer/viewer_lau.js",
        vid:  "/plexos/app/meta/Media Player/player_lau.js",
        txt:  "/plexos/app/data/Notepad/notepad_lau.js",
        json: "/plexos/app/data/Monaco/monaco_lau.js",
        js:   "/plexos/app/data/Monaco/monaco_lau.js",
    }
}