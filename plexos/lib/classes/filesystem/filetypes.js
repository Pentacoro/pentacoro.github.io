const typeMap = {
    "DirectoryFile": () => import("./directory.js"),
    "StringFile": () => import("./string.js"),
    "ProxyFile": () => import("./proxy.js"),
    "MetaFile": () => import("./MetaFile.js"),
};

export default async function typeClass(type) {
    const importer = typeMap[type];
    if (!importer) return null;
    
    const module = await importer();
    return module.default;
}
