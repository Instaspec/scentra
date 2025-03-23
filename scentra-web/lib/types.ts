export type Oil = {
  essential_oil_id: string;
  essential_oil_name: string;
  scent_analysis: {
    primary_notes: string[];
    secondary_notes: string[];
    intensity: number;
  };
  popularity: {
    popularity_score: number;
  };
};
