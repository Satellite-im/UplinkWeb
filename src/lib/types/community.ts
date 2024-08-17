import type { User } from "."
import { PermissionCategory, PermissionState } from "$lib/enums/community"

export type Permission = {
    id: string
    category: PermissionCategory
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

export type Tag = {
    name: string
    color: string
}
