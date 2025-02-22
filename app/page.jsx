import Global from "./Components/Global";
import Span from "./Components/Span";

export default function Home() {
 return(
  <div className="flex">
    <div className="w-[60%]">
    <Global/>
    </div>
    <div className="w-[40%]">
      <Span/>
    </div>
  </div>
 )
}
