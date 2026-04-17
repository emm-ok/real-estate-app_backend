export const requireAdmin = async(req, res, next) => {
    try{
        if(!req.user){
        return res.status(401).json({
            message: "User not found"
        })
    }

    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            message: "Access denied, Admin only!"
        })
    }

    next();
    } catch(error){
        return res.status(500).json({
            message: "Failed to verify admin"
        })
    }
}