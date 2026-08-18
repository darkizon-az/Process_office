import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request:Request){try{const input=loginSchema.parse(await request.json());const user=await prisma.user.findUnique({where:{email:input.email.toLowerCase()}});if(!user?.active||!(await bcrypt.compare(input.password,user.passwordHash)))return NextResponse.json({error:"Неверные данные"},{status:401});await createSession(user.id);await prisma.auditLog.create({data:{userId:user.id,action:"ADMIN_LOGIN",entityType:"USER",entityId:user.id}});return NextResponse.json({ok:true})}catch{return NextResponse.json({error:"Некорректный запрос"},{status:400})}}
