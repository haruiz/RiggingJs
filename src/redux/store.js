import { createStore} from "redux";
import reducer from "./reducers";
export default createStore(reducer);//return the big state object