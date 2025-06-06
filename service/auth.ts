import jwt from 'jsonwebtoken';
import { prisma } from "./prismaClient"


export const createToken = (uuid : string) => {
  const token = jwt.sign({id: uuid}, process.env.AUTH_SECRET,{
    expiresIn: '55m',
  });

  return token;
}



export const VerifyToken = async (token : string) => {
  const response = {
    status: "UNKNOWN_ERROR",
    uuid: null
  }

  const expired_token = await prisma.expiredToken.findFirst({
    where: {
      token: token
    }
  })
  console.log(expired_token)
  if (expired_token) {
    response.status="LOGGED_OUT_SESSION"
    return response;
  }

  console.log(token)

  const result = jwt.verify(token, process.env.AUTH_SECRET, async (err, decoded) => {
    if (err) {
      response.status="INVALID_SESSION";
      return false;
    }

    const { id } = decoded;
    response.uuid=id;
    response.status="SUCCESS";
    return true;
  });

  return response;
}


export const removeToken = async (token : string) => {
  const expired_token = await prisma.expiredToken.create({
    data:{
      token: token
    }
  })
  
  
}