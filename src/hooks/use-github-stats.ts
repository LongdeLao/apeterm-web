import { useQuery } from "@tanstack/react-query";

const REPO = "LongdeLao/apeterm";

interface GitHubStats {
  stars: number;
  forks: number;
  openIssues: number;
}

export function useGitHubStats() {
  return useQuery<GitHubStats | null>({
    queryKey: ["github-stats", REPO],
    queryFn: async () => {
      const res = await fetch(`https://api.github.com/repos/${REPO}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        stars: data.stargazers_count ?? 0,
        forks: data.forks_count ?? 0,
        openIssues: data.open_issues_count ?? 0,
      };
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
