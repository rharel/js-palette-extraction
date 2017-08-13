(function() {
    // Converts array [r, g, b] to string "rgb(r, g, b)".
    function rgb_to_string(color)
    {
        const [r, g, b] = color;
        return `rgb(${r}, ${g}, ${b})`;
    }
    // Adds colors contained in the given array as <span class="color"> to the host element.
    function display_palette(palette, host)
    {
        palette.forEach(color =>
        {
            const span = document.createElement('span');
            span.classList += 'color';
            span.style.backgroundColor = rgb_to_string(color);

            host.appendChild(span);
        });
    }
    // Extracts the color palette of the image at a hard-coded URL.
    function main(extract_palette)
    {
        const image = extract_palette.from_url("http://i.imgur.com/IYRmHas.jpg",
            // palette size:
            10,
            // cell size:
            {
                width:  100,
                height: 100
            },
            // on success:
            palette =>
            {
                const host = document.getElementById('palette');
                display_palette(palette, host);
            }
        );
        image.id = 'target-image';
        image.addEventListener('load', () =>
        {
            document.getElementById('target-image-container').appendChild(image);
        });
    }

    requirejs.config({
        paths: {
            "palette_extraction": "../../distribution/optimized/palette_extraction.min"
        }
    });
    require(["palette_extraction"], extract_palette =>
    {
        main(extract_palette);
    });
})();
