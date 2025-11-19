import { NextFunction, Request, Response } from "express"

export const checkRole = (allowedRoles : string[]) => {
    return (req : Request, res : Response, next : NextFunction) => {
        const userRole = req.user?.role;
        if(!userRole){
             return res.status(403).json({
                message : "Access denied : You dont have permission on this route"
            })
        }
        if( allowedRoles.includes(userRole)){
            next()
        }else{
            return res.status(403).json({
                message : "Access denied : You dont have permission on this route"
            })
        }
    }
}