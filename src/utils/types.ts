export interface Project {
    id: number;
    name: string;
    description: string;
    url: string;        // URL da nuvem de pontos
    images_url: string; // Caminho das imagens
    csv_url: string;    // Caminho do CSV
    branchesId?: number;
    tenant_id: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role: Role;
    tenant_id: number;
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[]; // Lista de permissões associadas à role
}

export interface Permission {
    id: number;
    description: string; // Apenas exibição, não editável
}

export interface Company {
    id: number;
    cnpj: string;
    name: string;
    country: string;
    state: string;
    city: string;
    email: string;
    telephone: string;
}

export interface Branch {
    id: number;
    name: string;
    tenant_id: number;
}