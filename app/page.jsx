import Global from "./Components/Global";
import Span from "./Components/Span";

export default function Home() {
 return(
  <div className="flex flex-col lg:flex-row">
    <div className="w-[80%] mx-auto lg:w-[60%]">
    <Global/>
    </div>
    <div className="w-[80%] mx-auto lg:w-[40%] mb-3">
      <Span/>
    </div>
  </div>
 )
}
