export interface UserResponseDto {
  id: string | null;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
