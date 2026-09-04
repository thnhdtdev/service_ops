import { FastifyReply, FastifyRequest } from "fastify";

import {userRoleSchema } from "../../types/auth.js";
import {createUserSupabase, supabase} from "../../lib/supabase";

export async function requireAuth(
        request: FastifyRequest,
        reply: FastifyReply,
){
    const authrization = request.headers.authorization;

    //check if the authorization header is present and starts with "Bearer "
    if(!authrization?.startsWith("Bearer ")){
        return reply.status(401).send({
            message: "Unauthorized",
        })
    }
        
    const token = authrization?.slice(7);

    const {data: {user}, error} = await supabase.auth.getUser(token);
    //check if there is an error or if the user is not found
    if(error || !user){
        return reply.status(401).send({
            message: "Invalid or expired token",
        })
    }

    const userSupabase = createUserSupabase(token)


    const {data: profile, error: profileError} = await userSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if(profileError || !profile){
        return reply.status(401).send({
            message: "User profile not found"
        })
    }

        request.user = user;
        request.accessToken = token;


        const roleResult = userRoleSchema.safeParse(profile.role);

        if (!roleResult.success) {
            request.log.error(
                {
                    userId: user.id,
                    role: profile.role
                },
                "Invalid user role"
            );

            return reply
                .status(403)
                .send({
                    message:
                        "Tài khoản không có quyền hợp lệ."
                });
        }

        request.role = roleResult.data;
}