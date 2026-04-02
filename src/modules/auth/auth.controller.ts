import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { verfiyRefreshToken, generateAccessToken, generateRefreshToken } from "../../utils/token";
import path from "node:path";

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


export const login = async (req: Request, res: Response) => {

  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    res.cookie("refreshToken", result.refreshToken), {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 4 * 60 * 60 * 1000
    }

    res.status(200).json({
      message: "Giriş başarılı",
      accesToken: result.accessToken,
      user: result.user

    })
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Oturum Süresi dolmuş lütfen tekrar giriş yapın" });
  }
  try {
    const { accessToken, newRefreshToken, user } = await authService.refreshAccessToken(token);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/'
    });

    return res.status(200).json({ accessToken, user })

  } catch (error) {
    return res.status(403).json({ message: "Token doğrulama hatası" });
  }
}



export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await authService.logout(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/"
    });
    return res.status(200).json({ message: "Başarıyla çıkış yapıldı" });
  } catch (error: any) {
    return res.status(500).json({ message: "Çıkış yapılırken bir hata oluştu" });
  }
}

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


