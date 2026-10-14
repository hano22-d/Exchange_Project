import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <ul>
                <Link to="/">Home</Link>
                <Link to="/operations">Operations</Link>
                <Link to="/inventory">Inventory</Link>
                <Link to="/archive">Archive</Link>
                <Link to="/depts">Departments</Link>
            </ul>
        </nav>
    );
}
export default Navbar;