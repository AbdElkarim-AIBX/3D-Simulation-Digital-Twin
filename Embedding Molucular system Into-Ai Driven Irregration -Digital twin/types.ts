export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export enum AppSection {
  HERO = 'hero',
  CHALLENGE = 'challenge',
  LIMITATIONS = 'limitations',
  BREAKTHROUGH = 'breakthrough',
  INNOVATION = 'innovation',
  ARCHITECTURE = 'architecture',
  BENEFITS = 'benefits',
  VISION = 'vision',
  CTA = 'cta',
  LINK = 'link'
}