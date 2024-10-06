import { Request, Response, NextFunction } from "express";
declare const getCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updateCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updateUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const deleteUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getCurrentUser, updateCurrentUser, getUsers, createUser, getUserById, updateUserById, deleteUserById, };
