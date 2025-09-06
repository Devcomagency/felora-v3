export interface EscortProfileDTO {
  id: string; 
  handle: string; 
  displayName: string; 
  bio?: string;
  languages: string[]; 
  services: string[]; 
  ratePerHour?: number; 
  avatarUrl?: string;
}

export interface ClubProfileDTO {
  id: string; 
  handle: string; 
  name: string; 
  description?: string;
  address?: string; 
  openingHours?: string; 
  avatarUrl?: string; 
  coverUrl?: string;
}

export interface ProfileService {
  getEscortByHandle(handle: string): Promise<EscortProfileDTO | null>
  getEscortByUserId(userId: string): Promise<EscortProfileDTO | null>
  upsertEscort(input: Partial<EscortProfileDTO> & { userId: string }): Promise<void>
  getClubByHandle(handle: string): Promise<ClubProfileDTO | null>
  getClubByUserId(userId: string): Promise<ClubProfileDTO | null>
  upsertClub(input: Partial<ClubProfileDTO> & { userId: string }): Promise<void>
}