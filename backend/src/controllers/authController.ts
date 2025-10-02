import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Register
export const register = async( req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({message: 'Fill all fields'});

    const exist = await User.findOne({ email });
    if(exist) return res.status(400).json({message: 'User already exists'});

    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({ name, email, password: hashedPassword});

    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET!, {expiresIn: '7d'});
    res.status(201).json({token, user: { id: user._id, name: user.name, email: user.email } });
};

// Login
export const login = async ( req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials'});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: 'Invalid credentials'});

    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET!, {expiresIn: '7d'});
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email}} );
}

