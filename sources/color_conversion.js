(function() {
    // Generates triplet [h, s, l] with members in [0, 1] from triplet r, g, b with members
    // in [0, 255].
    //
    // Adapted from: https://gist.github.com/mjackson/5311256
    function rgb_to_hsl(r, g, b)
    {
        r /= 255; g /= 255; b /= 255;

        const max = Math.max(r, g, b),
              min = Math.min(r, g, b);

        let h, s,
            l = (max + min) / 2;

        if (max === min) { h = s = 0; }  // achromatic
        else
        {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max)
            {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2;               break;
                case b: h = (r - g) / d + 4;               break;
            }
            h /= 6;
        }
        return [h, s, l];
    }
    // Generates triplet [r, g, b] with members in [0, 255] from triplet h, s, l with members
    // in [0, 1].
    //
    // Adapted from: https://gist.github.com/mjackson/5311256
    function hsl_to_rgb(h, s, l)
    {
        let r, g, b;

        if (s === 0) { r = g = b = l; }  // achromatic
        else
        {
            function hue_to_rgb(p, q, t)
            {
                if (t < 0)   t += 1;
                if (t > 1)   t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                  p = 2 * l - q;

            r = hue_to_rgb(p, q, h + 1/3);
            g = hue_to_rgb(p, q, h      );
            b = hue_to_rgb(p, q, h - 1/3);
        }
        return [
            Math.max(Math.min(r * 256, 255), 0),
            Math.max(Math.min(g * 256, 255), 0),
            Math.max(Math.min(b * 256, 255), 0)
        ];
    }
    define({
        rgb_to_hsl: rgb_to_hsl,
        hsl_to_rgb: hsl_to_rgb
    });
})();
