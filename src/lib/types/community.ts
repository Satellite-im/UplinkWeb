import type { User } from "."

export enum PermissionState {
    Allowed = "allowed",
    Denied = "denied",
    Unset = "unset",
}

export type Permission = {
    id: string
    description: string
    state: PermissionState
}

export type Role = {
    id: string
    level: number
    description: string
    permissions: Permission[]
}

export type Member = {
    user: User
    roles: Role[]
    permissions: Permission[]
}

export type Community = {
    id: string
    name: string
    description: string
    members: Member[]
    roles: Role[]
    permissions: Permissions[]
}
