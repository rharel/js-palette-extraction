function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export type Sample = number[];
export type Cluster = { mean: Sample; size: number };

export function k_means_clusters(
  samples: Sample[],
  cluster_count: number,
  initial_guess: Sample[],
  distance: (a: Sample, b: Sample) => number
): Cluster[] {
  const means = clone(initial_guess);
  let mean_assignment: number[] = new Array(samples.length).fill(0);
  let mean_sample_counts: number[] = new Array(cluster_count).fill(0);
  let mean_assignment_changed = true;

  while (mean_assignment_changed) {
    mean_sample_counts.fill(0);
    mean_assignment_changed = false;

    // Associate each sample with its nearest mean.
    samples.forEach((sample, sample_index) => {
      let nearest_mean_index = 0;
      let nearest_mean_distance = distance(sample, means[0]);
      for (let i = 1; i < cluster_count; ++i) {
        const distance_to_mean_i = distance(sample, means[i]);
        if (distance_to_mean_i < nearest_mean_distance) {
          nearest_mean_distance = distance_to_mean_i;
          nearest_mean_index = i;
        }
      }

      if (nearest_mean_index !== mean_assignment[sample_index]) {
        mean_assignment_changed = true;
      }

      mean_assignment[sample_index] = nearest_mean_index;
      mean_sample_counts[nearest_mean_index] += 1;
    });

    // Recompute the means.
    if (mean_assignment_changed) {
      means.forEach((mean) => mean.fill(0));
      samples.forEach((sample, sample_index) => {
        const mean_index = mean_assignment[sample_index];
        const mean = means[mean_index];
        const mean_sample_count = mean_sample_counts[mean_index];
        mean.forEach((_, i) => (mean[i] += sample[i] / mean_sample_count));
      });
    }
  }

  return means.map((mean, index) => {
    return {
      mean: mean,
      size: mean_sample_counts[index],
    };
  });
}
