(async () => {
    const r = await fetch(`https://cdn.mahiru.one/mahiru.png?t=${Date.now()}`);
    const b = await r.blob();

    const url = URL.createObjectURL(b);
    const img = new Image();

    await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const rgba = ctx.getImageData(0, 0, img.width, img.height).data;

    const chunks = [];
    for (let i = 0; i < rgba.length; i += 4) {
        chunks.push(rgba[i] & 3);
        chunks.push(rgba[i + 1] & 3);
        chunks.push(rgba[i + 2] & 3);
    }

    const bytes = [];
    let cur = 0;
    let bits = 0;
    for (const c of chunks) {
        cur = (cur << 2) | c;
        bits += 2;
        if (bits >= 8) {
            bits -= 8;
            bytes.push((cur >> bits) & 255);
        }
    }

    return new Uint8Array(bytes);
})();
