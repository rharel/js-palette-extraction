(function() {
    let convert_color, random, k_means;

    // Utility class for the inspection of image data.
    class ImageQuery
    {
        constructor(image_data)
        {
            this._image_data = image_data;
        }

        get width()  { return this._image_data.width;  }
        get height() { return this._image_data.height; }

        pixel(x, y)
        {
            const w = this._image_data.width,
                  i = 4 * (y * w + x);

            return this._image_data.data.slice(i, i + 3);
        }
    }
    // Uses jitter-grid supersampling to collect samples from image data.
    function gather_samples(image_data, cell_size)
    {
        const query = new ImageQuery(image_data);

        const w = cell_size.width,
              h = cell_size.height;
        const n = query.width  - w,
              m = query.height - h;

        const samples = [];
        for (let x_min = 0; x_min < n; x_min += w)
        {
            for (let y_min = 0; y_min < m; y_min += h)
            {
                const x = random.integer_in_range(x_min, x_min + w),
                      y = random.integer_in_range(y_min, y_min + h);

                samples.push(query.pixel(x, y));
            }
        }
        return samples;
    }

    function euclidean_distance(first, second)
    {
        const [a1, b1, c1] = first,
              [a2, b2, c2] = second;

        return Math.pow(a1 - a2, 2) +
               Math.pow(b1 - b2, 2) +
               Math.pow(c1 - c2, 2);
    }
    // Uses k-means to cluster color samples.
    function find_clusters(observations, cluster_count)
    {
        const initial_guess = [];
        for (let i = 0; i < cluster_count; ++i)
        {
            const random_index       = random.integer_in_range(0, observations.length - 1),
                  random_observation = observations[random_index];

            initial_guess.push(random_observation.slice());
        }
        return k_means.find_clusters(
            observations, cluster_count,
            initial_guess, euclidean_distance
        );
    }

    // Returns a sorted list of clusters (hsl) in decreasing order of significance.
    function extract_palette_from_samples(samples, palette_size)
    {
        return find_clusters(samples, palette_size)
              .sort((a, b) => b.size - a.size);
    }
    // Returns a sorted list of colors (rgb) in decreasing order of significance.
    function extract_palette_from_image_data(image_data, palette_size, cell_size)
    {
        const samples_rgb = gather_samples(image_data, cell_size),
              samples_hsl = samples_rgb.map(color =>
              {
                  const [r, g, b] = color;
                  return convert_color.rgb_to_hsl(r, g, b);
              });
        return extract_palette_from_samples(samples_hsl, palette_size)
              .map(cluster =>
              {
                  const [h, s, l] = cluster.mean;
                  return convert_color.hsl_to_rgb(h, s, l);
              });
    }
    // Returns a sorted list of colors (rgb) in decreasing order of significance.
    function extract_palette_from_image(image, palette_size, cell_size)
    {
        const canvas  = document.createElement('canvas'),
              context = canvas.getContext('2d');

        canvas.width  = image.naturalWidth;
        canvas.height = image.naturalHeight;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const image_data = context.getImageData(0, 0, canvas.width, canvas.height);

        return extract_palette_from_image_data(image_data, palette_size, cell_size);
    }
    // Loads an image and invokes the success callback with a sorted list of colors (rgb) in
    // decreasing order of significance.
    function extract_palette_from_url(url, palette_size, cell_size, on_success, on_error)
    {
        const image = new Image();

        image.addEventListener('error', on_error);
        image.addEventListener('load', () =>
            on_success(extract_palette_from_image(image, palette_size, cell_size)));

        image.crossOrigin = "Anonymous";
        image.src         = url;

        return image;
    }

    define(["./color_conversion", "./rng", "./k_means_clustering"],
          (color_conversion, rng, k_means_clustering) =>
    {
        convert_color = color_conversion;
        random        = rng;
        k_means       = k_means_clustering;

        return {
            from_samples:    extract_palette_from_samples,
            from_image_data: extract_palette_from_image_data,
            from_image:      extract_palette_from_image,
            from_url:        extract_palette_from_url
        };
    });
})();
