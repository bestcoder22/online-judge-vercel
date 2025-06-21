import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext(null);

export const AuthContextProvider = (props) => {
    const [isAdmin,setisAdmin] = useState(null);
    const [userinfo,setUserinfo] = useState(null);
    const [loading, setLoading] = useState(true); //loading flag 

    useEffect(() => {
        const checkadmin = async () => {
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/me`, {withCredentials:true});
                if(response.data.success){
                    const userid=response.data.id
                    const response_user = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/getuser`, {userid} , {withCredentials:true});
                    setUserinfo(response_user.data.user);
                    if(response.data.role === "admin")
                        setisAdmin(true);
                }
            }
            catch(error){
                console.error("Error in getting token", error);
            }finally {
                setLoading(false);   // ← finished
            }
        }
        
        checkadmin();
    },[]);
    // console.log(isAdmin);

    const contextValues = {isAdmin,userinfo,loading};
    return (
        <AuthContext.Provider value={contextValues}>
            {props.children}
        </AuthContext.Provider>
    )
}