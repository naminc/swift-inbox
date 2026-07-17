export type Domain = {
  id: number;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  label: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicDomain = {
  id: number;
  name: string;
  label: string | null;
  isDefault: boolean;
};

export type DomainInput = {
  name: string;
  isActive?: boolean;
  isDefault?: boolean;
  label?: string | null;
};
