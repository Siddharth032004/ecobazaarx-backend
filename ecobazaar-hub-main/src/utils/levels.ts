export const LEVEL_THRESHOLDS = [
    { name: "Eco Starter", min: 0 },
    { name: "Green Explorer", min: 200 },
    { name: "Carbon Hero", min: 500 },
    { name: "Planet Guardian", min: 1000 },
    { name: "Earth Legend", min: 2000 },
];

export const getLevelFromPoints = (points: number): string => {
    // Iterate in reverse to find the highest matching threshold
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (points >= LEVEL_THRESHOLDS[i].min) {
            return LEVEL_THRESHOLDS[i].name;
        }
    }
    return "Eco Starter";
};

export const getNextLevelInfo = (points: number): { nextLevelName: string | null; nextLevelPoints: number | null } => {
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (points < LEVEL_THRESHOLDS[i].min) {
            return {
                nextLevelName: LEVEL_THRESHOLDS[i].name,
                nextLevelPoints: LEVEL_THRESHOLDS[i].min,
            };
        }
    }
    // Reached max level
    return { nextLevelName: null, nextLevelPoints: null };
};
