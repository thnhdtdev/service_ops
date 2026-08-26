import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "../../types/auth";

export function requireRole(...allowedRoles:UserRole[]){
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        
        //this array contain this value
        if(!allowedRoles.includes(request.role)){
            return reply.status(403).send({
                message: "Forbidden"
            })
        }
    }
}