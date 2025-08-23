export type Idea = { 
    name: string; 
    tagline: string; 
    description: string 
};

export type SubmittedIdea = Idea & {
    id: string; 
    aiRating: number; 
    votes: number; 
    createdAt: string 
};