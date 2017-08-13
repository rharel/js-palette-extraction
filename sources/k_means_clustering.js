(function() {
    // Associates each observation with the index of its closest mean.
    //
    // Parameters:
    //  observations: An array of vectors with length m.
    //  means:        An array of vectors with length n.
    //
    //  distance_measure: A function D(observation, mean) yielding the distance between a given
    //                    observation and mean.
    //
    //  previous_assignment:
    //
    //                       This is the previous assignment from the previous iteration of the
    //                       algorithm.
    //
    //  new_assignment: An output buffer, analogous to previous_assignment.
    //
    //  assignment_counts: An array of length n whose member at index j contains the number of
    //                     observations assigned to the mean at j.
    //
    // Returns true iff new_assignment differs from previous_assignment.
    function assign_observations_to_means(
        observations, means, distance_measure,
        previous_assignment, new_assignment, assignment_counts)
    {
        const cluster_count    = means.length;
        let assignment_changed = false;

        assignment_counts.fill(0);

        observations.forEach((observation, i) =>
        {
            let j_min = 0,
                D_min = distance_measure(observation, means[0]);

            for (let j = 1; j < cluster_count; ++j)
            {
                const D = distance_measure(observation, means[j]);
                if (D < D_min)
                {
                    D_min = D;
                    j_min = j;
                }
            }

            new_assignment[i]         = j_min;
            assignment_counts[j_min] += 1;

            if (new_assignment[i] !== previous_assignment[i])
            {
                assignment_changed = true;
            }
        });
        return assignment_changed;
    }
    // Computes the means of given clusters.
    //
    // Parameters:
    //  observations: An array of vectors with length m.
    //
    //  assignment: An array of length m whose member at index i refers to the assigned
    //              mean index j of the observation at i.
    //
    //  assignment_counts: An array of length n whose member at index j contains the number of
    //                     observations assigned to the mean at j.
    //
    //  means: An output buffer for the computed means.
    function compute_means(observations, assignment, assignment_counts, means)
    {
        means.forEach(mean => mean.fill(0));
        observations.forEach((observation, i) =>
        {
            const j    = assignment[i],
                  mean = means[j],
                  n    = assignment_counts[j];

            mean.forEach((_, k) => mean[k] += observation[k] / n);
        });
    }
    // Segments given observation into k clusters.
    //
    // Returns an array of length k, whose members are of the form {mean: <vector>, size: <number>},
    // with 'mean' being the cluster mean and 'size' being the number of observations assigned to
    // that cluster.
    function find_clusters(observations, cluster_count, initial_guess, distance_measure)
    {
        const means = initial_guess;

        let previous_assignment = new Array(observations.length),
            new_assignment      = new Array(observations.length),
            assignment_counts   = new Array(cluster_count);

        let assignment_changed = true;
        while (assignment_changed)
        {
            assignment_changed = assign_observations_to_means(
                observations, means, distance_measure,
                previous_assignment, new_assignment, assignment_counts
            );
            if (assignment_changed)
            {
                compute_means(observations, new_assignment, assignment_counts, means);

                const buffer        = previous_assignment;
                previous_assignment = new_assignment;
                new_assignment      = buffer;
            }
        }
        return means.map((mean, index) =>
        {
            return {
                mean: mean,
                size: assignment_counts[index]
            };
        });
    }
    define({
        find_clusters: find_clusters
    });
})();
