let cfg = {
    system: {
        basePath: window.location
    },
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
            height: 32
        }
    },
    apps: {
        dir:  "/plexos/app/sys/Explorer/explorer.lau.js",
        web:  "/plexos/app/meta/Web Framer/iframer.lau.js",
        meta: "/plexos/app/meta/Meta Creator/metaCreator.lau.js",
        img:  "/plexos/app/meta/Image Viewer/viewer.lau.js",
        vid:  "/plexos/app/meta/Media Player/player.lau.js",
        txt:  "/plexos/app/data/Notepad/notepad.lau.js",
        json: "/plexos/app/data/Monaco/monaco.lau.js",
        js:   "/plexos/app/data/Monaco/monaco.lau.js",
    }
}
export default cfg