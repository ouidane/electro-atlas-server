import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";

export class UserController {
  async getCurrentUser(req: Request, res: Response) {
    const userId = req.user.id;
    const userData = await userService.getCurrentUserData(userId);

    res.status(200).json(userData);
  }

  async updateCurrentUser(req: Request, res: Response) {
    const userId = req.user?.id;
    await userService.updateProfileByUserId(userId, req.body);

    res.status(200).json({ message: "User updated successfully" });
  }

  async getUsers(req: Request, res: Response) {
    const { limit, page, sort = "createdAt", ...filters } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const { users, totalCount } = await userService.getUsers({
      pageNumber,
      sort: sort as string,
      skip,
      filters: filters as { [key: string]: string },
      limitNumber,
    });

    res.status(200).json({
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
        limit: limitNumber,
      },
    });
  }

  async createUser(req: Request, res: Response) {
    const user = await userService.createUser(req.body);

    res.status(201).json({ message: "User created successfully", user });
  }

  async getUserById(req: Request, res: Response) {
    const userId = req.params.userId;
    const user = await userService.getUserById(userId);

    res.status(200).json({ user });
  }

  async updateUserById(req: Request, res: Response) {
    const userId = req.params.userId;

    await Promise.all([
      userService.updateUserById(userId, req.body),
      userService.updateProfileByUserId(userId, req.body),
    ]);

    res.status(200).json({ message: "User updated successfully" });
  }

  async deleteUserById(req: Request, res: Response) {
    const userId = req.params.userId;
    await userService.deleteUserById(userId);

    res.status(200).json({ message: "User deleted successfully" });
  }
}

export const userController = new UserController();
