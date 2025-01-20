import { z } from 'zod';

/* Export Data Transfer Objects (DTOs) and corresponding types for the all entities in the application
 Naming convention: DTOs are named as z<EntityName><Action>, types are named as <EntityName><Action>
 Examples for User entity: DTO = zUser, type = User; DTO = zUserCreate, types = UserCreate */

export const zUser = z.object({
    id: z.number().int(),
    name: z.string(),
});

export type User = z.infer<typeof zUser>;

export const zUserCreate = z.object({
    name: z.string(),
});

export type UserCreate = z.infer<typeof zUserCreate>;