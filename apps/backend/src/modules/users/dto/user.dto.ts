export interface UserResponseDto {
  id: string | null;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
