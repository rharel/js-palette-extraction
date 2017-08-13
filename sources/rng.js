(function() {
    // Generates a random integer in [min, max].
    function random_integer_in_range(min, max)
    {
        return min + Math.floor(Math.random() * (max - min + 1));
    }
    define({
        integer_in_range: random_integer_in_range
    });
})();
