import { useParams } from "react-router-dom";
import Compiler from "../components/Compiler";
import Navbar from "../components/Navbar";

const Problempage = () => {
    const {problemid} = useParams();
    return(
        <div className="font-sans">
            <Compiler problemid={problemid} />
        </div>
    )
}

export default Problempage;