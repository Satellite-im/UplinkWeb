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
    name: string
    level: number
    description: string
    color: string
    permissions: Permission[]
}

export type Member = {
    user: User
    roles: Role[]
    permissions: Permission[]
    tags: Tag[]
    meta: {
        join: Date
    }
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
