import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const newUser = await authService.register(username, password);
    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      user: newUser,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message, status: 400 });
  }
};
export const findAll = async (req: Request, res: Response) => {
  try {
    const users = await authService.findAll();
    res.status(200).json({
      message: "Kullanıcılar başarıyla getirildi",
      user: users,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message, status: 400 })
  }
}

export const login = async (req: Request, res: Response) => {

  try {
    const { username, password } = req.body;
    const user = await authService.login(username, password);

    res.status(200).json({
      message: "Giriş başarılı",
      status: 200,
      user: user,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message, status: 400 });
  }
}

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await authService.deleteUserById(id as string);
    res.status(200).json({
      message: "Kullanıcı başarıyla silindi",
    })

  } catch (error: any) {
    res.status(400).json({ message: error.message, status: 400 })
  }

}

export const updateUser = async (req: Request, res: Response) => {

  try {
    const { id } = req.params;
    const { username, password } = req.body;
    const updatedUser = await authService.updateUser(id as string, username, password);
    res.status(200).json({
      message: "Kullanıcı başarıyla güncellendi",
      user: updatedUser,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message, status: 400 })
  }
}


